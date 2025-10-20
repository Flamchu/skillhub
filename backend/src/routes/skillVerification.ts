import { Router, Request, Response } from "express";
import { ProficiencyLevel } from "@prisma/client";
import { AuthenticatedRequest, authenticateSupabaseToken, requireAdmin } from "../middleware/supabaseAuth";
import { prisma } from "../config/database";

const router = Router();

// get verification questions for a skill (protected - user must be attempting to add this skill)
router.get("/skills/:skillId/verification/questions", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { skillId } = req.params;
		const userId = req.user!.id;

		// verify skill exists
		const skill = await prisma.skill.findUnique({
			where: { id: skillId },
			select: { id: true, name: true, slug: true },
		});

		if (!skill) {
			return res.status(404).json({ error: "Skill not found" });
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

		// if they already have it verified, they shouldn't be taking the test again
		if (existingUserSkill?.isVerified) {
			return res.status(400).json({
				error: "You already have this skill verified",
				userSkill: existingUserSkill,
			});
		}

		// get verification questions for this skill
		const questions = await prisma.skillVerificationQuestion.findMany({
			where: { skillId },
			include: {
				choices: {
					select: {
						id: true,
						label: true,
						choiceText: true,
						order: true,
						// don't include isCorrect for security
					},
					orderBy: { order: "asc" },
				},
			},
			orderBy: { order: "asc" },
		});

		if (questions.length === 0) {
			return res.status(404).json({
				error: "No verification questions found for this skill",
				message: "This skill does not have a verification quiz yet. Please contact an administrator.",
			});
		}

		// calculate total possible points
		const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

		res.json({
			skill,
			questions: questions.map((q) => ({
				id: q.id,
				questionText: q.questionText,
				difficultyLevel: q.difficultyLevel,
				points: q.points,
				order: q.order,
				choices: q.choices,
			})),
			totalPoints,
			questionsCount: questions.length,
		});
	} catch (error) {
		console.error("Get verification questions error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// start a verification attempt (protected)
router.post("/skills/:skillId/verification/attempts", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { skillId } = req.params;
		const userId = req.user!.id;

		// verify skill exists
		const skill = await prisma.skill.findUnique({
			where: { id: skillId },
		});

		if (!skill) {
			return res.status(404).json({ error: "Skill not found" });
		}

		// check if user already has this skill verified
		const existingUserSkill = await prisma.userSkill.findUnique({
			where: {
				userId_skillId: {
					userId,
					skillId,
				},
			},
		});

		if (existingUserSkill?.isVerified) {
			return res.status(400).json({
				error: "You already have this skill verified",
				userSkill: existingUserSkill,
			});
		}

		// check for existing incomplete attempt
		const incompleteAttempt = await prisma.skillVerificationAttempt.findFirst({
			where: {
				userId,
				skillId,
				completedAt: null,
			},
		});

		if (incompleteAttempt) {
			return res.status(409).json({
				error: "You already have an incomplete verification attempt for this skill",
				attemptId: incompleteAttempt.id,
			});
		}

		// get questions to calculate total points
		const questions = await prisma.skillVerificationQuestion.findMany({
			where: { skillId },
			select: { points: true },
		});

		if (questions.length === 0) {
			return res.status(404).json({ error: "No verification questions found for this skill" });
		}

		const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

		// create new attempt
		const attempt = await prisma.skillVerificationAttempt.create({
			data: {
				userId,
				skillId,
				totalPoints,
			},
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

		res.status(201).json({ attempt });
	} catch (error) {
		console.error("Create verification attempt error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// submit verification answers and complete attempt (protected)
router.patch("/verification/attempts/:attemptId/submit", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { attemptId } = req.params;
		const { answers } = req.body;
		const userId = req.user!.id;

		// validate answers format
		if (!answers || !Array.isArray(answers)) {
			return res.status(400).json({ error: "Answers array is required" });
		}

		// find attempt and verify ownership
		const attempt = await prisma.skillVerificationAttempt.findUnique({
			where: { id: attemptId },
			include: {
				skill: true,
			},
		});

		if (!attempt) {
			return res.status(404).json({ error: "Verification attempt not found" });
		}

		if (attempt.userId !== userId) {
			return res.status(403).json({ error: "Access denied" });
		}

		if (attempt.completedAt) {
			return res.status(400).json({ error: "This attempt has already been completed" });
		}

		// get all questions with correct answers
		const questions = await prisma.skillVerificationQuestion.findMany({
			where: { skillId: attempt.skillId },
			include: {
				choices: true,
			},
		});

		// create a map of question answers
		const questionMap = new Map(questions.map((q) => [q.id, q]));

		let totalEarnedPoints = 0;
		const userAnswers = [];

		// grade each answer
		for (const answer of answers) {
			const { questionId, selectedChoices } = answer;

			if (!questionId || !Array.isArray(selectedChoices)) {
				return res.status(400).json({
					error: "Invalid answer format",
					details: "Each answer must have questionId and selectedChoices array",
				});
			}

			const question = questionMap.get(questionId);
			if (!question) {
				return res.status(400).json({
					error: `Invalid question ID: ${questionId}`,
				});
			}

			// get correct choice IDs
			const correctChoiceIds = new Set(question.choices.filter((c) => c.isCorrect).map((c) => c.id));

			// check if user's answer matches exactly
			const selectedSet = new Set(selectedChoices);
			const isCorrect = correctChoiceIds.size === selectedSet.size && [...correctChoiceIds].every((id) => selectedSet.has(id));

			const pointsEarned = isCorrect ? question.points : 0;
			totalEarnedPoints += pointsEarned;

			userAnswers.push({
				questionId,
				selectedChoices,
				isCorrect,
				pointsEarned,
			});
		}

		// calculate achieved proficiency level based on score percentage
		const scorePercentage = (totalEarnedPoints / attempt.totalPoints) * 100;
		let achievedLevel: ProficiencyLevel;
		let passedVerification = false;

		if (scorePercentage >= 90) {
			achievedLevel = ProficiencyLevel.EXPERT;
			passedVerification = true;
		} else if (scorePercentage >= 75) {
			achievedLevel = ProficiencyLevel.ADVANCED;
			passedVerification = true;
		} else if (scorePercentage >= 60) {
			achievedLevel = ProficiencyLevel.INTERMEDIATE;
			passedVerification = true;
		} else {
			achievedLevel = ProficiencyLevel.BASIC;
			passedVerification = false;
		}

		// update attempt with results
		const updatedAttempt = await prisma.skillVerificationAttempt.update({
			where: { id: attemptId },
			data: {
				completedAt: new Date(),
				earnedPoints: totalEarnedPoints,
				achievedLevel,
				passedVerification,
			},
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

		// save user answers
		await prisma.skillVerificationUserAnswer.createMany({
			data: userAnswers.map((answer) => ({
				attemptId,
				questionId: answer.questionId,
				selectedChoices: answer.selectedChoices,
				isCorrect: answer.isCorrect,
				pointsEarned: answer.pointsEarned,
			})),
		});

		res.json({
			attempt: updatedAttempt,
			results: {
				totalPoints: attempt.totalPoints,
				earnedPoints: totalEarnedPoints,
				scorePercentage: Math.round(scorePercentage * 100) / 100,
				achievedLevel,
				passedVerification,
				answersCount: userAnswers.length,
				correctAnswersCount: userAnswers.filter((a) => a.isCorrect).length,
			},
		});
	} catch (error) {
		console.error("Submit verification answers error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// get verification attempt results (protected)
router.get("/verification/attempts/:attemptId", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { attemptId } = req.params;
		const { includeAnswers = "false" } = req.query;
		const userId = req.user!.id;

		const attempt = await prisma.skillVerificationAttempt.findUnique({
			where: { id: attemptId },
			include: {
				skill: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
				userAnswers:
					includeAnswers === "true"
						? {
								include: {
									question: {
										select: {
											id: true,
											questionText: true,
											difficultyLevel: true,
											points: true,
											choices: true,
										},
									},
								},
							}
						: false,
			},
		});

		if (!attempt) {
			return res.status(404).json({ error: "Verification attempt not found" });
		}

		if (attempt.userId !== userId && req.user!.role !== "ADMIN") {
			return res.status(403).json({ error: "Access denied" });
		}

		const scorePercentage = attempt.completedAt ? (attempt.earnedPoints / attempt.totalPoints) * 100 : 0;

		res.json({
			attempt,
			results: attempt.completedAt
				? {
						totalPoints: attempt.totalPoints,
						earnedPoints: attempt.earnedPoints,
						scorePercentage: Math.round(scorePercentage * 100) / 100,
						achievedLevel: attempt.achievedLevel,
						passedVerification: attempt.passedVerification,
					}
				: null,
		});
	} catch (error) {
		console.error("Get verification attempt error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// get user's verification attempts for a skill (protected)
router.get("/skills/:skillId/verification/attempts", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { skillId } = req.params;
		const userId = req.user!.id;

		const attempts = await prisma.skillVerificationAttempt.findMany({
			where: {
				userId,
				skillId,
			},
			include: {
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
		});

		const attemptsWithResults = attempts.map((attempt) => {
			const scorePercentage = attempt.completedAt ? (attempt.earnedPoints / attempt.totalPoints) * 100 : 0;

			return {
				...attempt,
				scorePercentage: Math.round(scorePercentage * 100) / 100,
			};
		});

		res.json({ attempts: attemptsWithResults });
	} catch (error) {
		console.error("Get verification attempts error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// apply verification results to user skill (protected)
router.post("/verification/attempts/:attemptId/apply", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { attemptId } = req.params;
		const userId = req.user!.id;

		// find attempt
		const attempt = await prisma.skillVerificationAttempt.findUnique({
			where: { id: attemptId },
		});

		if (!attempt) {
			return res.status(404).json({ error: "Verification attempt not found" });
		}

		if (attempt.userId !== userId) {
			return res.status(403).json({ error: "Access denied" });
		}

		if (!attempt.completedAt) {
			return res.status(400).json({ error: "Attempt is not completed yet" });
		}

		if (!attempt.passedVerification) {
			return res.status(400).json({
				error: "Verification not passed",
				message: "You need to score at least 60% to verify this skill",
			});
		}

		// check if user already has this skill
		const existingUserSkill = await prisma.userSkill.findUnique({
			where: {
				userId_skillId: {
					userId,
					skillId: attempt.skillId,
				},
			},
		});

		let userSkill;

		if (existingUserSkill) {
			// update existing skill with verified proficiency
			userSkill = await prisma.userSkill.update({
				where: {
					userId_skillId: {
						userId,
						skillId: attempt.skillId,
					},
				},
				data: {
					proficiency: attempt.achievedLevel!,
					isVerified: true,
					verificationAttemptId: attemptId,
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
		} else {
			// create new user skill with verified proficiency
			userSkill = await prisma.userSkill.create({
				data: {
					userId,
					skillId: attempt.skillId,
					proficiency: attempt.achievedLevel!,
					isVerified: true,
					verificationAttemptId: attemptId,
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
		}

		res.json({
			message: "Skill verification applied successfully",
			userSkill,
		});
	} catch (error) {
		console.error("Apply verification error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// delete/abandon an incomplete verification attempt (protected)
router.delete("/verification/attempts/:attemptId", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { attemptId } = req.params;
		const userId = req.user!.id;

		// find attempt
		const attempt = await prisma.skillVerificationAttempt.findUnique({
			where: { id: attemptId },
		});

		if (!attempt) {
			return res.status(404).json({ error: "Verification attempt not found" });
		}

		if (attempt.userId !== userId) {
			return res.status(403).json({ error: "Access denied" });
		}

		if (attempt.completedAt) {
			return res.status(400).json({ error: "Cannot delete completed attempts" });
		}

		// delete associated user answers first
		await prisma.skillVerificationUserAnswer.deleteMany({
			where: { attemptId },
		});

		// delete the attempt
		await prisma.skillVerificationAttempt.delete({
			where: { id: attemptId },
		});

		res.json({
			message: "Incomplete verification attempt deleted successfully",
		});
	} catch (error) {
		console.error("Delete verification attempt error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

export default router;
