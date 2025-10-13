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

// add bookmark
router.post("/", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { courseId } = req.body;
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({ error: "Unauthorized" });
		}

		if (!courseId) {
			return res.status(400).json({ error: "Course ID is required" });
		}

		// check if course exists
		const courseExists = await prisma.course.findUnique({
			where: { id: courseId },
			select: { id: true },
		});

		if (!courseExists) {
			return res.status(404).json({ error: "Course not found" });
		}

		// check if already bookmarked
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
router.delete("/:bookmarkId", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { bookmarkId } = req.params;
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({ error: "Unauthorized" });
		}

		// find bookmark and verify ownership
		const bookmark = await prisma.bookmark.findUnique({
			where: { id: bookmarkId },
		});

		if (!bookmark) {
			return res.status(404).json({ error: "Bookmark not found" });
		}

		if (bookmark.userId !== userId && req.user?.role !== "ADMIN") {
			return res.status(403).json({ error: "Access denied" });
		}

		await prisma.bookmark.delete({
			where: { id: bookmarkId },
		});

		res.json({ message: "Bookmark removed successfully" });
	} catch (error) {
		console.error("Error deleting bookmark:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// remove bookmark by course id
router.delete("/course/:courseId", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { courseId } = req.params;
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({ error: "Unauthorized" });
		}

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