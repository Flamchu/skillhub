import { Router } from "express";
import { authenticateSupabaseToken } from "../middleware/supabaseAuth";
import { getVideoChapters, updateCourseChapters, batchUpdateChapters } from "../services/youtubeChaptersService";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

/**
 * get chapters for a specific video (cached)
 * GET /api/chapters/video/:videoId
 */
router.get("/video/:videoId", async (req, res) => {
	try {
		const { videoId } = req.params;

		if (!videoId || videoId.length !== 11) {
			return res.status(400).json({ error: "Invalid video ID" });
		}

		const chapters = await getVideoChapters(videoId);

		return res.json({ chapters });
	} catch (error) {
		console.error("error fetching video chapters:", error);
		return res.status(500).json({ error: "Failed to fetch video chapters" });
	}
});

/**
 * fetch and update chapters for a course
 * POST /api/chapters/course/:courseId/update
 * requires authentication
 */
router.post("/course/:courseId/update", authenticateSupabaseToken, async (req, res) => {
	try {
		const { courseId } = req.params;

		// verify course exists
		const course = await prisma.course.findUnique({
			where: { id: courseId },
			select: { id: true, title: true },
		});

		if (!course) {
			return res.status(404).json({ error: "Course not found" });
		}

		const result = await updateCourseChapters(courseId);

		if (!result.success) {
			return res.status(500).json({ error: "Failed to update chapters" });
		}

		return res.json({
			success: true,
			courseId: course.id,
			courseTitle: course.title,
			chaptersCount: result.chaptersCount,
			message: result.chaptersCount > 0 ? `Successfully updated ${result.chaptersCount} chapters` : "No chapters found or course is a playlist",
		});
	} catch (error) {
		console.error("error updating course chapters:", error);
		return res.status(500).json({ error: "Failed to update course chapters" });
	}
});

/**
 * batch update chapters for multiple courses
 * POST /api/chapters/batch-update
 * requires authentication
 * body: { courseIds: string[] }
 */
router.post("/batch-update", authenticateSupabaseToken, async (req, res) => {
	try {
		const { courseIds } = req.body;

		if (!Array.isArray(courseIds) || courseIds.length === 0) {
			return res.status(400).json({ error: "courseIds must be a non-empty array" });
		}

		// limit to 50 courses at a time
		if (courseIds.length > 50) {
			return res.status(400).json({ error: "Maximum 50 courses allowed per batch" });
		}

		const result = await batchUpdateChapters(courseIds);

		return res.json({
			success: true,
			updated: result.updated,
			failed: result.failed,
			total: courseIds.length,
			message: `Updated ${result.updated} courses, ${result.failed} failed`,
		});
	} catch (error) {
		console.error("error batch updating chapters:", error);
		return res.status(500).json({ error: "Failed to batch update chapters" });
	}
});

/**
 * update all single-video courses with chapters
 * POST /api/chapters/update-all-singles
 * requires authentication (admin only recommended)
 */
router.post("/update-all-singles", authenticateSupabaseToken, async (req, res) => {
	try {
		// find all single-video courses
		const singleVideoCourses = await prisma.course.findMany({
			where: {
				lessons: {
					// courses with exactly 1 lesson
					some: {},
				},
			},
			include: {
				_count: {
					select: { lessons: true },
				},
			},
		});

		// filter to only courses with exactly 1 lesson
		const courseIds = singleVideoCourses.filter((c) => c._count.lessons === 1).map((c) => c.id);

		if (courseIds.length === 0) {
			return res.json({
				success: true,
				updated: 0,
				failed: 0,
				total: 0,
				message: "No single-video courses found",
			});
		}

		const result = await batchUpdateChapters(courseIds);

		return res.json({
			success: true,
			updated: result.updated,
			failed: result.failed,
			total: courseIds.length,
			message: `Processed ${courseIds.length} single-video courses: ${result.updated} updated, ${result.failed} failed`,
		});
	} catch (error) {
		console.error("error updating all single-video courses:", error);
		return res.status(500).json({ error: "Failed to update single-video courses" });
	}
});

export default router;
