import { Router, Request, Response } from "express";
import { CourseSource, CourseDifficulty, QuestType, XPSource } from "@prisma/client";
import { AuthenticatedRequest, authenticateSupabaseToken } from "../middleware/supabaseAuth";
import { cache, cacheConfigs, invalidateCacheMiddleware } from "../middleware/cache";
import { redis, isRedisAvailable, generateCacheKey, CACHE_TTL, CACHE_KEYS } from "../config/redis";
import { prisma } from "../config/database";
import { YouTubeService } from "../services/youtubeService";
import { validate, extractSchemas, ValidatedRequest } from "../middleware/validation";
import { schemas } from "../schemas";
import { aiSummaryService } from "../services/aiSummaryService";
import { checkQuestProgress, awardXP, updateStreak } from "../services/socialService";
import { generateMissingAiSummaries } from "../scripts/generateAiSummaries";

// combined interface for authenticated and validated requests
interface AuthenticatedValidatedRequest extends AuthenticatedRequest, ValidatedRequest {}

const router = Router();

// get user enrollments
router.get("/enrollments", authenticateSupabaseToken, validate(extractSchemas(schemas.getUserEnrollments)), async (req: AuthenticatedValidatedRequest, res: Response) => {
	try {
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({ error: "User not authenticated" });
		}

		// use validated query data with defaults
		const { page = 1, limit = 20 } = req.validatedQuery || {};
		const offset = (Number(page) - 1) * Number(limit);

		// generate cache key
		const cacheKey = generateCacheKey(CACHE_KEYS.USER_ENROLLMENTS, userId, String(page), String(limit));

		// try to get from cache
		if (isRedisAvailable && redis) {
			const cached = await redis.get(cacheKey);
			if (cached) {
				return res.json(JSON.parse(cached));
			}
		}

		const enrollments = await prisma.enrollment.findMany({
			where: {
				userId,
			},
			include: {
				course: {
					include: {
						_count: {
							select: {
								lessons: true,
							},
						},
					},
				},
			},
			orderBy: {
				enrolledAt: "desc",
			},
			skip: offset,
			take: Number(limit),
		});

		const totalCount = await prisma.enrollment.count({
			where: {
				userId,
			},
		});

		const totalPages = Math.ceil(totalCount / Number(limit));

		const result = {
			enrollments,
			pagination: {
				page: Number(page),
				limit: Number(limit),
				totalCount,
				totalPages,
				hasNext: Number(page) < totalPages,
				hasPrev: Number(page) > 1,
			},
		};

		// cache the result (5 minutes)
		if (isRedisAvailable && redis) {
			await redis.setex(cacheKey, CACHE_TTL.SHORT, JSON.stringify(result));
		}

		res.json(result);
	} catch (error) {
		console.error("Error fetching user enrollments:", error);
		res.status(500).json({ error: "Failed to fetch user enrollments" });
	}
});

// get courses
router.get("/", cache(cacheConfigs.coursesList), async (req: Request, res: Response) => {
	try {
		const { skillId, difficulty, freeOnly = "false", provider, source, language = "en", minRating, maxDuration, search, page = "1", limit = "20", sortBy = "createdAt", sortOrder = "desc" } = req.query;

		// where clause
		const where: any = {};

		if (skillId) {
			where.skills = {
				some: {
					skillId: skillId as string,
				},
			};
		}

		// filter by skill tags has been removed - use skillId instead

		if (difficulty) {
			where.difficulty = difficulty as CourseDifficulty;
		}

		if (freeOnly === "true") {
			where.isPaid = false;
		}

		if (provider) {
			where.provider = {
				contains: provider as string,
				mode: "insensitive",
			};
		}

		if (source) {
			where.source = source as CourseSource;
		}

		if (language) {
			where.language = language as string;
		}

		if (minRating) {
			where.rating = {
				gte: parseFloat(minRating as string),
			};
		}

		if (maxDuration) {
			where.durationMinutes = {
				lte: parseInt(maxDuration as string),
			};
		}

		if (search) {
			where.OR = [
				{
					title: {
						contains: search as string,
						mode: "insensitive",
					},
				},
				{
					description: {
						contains: search as string,
						mode: "insensitive",
					},
				},
				{
					provider: {
						contains: search as string,
						mode: "insensitive",
					},
				},
			];
		}

		// order
		const orderBy: any = {};
		orderBy[sortBy as string] = sortOrder;

		// pagination
		const pageNum = parseInt(page as string);
		const limitNum = parseInt(limit as string);
		const skip = (pageNum - 1) * limitNum;

		const [courses, totalCount] = await Promise.all([
			prisma.course.findMany({
				where,
				skip,
				take: limitNum,
				orderBy,
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
					_count: {
						select: {
							Bookmark: true,
							Recommendation: true,
							enrollments: true,
						},
					},
				},
			}),
			prisma.course.count({ where }),
		]);

		const totalPages = Math.ceil(totalCount / limitNum);

		res.json({
			courses,
			pagination: {
				page: pageNum,
				limit: limitNum,
				totalCount,
				totalPages,
				hasNext: pageNum < totalPages,
				hasPrev: pageNum > 1,
			},
		});
	} catch (error) {
		console.error("Error fetching courses:", error);
		res.status(500).json({ error: "Failed to fetch courses" });
	}
});

