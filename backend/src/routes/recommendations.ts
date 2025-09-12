import { Router, Response } from "express";
import { RecommendationAlgorithm, ProficiencyLevel } from "@prisma/client";
import { AuthenticatedRequest, authenticateSupabaseToken } from "../middleware/supabaseAuth";
import { prisma } from "../config/database";

const router = Router();

// get recommendations for a user
router.get("/", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { userId, skillId, algorithm, page = "1", limit = "20", sortBy = "score", sortOrder = "desc" } = req.query;

		const targetUserId = (userId as string) || req.user!.id;

		// verify user can access recommendations (own or admin)
		if (req.user?.id !== targetUserId && req.user?.role !== "ADMIN") {
			return res.status(403).json({ error: "Access denied" });
		}

		const pageNum = parseInt(page as string);
		const limitNum = parseInt(limit as string);
		const offset = (pageNum - 1) * limitNum;

		// build where clause
		const where: any = { userId: targetUserId };

		if (skillId) {
			where.skillId = skillId as string;
		}

		if (algorithm) {
			where.algorithm = algorithm as RecommendationAlgorithm;
		}

		// build order by
		const orderBy: any = {};
		if (sortBy === "createdAt") {
			orderBy.createdAt = sortOrder as "asc" | "desc";
		} else {
			orderBy.score = sortOrder as "asc" | "desc";
		}

		const [recommendations, totalCount] = await Promise.all([
			prisma.recommendation.findMany({
				where,
				include: {
					skill: {
						select: {
							id: true,
							name: true,
							slug: true,
							description: true,
						},
					},
					course: {
						include: {
							tags: {
								include: {
									tag: true,
								},
							},
							skills: {
								include: {
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
					},
				},
				orderBy,
				skip: offset,
				take: limitNum,
			}),
			prisma.recommendation.count({ where }),
		]);

		const totalPages = Math.ceil(totalCount / limitNum);

		res.json({
			recommendations: recommendations.map((rec) => ({
				...rec,
				course: rec.course
					? {
							...rec.course,
							tags: rec.course.tags.map((t) => t.tag),
							skills: rec.course.skills.map((s) => s.skill),
					  }
					: null,
			})),
			pagination: {
				currentPage: pageNum,
				totalPages,
				totalCount,
				hasNext: pageNum < totalPages,
				hasPrev: pageNum > 1,
			},
		});
	} catch (error) {
		console.error("Error fetching recommendations:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// generate new recommendations for a user
router.post("/generate", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { userId, algorithm = "RULES", maxRecommendations = 10 } = req.body;
		const targetUserId = userId || req.user!.id;

		// verify user can generate recommendations (own or admin)
		if (req.user?.id !== targetUserId && req.user?.role !== "ADMIN") {
			return res.status(403).json({ error: "Access denied" });
		}

		// verify user exists
		const user = await prisma.user.findUnique({
			where: { id: targetUserId },
			include: {
				skills: {
					include: {
						skill: {
							include: {
								courses: {
									include: {
										course: {
											include: {
												tags: {
													include: {
														tag: true,
													},
												},
											},
										},
									},
								},
							},
						},
					},
				},
				bookmarks: {
					select: {
						courseId: true,
					},
				},
			},
		});

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		// clear existing recommendations for this user
		await prisma.recommendation.deleteMany({
			where: { userId: targetUserId },
		});

		const recommendations = [];
		const bookmarkedCourseIds = new Set(user.bookmarks.map((b) => b.courseId));

		if (algorithm === "RULES" || algorithm === "CONTENT_BASED") {
			// rules-based and content-based recommendation logic
			const userSkills = user.skills;
			const courseScores = new Map<string, { course: any; score: number; reasons: string[] }>();

			for (const userSkill of userSkills) {
				const skill = userSkill.skill;
				const proficiencyLevel = userSkill.proficiency;
				const targetLevel = userSkill.targetLevel;

				// get courses for this skill
				for (const courseSkill of skill.courses) {
					const course = courseSkill.course;

					// skip already bookmarked courses
					if (bookmarkedCourseIds.has(course.id)) continue;

					let score = courseSkill.relevance; // base relevance score (0-100)
					const reasons = [];

					// boost score based on proficiency gap
					if (targetLevel && targetLevel !== proficiencyLevel) {
						const proficiencyLevels = ["NONE", "BASIC", "INTERMEDIATE", "ADVANCED", "EXPERT"];
						const currentIndex = proficiencyLevels.indexOf(proficiencyLevel);
						const targetIndex = proficiencyLevels.indexOf(targetLevel);

						if (targetIndex > currentIndex) {
							score += 20; // boost for growth opportunity
							reasons.push(`Helps progress from ${proficiencyLevel.toLowerCase()} to ${targetLevel.toLowerCase()}`);
						}
					}

					// boost score based on course difficulty matching user level
					const difficultyBoost = getDifficultyBoost(course.difficulty, proficiencyLevel);
					score += difficultyBoost.boost;
					if (difficultyBoost.reason) reasons.push(difficultyBoost.reason);

					// boost for highly rated courses
					if (course.rating && course.rating >= 4.0) {
						score += 10;
						reasons.push(`Highly rated (${course.rating}/5)`);
					}

					// boost for free courses
					if (!course.isPaid) {
						score += 5;
						reasons.push("Free course");
					}

					// update or create course score entry
					if (!courseScores.has(course.id)) {
						courseScores.set(course.id, {
							course,
							score: 0,
							reasons: [],
						});
					}

					const existing = courseScores.get(course.id)!;
					existing.score += score;
					existing.reasons.push(...reasons);
				}
			}

			// convert to array and sort by score
			const sortedCourses = Array.from(courseScores.entries())
				.map(([courseId, data]) => ({
					courseId,
					...data,
					score: Math.min(data.score, 100), // cap at 100
				}))
				.sort((a, b) => b.score - a.score)
				.slice(0, maxRecommendations);

			// create recommendation records
			for (const item of sortedCourses) {
				const recommendation = await prisma.recommendation.create({
					data: {
						userId: targetUserId,
						courseId: item.courseId,
						algorithm: algorithm as RecommendationAlgorithm,
						score: item.score,
						meta: {
							reasons: item.reasons,
							algorithm: algorithm,
						},
					},
				});
				recommendations.push(recommendation);
			}
		} else if (algorithm === "COLLAB_FILTER") {
			// collaborative filtering - find similar users and their bookmarked courses
			const similarUsers = await prisma.user.findMany({
				where: {
					id: { not: targetUserId },
					skills: {
						some: {
							skillId: {
								in: user.skills.map((s) => s.skillId),
							},
						},
					},
				},
				include: {
					bookmarks: {
						include: {
							course: true,
						},
					},
					skills: {
						include: {
							skill: true,
						},
					},
				},
				take: 20, // limit similar users for performance
			});

			const courseScores = new Map<string, number>();

			for (const similarUser of similarUsers) {
				// calculate similarity score based on shared skills
				const sharedSkills = similarUser.skills.filter((s) => user.skills.some((us) => us.skillId === s.skillId));

				const similarityScore = sharedSkills.length / Math.max(user.skills.length, similarUser.skills.length);

				// add points for their bookmarked courses
				for (const bookmark of similarUser.bookmarks) {
					if (bookmarkedCourseIds.has(bookmark.courseId)) continue;

					const currentScore = courseScores.get(bookmark.courseId) || 0;
					courseScores.set(bookmark.courseId, currentScore + similarityScore * 50);
				}
			}

			// convert to sorted array and create recommendations
			const sortedCourses = Array.from(courseScores.entries())
				.sort((a, b) => b[1] - a[1])
				.slice(0, maxRecommendations);

			for (const [courseId, score] of sortedCourses) {
				const recommendation = await prisma.recommendation.create({
					data: {
						userId: targetUserId,
						courseId,
						algorithm: "COLLAB_FILTER",
						score,
						meta: {
							algorithm: "COLLAB_FILTER",
							reasons: ["Recommended based on users with similar skills"],
						},
					},
				});
				recommendations.push(recommendation);
			}
		}

		// fetch the created recommendations with full details
		const fullRecommendations = await prisma.recommendation.findMany({
			where: {
				userId: targetUserId,
				id: { in: recommendations.map((r) => r.id) },
			},
			include: {
				skill: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
				course: {
					include: {
						tags: {
							include: {
								tag: true,
							},
						},
						skills: {
							include: {
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
				},
			},
			orderBy: {
				score: "desc",
			},
		});

		res.status(201).json({
			message: `Generated ${fullRecommendations.length} recommendations using ${algorithm} algorithm`,
			recommendations: fullRecommendations.map((rec) => ({
				...rec,
				course: rec.course
					? {
							...rec.course,
							tags: rec.course.tags.map((t) => t.tag),
							skills: rec.course.skills.map((s) => s.skill),
					  }
					: null,
			})),
			algorithm,
			count: fullRecommendations.length,
		});
	} catch (error) {
		console.error("Error generating recommendations:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// helper function to determine difficulty boost based on user proficiency
function getDifficultyBoost(courseDifficulty: string, userProficiency: ProficiencyLevel): { boost: number; reason?: string } {
	const difficultyMap = {
		BEGINNER: 0,
		INTERMEDIATE: 1,
		ADVANCED: 2,
	};

	const proficiencyMap = {
		NONE: 0,
		BASIC: 0,
		INTERMEDIATE: 1,
		ADVANCED: 2,
		EXPERT: 2,
	};

	const courseDifficultyLevel = difficultyMap[courseDifficulty as keyof typeof difficultyMap] ?? 0;
	const userProficiencyLevel = proficiencyMap[userProficiency];

	if (courseDifficultyLevel === userProficiencyLevel) {
		return { boost: 15, reason: "Perfect difficulty match for your level" };
	} else if (courseDifficultyLevel === userProficiencyLevel + 1) {
		return { boost: 10, reason: "Slightly challenging - good for growth" };
	} else if (courseDifficultyLevel === userProficiencyLevel - 1) {
		return { boost: 5, reason: "Good for reinforcing fundamentals" };
	} else if (courseDifficultyLevel > userProficiencyLevel + 1) {
		return { boost: -10, reason: "May be too advanced" };
	} else {
		return { boost: -5, reason: "May be too basic" };
	}
}

export default router;
