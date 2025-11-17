import { Router, Request, Response } from "express";
import { authenticateSupabaseToken, AuthenticatedRequest } from "../middleware/supabaseAuth";
import { udemyService } from "../services/udemyService";
import { prisma } from "../config/database";

const router = Router();

// admin middleware to check if user is admin
const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: Function) => {
	try {
		const userId = req.user?.id;
		if (!userId) {
			return res.status(401).json({ error: "Not authenticated" });
		}

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { role: true },
		});

		if (!user || user.role !== "ADMIN") {
			return res.status(403).json({ error: "Admin access required" });
		}

		next();
	} catch (error) {
		console.error("Admin check error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// search udemy courses (public endpoint for browsing)
router.get("/search", async (req: Request, res: Response) => {
	try {
		const { query, page, pageSize, category, level, language, price, orderBy } = req.query;

		if (!query || typeof query !== "string") {
			return res.status(400).json({ error: "Search query required" });
		}

		const results = await udemyService.searchCourses(query, {
			page: page ? parseInt(page as string) : undefined,
			pageSize: pageSize ? parseInt(pageSize as string) : undefined,
			category: category as string,
			level: level as string,
			language: language as string,
			price: price as "paid" | "free",
			orderBy: orderBy as string,
		});

		res.json(results);
	} catch (error) {
		console.error("Udemy search error:", error);
		res.status(500).json({ error: "Failed to search Udemy courses" });
	}
});

// get course details from udemy
router.get("/course/:courseId", async (req: Request, res: Response) => {
	try {
		const courseId = parseInt(req.params.courseId);

		if (isNaN(courseId)) {
			return res.status(400).json({ error: "Invalid course ID" });
		}

		const course = await udemyService.getCourseDetails(courseId);
		res.json(course);
	} catch (error) {
		console.error("Udemy course details error:", error);
		res.status(500).json({ error: "Failed to fetch course details" });
	}
});

// admin: import single course
router.post("/admin/import", authenticateSupabaseToken, requireAdmin, async (req: Request, res: Response) => {
	try {
		const { courseId, skillIds } = req.body;

		if (!courseId) {
			return res.status(400).json({ error: "Course ID required" });
		}

		const course = await udemyService.importCourse(parseInt(courseId), skillIds || []);
		res.json({ success: true, course });
	} catch (error) {
		console.error("Import course error:", error);
		res.status(500).json({ error: "Failed to import course" });
	}
});

// admin: bulk import courses by search
router.post("/admin/bulk-import", authenticateSupabaseToken, requireAdmin, async (req: Request, res: Response) => {
	try {
		const { query, maxCourses, skillIds } = req.body;

		if (!query) {
			return res.status(400).json({ error: "Search query required" });
		}

		const courses = await udemyService.bulkImportBySearch(query, maxCourses || 20, skillIds || []);

		res.json({
			success: true,
			imported: courses.length,
			courses,
		});
	} catch (error) {
		console.error("Bulk import error:", error);
		res.status(500).json({ error: "Failed to bulk import courses" });
	}
});

// admin: sync existing udemy courses
router.post("/admin/sync", authenticateSupabaseToken, requireAdmin, async (req: Request, res: Response) => {
	try {
		const result = await udemyService.syncExistingCourses();
		res.json({
			success: true,
			...result,
		});
	} catch (error) {
		console.error("Sync courses error:", error);
		res.status(500).json({ error: "Failed to sync courses" });
	}
});

// get recommendations by skill (authenticated users)
router.get("/recommendations/:skillName", authenticateSupabaseToken, async (req: Request, res: Response) => {
	try {
		const { skillName } = req.params;
		const { limit } = req.query;

		const recommendations = await udemyService.getRecommendationsBySkill(skillName, limit ? parseInt(limit as string) : 10);

		res.json({ recommendations });
	} catch (error) {
		console.error("Recommendations error:", error);
		res.status(500).json({ error: "Failed to fetch recommendations" });
	}
});

// get all imported udemy courses from our database
router.get("/imported", async (req: Request, res: Response) => {
	try {
		const { page = "1", limit = "20", skillId } = req.query;
		const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

		const where: any = {
			source: "UDEMY",
		};

		if (skillId) {
			where.skills = {
				some: {
					skillId: skillId as string,
				},
			};
		}

		const [courses, total] = await Promise.all([
			prisma.course.findMany({
				where,
				include: {
					skills: {
						include: {
							skill: true,
						},
					},
					_count: {
						select: {
							enrollments: true,
						},
					},
				},
				orderBy: { rating: "desc" },
				take: parseInt(limit as string),
				skip: offset,
			}),
			prisma.course.count({ where }),
		]);

		res.json({
			courses,
			pagination: {
				page: parseInt(page as string),
				limit: parseInt(limit as string),
				total,
				totalPages: Math.ceil(total / parseInt(limit as string)),
			},
		});
	} catch (error) {
		console.error("Get imported courses error:", error);
		res.status(500).json({ error: "Failed to fetch imported courses" });
	}
});

export default router;
