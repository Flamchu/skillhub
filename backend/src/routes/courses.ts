import { Router, Request, Response } from "express";
import { CourseSource, CourseDifficulty } from "@prisma/client";
import { AuthenticatedRequest, authenticateSupabaseToken } from "../middleware/supabaseAuth";
import { cache, cacheConfigs, invalidateCacheMiddleware } from "../middleware/cache";
import { CACHE_KEYS } from "../config/redis";
import { prisma } from "../config/database";
import { YouTubeService } from "../services/youtubeService";
import { validate, extractSchemas } from "../middleware/validation";
import { schemas } from "../schemas";

const router = Router();

// get courses
router.get("/", cache(cacheConfigs.coursesList), async (req: Request, res: Response) => {
	try {
		const { skillId, tag, difficulty, freeOnly = "false", provider, source, language = "en", minRating, maxDuration, search, page = "1", limit = "20", sortBy = "createdAt", sortOrder = "desc" } = req.query;

		// where clause
		const where: any = {};

		if (skillId) {
			where.skills = {
				some: {
					skillId: skillId as string,
				},
			};
		}

		if (tag) {
			where.tags = {
				some: {
					tag: {
						name: {
							equals: tag as string,
							mode: "insensitive",
						},
					},
				},
			};
		}

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
					tags: {
						include: {
							tag: {
								select: {
									id: true,
									name: true,
								},
							},
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
							Bookmark: true,
							Recommendation: true,
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
				tags: {
					include: {
						tag: {
							select: {
								id: true,
								name: true,
							},
						},
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

// create course (admin)
router.post("/", authenticateSupabaseToken, invalidateCacheMiddleware([`${CACHE_KEYS.COURSES_LIST}:*`]), async (req: AuthenticatedRequest, res: Response) => {
	try {
		if (req.user?.role !== "ADMIN") {
			return res.status(403).json({ error: "Admin access required" });
		}

		const { title, description, provider, source = "INTERNAL", externalId, url, language = "en", difficulty = "BEGINNER", durationMinutes, rating, isPaid = false, priceCents, tags = [], skills = [] } = req.body;

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
				tags: {
					create: tags.map((tagName: string) => ({
						tag: {
							connectOrCreate: {
								where: { name: tagName },
								create: { name: tagName },
							},
						},
					})),
				},
				skills: {
					create: skills.map((skillData: { skillId: string; relevance?: number }) => ({
						skillId: skillData.skillId,
						relevance: skillData.relevance || 50,
					})),
				},
			},
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
		});

		res.status(201).json({ message: "Course created successfully", course });
	} catch (error) {
		console.error("Error creating course:", error);
		res.status(500).json({ error: "Failed to create course" });
	}
});

// update course (admin)
router.patch("/:id", authenticateSupabaseToken, invalidateCacheMiddleware([`${CACHE_KEYS.COURSES_LIST}:*`, `${CACHE_KEYS.COURSE_DETAIL}:*`]), async (req: AuthenticatedRequest, res: Response) => {
	try {
		if (req.user?.role !== "ADMIN") {
			return res.status(403).json({ error: "Admin access required" });
		}

		const { id } = req.params;
		const { title, description, provider, source, externalId, url, language, difficulty, durationMinutes, rating, isPaid, priceCents, tags, skills } = req.body;

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

		// tags update
		if (tags !== undefined) {
			// reset tags
			await prisma.courseTag.deleteMany({
				where: { courseId: id },
			});

			updateData.tags = {
				create: tags.map((tagName: string) => ({
					tag: {
						connectOrCreate: {
							where: { name: tagName },
							create: { name: tagName },
						},
					},
				})),
			};
		}

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
		});

		res.json({ message: "Course updated successfully", course });
	} catch (error) {
		console.error("Error updating course:", error);
		res.status(500).json({ error: "Failed to update course" });
	}
});

// delete course (admin)
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
		await prisma.$transaction([prisma.courseTag.deleteMany({ where: { courseId: id } }), prisma.courseSkill.deleteMany({ where: { courseId: id } }), prisma.course.delete({ where: { id } })]);

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
					tags,
					difficulty,
					overrides,
				});
			} catch (error) {
				// if playlist fails, try as single video
				console.log("Playlist ingestion failed, trying single video...");
				return await YouTubeService.ingestSingleVideo(url, {
					skillIds,
					tags,
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
				tags: {
					include: {
						tag: {
							select: {
								id: true,
								name: true,
							},
						},
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

		// check if course exists
		const course = await prisma.course.findUnique({
			where: { id: courseId },
			select: { id: true, title: true },
		});

		if (!course) {
			return res.status(404).json({ error: "Course not found" });
		}

		const progress = await YouTubeService.getCourseProgress(userId, courseId);

		res.json({
			course: {
				id: course.id,
				title: course.title,
			},
			progress,
		});
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

export default router;
