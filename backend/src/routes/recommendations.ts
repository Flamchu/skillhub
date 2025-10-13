import { Router, Response } from "express";
import { RecommendationAlgorithm, ProficiencyLevel } from "@prisma/client";
import { AuthenticatedRequest, authenticateSupabaseToken } from "../middleware/supabaseAuth";
import { prisma } from "../config/database";
import { generateAICourseRecommendations } from "../services/aiCourseService";

const router = Router();

// get recommendations for a specific user
router.get(
	"/",
	authenticateSupabaseToken,
	async (req: AuthenticatedRequest, res: Response) => {
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
	},
);

export default router;