import { Router, Response } from "express";
import { PrismaClient, CourseSource, CourseDifficulty } from "@prisma/client";
import { AuthenticatedRequest, authenticateToken } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// GET /courses - Get courses with filtering
router.get("/", async (req, res: Response) => {
	try {
		const { skillId, tag, difficulty, freeOnly = "false", provider, source, language = "en", minRating, maxDuration, search, page = "1", limit = "20", sortBy = "createdAt", sortOrder = "desc" } = req.query;

		// Build where clause
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

		// Build order by
		const orderBy: any = {};
		orderBy[sortBy as string] = sortOrder;

		// Pagination
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

// GET /courses/:id - Get course by ID with details
router.get("/:id", async (req, res: Response) => {
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

// POST /courses - Create new course (admin only)
router.post("/", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		if (req.user?.role !== "ADMIN") {
			return res.status(403).json({ error: "Admin access required" });
		}

		const { title, description, provider, source = "INTERNAL", externalId, url, language = "en", difficulty = "BEGINNER", durationMinutes, rating, isPaid = false, priceCents, tags = [], skills = [] } = req.body;

		// Validation
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

		// Create course with related data
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

// PATCH /courses/:id - Update course (admin only)
router.patch("/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		if (req.user?.role !== "ADMIN") {
			return res.status(403).json({ error: "Admin access required" });
		}

		const { id } = req.params;
		const { title, description, provider, source, externalId, url, language, difficulty, durationMinutes, rating, isPaid, priceCents, tags, skills } = req.body;

		// Check if course exists
		const existingCourse = await prisma.course.findUnique({
			where: { id },
		});

		if (!existingCourse) {
			return res.status(404).json({ error: "Course not found" });
		}

		// Validation
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

		// Build update data
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

		// Handle tags update
		if (tags !== undefined) {
			// Delete existing tags and create new ones
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

		// Handle skills update
		if (skills !== undefined) {
			// Delete existing skill associations and create new ones
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

// DELETE /courses/:id - Delete course (admin only)
router.delete("/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		if (req.user?.role !== "ADMIN") {
			return res.status(403).json({ error: "Admin access required" });
		}

		const { id } = req.params;

		// Check if course exists
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

		// Check for dependencies
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

		await prisma.course.delete({
			where: { id },
		});

		res.json({ message: "Course deleted successfully" });
	} catch (error) {
		console.error("Error deleting course:", error);
		res.status(500).json({ error: "Failed to delete course" });
	}
});

export default router;
