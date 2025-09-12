import { Router, Response } from "express";
import { AuthenticatedRequest, authenticateSupabaseToken } from "../middleware/supabaseAuth";
import { prisma } from "../config/database";

const router = Router();

// get user's bookmarked courses
router.get("/:id/bookmarks", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { id: userId } = req.params;
		const { page = "1", limit = "20", sortBy = "createdAt", sortOrder = "desc" } = req.query;

		// verify user can access bookmarks (own or admin)
		if (req.user?.id !== userId && req.user?.role !== "ADMIN") {
			return res.status(403).json({ error: "Access denied" });
		}

		// verify user exists
		const userExists = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true },
		});

		if (!userExists) {
			return res.status(404).json({ error: "User not found" });
		}

		const pageNum = parseInt(page as string);
		const limitNum = parseInt(limit as string);
		const offset = (pageNum - 1) * limitNum;

		// build order by
		const orderBy: any = {};
		if (sortBy === "createdAt") {
			orderBy.createdAt = sortOrder as "asc" | "desc";
		} else if (sortBy === "title") {
			orderBy.course = { title: sortOrder as "asc" | "desc" };
		} else if (sortBy === "rating") {
			orderBy.course = { rating: sortOrder as "asc" | "desc" };
		} else {
			orderBy.createdAt = "desc";
		}

		const [bookmarks, totalCount] = await Promise.all([
			prisma.bookmark.findMany({
				where: { userId },
				include: {
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
			prisma.bookmark.count({
				where: { userId },
			}),
		]);

		const totalPages = Math.ceil(totalCount / limitNum);

		res.json({
			bookmarks: bookmarks.map((bookmark) => ({
				id: bookmark.id,
				createdAt: bookmark.createdAt,
				course: {
					...bookmark.course,
					tags: bookmark.course.tags.map((t) => t.tag),
					skills: bookmark.course.skills.map((s) => s.skill),
				},
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
		console.error("Error fetching bookmarks:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// bookmark a course
router.post("/:id/bookmarks", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { id: userId } = req.params;
		const { courseId } = req.body;

		// verify user can create bookmarks (own only)
		if (req.user?.id !== userId) {
			return res.status(403).json({ error: "Access denied" });
		}

		if (!courseId) {
			return res.status(400).json({ error: "Course ID is required" });
		}

		// verify user and course exist
		const [user, course] = await Promise.all([
			prisma.user.findUnique({
				where: { id: userId },
				select: { id: true },
			}),
			prisma.course.findUnique({
				where: { id: courseId },
				select: { id: true, title: true },
			}),
		]);

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		if (!course) {
			return res.status(404).json({ error: "Course not found" });
		}

		// check if bookmark already exists
		const existingBookmark = await prisma.bookmark.findUnique({
			where: {
				userId_courseId: {
					userId,
					courseId,
				},
			},
		});

		if (existingBookmark) {
			return res.status(409).json({ error: "Course already bookmarked" });
		}

		// create bookmark
		const bookmark = await prisma.bookmark.create({
			data: {
				userId,
				courseId,
			},
			include: {
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
		});

		res.status(201).json({
			bookmark: {
				id: bookmark.id,
				createdAt: bookmark.createdAt,
				course: {
					...bookmark.course,
					tags: bookmark.course.tags.map((t) => t.tag),
					skills: bookmark.course.skills.map((s) => s.skill),
				},
			},
		});
	} catch (error) {
		console.error("Error creating bookmark:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// remove bookmark
router.delete("/:id/bookmarks/:courseId", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { id: userId, courseId } = req.params;

		// verify user can delete bookmarks (own only)
		if (req.user?.id !== userId) {
			return res.status(403).json({ error: "Access denied" });
		}

		// check if bookmark exists
		const bookmark = await prisma.bookmark.findUnique({
			where: {
				userId_courseId: {
					userId,
					courseId,
				},
			},
		});

		if (!bookmark) {
			return res.status(404).json({ error: "Bookmark not found" });
		}

		// delete bookmark
		await prisma.bookmark.delete({
			where: {
				userId_courseId: {
					userId,
					courseId,
				},
			},
		});

		res.json({ message: "Bookmark removed successfully" });
	} catch (error) {
		console.error("Error deleting bookmark:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

export default router;
