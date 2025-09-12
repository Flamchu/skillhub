import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest, authenticateSupabaseToken, requireAdmin } from "../middleware/supabaseAuth";

const router = Router();
const prisma = new PrismaClient();

// get user by id (public route for basic profile info)
router.get("/:id", async (req, res: Response) => {
	try {
		const { id } = req.params;

		const user = await prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				headline: true,
				bio: true,
				createdAt: true,
				region: {
					select: {
						id: true,
						name: true,
						code: true,
					},
				},
				// public skills with basic info
				skills: {
					select: {
						id: true,
						proficiency: true,
						progress: true,
						skill: {
							select: {
								id: true,
								name: true,
								slug: true,
							},
						},
					},
				},
			},
		});

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		res.json({ user });
	} catch (error) {
		console.error("Get user error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// get user's full profile (protected, only own profile or admin)
router.get("/:id/profile", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { id } = req.params;
		const currentUser = req.user!;

		// users can only access their own profile unless they're admin
		if (currentUser.id !== id && currentUser.role !== "ADMIN") {
			return res.status(403).json({ error: "Access denied" });
		}

		const user = await prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				email: true,
				name: true,
				headline: true,
				bio: true,
				role: true,
				regionId: true,
				createdAt: true,
				updatedAt: true,
				region: {
					select: {
						id: true,
						name: true,
						code: true,
					},
				},
				skills: {
					include: {
						skill: {
							select: {
								id: true,
								name: true,
								slug: true,
								description: true,
								parent: {
									select: {
										id: true,
										name: true,
										slug: true,
									},
								},
							},
						},
					},
					orderBy: {
						updatedAt: "desc",
					},
				},
				bookmarks: {
					include: {
						course: {
							select: {
								id: true,
								title: true,
								description: true,
								provider: true,
								source: true,
								url: true,
								difficulty: true,
								durationMinutes: true,
								rating: true,
								priceCents: true,
								isPaid: true,
							},
						},
					},
					orderBy: {
						createdAt: "desc",
					},
				},
				testAttempts: {
					include: {
						test: {
							select: {
								id: true,
								title: true,
								skill: {
									select: {
										id: true,
										name: true,
										slug: true,
									},
								},
							},
						},
					},
					orderBy: {
						createdAt: "desc",
					},
					take: 10, // last 10 attempts
				},
			},
		});

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		res.json({ user });
	} catch (error) {
		console.error("Get user profile error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// update user profile (protected, only own profile or admin)
router.patch("/:id", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { id } = req.params;
		const currentUser = req.user!;

		// users can only update their own profile unless they're admin
		if (currentUser.id !== id && currentUser.role !== "ADMIN") {
			return res.status(403).json({ error: "Access denied" });
		}

		const { name, headline, bio, regionId } = req.body;

		// validate input
		if (name !== undefined && (typeof name !== "string" || name.trim().length < 1)) {
			return res.status(400).json({ error: "Name must be a non-empty string" });
		}

		if (headline !== undefined && typeof headline !== "string") {
			return res.status(400).json({ error: "Headline must be a string" });
		}

		if (bio !== undefined && typeof bio !== "string") {
			return res.status(400).json({ error: "Bio must be a string" });
		}

		if (regionId !== undefined && regionId !== null) {
			// verify region exists
			const regionExists = await prisma.region.findUnique({
				where: { id: regionId },
			});

			if (!regionExists) {
				return res.status(400).json({ error: "Invalid region ID" });
			}
		}

		const updateData: any = {};
		if (name !== undefined) updateData.name = name.trim();
		if (headline !== undefined) updateData.headline = headline.trim();
		if (bio !== undefined) updateData.bio = bio.trim();
		if (regionId !== undefined) updateData.regionId = regionId;

		const updatedUser = await prisma.user.update({
			where: { id },
			data: updateData,
			select: {
				id: true,
				email: true,
				name: true,
				headline: true,
				bio: true,
				role: true,
				regionId: true,
				updatedAt: true,
				region: {
					select: {
						id: true,
						name: true,
						code: true,
					},
				},
			},
		});

		res.json({
			message: "Profile updated successfully",
			user: updatedUser,
		});
	} catch (error) {
		console.error("Update user error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// delete user account (protected, only own account or admin)
router.delete("/:id", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { id } = req.params;
		const currentUser = req.user!;

		// users can only delete their own account unless they're admin
		if (currentUser.id !== id && currentUser.role !== "ADMIN") {
			return res.status(403).json({ error: "Access denied" });
		}

		// check if user exists
		const user = await prisma.user.findUnique({
			where: { id },
		});

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		// TODO: in production, consider soft delete instead of hard delete
		// for data retention and analytics purposes
		await prisma.user.delete({
			where: { id },
		});

		res.json({ message: "User account deleted successfully" });
	} catch (error) {
		console.error("Delete user error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// get user statistics (protected, only own stats or admin)
router.get("/:id/stats", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { id } = req.params;
		const currentUser = req.user!;

		// users can only access their own stats unless they're admin
		if (currentUser.id !== id && currentUser.role !== "ADMIN") {
			return res.status(403).json({ error: "Access denied" });
		}

		const user = await prisma.user.findUnique({
			where: { id },
		});

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		// get various statistics
		const [skillsCount, testAttempts, bookmarksCount, recommendations] = await Promise.all([
			// skills statistics
			prisma.userSkill.groupBy({
				by: ["proficiency"],
				where: { userId: id },
				_count: {
					id: true,
				},
			}),

			// test statistics
			prisma.testAttempt.findMany({
				where: { userId: id },
				select: {
					score: true,
					completedAt: true,
					test: {
						select: {
							skill: {
								select: {
									name: true,
								},
							},
						},
					},
				},
				orderBy: {
					completedAt: "desc",
				},
			}),

			// bookmarks count
			prisma.bookmark.count({
				where: { userId: id },
			}),

			// recommendations count
			prisma.recommendation.count({
				where: { userId: id },
			}),
		]);

		// calculate test statistics
		const testStats = {
			totalAttempts: testAttempts.length,
			averageScore: testAttempts.length > 0 ? testAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / testAttempts.length : 0,
			completedTests: testAttempts.filter((attempt) => attempt.completedAt).length,
			skillsTestedCount: new Set(testAttempts.map((attempt) => attempt.test.skill?.name).filter(Boolean)).size,
		};

		// skills distribution
		const skillsDistribution = skillsCount.reduce(
			(acc, group) => {
				const proficiencyKey = group.proficiency.toLowerCase() as keyof typeof acc;
				acc[proficiencyKey] = group._count.id;
				return acc;
			},
			{
				none: 0,
				basic: 0,
				intermediate: 0,
				advanced: 0,
				expert: 0,
			}
		);

		res.json({
			userId: id,
			stats: {
				skills: {
					total: skillsCount.reduce((sum, group) => sum + group._count.id, 0),
					distribution: skillsDistribution,
				},
				tests: testStats,
				bookmarks: bookmarksCount,
				recommendations: recommendations,
				joinedAt: user.createdAt,
			},
		});
	} catch (error) {
		console.error("Get user stats error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// get users list (admin only, with pagination and filtering)
router.get("/", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const currentUser = req.user!;

		if (currentUser.role !== "ADMIN") {
			return res.status(403).json({ error: "Admin access required" });
		}

		const { page = "1", limit = "20", search, role, regionId, sortBy = "createdAt", sortOrder = "desc" } = req.query;

		const pageNum = parseInt(page as string);
		const limitNum = parseInt(limit as string);
		const skip = (pageNum - 1) * limitNum;

		// build where clause
		const where: any = {};

		if (search) {
			where.OR = [{ name: { contains: search as string, mode: "insensitive" } }, { email: { contains: search as string, mode: "insensitive" } }, { headline: { contains: search as string, mode: "insensitive" } }];
		}

		if (role) {
			where.role = role;
		}

		if (regionId) {
			where.regionId = regionId;
		}

		// build order by
		const orderBy: any = {};
		orderBy[sortBy as string] = sortOrder;

		const [users, totalCount] = await Promise.all([
			prisma.user.findMany({
				where,
				select: {
					id: true,
					email: true,
					name: true,
					headline: true,
					role: true,
					regionId: true,
					createdAt: true,
					region: {
						select: {
							id: true,
							name: true,
							code: true,
						},
					},
					_count: {
						select: {
							skills: true,
							testAttempts: true,
							bookmarks: true,
						},
					},
				},
				orderBy,
				skip,
				take: limitNum,
			}),
			prisma.user.count({ where }),
		]);

		const totalPages = Math.ceil(totalCount / limitNum);

		res.json({
			users,
			pagination: {
				currentPage: pageNum,
				totalPages,
				totalCount,
				hasNext: pageNum < totalPages,
				hasPrev: pageNum > 1,
			},
		});
	} catch (error) {
		console.error("Get users list error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

export default router;
