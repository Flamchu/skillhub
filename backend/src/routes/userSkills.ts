import { Router, Request, Response } from "express";
import { ProficiencyLevel } from "@prisma/client";
import { AuthenticatedRequest, authenticateSupabaseToken } from "../middleware/supabaseAuth";
import { catchAsync, createError } from "../middleware/errorHandler";
import { prisma } from "../config/database";

const router = Router();

// get user's skills
router.get("/:userId/skills", async (req: Request, res: Response) => {
	try {
		const { userId } = req.params;
		const { includeProgress = "false", skillId } = req.query;

		// check if user exists
		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const where: any = { userId };
		if (skillId) {
			where.skillId = skillId as string;
		}

		const skills = await prisma.userSkill.findMany({
			where,
			include: {
				skill: {
					select: {
						id: true,
						name: true,
						slug: true,
						description: true,
						parent: {
							select: {
								id: true,
								name: true,
								slug: true,
							},
						},
						children: {
							select: {
								id: true,
								name: true,
								slug: true,
							},
						},
					},
				},
			},
			orderBy: [{ proficiency: "desc" }, { progress: "desc" }, { updatedAt: "desc" }],
		});

		// if includeProgress is true, add progress statistics
		let enrichedSkills = skills;
		if (includeProgress === "true") {
			enrichedSkills = await Promise.all(
				skills.map(async (userSkill) => {
					// get related test attempts for this skill
					const testAttempts = await prisma.testAttempt.findMany({
						where: {
							userId,
							test: {
								skillId: userSkill.skillId,
							},
						},
						orderBy: {
							createdAt: "desc",
						},
						take: 5, // last 5 attempts
					});

					// get recommended courses count for this skill
					const recommendedCoursesCount = await prisma.recommendation.count({
						where: {
							userId,
							skillId: userSkill.skillId,
						},
					});

					return {
						...userSkill,
						recentTestAttempts: testAttempts,
						recommendedCoursesCount,
					};
				})
			);
		}

		res.json({ skills: enrichedSkills });
	} catch (error) {
		console.error("Get user skills error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// add skill to user profile (protected)
router.post("/:userId/skills", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { userId } = req.params;
		const currentUser = req.user!;

		// users can only add skills to their own profile unless they're admin
		if (currentUser.id !== userId && currentUser.role !== "ADMIN") {
			return res.status(403).json({ error: "Access denied" });
		}

		const { skillId, proficiency = "BASIC", targetLevel, progress = 0 } = req.body;

		if (!skillId) {
			return res.status(400).json({ error: "Skill ID is required" });
		}

		// validate proficiency level
		const validProficiencyLevels = Object.values(ProficiencyLevel);
		if (!validProficiencyLevels.includes(proficiency)) {
			return res.status(400).json({ error: "Invalid proficiency level" });
		}

		if (targetLevel && !validProficiencyLevels.includes(targetLevel)) {
			return res.status(400).json({ error: "Invalid target level" });
		}

		// validate and convert progress to number if needed
		const progressNum = typeof progress === "string" ? parseFloat(progress) : progress;
		if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
			return res.status(400).json({ error: "Progress must be a number between 0 and 100" });
		}

		// check if skill exists
		const skill = await prisma.skill.findUnique({
			where: { id: skillId },
		});

		if (!skill) {
			return res.status(400).json({ error: "Skill not found" });
		}

		// check if user already has this skill
		const existingUserSkill = await prisma.userSkill.findUnique({
			where: {
				userId_skillId: {
					userId,
					skillId,
				},
			},
		});

		if (existingUserSkill) {
			return res.status(400).json({ error: "User already has this skill" });
		}

		const userSkill = await prisma.userSkill.create({
			data: {
				userId,
				skillId,
				proficiency,
				targetLevel,
				progress: progressNum,
				lastPracticed: new Date(),
			},
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
		});

		res.status(201).json({
			message: "Skill added successfully",
			userSkill,
		});
	} catch (error) {
		console.error("Add user skill error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// update user skill (protected)
router.patch("/:userId/skills/:skillId", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { userId, skillId } = req.params;
		const currentUser = req.user!;

		// users can only update their own skills unless they're admin
		if (currentUser.id !== userId && currentUser.role !== "ADMIN") {
			return res.status(403).json({ error: "Access denied" });
		}

		const { proficiency, targetLevel, progress, lastPracticed } = req.body;

		// validate input
		const validProficiencyLevels = Object.values(ProficiencyLevel);
		if (proficiency && !validProficiencyLevels.includes(proficiency)) {
			return res.status(400).json({ error: "Invalid proficiency level" });
		}

		if (targetLevel && !validProficiencyLevels.includes(targetLevel)) {
			return res.status(400).json({ error: "Invalid target level" });
		}

		// validate and convert progress to number if needed
		let validatedProgress = progress;
		if (progress !== undefined) {
			const progressNum = typeof progress === "string" ? parseFloat(progress) : progress;
			if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
				return res.status(400).json({ error: "Progress must be a number between 0 and 100" });
			}
			validatedProgress = progressNum;
		}

		// check if user skill exists
		const existingUserSkill = await prisma.userSkill.findUnique({
			where: {
				userId_skillId: {
					userId,
					skillId,
				},
			},
		});

		if (!existingUserSkill) {
			return res.status(404).json({ error: "User skill not found" });
		}

		const updateData: any = {};
		if (proficiency !== undefined) updateData.proficiency = proficiency;
		if (targetLevel !== undefined) updateData.targetLevel = targetLevel;
		if (validatedProgress !== undefined) updateData.progress = validatedProgress;
		if (lastPracticed !== undefined) updateData.lastPracticed = new Date(lastPracticed);

		const updatedUserSkill = await prisma.userSkill.update({
			where: {
				userId_skillId: {
					userId,
					skillId,
				},
			},
			data: updateData,
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
		});

		res.json({
			message: "User skill updated successfully",
			userSkill: updatedUserSkill,
		});
	} catch (error) {
		console.error("Update user skill error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// remove skill from user profile (protected)
router.delete("/:userId/skills/:skillId", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { userId, skillId } = req.params;
		const currentUser = req.user!;

		// users can only remove their own skills unless they're admin
		if (currentUser.id !== userId && currentUser.role !== "ADMIN") {
			return res.status(403).json({ error: "Access denied" });
		}

		// check if user skill exists
		const existingUserSkill = await prisma.userSkill.findUnique({
			where: {
				userId_skillId: {
					userId,
					skillId,
				},
			},
		});

		if (!existingUserSkill) {
			return res.status(404).json({ error: "User skill not found" });
		}

		await prisma.userSkill.delete({
			where: {
				userId_skillId: {
					userId,
					skillId,
				},
			},
		});

		res.json({ message: "Skill removed successfully" });
	} catch (error) {
		console.error("Remove user skill error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// get skill progression recommendations for user (protected)
router.get("/:userId/skills/:skillId/progression", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { userId, skillId } = req.params;
		const currentUser = req.user!;

		// users can only access their own progression unless they're admin
		if (currentUser.id !== userId && currentUser.role !== "ADMIN") {
			return res.status(403).json({ error: "Access denied" });
		}

		// check if user skill exists
		const userSkill = await prisma.userSkill.findUnique({
			where: {
				userId_skillId: {
					userId,
					skillId,
				},
			},
			include: {
				skill: {
					include: {
						parent: true,
						children: true,
					},
				},
			},
		});

		if (!userSkill) {
			return res.status(404).json({ error: "User skill not found" });
		}

		// get related courses
		const relatedCourses = await prisma.course.findMany({
			where: {
				skills: {
					some: {
						skillId,
					},
				},
			},
			include: {
				skills: {
					where: {
						skillId,
					},
					select: {
						relevance: true,
					},
				},
			},
			orderBy: {
				rating: "desc",
			},
			take: 5,
		});

		// get available tests
		const availableTests = await prisma.test.findMany({
			where: {
				skillId,
				published: true,
			},
			select: {
				id: true,
				title: true,
				difficulty: true,
				totalQuestions: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		// get recent test scores
		const recentTestAttempts = await prisma.testAttempt.findMany({
			where: {
				userId,
				test: {
					skillId,
				},
			},
			include: {
				test: {
					select: {
						title: true,
						difficulty: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
			take: 5,
		});

		// suggest next steps based on current proficiency
		const getNextSteps = (proficiency: ProficiencyLevel, targetLevel?: ProficiencyLevel | null) => {
			const steps = [];

			if (proficiency === "NONE" || proficiency === "BASIC") {
				steps.push("Take beginner-level courses");
				steps.push("Practice with basic exercises");
			}

			if (proficiency === "BASIC" || proficiency === "INTERMEDIATE") {
				steps.push("Complete intermediate projects");
				steps.push("Take skill assessment tests");
			}

			if (proficiency === "INTERMEDIATE" || proficiency === "ADVANCED") {
				steps.push("Work on advanced projects");
				steps.push("Consider teaching or mentoring others");
			}

			if (targetLevel && targetLevel !== proficiency) {
				steps.push(`Focus on reaching ${targetLevel.toLowerCase()} level`);
			}

			return steps;
		};

		const nextSteps = getNextSteps(userSkill.proficiency, userSkill.targetLevel);

		res.json({
			userSkill: {
				id: userSkill.id,
				proficiency: userSkill.proficiency,
				targetLevel: userSkill.targetLevel,
				progress: userSkill.progress,
				lastPracticed: userSkill.lastPracticed,
			},
			skill: userSkill.skill,
			progression: {
				nextSteps,
				recommendedCourses: relatedCourses,
				availableTests,
				recentTestAttempts,
			},
		});
	} catch (error) {
		console.error("Get skill progression error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// bulk update multiple user skills (protected)
router.patch("/:userId/skills", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { userId } = req.params;
		const currentUser = req.user!;

		// users can only update their own skills unless they're admin
		if (currentUser.id !== userId && currentUser.role !== "ADMIN") {
			return res.status(403).json({ error: "Access denied" });
		}

		const { skills } = req.body;

		if (!Array.isArray(skills) || skills.length === 0) {
			return res.status(400).json({ error: "Skills array is required" });
		}

		// validate all skills data first
		const validProficiencyLevels = Object.values(ProficiencyLevel);
		for (const skill of skills) {
			if (!skill.skillId) {
				return res.status(400).json({ error: "All skills must have a skillId" });
			}

			if (skill.proficiency && !validProficiencyLevels.includes(skill.proficiency)) {
				return res.status(400).json({ error: `Invalid proficiency level: ${skill.proficiency}` });
			}

			if (skill.targetLevel && !validProficiencyLevels.includes(skill.targetLevel)) {
				return res.status(400).json({ error: `Invalid target level: ${skill.targetLevel}` });
			}

			if (skill.progress !== undefined) {
				const progressNum = typeof skill.progress === "string" ? parseFloat(skill.progress) : skill.progress;
				if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
					return res.status(400).json({ error: "Progress must be a number between 0 and 100" });
				}
				skill.progress = progressNum; // normalize to number
			}
		}

		// perform bulk updates
		const updatePromises = skills.map((skill: any) => {
			const updateData: any = {};
			if (skill.proficiency !== undefined) updateData.proficiency = skill.proficiency;
			if (skill.targetLevel !== undefined) updateData.targetLevel = skill.targetLevel;
			if (skill.progress !== undefined) updateData.progress = skill.progress;
			if (skill.lastPracticed !== undefined) updateData.lastPracticed = new Date(skill.lastPracticed);

			return prisma.userSkill.update({
				where: {
					userId_skillId: {
						userId,
						skillId: skill.skillId,
					},
				},
				data: updateData,
				include: {
					skill: {
						select: {
							id: true,
							name: true,
							slug: true,
						},
					},
				},
			});
		});

		const updatedUserSkills = await Promise.all(updatePromises);

		res.json({
			message: "User skills updated successfully",
			userSkills: updatedUserSkills,
		});
	} catch (error) {
		console.error("Bulk update user skills error:", error);
		if (error instanceof Error && error.message.includes("Record to update not found")) {
			res.status(404).json({ error: "One or more user skills not found" });
		} else {
			res.status(500).json({ error: "Internal server error" });
		}
	}
});

export default router;
