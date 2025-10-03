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
			// enhanced rules-based and content-based recommendation logic
			const userSkills = user.skills;
			const courseScores = new Map<string, { course: any; score: number; reasons: string[] }>();

			// get related skills for better recommendations
			const relatedSkills = await getRelatedSkills(userSkills.map((us) => us.skillId));

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

			// also consider courses for related skills (with lower weight)
			for (const relatedSkillId of relatedSkills) {
				const relatedSkill = await prisma.skill.findUnique({
					where: { id: relatedSkillId },
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
				});

				if (relatedSkill) {
					for (const courseSkill of relatedSkill.courses) {
						const course = courseSkill.course;

						// skip already bookmarked courses
						if (bookmarkedCourseIds.has(course.id)) continue;

						let score = courseSkill.relevance * 0.6; // reduced weight for related skills
						const reasons = [`Related to your ${relatedSkill.name} interests`];

						// boost for highly rated courses
						if (course.rating && course.rating >= 4.0) {
							score += 5;
							reasons.push(`Highly rated (${course.rating}/5)`);
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

// skill correlation mapping - skills that are commonly learned together
const SKILL_CORRELATIONS: Record<string, string[]> = {
	"html": ["css", "javascript", "web-development"],
	"css": ["html", "javascript", "sass", "tailwind"],
	"javascript": ["html", "css", "typescript", "react", "node.js"],
	"typescript": ["javascript", "react", "node.js", "angular"],
	"react": ["javascript", "typescript", "html", "css", "next.js"],
	"vue": ["javascript", "typescript", "html", "css"],
	"angular": ["typescript", "javascript", "html", "css"],
	"node.js": ["javascript", "typescript", "express", "mongodb"],
	"express": ["node.js", "javascript", "rest-api"],
	"mongodb": ["node.js", "database", "nosql"],
	"sql": ["database", "postgresql", "mysql"],
	"postgresql": ["sql", "database"],
	"mysql": ["sql", "database"],
	"python": ["django", "flask", "data-science", "machine-learning"],
	"django": ["python", "web-development"],
	"flask": ["python", "web-development"],
	"java": ["spring", "android", "backend"],
	"spring": ["java", "backend"],
	"docker": ["devops", "kubernetes", "deployment"],
	"kubernetes": ["docker", "devops", "deployment"],
	"aws": ["cloud", "devops", "deployment"],
	"azure": ["cloud", "devops", "deployment"],
	"git": ["version-control", "github", "development"],
	"github": ["git", "version-control", "development"],
};

// get related skills based on correlation mapping
async function getRelatedSkills(userSkillIds: string[]): Promise<string[]> {
	// get skill slugs for the user's skills
	const userSkills = await prisma.skill.findMany({
		where: { id: { in: userSkillIds } },
		select: { slug: true },
	});

	const relatedSlugs = new Set<string>();

	// find correlated skills
	for (const userSkill of userSkills) {
		const correlations = SKILL_CORRELATIONS[userSkill.slug.toLowerCase()] || [];
		correlations.forEach((slug) => relatedSlugs.add(slug));
	}

	// get skill IDs for related skills
	const relatedSkills = await prisma.skill.findMany({
		where: {
			slug: {
				in: Array.from(relatedSlugs),
				mode: "insensitive",
			},
		},
		select: { id: true },
	});

	return relatedSkills.map((s) => s.id);
}

// ai skill generation endpoint
router.post("/ai-skills", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { prompt, userId } = req.body;
		const targetUserId = userId || req.user!.id;

		// verify user can generate skills (own or admin)
		if (req.user?.id !== targetUserId && req.user?.role !== "ADMIN") {
			return res.status(403).json({ error: "Access denied" });
		}

		if (!prompt || prompt.trim().length < 10) {
			return res.status(400).json({ error: "Please provide a detailed description (at least 10 characters)" });
		}

		// generate skill suggestions based on prompt
		const suggestedSkills = await generateSkillsFromPrompt(prompt);

		res.json({
			message: "AI skill suggestions generated successfully",
			skills: suggestedSkills,
			prompt: prompt.trim(),
		});
	} catch (error) {
		console.error("Error generating AI skills:", error);
		res.status(500).json({ error: "Failed to generate skill suggestions" });
	}
});

// generate skills from ai prompt using local service
async function generateSkillsFromPrompt(prompt: string): Promise<{ skill: any; suggestedProficiency: ProficiencyLevel; reason: string }[]> {
	console.log(`[generateSkillsFromPrompt] Starting with prompt: "${prompt}"`);

	// get all skills from database
	const allSkills = await prisma.skill.findMany({
		select: { id: true, name: true, slug: true, description: true },
	});

	console.log(`[generateSkillsFromPrompt] Found ${allSkills.length} skills in database`);

	// use local ai service
	const { generateAISkillSuggestions } = await import("../services/aiSkillService");
	console.log("[generateSkillsFromPrompt] AI service imported successfully");

	const skillsForAI = allSkills.map((skill) => ({
		name: skill.name,
		slug: skill.slug,
		description: skill.description || undefined,
	}));

	console.log(`[generateSkillsFromPrompt] Calling AI service with ${skillsForAI.length} skills`);
	console.log(`[generateSkillsFromPrompt] About to call generateAISkillSuggestions...`);
	const aiResponse = await generateAISkillSuggestions(prompt, skillsForAI);
	console.log(`[generateSkillsFromPrompt] AI response received:`, aiResponse);
	console.log(`[generateSkillsFromPrompt] AI response skills count: ${aiResponse.skills.length}`);

	// convert ai suggestions to database format
	const suggestions: { skill: any; suggestedProficiency: ProficiencyLevel; reason: string }[] = [];

	for (const aiSuggestion of aiResponse.skills) {
		const dbSkill = allSkills.find((skill) => skill.slug === aiSuggestion.skillSlug && skill.name === aiSuggestion.skillName);

		if (dbSkill) {
			suggestions.push({
				skill: dbSkill,
				suggestedProficiency: aiSuggestion.suggestedProficiency,
				reason: aiSuggestion.reason,
			});
		}
	}

	// fallback to basic suggestions if ai found nothing
	if (suggestions.length === 0) {
		const fallbackSkills = ["html", "css", "javascript", "git"];
		for (const slug of fallbackSkills) {
			const skill = allSkills.find((s) => s.slug.toLowerCase() === slug);
			if (skill) {
				suggestions.push({
					skill,
					suggestedProficiency: "BASIC" as ProficiencyLevel,
					reason: "Essential foundation skill for web development",
				});
			}
		}
	}

	return suggestions.slice(0, 8); // limit to 8 suggestions
}

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