// get course by id
router.get("/:id", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const course = await prisma.course.findUnique({
			where: { id },
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
					orderBy: {
						relevance: "desc",
					},
				},
				_count: {
					select: {
						Bookmark: true,
						Recommendation: true,
						enrollments: true,
					},
				},
			},
		});

		if (!course) {
			return res.status(404).json({ error: "Course not found" });
		}

		res.json({ course });
	} catch (error) {
		console.error("Error fetching course:", error);
		res.status(500).json({ error: "Failed to fetch course" });
	}
});

// create course
router.post("/", authenticateSupabaseToken, invalidateCacheMiddleware([`${CACHE_KEYS.COURSES_LIST}:*`]), async (req: AuthenticatedRequest, res: Response) => {
	try {
		if (req.user?.role !== "ADMIN") {
			return res.status(403).json({ error: "Admin access required" });
		}

		const { title, description, aiSummary, provider, source = "INTERNAL", externalId, url, language = "en", difficulty = "BEGINNER", durationMinutes, rating, isPaid = false, priceCents, skills = [] } = req.body;

		// validate
		if (!title) {
			return res.status(400).json({ error: "Title is required" });
		}

		if (!Object.values(CourseSource).includes(source)) {
			return res.status(400).json({ error: "Invalid course source" });
		}

		if (!Object.values(CourseDifficulty).includes(difficulty)) {
			return res.status(400).json({ error: "Invalid difficulty level" });
		}

		if (rating && (rating < 0 || rating > 5)) {
			return res.status(400).json({ error: "Rating must be between 0 and 5" });
		}

		if (durationMinutes && durationMinutes < 0) {
			return res.status(400).json({ error: "Duration must be positive" });
		}

		if (priceCents && priceCents < 0) {
			return res.status(400).json({ error: "Price must be positive" });
		}

		// create with relations
		const course = await prisma.course.create({
			data: {
				title,
				description,
				aiSummary,
				provider,
				source,
				externalId,
				url,
				language,
				difficulty,
				durationMinutes,
				rating,
				isPaid,
				priceCents,
				skills: {
					create: skills.map((skillData: { skillId: string; relevance?: number }) => ({
						skillId: skillData.skillId,
						relevance: skillData.relevance || 50,
					})),
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

		res.status(201).json({ message: "Course created successfully", course });
	} catch (error) {
		console.error("Error creating course:", error);
		res.status(500).json({ error: "Failed to create course" });
	}
});

// update course
router.patch("/:id", authenticateSupabaseToken, invalidateCacheMiddleware([`${CACHE_KEYS.COURSES_LIST}:*`, `${CACHE_KEYS.COURSE_DETAIL}:*`]), async (req: AuthenticatedRequest, res: Response) => {
	try {
		if (req.user?.role !== "ADMIN") {
			return res.status(403).json({ error: "Admin access required" });
		}

		const { id } = req.params;
		const { title, description, aiSummary, provider, source, externalId, url, language, difficulty, durationMinutes, rating, isPaid, priceCents, skills } = req.body;

		// ensure exists
		const existingCourse = await prisma.course.findUnique({
			where: { id },
		});

		if (!existingCourse) {
			return res.status(404).json({ error: "Course not found" });
		}

		// validate
		if (source && !Object.values(CourseSource).includes(source)) {
			return res.status(400).json({ error: "Invalid course source" });
		}

		if (difficulty && !Object.values(CourseDifficulty).includes(difficulty)) {
			return res.status(400).json({ error: "Invalid difficulty level" });
		}

		if (rating && (rating < 0 || rating > 5)) {
			return res.status(400).json({ error: "Rating must be between 0 and 5" });
		}

		if (durationMinutes && durationMinutes < 0) {
			return res.status(400).json({ error: "Duration must be positive" });
		}

		if (priceCents && priceCents < 0) {
			return res.status(400).json({ error: "Price must be positive" });
		}

		// update payload
		const updateData: any = {};

		if (title !== undefined) updateData.title = title;
		if (description !== undefined) updateData.description = description;
		if (aiSummary !== undefined) updateData.aiSummary = aiSummary;
		if (provider !== undefined) updateData.provider = provider;
		if (source !== undefined) updateData.source = source;
		if (externalId !== undefined) updateData.externalId = externalId;
		if (url !== undefined) updateData.url = url;
		if (language !== undefined) updateData.language = language;
		if (difficulty !== undefined) updateData.difficulty = difficulty;
		if (durationMinutes !== undefined) updateData.durationMinutes = durationMinutes;
		if (rating !== undefined) updateData.rating = rating;
		if (isPaid !== undefined) updateData.isPaid = isPaid;
		if (priceCents !== undefined) updateData.priceCents = priceCents;

		// skills update
		if (skills !== undefined) {
			// reset skills
			await prisma.courseSkill.deleteMany({
				where: { courseId: id },
			});

			updateData.skills = {
				create: skills.map((skillData: { skillId: string; relevance?: number }) => ({
					skillId: skillData.skillId,
					relevance: skillData.relevance || 50,
				})),
			};
		}

		const course = await prisma.course.update({
			where: { id },
			data: updateData,
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

		res.json({ message: "Course updated successfully", course });
	} catch (error) {
		console.error("Error updating course:", error);
		res.status(500).json({ error: "Failed to update course" });
	}
});

// delete course
router.delete("/:id", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		if (req.user?.role !== "ADMIN") {
			return res.status(403).json({ error: "Admin access required" });
		}

		const { id } = req.params;

		// ensure exists
		const course = await prisma.course.findUnique({
			where: { id },
			include: {
				_count: {
					select: {
						Bookmark: true,
						Recommendation: true,
						enrollments: true,
					},
				},
			},
		});

		if (!course) {
			return res.status(404).json({ error: "Course not found" });
		}

		// check dependencies
		const dependencies = [];
		if (course._count.Bookmark > 0) {
			dependencies.push(`${course._count.Bookmark} user bookmarks`);
		}
		if (course._count.Recommendation > 0) {
			dependencies.push(`${course._count.Recommendation} recommendations`);
		}

		if (dependencies.length > 0) {
			return res.status(400).json({
				error: `Cannot delete course. It has the following dependencies: ${dependencies.join(", ")}`,
			});
		}

		// remove related associations then delete course in a transaction
		await prisma.$transaction([prisma.courseSkill.deleteMany({ where: { courseId: id } }), prisma.course.delete({ where: { id } })]);

		res.json({ message: "Course deleted successfully" });
	} catch (error) {
		console.error("Error deleting course:", error);
		res.status(500).json({ error: "Failed to delete course" });
	}
});

// ===== YOUTUBE INGESTION ENDPOINTS =====

// import youtube playlist or video (admin only)
router.post("/import/youtube", authenticateSupabaseToken, validate(extractSchemas(schemas.youtubeIngest)), invalidateCacheMiddleware([`${CACHE_KEYS.COURSES_LIST}:*`]), async (req: AuthenticatedRequest, res: Response) => {
	try {
		if (req.user?.role !== "ADMIN") {
			return res.status(403).json({ error: "Admin access required" });
		}

		const { url, skillIds, tags, difficulty, overrides } = req.body;

		// validate skills exist if provided
		if (skillIds && skillIds.length > 0) {
			const existingSkills = await prisma.skill.findMany({
				where: { id: { in: skillIds } },
				select: { id: true },
			});

			if (existingSkills.length !== skillIds.length) {
				return res.status(400).json({
					error: "One or more skill IDs are invalid",
				});
			}
		}

		console.log(`📹 Admin ${req.user?.email} initiated YouTube import for: ${url}`);

		// determine if it's a playlist or single video and ingest accordingly
		const result = await (async () => {
			try {
				// try playlist first (yt-dlp will handle single videos in playlists gracefully)
				return await YouTubeService.ingestPlaylist(url, {
					skillIds,
					difficulty,
					overrides,
				});
			} catch (error) {
				// if playlist fails, try as single video
				console.log("Playlist ingestion failed, trying single video...");
				return await YouTubeService.ingestSingleVideo(url, {
					skillIds,
					difficulty,
					overrides,
				});
			}
		})();

		res.status(201).json({
			message: "YouTube content imported successfully",
			course: result.course,
			lessonsCount: result.lessonsCount,
			type: result.lessonsCount > 1 ? "playlist" : "video",
		});
	} catch (error) {
		console.error("Error importing YouTube content:", error);
		res.status(500).json({
			error: "Failed to import YouTube content",
			details: error instanceof Error ? error.message : "Unknown error",
		});
	}
});

// get course with lessons (enhanced endpoint)
router.get("/:id/lessons", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const course = await prisma.course.findUnique({
			where: { id },
			include: {
				lessons: {
					orderBy: { position: "asc" },
					select: {
						id: true,
						title: true,
						description: true,
						position: true,
						providerVideoId: true,
						url: true,
						durationSeconds: true,
						thumbnail: true,
						createdAt: true,
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
				_count: {
					select: {
						lessons: true,
						Bookmark: true,
						enrollments: true,
					},
				},
			},
		});

		if (!course) {
			return res.status(404).json({ error: "Course not found" });
		}

		res.json({ course });
	} catch (error) {
		console.error("Error fetching course lessons:", error);
		res.status(500).json({ error: "Failed to fetch course lessons" });
	}
});

// get user's progress for a course (protected)
router.get("/:courseId/progress", authenticateSupabaseToken, validate(extractSchemas(schemas.getCourseProgress)), async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { courseId } = req.params;
		const userId = req.user!.id;

		// generate cache key
		const cacheKey = generateCacheKey(CACHE_KEYS.COURSE_PROGRESS, userId, courseId);

		// try to get from cache
		if (isRedisAvailable && redis) {
			const cached = await redis.get(cacheKey);
			if (cached) {
				return res.json(JSON.parse(cached));
			}
		}

		// check if course exists
		const course = await prisma.course.findUnique({
			where: { id: courseId },
			select: { id: true, title: true },
		});

		if (!course) {
			return res.status(404).json({ error: "Course not found" });
		}

		const progress = await YouTubeService.getCourseProgress(userId, courseId);

		const result = {
			course: {
				id: course.id,
				title: course.title,
			},
			progress,
		};

		// cache the result (5 minutes)
		if (isRedisAvailable && redis) {
			await redis.setex(cacheKey, CACHE_TTL.SHORT, JSON.stringify(result));
		}

		res.json(result);
	} catch (error) {
		console.error("Error fetching course progress:", error);
		res.status(500).json({ error: "Failed to fetch course progress" });
	}
});

// update user progress for a lesson (protected)
router.patch("/lessons/:lessonId/progress", authenticateSupabaseToken, validate(extractSchemas(schemas.updateUserProgress)), async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { lessonId } = req.params;
		const userId = req.user!.id;
		const { completed, progressPercent, watchTimeSeconds } = req.body;

		// check if lesson exists
		const lesson = await prisma.lesson.findUnique({
			where: { id: lessonId },
			select: {
				id: true,
				title: true,
				courseId: true,
				course: {
					select: {
						id: true,
						title: true,
					},
				},
			},
		});

		if (!lesson) {
			return res.status(404).json({ error: "Lesson not found" });
		}

		const progress = await YouTubeService.updateUserProgress(userId, lessonId, {
			completed,
			progressPercent,
			watchTimeSeconds,
		});

		// gamification: award xp and check quests when lesson is completed
		if (completed) {
			// award xp for lesson completion (base 20 xp)
			await awardXP(userId, 20, XPSource.LESSON_COMPLETION, `Completed lesson: ${lesson.title}`);

			// update streak
			await updateStreak(userId);

			// check quest progress
			await checkQuestProgress(userId, QuestType.COMPLETE_LESSON);
			await checkQuestProgress(userId, QuestType.COMPLETE_MULTIPLE_LESSONS);
		}

		// invalidate course progress cache
		if (isRedisAvailable && redis) {
			const progressCacheKey = generateCacheKey(CACHE_KEYS.COURSE_PROGRESS, userId, lesson.courseId);
			const enrollmentsCacheKey = generateCacheKey(CACHE_KEYS.USER_ENROLLMENTS, userId, "*");
			await redis.del(progressCacheKey);
			// delete all enrollment cache pages for this user
			const enrollmentKeys = await redis.keys(enrollmentsCacheKey);
			if (enrollmentKeys.length > 0) {
				await redis.del(...enrollmentKeys);
			}
		}

		res.json({
			message: "Progress updated successfully",
			progress,
			lesson: {
				id: lesson.id,
				title: lesson.title,
				course: lesson.course,
			},
		});
	} catch (error) {
		console.error("Error updating lesson progress:", error);
		res.status(500).json({ error: "Failed to update lesson progress" });
	}
});

