import { Router, Request, Response } from "express";
import { ProficiencyLevel } from "@prisma/client";
import { AuthenticatedRequest, authenticateSupabaseToken, requireAdmin } from "../middleware/supabaseAuth";
import { prisma } from "../config/database";

const router = Router();

// admin: get all verification questions for a skill
router.get("/skills/:skillId/verification/questions/admin", authenticateSupabaseToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { skillId } = req.params;

		const questions = await prisma.skillVerificationQuestion.findMany({
			where: { skillId },
			include: {
				choices: {
					orderBy: { order: "asc" },
				},
				skill: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
			},
			orderBy: { order: "asc" },
		});

		res.json({ questions });
	} catch (error) {
		console.error("Admin get verification questions error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// admin: create verification question for a skill
router.post("/skills/:skillId/verification/questions", authenticateSupabaseToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { skillId } = req.params;
		const { questionText, difficultyLevel, points, order, choices } = req.body;

		// validate required fields
		if (!questionText || !choices || !Array.isArray(choices) || choices.length !== 4) {
			return res.status(400).json({
				error: "Invalid input",
				message: "questionText and exactly 4 choices are required",
			});
		}

		// validate proficiency level
		const validProficiencyLevels = [ProficiencyLevel.INTERMEDIATE, ProficiencyLevel.ADVANCED, ProficiencyLevel.EXPERT];
		if (difficultyLevel && !validProficiencyLevels.includes(difficultyLevel)) {
			return res.status(400).json({
				error: "Invalid difficulty level",
				message: "Difficulty must be INTERMEDIATE, ADVANCED, or EXPERT",
			});
		}

		// validate choices
		const labels = ["A", "B", "C", "D"];
		const correctChoices = choices.filter((c: any) => c.isCorrect);

		if (correctChoices.length < 1 || correctChoices.length > 3) {
			return res.status(400).json({
				error: "Invalid choices",
				message: "Must have between 1 and 3 correct answers",
			});
		}

		// verify skill exists
		const skill = await prisma.skill.findUnique({
			where: { id: skillId },
		});

		if (!skill) {
			return res.status(404).json({ error: "Skill not found" });
		}

		// create question with choices
		const question = await prisma.skillVerificationQuestion.create({
			data: {
				skillId,
				questionText,
				difficultyLevel: difficultyLevel || ProficiencyLevel.INTERMEDIATE,
				points: points || 1,
				order: order || 0,
				choices: {
					create: choices.map((choice: any, index: number) => ({
						choiceText: choice.choiceText || choice.text,
						label: labels[index],
						isCorrect: choice.isCorrect || false,
						order: index,
					})),
				},
			},
			include: {
				choices: {
					orderBy: { order: "asc" },
				},
			},
		});

		res.status(201).json({
			message: "Verification question created successfully",
			question,
		});
	} catch (error) {
		console.error("Admin create verification question error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// admin: update verification question
router.patch("/verification/questions/:questionId", authenticateSupabaseToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { questionId } = req.params;
		const { questionText, difficultyLevel, points, order, choices } = req.body;

		// verify question exists
		const existingQuestion = await prisma.skillVerificationQuestion.findUnique({
			where: { id: questionId },
			include: { choices: true },
		});

		if (!existingQuestion) {
			return res.status(404).json({ error: "Question not found" });
		}

		// validate proficiency level if provided
		if (difficultyLevel) {
			const validProficiencyLevels = [ProficiencyLevel.INTERMEDIATE, ProficiencyLevel.ADVANCED, ProficiencyLevel.EXPERT];
			if (!validProficiencyLevels.includes(difficultyLevel)) {
				return res.status(400).json({
					error: "Invalid difficulty level",
					message: "Difficulty must be INTERMEDIATE, ADVANCED, or EXPERT",
				});
			}
		}

		// validate choices if provided
		if (choices) {
			if (!Array.isArray(choices) || choices.length !== 4) {
				return res.status(400).json({
					error: "Invalid choices",
					message: "Must provide exactly 4 choices",
				});
			}

			const correctChoices = choices.filter((c: any) => c.isCorrect);
			if (correctChoices.length < 1 || correctChoices.length > 3) {
				return res.status(400).json({
					error: "Invalid choices",
					message: "Must have between 1 and 3 correct answers",
				});
			}
		}

		// update question
		const updateData: any = {};
		if (questionText !== undefined) updateData.questionText = questionText;
		if (difficultyLevel !== undefined) updateData.difficultyLevel = difficultyLevel;
		if (points !== undefined) updateData.points = points;
		if (order !== undefined) updateData.order = order;

		const updatedQuestion = await prisma.skillVerificationQuestion.update({
			where: { id: questionId },
			data: updateData,
		});

		// update choices if provided
		if (choices) {
			const labels = ["A", "B", "C", "D"];

			// delete old choices
			await prisma.skillVerificationChoice.deleteMany({
				where: { questionId },
			});

			// create new choices
			await prisma.skillVerificationChoice.createMany({
				data: choices.map((choice: any, index: number) => ({
					questionId,
					choiceText: choice.choiceText || choice.text,
					label: labels[index],
					isCorrect: choice.isCorrect || false,
					order: index,
				})),
			});
		}

		// fetch updated question with choices
		const question = await prisma.skillVerificationQuestion.findUnique({
			where: { id: questionId },
			include: {
				choices: {
					orderBy: { order: "asc" },
				},
			},
		});

		res.json({
			message: "Verification question updated successfully",
			question,
		});
	} catch (error) {
		console.error("Admin update verification question error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// admin: delete verification question
router.delete("/verification/questions/:questionId", authenticateSupabaseToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { questionId } = req.params;

		// verify question exists
		const question = await prisma.skillVerificationQuestion.findUnique({
			where: { id: questionId },
		});

		if (!question) {
			return res.status(404).json({ error: "Question not found" });
		}

		// delete question (choices will be cascade deleted)
		await prisma.skillVerificationQuestion.delete({
			where: { id: questionId },
		});

		res.json({ message: "Verification question deleted successfully" });
	} catch (error) {
		console.error("Admin delete verification question error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// admin: bulk create verification questions for a skill
router.post("/skills/:skillId/verification/questions/bulk", authenticateSupabaseToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { skillId } = req.params;
		const { questions } = req.body;

		if (!questions || !Array.isArray(questions) || questions.length === 0) {
			return res.status(400).json({
				error: "Invalid input",
				message: "questions array is required",
			});
		}

		// verify skill exists
		const skill = await prisma.skill.findUnique({
			where: { id: skillId },
		});

		if (!skill) {
			return res.status(404).json({ error: "Skill not found" });
		}

		const labels = ["A", "B", "C", "D"];
		const validProficiencyLevels = [ProficiencyLevel.INTERMEDIATE, ProficiencyLevel.ADVANCED, ProficiencyLevel.EXPERT];

		// validate all questions first
		for (const [index, q] of questions.entries()) {
			if (!q.questionText || !q.choices || !Array.isArray(q.choices) || q.choices.length !== 4) {
				return res.status(400).json({
					error: "Invalid question format",
					message: `Question ${index + 1}: questionText and exactly 4 choices are required`,
				});
			}

			if (q.difficultyLevel && !validProficiencyLevels.includes(q.difficultyLevel)) {
				return res.status(400).json({
					error: "Invalid difficulty level",
					message: `Question ${index + 1}: Difficulty must be INTERMEDIATE, ADVANCED, or EXPERT`,
				});
			}

			const correctChoices = q.choices.filter((c: any) => c.isCorrect);
			if (correctChoices.length < 1 || correctChoices.length > 3) {
				return res.status(400).json({
					error: "Invalid choices",
					message: `Question ${index + 1}: Must have between 1 and 3 correct answers`,
				});
			}
		}

		// create all questions with choices
		const createdQuestions = await Promise.all(
			questions.map((q: any, index: number) =>
				prisma.skillVerificationQuestion.create({
					data: {
						skillId,
						questionText: q.questionText,
						difficultyLevel: q.difficultyLevel || ProficiencyLevel.INTERMEDIATE,
						points: q.points || 1,
						order: q.order !== undefined ? q.order : index,
						choices: {
							create: q.choices.map((choice: any, choiceIndex: number) => ({
								choiceText: choice.choiceText || choice.text,
								label: labels[choiceIndex],
								isCorrect: choice.isCorrect || false,
								order: choiceIndex,
							})),
						},
					},
					include: {
						choices: {
							orderBy: { order: "asc" },
						},
					},
				})
			)
		);

		res.status(201).json({
			message: `${createdQuestions.length} verification questions created successfully`,
			questions: createdQuestions,
		});
	} catch (error) {
		console.error("Admin bulk create verification questions error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// admin: get all verification attempts (with optional filters)
router.get("/verification/attempts/admin", authenticateSupabaseToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { skillId, userId, passed, page = "1", limit = "20" } = req.query;

		const pageNum = parseInt(page as string);
		const limitNum = parseInt(limit as string);
		const offset = (pageNum - 1) * limitNum;

		const where: any = {};
		if (skillId) where.skillId = skillId as string;
		if (userId) where.userId = userId as string;
		if (passed !== undefined) where.passedVerification = passed === "true";

		const [attempts, totalCount] = await Promise.all([
			prisma.skillVerificationAttempt.findMany({
				where,
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
					skill: {
						select: {
							id: true,
							name: true,
							slug: true,
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
				skip: offset,
				take: limitNum,
			}),
			prisma.skillVerificationAttempt.count({ where }),
		]);

		const totalPages = Math.ceil(totalCount / limitNum);

		const attemptsWithResults = attempts.map((attempt) => {
			const scorePercentage = attempt.completedAt ? (attempt.earnedPoints / attempt.totalPoints) * 100 : 0;

			return {
				...attempt,
				scorePercentage: Math.round(scorePercentage * 100) / 100,
			};
		});

		res.json({
			attempts: attemptsWithResults,
			pagination: {
				currentPage: pageNum,
				totalPages,
				totalCount,
				hasNext: pageNum < totalPages,
				hasPrev: pageNum > 1,
			},
		});
	} catch (error) {
		console.error("Admin get verification attempts error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

export default router;
