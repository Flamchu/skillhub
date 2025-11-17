import { Router, Request, Response } from "express";
import { AuthenticatedRequest, authenticateSupabaseToken, requireAdmin } from "../middleware/supabaseAuth";
import { validate, extractSchemas } from "../middleware/validation";
import { catchAsync, createError } from "../middleware/errorHandler";
import { schemas } from "../schemas";
import { cache, cacheConfigs } from "../middleware/cache";
import { prisma } from "../config/database";

const router = Router();

// get user by id (public route for basic profile info)
router.get(
	"/:id",
	validate(extractSchemas(schemas.getUser)),
	cache(cacheConfigs.userProfile),
	catchAsync(async (req: Request, res: Response) => {
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
			throw createError.notFound("User not found");
		}

		res.json({ user });
	})
);

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

// toggle social environment (protected)
router.patch("/:id/social-toggle", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { id } = req.params;
		const { enabled } = req.body;
		const currentUser = req.user!;

		// users can only toggle their own social environment
		if (currentUser.id !== id && currentUser.role !== "ADMIN") {
			return res.status(403).json({ error: "Access denied" });
		}

		if (typeof enabled !== "boolean") {
			return res.status(400).json({ error: "Enabled must be a boolean value" });
		}

		const user = await prisma.user.update({
			where: { id },
			data: {
				socialEnabled: enabled,
			},
			select: {
				id: true,
				socialEnabled: true,
			},
		});

		res.json({
			message: `Social environment ${enabled ? "enabled" : "disabled"} successfully`,
			socialEnabled: user.socialEnabled,
		});
	} catch (error) {
		console.error("Toggle social environment error:", error);
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

		// check if user exists and is not already deleted
		const user = await prisma.user.findUnique({
			where: { id },
		});

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		if (user.deletedAt) {
			return res.status(410).json({ error: "User account already deleted" });
		}

		// soft delete for data retention and audit trail
		await prisma.user.update({
			where: { id },
			data: {
				deletedAt: new Date(),
				email: `deleted_${id}@deleted.local`, // prevent email conflicts on re-registration
			},
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

// get user recent activity (protected, only own activity or admin)
router.get("/:id/activity", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { id } = req.params;
		const currentUser = req.user!;
		const { limit = "10" } = req.query;

		// users can only access their own activity unless they're admin
		if (currentUser.id !== id && currentUser.role !== "ADMIN") {
			return res.status(403).json({ error: "Access denied" });
		}

		const user = await prisma.user.findUnique({
			where: { id },
		});

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const limitNum = Math.min(parseInt(limit as string), 50); // max 50 items

		// get recent enrollments and progress
		const [recentEnrollments, recentProgress, recentCompletions] = await Promise.all([
			// recent course enrollments
			prisma.enrollment.findMany({
				where: {
					userId: id,
					enrolledAt: {
						gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // last 30 days
					},
				},
				include: {
					course: {
						select: {
							id: true,
							title: true,
							provider: true,
							source: true,
						},
					},
				},
				orderBy: { enrolledAt: "desc" },
				take: limitNum,
			}),

			// recent lesson progress
			prisma.userProgress.findMany({
				where: {
					userId: id,
					lastAccessedAt: {
						gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // last 30 days
					},
				},
				include: {
					lesson: {
						select: {
							id: true,
							title: true,
							course: {
								select: {
									id: true,
									title: true,
								},
							},
						},
					},
				},
				orderBy: { lastAccessedAt: "desc" },
				take: limitNum,
			}),

			// recent course completions
			prisma.enrollment.findMany({
				where: {
					userId: id,
					isCompleted: true,
					completedAt: {
						not: null,
						gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // last 30 days
					},
				},
				include: {
					course: {
						select: {
							id: true,
							title: true,
							provider: true,
							source: true,
						},
					},
				},
				orderBy: { completedAt: "desc" },
				take: limitNum,
			}),
		]);

		// format activity items
		const activity: any[] = [
			// enrollments
			...recentEnrollments.map((enrollment) => ({
				id: enrollment.id,
				type: "enrollment",
				title: `Enrolled in ${enrollment.course.title}`,
				description: `Started learning ${enrollment.course.title}`,
				courseId: enrollment.course.id,
				courseTitle: enrollment.course.title,
				provider: enrollment.course.provider,
				timestamp: enrollment.enrolledAt,
				icon: "BookOpen",
			})),

			// lesson progress
			...recentProgress
				.filter((p) => p.progressPercent && p.progressPercent > 0) // only actual progress
				.map((progress) => ({
					id: progress.id,
					type: "progress",
					title: progress.completed ? `Completed "${progress.lesson.title}"` : `Progress in "${progress.lesson.title}"`,
					description: progress.completed ? `Finished lesson in ${progress.lesson.course.title}` : `Made progress in ${progress.lesson.course.title} (${progress.progressPercent}%)`,
					courseId: progress.lesson.course.id,
					courseTitle: progress.lesson.course.title,
					lessonId: progress.lesson.id,
					lessonTitle: progress.lesson.title,
					progressPercent: progress.progressPercent,
					completed: progress.completed,
					timestamp: progress.lastAccessedAt,
					icon: progress.completed ? "CheckCircle" : "Play",
				})),

			// course completions
			...recentCompletions
				.filter((completion) => completion.completedAt !== null) // ensure completedAt exists
				.map((completion) => ({
					id: completion.id + "_completed",
					type: "completion",
					title: `Completed ${completion.course.title}`,
					description: `Successfully finished the entire course`,
					courseId: completion.course.id,
					courseTitle: completion.course.title,
					provider: completion.course.provider,
					timestamp: completion.completedAt!,
					icon: "Award",
				})),
		]
			.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
			.slice(0, limitNum);

		// format timestamps
		const formattedActivity = activity.map((item) => ({
			...item,
			timeAgo: formatTimeAgo(new Date(item.timestamp)),
			timestamp: item.timestamp,
		}));

		res.json({
			userId: id,
			activity: formattedActivity,
			totalCount: formattedActivity.length,
		});
	} catch (error) {
		console.error("Get user activity error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// format relative time
function formatTimeAgo(date: Date): string {
	const now = new Date();
	const diffInMs = now.getTime() - date.getTime();
	const diffInMins = Math.floor(diffInMs / (1000 * 60));
	const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
	const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

	if (diffInMins < 1) return "just now";
	if (diffInMins < 60) return `${diffInMins} minute${diffInMins > 1 ? "s" : ""} ago`;
	if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
	if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
	if (diffInDays < 30) {
		const weeks = Math.floor(diffInDays / 7);
		return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
	}
	const months = Math.floor(diffInDays / 30);
	return `${months} month${months > 1 ? "s" : ""} ago`;
}

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

		// build where clause - exclude soft-deleted users
		const where: any = {
			deletedAt: null,
		};

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

// admin: get soft-deleted users
router.get("/deleted/list", authenticateSupabaseToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { page = "1", limit = "20" } = req.query;

		const pageNum = parseInt(page as string);
		const limitNum = parseInt(limit as string);
		const skip = (pageNum - 1) * limitNum;

		const [users, totalCount] = await Promise.all([
			prisma.user.findMany({
				where: {
					deletedAt: { not: null },
				},
				select: {
					id: true,
					email: true,
					name: true,
					headline: true,
					role: true,
					createdAt: true,
					deletedAt: true,
					_count: {
						select: {
							skills: true,
							testAttempts: true,
							bookmarks: true,
						},
					},
				},
				orderBy: { deletedAt: "desc" },
				skip,
				take: limitNum,
			}),
			prisma.user.count({ where: { deletedAt: { not: null } } }),
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
		console.error("Get deleted users error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// admin: restore soft-deleted user
router.patch("/:id/restore", authenticateSupabaseToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { id } = req.params;

		const user = await prisma.user.findUnique({
			where: { id },
			select: { id: true, email: true, deletedAt: true, supabaseId: true },
		});

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		if (!user.deletedAt) {
			return res.status(400).json({ error: "User is not deleted" });
		}

		// restore the user
		const restoredUser = await prisma.user.update({
			where: { id },
			data: {
				deletedAt: null,
				email: user.email?.startsWith("deleted_") ? user.email.replace(/^deleted_[a-f0-9-]+@deleted\.local$/, "") || user.email : user.email,
			},
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				deletedAt: true,
			},
		});

		res.json({
			message: "User restored successfully",
			user: restoredUser,
		});
	} catch (error) {
		console.error("Restore user error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// clear user data (protected - fresh start)
router.post("/:id/clear-data", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { id } = req.params;
		const currentUser = req.user!;

		// users can only clear their own data
		if (currentUser.id !== id) {
			return res.status(403).json({ error: "Access denied" });
		}

		// delete all user's learning data in a transaction
		await prisma.$transaction(async (tx) => {
			// delete user skills
			await tx.userSkill.deleteMany({
				where: { userId: id },
			});

			// delete enrollments
			await tx.enrollment.deleteMany({
				where: { userId: id },
			});

			// delete user progress
			await tx.userProgress.deleteMany({
				where: { userId: id },
			});

			// delete bookmarks
			await tx.bookmark.deleteMany({
				where: { userId: id },
			});

			// delete test attempts
			await tx.testAttempt.deleteMany({
				where: { userId: id },
			});

			// delete skill verification attempts
			await tx.skillVerificationAttempt.deleteMany({
				where: { userId: id },
			});

			// delete recommendations
			await tx.recommendation.deleteMany({
				where: { userId: id },
			});
		});

		res.json({
			message: "All learning data cleared successfully",
			cleared: true,
		});
	} catch (error) {
		console.error("Clear user data error:", error);
		res.status(500).json({ error: "Failed to clear user data" });
	}
});

// delete user account (protected - soft delete)
router.delete("/:id/account", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { id } = req.params;
		const currentUser = req.user!;

		// users can only delete their own account
		if (currentUser.id !== id) {
			return res.status(403).json({ error: "Access denied" });
		}

		const user = await prisma.user.findUnique({
			where: { id },
			select: { id: true, email: true, supabaseId: true, deletedAt: true },
		});

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		if (user.deletedAt) {
			return res.status(400).json({ error: "Account already deleted" });
		}

		// soft delete the user account
		const deletedUser = await prisma.user.update({
			where: { id },
			data: {
				deletedAt: new Date(),
				email: user.email ? `deleted_${user.id}@deleted.local` : null,
			},
			select: {
				id: true,
				email: true,
				deletedAt: true,
			},
		});

		res.json({
			message: "Account deleted successfully",
			user: deletedUser,
		});
	} catch (error) {
		console.error("Delete account error:", error);
		res.status(500).json({ error: "Failed to delete account" });
	}
});

export default router;
