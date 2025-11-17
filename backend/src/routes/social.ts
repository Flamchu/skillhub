import { Router, Response } from "express";
import { AuthenticatedRequest, authenticateSupabaseToken, requireAdmin } from "../middleware/supabaseAuth";
import { prisma } from "../config/database";
import { redis, isRedisAvailable, generateCacheKey, CACHE_TTL, CACHE_KEYS } from "../config/redis";
import { awardXP, checkQuestProgress, getLevelFromXP, getProgressToNextLevel, getUserDailyQuests, getWeeklyLeaderboard, getXPForLevel, seedQuests, updateStreak } from "../services/socialService";
import { XPSource, QuestType } from "@prisma/client";

const router = Router();

// get user's gamification profile
router.get("/profile", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const userId = req.user!.id;

		// check cache first
		const cacheKey = generateCacheKey(CACHE_KEYS.SOCIAL_PROFILE, userId);
		if (isRedisAvailable && redis) {
			const cached = await redis.get(cacheKey);
			if (cached) {
				return res.json(JSON.parse(cached));
			}
		}

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				name: true,
				xp: true,
				level: true,
				currentStreak: true,
				longestStreak: true,
				lastActivityDate: true,
			},
		});

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const progress = getProgressToNextLevel(user.xp);

		const result = {
			user: {
				...user,
				...progress,
			},
		};

		// cache for 1 minute (very short since it updates frequently)
		if (isRedisAvailable && redis) {
			await redis.setex(cacheKey, 60, JSON.stringify(result));
		}

		res.json(result);
	} catch (error) {
		console.error("Get gamification profile error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// get user's daily quests
router.get("/quests/daily", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const userId = req.user!.id;

		// check cache first
		const cacheKey = generateCacheKey(CACHE_KEYS.DAILY_QUESTS, userId);
		if (isRedisAvailable && redis) {
			const cached = await redis.get(cacheKey);
			if (cached) {
				return res.json(JSON.parse(cached));
			}
		}

		const quests = await getUserDailyQuests(userId);

		const result = { quests };

		// cache for 5 minutes
		if (isRedisAvailable && redis) {
			await redis.setex(cacheKey, CACHE_TTL.SHORT, JSON.stringify(result));
		}

		res.json(result);
	} catch (error) {
		console.error("Get daily quests error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// get weekly leaderboard
router.get("/leaderboard/weekly", async (req, res: Response) => {
	try {
		const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

		// check cache first
		const cacheKey = generateCacheKey(CACHE_KEYS.WEEKLY_LEADERBOARD, String(limit));
		if (isRedisAvailable && redis) {
			const cached = await redis.get(cacheKey);
			if (cached) {
				return res.json(JSON.parse(cached));
			}
		}

		const leaderboard = await getWeeklyLeaderboard(limit);

		const result = { leaderboard };

		// cache for 5 minutes (leaderboard updates frequently)
		if (isRedisAvailable && redis) {
			await redis.setex(cacheKey, CACHE_TTL.SHORT, JSON.stringify(result));
		}

		res.json(result);
	} catch (error) {
		console.error("Get weekly leaderboard error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// get global leaderboard (all-time)
router.get("/leaderboard/global", async (req, res: Response) => {
	try {
		const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

		// check cache first
		const cacheKey = generateCacheKey(CACHE_KEYS.GLOBAL_LEADERBOARD, String(limit));
		if (isRedisAvailable && redis) {
			const cached = await redis.get(cacheKey);
			if (cached) {
				return res.json(JSON.parse(cached));
			}
		}

		const users = await prisma.user.findMany({
			where: {
				deletedAt: null,
			},
			select: {
				id: true,
				name: true,
				email: true,
				xp: true,
				level: true,
				currentStreak: true,
				regionId: true,
				region: {
					select: {
						id: true,
						name: true,
						code: true,
					},
				},
			},
			orderBy: {
				xp: "desc",
			},
			take: limit,
		});
		const leaderboard = users.map((user, index) => ({
			rank: index + 1,
			user: {
				id: user.id,
				name: user.name || "Anonymous",
				xp: user.xp,
				level: user.level,
				currentStreak: user.currentStreak,
				region: user.region,
			},
		}));

		const result = { leaderboard };

		// cache for 10 minutes (global leaderboard changes less frequently)
		if (isRedisAvailable && redis) {
			await redis.setex(cacheKey, CACHE_TTL.MEDIUM, JSON.stringify(result));
		}

		res.json(result);
	} catch (error) {
		console.error("Get global leaderboard error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// get user's xp history
router.get("/xp/history", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const userId = req.user!.id;
		const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
		const page = parseInt(req.query.page as string) || 1;
		const offset = (page - 1) * limit;

		const [transactions, totalCount] = await Promise.all([
			prisma.xPTransaction.findMany({
				where: { userId },
				orderBy: { createdAt: "desc" },
				take: limit,
				skip: offset,
			}),
			prisma.xPTransaction.count({
				where: { userId },
			}),
		]);

		const totalPages = Math.ceil(totalCount / limit);

		res.json({
			transactions,
			pagination: {
				currentPage: page,
				totalPages,
				totalCount,
				hasNext: page < totalPages,
				hasPrev: page > 1,
			},
		});
	} catch (error) {
		console.error("Get XP history error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// manually award xp (admin only)
router.post("/xp/award", authenticateSupabaseToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { userId, amount, description } = req.body;

		if (!userId || !amount) {
			return res.status(400).json({ error: "userId and amount are required" });
		}

		if (amount <= 0) {
			return res.status(400).json({ error: "Amount must be positive" });
		}

		const result = await awardXP(userId, amount, XPSource.ADMIN_GRANT, description || "Admin granted XP");

		res.json({
			message: "XP awarded successfully",
			...result,
		});
	} catch (error) {
		console.error("Award XP error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// get all quests (admin)
router.get("/quests/admin", authenticateSupabaseToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const quests = await prisma.quest.findMany({
			orderBy: { createdAt: "desc" },
			include: {
				_count: {
					select: {
						completions: true,
					},
				},
			},
		});

		res.json({ quests });
	} catch (error) {
		console.error("Get quests error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// create quest (admin)
router.post("/quests", authenticateSupabaseToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { title, description, type, xpReward, targetCount } = req.body;

		if (!title || !description || !type || !xpReward) {
			return res.status(400).json({ error: "Missing required fields" });
		}

		const quest = await prisma.quest.create({
			data: {
				title,
				description,
				type,
				xpReward,
				targetCount: targetCount || 1,
			},
		});

		res.status(201).json({ quest });
	} catch (error) {
		console.error("Create quest error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// update quest (admin)
router.patch("/quests/:id", authenticateSupabaseToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { id } = req.params;
		const { title, description, type, xpReward, targetCount, isActive } = req.body;

		const quest = await prisma.quest.update({
			where: { id },
			data: {
				...(title && { title }),
				...(description && { description }),
				...(type && { type }),
				...(xpReward !== undefined && { xpReward }),
				...(targetCount !== undefined && { targetCount }),
				...(isActive !== undefined && { isActive }),
			},
		});

		res.json({ quest });
	} catch (error) {
		console.error("Update quest error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// delete quest (admin)
router.delete("/quests/:id", authenticateSupabaseToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { id } = req.params;

		await prisma.quest.delete({
			where: { id },
		});

		res.json({ message: "Quest deleted successfully" });
	} catch (error) {
		console.error("Delete quest error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// seed initial quests (admin)
router.post("/quests/seed", authenticateSupabaseToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
	try {
		await seedQuests();
		res.json({ message: "Quests seeded successfully" });
	} catch (error) {
		console.error("Seed quests error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// get quest statistics (admin)
router.get("/stats/quests", authenticateSupabaseToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const stats = await prisma.questCompletion.groupBy({
			by: ["questId"],
			where: {
				completedAt: {
					gte: today,
				},
				isCompleted: true,
			},
			_count: {
				id: true,
			},
		});

		// get quest details
		const questIds = stats.map((s) => s.questId);
		const quests = await prisma.quest.findMany({
			where: {
				id: {
					in: questIds,
				},
			},
		});

		const questStats = stats.map((stat) => {
			const quest = quests.find((q) => q.id === stat.questId);
			return {
				quest,
				completionsToday: stat._count.id,
			};
		});

		res.json({ questStats });
	} catch (error) {
		console.error("Get quest stats error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

export default router;