// enroll in course
router.post("/:courseId/enroll", authenticateSupabaseToken, validate(extractSchemas(schemas.enrollCourse)), async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { courseId } = req.params;
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({ error: "User not authenticated" });
		}

		// check if course exists
		const course = await prisma.course.findUnique({
			where: { id: courseId },
			select: { id: true, title: true },
		});

		if (!course) {
			return res.status(404).json({ error: "Course not found" });
		}

		// check if already enrolled
		const existingEnrollment = await prisma.enrollment.findUnique({
			where: {
				userId_courseId: {
					userId,
					courseId,
				},
			},
		});

		if (existingEnrollment) {
			return res.status(200).json({
				message: "Already enrolled in this course",
				enrollment: existingEnrollment,
			});
		}

		// create enrollment
		const enrollment = await prisma.enrollment.create({
			data: {
				userId,
				courseId,
			},
			include: {
				course: {
					select: {
						id: true,
						title: true,
						thumbnail: true,
					},
				},
			},
		});

		// invalidate enrollments cache
		if (isRedisAvailable && redis) {
			const enrollmentsCacheKey = generateCacheKey(CACHE_KEYS.USER_ENROLLMENTS, userId, "*");
			const enrollmentKeys = await redis.keys(enrollmentsCacheKey);
			if (enrollmentKeys.length > 0) {
				await redis.del(...enrollmentKeys);
			}
		}

		res.status(201).json({
			message: "Successfully enrolled in course",
			enrollment,
		});
	} catch (error) {
		console.error("Error enrolling in course:", error);
		res.status(500).json({ error: "Failed to enroll in course" });
	}
});

