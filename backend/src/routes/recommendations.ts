import { Router, Response } from "express";
import { RecommendationAlgorithm, ProficiencyLevel } from "@prisma/client";
import { AuthenticatedRequest, authenticateSupabaseToken } from "../middleware/supabaseAuth";
import { prisma } from "../config/database";
import { generateAICourseRecommendations } from "../services/aiCourseService";

const router = Router();

// get recommendations for a specific user
router.get("/", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const userId = req.user?.id;
		if (!userId) {
			return res.status(401).json({ error: "User not found" });
		}

		const algorithm = (req.query.algorithm as RecommendationAlgorithm) || RecommendationAlgorithm.SEMANTIC;
		const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
		const page = parseInt(req.query.page as string) || 1;
		const offset = (page - 1) * limit;

		// get user with skills and bookmarks
		const user = await prisma.user.findUnique({
			where: { id: userId },
			include: {
				skills: {
					include: {
						skill: {
							select: {
								id: true,
								name: true,
								slug: true,
								description: true,
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

		const bookmarkedCourseIds = new Set(user.bookmarks.map((b) => b.courseId));

		if (algorithm === RecommendationAlgorithm.SEMANTIC) {
			// use ai service for recommendations
			const userSkills = user.skills.map((us) => ({
				name: us.skill.name,
				proficiency: us.proficiency || ProficiencyLevel.BASIC,
				progress: us.progress || 0,
			}));

			if (userSkills.length === 0) {
				return res.json({ recommendations: [], totalCount: 0, page, limit });
			}

			// get all courses with skills (excluding bookmarked)
			const courses = await prisma.course.findMany({
				where: {
					id: {
						notIn: Array.from(bookmarkedCourseIds),
					},
				},
				include: {
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
			});

			// format courses for ai service
			const coursesForAI = courses.map((course) => ({
				id: course.id,
				title: course.title,
				description: course.description || "",
				skills: course.skills.map((cs) => ({ name: cs.skill.name })),
			}));

			// get ai recommendations
			const aiRecommendations = await generateAICourseRecommendations(userSkills, coursesForAI);

			// apply pagination to ai results
			const paginatedRecommendations = aiRecommendations.courses.slice(offset, offset + limit);

			// format response
			const recommendations = paginatedRecommendations.map((rec) => ({
				id: `ai-${rec.course_id}`,
				score: rec.relevance_score,
				algorithm: RecommendationAlgorithm.SEMANTIC,
				course: courses.find((c) => c.id === rec.course_id),
			}));

			return res.json({
				recommendations,
				totalCount: aiRecommendations.courses.length,
				page,
				limit,
			});
		}

		// skill-based recommendations (fallback)
		if (user.skills.length === 0) {
			return res.json({ recommendations: [], totalCount: 0, page, limit });
		}

		const userSkillIds = user.skills.map((us) => us.skillId);

		// find courses that match user skills
		const courses = await prisma.course.findMany({
			where: {
				id: {
					notIn: Array.from(bookmarkedCourseIds),
				},
				skills: {
					some: {
						skillId: {
							in: userSkillIds,
						},
					},
				},
			},
			include: {
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
			take: limit,
			skip: offset,
		});

		// calculate skill match scores
		const recommendations = courses.map((course) => {
			const courseSkillIds = course.skills.map((cs) => cs.skillId);
			const matchingSkillsCount = courseSkillIds.filter((skillId) => userSkillIds.includes(skillId)).length;
			const score = matchingSkillsCount / Math.max(courseSkillIds.length, 1);

			return {
				id: `skill-${course.id}`,
				score,
				algorithm: RecommendationAlgorithm.CONTENT_BASED,
				course,
			};
		});

		// sort by score descending
		recommendations.sort((a, b) => b.score - a.score);

		// get total count for pagination
		const totalCount = await prisma.course.count({
			where: {
				id: {
					notIn: Array.from(bookmarkedCourseIds),
				},
				skills: {
					some: {
						skillId: {
							in: userSkillIds,
						},
					},
				},
			},
		});

		res.json({
			recommendations,
			totalCount,
			page,
			limit,
		});
	} catch (error) {
		console.error("Get recommendations error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// generate new recommendations for user
router.post("/generate", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const userId = req.user?.id;
		if (!userId) {
			return res.status(401).json({ error: "User not found" });
		}

		const { algorithm = "SEMANTIC", maxRecommendations = 20 } = req.body;

		// validate algorithm
		const validAlgorithms = ["RULES", "CONTENT_BASED", "COLLAB_FILTER", "HYBRID", "SEMANTIC"];
		if (!validAlgorithms.includes(algorithm)) {
			return res.status(400).json({ error: "Invalid algorithm" });
		}

		// get user with skills and bookmarks
		const user = await prisma.user.findUnique({
			where: { id: userId },
			include: {
				skills: {
					include: {
						skill: {
							select: {
								id: true,
								name: true,
								slug: true,
								description: true,
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

		if (user.skills.length === 0) {
			return res.json({
				message: "No skills found. Please add skills to get recommendations.",
				recommendations: [],
				algorithm,
				count: 0,
			});
		}

		const bookmarkedCourseIds = new Set(user.bookmarks.map((b) => b.courseId));

		let recommendations: any[] = [];

		if (algorithm === "SEMANTIC") {
			// use ai service for recommendations
			const userSkills = user.skills.map((us) => ({
				name: us.skill.name,
				proficiency: us.proficiency || ProficiencyLevel.BASIC,
				progress: us.progress || 0,
			}));

			// get all courses with skills (excluding bookmarked)
			const courses = await prisma.course.findMany({
				where: {
					id: {
						notIn: Array.from(bookmarkedCourseIds),
					},
				},
				include: {
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
			});

			// format courses for ai service
			const coursesForAI = courses.map((course) => ({
				id: course.id,
				title: course.title,
				description: course.description || "",
				skills: course.skills.map((cs) => ({ name: cs.skill.name })),
			}));

			// get ai recommendations
			const aiRecommendations = await generateAICourseRecommendations(userSkills, coursesForAI, maxRecommendations);

			// format response
			recommendations = aiRecommendations.courses.slice(0, maxRecommendations).map((rec) => ({
				id: `ai-${rec.course_id}`,
				score: rec.relevance_score,
				algorithm: RecommendationAlgorithm.SEMANTIC,
				course: courses.find((c) => c.id === rec.course_id),
			}));
		} else {
			// content-based recommendations (fallback)
			const userSkillIds = user.skills.map((us) => us.skillId);

			// find courses that match user skills
			const courses = await prisma.course.findMany({
				where: {
					id: {
						notIn: Array.from(bookmarkedCourseIds),
					},
					skills: {
						some: {
							skillId: {
								in: userSkillIds,
							},
						},
					},
				},
				include: {
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
				take: maxRecommendations,
			});

			// calculate skill match scores
			recommendations = courses.map((course) => {
				const courseSkillIds = course.skills.map((cs) => cs.skillId);
				const matchingSkillsCount = courseSkillIds.filter((skillId) => userSkillIds.includes(skillId)).length;
				const score = matchingSkillsCount / Math.max(courseSkillIds.length, 1);

				return {
					id: `skill-${course.id}`,
					score,
					algorithm: RecommendationAlgorithm.CONTENT_BASED,
					course,
				};
			});

			// sort by score descending
			recommendations.sort((a, b) => b.score - a.score);
		}

		res.json({
			message: `Generated ${recommendations.length} recommendations using ${algorithm} algorithm`,
			recommendations,
			algorithm,
			count: recommendations.length,
		});
	} catch (error) {
		console.error("Generate recommendations error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// generate AI skill suggestions
router.post("/ai-skills", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const userId = req.user?.id;
		if (!userId) {
			return res.status(401).json({ error: "User not found" });
		}

		const { prompt } = req.body;
		if (!prompt || typeof prompt !== "string") {
			return res.status(400).json({ error: "Prompt is required" });
		}

		// import AI skill service
		const { generateAISkillSuggestions } = await import("../services/aiSkillService");

		// get available skills from database
		const dbSkills = await prisma.skill.findMany({
			select: {
				id: true,
				name: true,
				slug: true,
				description: true,
			},
		});

		// map to format expected by AI service
		const availableSkills = dbSkills.map((skill) => ({
			name: skill.name,
			slug: skill.slug,
			description: skill.description || undefined,
		}));

		// generate AI skill suggestions
		console.log(`[AI SKILLS] Generating suggestions for user ${userId} with prompt: "${prompt}"`);
		const aiResponse = await generateAISkillSuggestions(prompt, availableSkills);

		// map AI suggestions to our response format
		const skillSuggestions = await Promise.all(
			aiResponse.skills.map(async (suggestion) => {
				// find the skill in database by name or slug
				const skill = dbSkills.find((s) => s.slug === suggestion.skillSlug || s.name.toLowerCase() === suggestion.skillName.toLowerCase());

				if (!skill) {
					console.warn(`[AI SKILLS] Skill not found in database: ${suggestion.skillName}`);
					return null;
				}

				return {
					skill: {
						id: skill.id,
						name: skill.name,
						slug: skill.slug,
						description: skill.description,
					},
					suggestedProficiency: suggestion.suggestedProficiency,
					reason: suggestion.reason,
					priority: suggestion.priority,
				};
			})
		);

		// filter out null results and sort by priority
		const validSuggestions = skillSuggestions.filter((s): s is NonNullable<typeof s> => s !== null).sort((a, b) => b.priority - a.priority);

		res.json({
			skills: validSuggestions,
			analysis: aiResponse.analysis,
			prompt,
			totalSuggestions: validSuggestions.length,
		});
	} catch (error) {
		console.error("AI skills generation error:", error);
		res.status(500).json({
			error: "Failed to generate skill suggestions",
			details: error instanceof Error ? error.message : "Unknown error",
		});
	}
});

export default router;
