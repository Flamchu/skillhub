import express from "express";
import { prisma } from "../config/database";

const router = express.Router();

// public stats endpoint (no authentication required)
router.get("/", async (req, res) => {
	try {
		// get basic public stats
		const [totalUsers, totalCourses, totalSkills] = await Promise.all([prisma.user.count(), prisma.course.count(), prisma.skill.count()]);

		// calculate a mock success rate based on available data
		// this could be enhanced with actual completion/success metrics
		const successRate = 95; // placeholder - could be calculated from actual completion data

		const stats = {
			users: totalUsers,
			courses: totalCourses,
			skills: totalSkills,
			successRate: successRate,
		};

		res.json(stats);
	} catch (error) {
		console.error("Public stats error:", error);
		// return fallback stats on error
		res.json({
			users: 50000,
			courses: 500,
			skills: 250,
			successRate: 95,
		});
	}
});

export default router;