// generate AI summaries for courses (admin only)
router.post("/generate-summaries", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		if (req.user?.role !== "ADMIN") {
			return res.status(403).json({ error: "Admin access required" });
		}

		console.log(`🤖 Admin ${req.user?.email} initiated AI summary generation`);

		// run the summary generation script in the background
		generateMissingAiSummaries()
			.then(() => console.log("✅ AI summary generation completed"))
			.catch((error) => console.error("❌ AI summary generation failed:", error));

		res.json({
			message: "AI summary generation started",
			note: "This process runs in the background. Check server logs for progress.",
		});
	} catch (error) {
		console.error("Error starting AI summary generation:", error);
		res.status(500).json({ error: "Failed to start AI summary generation" });
	}
});

// generate AI summary for specific course (admin only)
router.post("/:id/generate-summary", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		if (req.user?.role !== "ADMIN") {
			return res.status(403).json({ error: "Admin access required" });
		}

		const { id } = req.params;

		const course = await prisma.course.findUnique({
			where: { id },
			select: { id: true, title: true, description: true, aiSummary: true },
		});

		if (!course) {
			return res.status(404).json({ error: "Course not found" });
		}

		if (!course.description) {
			return res.status(400).json({ error: "Course has no description to summarize" });
		}

		console.log(`🤖 Admin ${req.user?.email} requested AI summary for: ${course.title}`);

		const aiSummary = await aiSummaryService.generateSummary(course.description);

		if (aiSummary) {
			await prisma.course.update({
				where: { id },
				data: { aiSummary },
			});

			console.log(`✅ Generated AI summary for: ${course.title}`);
			res.json({
				message: "AI summary generated successfully",
				aiSummary,
				previousSummary: course.aiSummary,
			});
		} else {
			res.status(500).json({ error: "Failed to generate AI summary" });
		}
	} catch (error) {
		console.error("Error generating AI summary for course:", error);
		res.status(500).json({ error: "Failed to generate AI summary" });
	}
});

export default router;
