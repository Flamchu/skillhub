import express from "express";
import { prisma } from "../config/database";
import { authenticateSupabaseToken } from "../middleware/supabaseAuth";
import { z } from "zod";

const router = express.Router();

// admin dashboard stats
router.get("/stats", authenticateSupabaseToken, async (req, res) => {
	try {
		const user = (req as any).user;

		// only admin users can access dashboard stats
		if (user.role !== "ADMIN") {
			return res.status(403).json({ error: "Access denied", message: "Admin role required" });
		}

		// get counts for all major entities
		const [totalUsers, totalCourses, totalSkills, totalTests, recentUsers, recentCourses, recentSkills] = await Promise.all([
			// total counts
			prisma.user.count(),
			prisma.course.count(),
			prisma.skill.count(),
			prisma.test.count(),

			// recent activity (last 7 days)
			prisma.user.findMany({
				where: {
					createdAt: {
						gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
					},
				},
				orderBy: { createdAt: "desc" },
				take: 5,
				select: {
					id: true,
					name: true,
					email: true,
					createdAt: true,
				},
			}),
			prisma.course.findMany({
				where: {
					createdAt: {
						gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
					},
				},
				orderBy: { createdAt: "desc" },
				take: 5,
				select: {
					id: true,
					title: true,
					createdAt: true,
				},
			}),
			prisma.skill.findMany({
				where: {
					createdAt: {
						gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
					},
				},
				orderBy: { createdAt: "desc" },
				take: 5,
				select: {
					id: true,
					name: true,
					createdAt: true,
				},
			}),
		]);

		// calculate growth metrics
		const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
		const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

		const [usersThisWeek, usersThisMonth, coursesThisWeek, skillsThisWeek] = await Promise.all([
			prisma.user.count({
				where: { createdAt: { gte: lastWeek } },
			}),
			prisma.user.count({
				where: { createdAt: { gte: lastMonth } },
			}),
			prisma.course.count({
				where: { createdAt: { gte: lastWeek } },
			}),
			prisma.skill.count({
				where: { createdAt: { gte: lastWeek } },
			}),
		]);

		// format recent activity
		const recentActivity = [
			...recentUsers.map((user) => ({
				type: "user" as const,
				message: `New user registered: ${user.name || user.email}`,
				time: user.createdAt,
				id: user.id,
			})),
			...recentCourses.map((course) => ({
				type: "course" as const,
				message: `Course '${course.title}' was created`,
				time: course.createdAt,
				id: course.id,
			})),
			...recentSkills.map((skill) => ({
				type: "skill" as const,
				message: `Skill '${skill.name}' was created`,
				time: skill.createdAt,
				id: skill.id,
			})),
		]
			.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
			.slice(0, 10);

		const stats = {
			totals: {
				users: totalUsers,
				courses: totalCourses,
				skills: totalSkills,
				tests: totalTests,
			},
			growth: {
				usersThisWeek,
				usersThisMonth,
				coursesThisWeek,
				skillsThisWeek,
			},
			recentActivity: recentActivity.map((activity) => ({
				...activity,
				time: formatTimeAgo(activity.time),
			})),
		};

		res.json({ stats });
	} catch (error) {
		console.error("Dashboard stats error:", error);
		res.status(500).json({
			error: "Internal server error",
			message: "Failed to fetch dashboard statistics",
		});
	}
});

// format relative time
function formatTimeAgo(date: Date): string {
	const now = new Date();
	const diffInMs = now.getTime() - date.getTime();
	const diffInMins = Math.floor(diffInMs / (1000 * 60));
	const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
	const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

	if (diffInMins < 1) {
		return "Just now";
	} else if (diffInMins < 60) {
		return `${diffInMins} minute${diffInMins === 1 ? "" : "s"} ago`;
	} else if (diffInHours < 24) {
		return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
	} else if (diffInDays < 7) {
		return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
	} else {
		return date.toLocaleDateString();
	}
}

export default router;
