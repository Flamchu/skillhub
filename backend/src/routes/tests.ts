import { Router, Request, Response } from "express";
import { CourseDifficulty } from "@prisma/client";
import { AuthenticatedRequest, authenticateSupabaseToken, requireAdmin } from "../middleware/supabaseAuth";
import { prisma } from "../config/database";

const router = Router();

// get all published tests with filtering
router.get("/", async (req: Request, res: Response) => {
	try {
		const { skillId, difficulty, page = "1", limit = "20", sortBy = "createdAt", sortOrder = "desc" } = req.query;

		const pageNum = parseInt(page as string);
		const limitNum = parseInt(limit as string);
		const offset = (pageNum - 1) * limitNum;

		// build where clause
		const where: any = {
			published: true,
		};

		if (skillId) {
			where.skillId = skillId as string;
		}

		if (difficulty) {
			where.difficulty = difficulty as CourseDifficulty;
		}

		// build order by
		const orderBy: any = {};
		if (sortBy === "title") {
			orderBy.title = sortOrder as "asc" | "desc";
		} else if (sortBy === "difficulty") {
			orderBy.difficulty = sortOrder as "asc" | "desc";
		} else if (sortBy === "totalQuestions") {
			orderBy.totalQuestions = sortOrder as "asc" | "desc";
		} else {
			orderBy.createdAt = sortOrder as "asc" | "desc";
		}

		const [tests, totalCount] = await Promise.all([
			prisma.test.findMany({
				where,
				include: {
					skill: {
						select: {
							id: true,
							name: true,
							slug: true,
						},
					},
					createdBy: {
						select: {
							id: true,
							name: true,
						},
					},
					_count: {
						select: {
							questions: true,
							TestAttempt: true,
						},
					},
				},
				orderBy,
				skip: offset,
				take: limitNum,
			}),
			prisma.test.count({ where }),
		]);

		const totalPages = Math.ceil(totalCount / limitNum);

		res.json({
			tests: tests.map((test) => ({
				...test,
				questionsCount: test._count.questions,
				attemptsCount: test._count.TestAttempt,
				_count: undefined,
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
		console.error("Error fetching tests:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// get test details with questions
router.get("/:id", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const test = await prisma.test.findUnique({
			where: {
				id,
				published: true,
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
				createdBy: {
					select: {
						id: true,
						name: true,
					},
				},
				questions: {
					include: {
						choices: {
							select: {
								id: true,
								text: true,
								order: true,
								// don't include isCorrect for security
							},
							orderBy: {
								order: "asc",
							},
						},
					},
					orderBy: {
						order: "asc",
					},
				},
			},
		});

		if (!test) {
			return res.status(404).json({ error: "Test not found" });
		}

		res.json({ test });
	} catch (error) {
		console.error("Error fetching test:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// start a new test attempt
router.post("/:id/attempts", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { id: testId } = req.params;
		const userId = req.user!.id;

		// verify test exists and is published
		const test = await prisma.test.findUnique({
			where: {
				id: testId,
				published: true,
			},
			select: {
				id: true,
				title: true,
				totalQuestions: true,
			},
		});

		if (!test) {
			return res.status(404).json({ error: "Test not found" });
		}

		// check if user has an incomplete attempt
		const existingAttempt = await prisma.testAttempt.findFirst({
			where: {
				userId,
				testId,
				completedAt: null,
			},
		});

		if (existingAttempt) {
			return res.status(409).json({
				error: "You already have an incomplete attempt for this test",
				attemptId: existingAttempt.id,
			});
		}

		// create new attempt
		const attempt = await prisma.testAttempt.create({
			data: {
				userId,
				testId,
			},
			include: {
				test: {
					select: {
						id: true,
						title: true,
						totalQuestions: true,
					},
				},
			},
		});

		res.status(201).json({ attempt });
	} catch (error) {
		console.error("Error creating test attempt:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// submit test answers and complete attempt
router.patch("/attempts/:attemptId", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { attemptId } = req.params;
		const { answers } = req.body;
		const userId = req.user!.id;

		if (!answers || !Array.isArray(answers)) {
			return res.status(400).json({ error: "Answers array is required" });
		}

		// find attempt and verify ownership
		const attempt = await prisma.testAttempt.findUnique({
			where: { id: attemptId },
			include: {
				test: {
					include: {
						questions: {
							include: {
								choices: true,
							},
							orderBy: {
								order: "asc",
							},
						},
					},
				},
			},
		});

		if (!attempt) {
			return res.status(404).json({ error: "Test attempt not found" });
		}

		if (attempt.userId !== userId) {
			return res.status(403).json({ error: "Access denied" });
		}

		if (attempt.completedAt) {
			return res.status(409).json({ error: "Test attempt already completed" });
		}

		// calculate score
		let correctAnswers = 0;
		let totalPoints = 0;

		const processedAnswers = answers.map((answer: any) => {
			const question = attempt.test.questions.find((q) => q.id === answer.questionId);
			if (!question) return answer;

			totalPoints += question.points;

			if (question.type === "MULTIPLE_CHOICE") {
				const correctChoice = question.choices.find((c) => c.isCorrect);
				if (correctChoice && answer.choiceId === correctChoice.id) {
					correctAnswers += question.points;
				}
			}
			// for open questions, manual grading would be required
			// for now, we'll assume they're not auto-graded

			return {
				...answer,
				questionId: question.id,
				isCorrect: question.type === "MULTIPLE_CHOICE" ? question.choices.find((c) => c.id === answer.choiceId)?.isCorrect || false : null,
			};
		});

		const score = totalPoints > 0 ? (correctAnswers / totalPoints) * 100 : 0;

		// update attempt
		const updatedAttempt = await prisma.testAttempt.update({
			where: { id: attemptId },
			data: {
				completedAt: new Date(),
				score: score,
				answers: processedAnswers,
			},
			include: {
				test: {
					select: {
						id: true,
						title: true,
						totalQuestions: true,
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

		res.json({
			attempt: updatedAttempt,
			results: {
				score: score,
				correctAnswers: correctAnswers,
				totalPoints: totalPoints,
				percentage: Math.round(score * 100) / 100,
			},
		});
	} catch (error) {
		console.error("Error submitting test attempt:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// get user's test attempts
router.get("/users/:id/attempts", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { id: userId } = req.params;
		const { testId, completed, page = "1", limit = "20", sortBy = "startedAt", sortOrder = "desc" } = req.query;

		// verify user can access attempts (own or admin)
		if (req.user?.id !== userId && req.user?.role !== "ADMIN") {
			return res.status(403).json({ error: "Access denied" });
		}

		const pageNum = parseInt(page as string);
		const limitNum = parseInt(limit as string);
		const offset = (pageNum - 1) * limitNum;

		// build where clause
		const where: any = { userId };

		if (testId) {
			where.testId = testId as string;
		}

		if (completed === "true") {
			where.completedAt = { not: null };
		} else if (completed === "false") {
			where.completedAt = null;
		}

		// build order by
		const orderBy: any = {};
		if (sortBy === "completedAt") {
			orderBy.completedAt = sortOrder as "asc" | "desc";
		} else if (sortBy === "score") {
			orderBy.score = sortOrder as "asc" | "desc";
		} else {
			orderBy.startedAt = sortOrder as "asc" | "desc";
		}

		const [attempts, totalCount] = await Promise.all([
			prisma.testAttempt.findMany({
				where,
				include: {
					test: {
						select: {
							id: true,
							title: true,
							totalQuestions: true,
							difficulty: true,
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
				orderBy,
				skip: offset,
				take: limitNum,
			}),
			prisma.testAttempt.count({ where }),
		]);

		const totalPages = Math.ceil(totalCount / limitNum);

		res.json({
			attempts,
			pagination: {
				currentPage: pageNum,
				totalPages,
				totalCount,
				hasNext: pageNum < totalPages,
				hasPrev: pageNum > 1,
			},
		});
	} catch (error) {
		console.error("Error fetching user attempts:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// create a new test (admin only)
router.post("/", authenticateSupabaseToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { title, skillId, difficulty, questions = [] } = req.body;
		const createdById = req.user!.id;

		if (!title) {
			return res.status(400).json({ error: "Title is required" });
		}

		// verify skill exists if provided
		if (skillId) {
			const skill = await prisma.skill.findUnique({
				where: { id: skillId },
			});
			if (!skill) {
				return res.status(404).json({ error: "Skill not found" });
			}
		}

		const test = await prisma.test.create({
			data: {
				title,
				skillId,
				difficulty: difficulty || "BEGINNER",
				totalQuestions: questions.length,
				createdById,
				questions: {
					create: questions.map((question: any, index: number) => ({
						text: question.text,
						type: question.type || "MULTIPLE_CHOICE",
						order: question.order || index,
						points: question.points || 1,
						choices: {
							create: (question.choices || []).map((choice: any, choiceIndex: number) => ({
								text: choice.text,
								isCorrect: choice.isCorrect || false,
								order: choice.order || choiceIndex,
							})),
						},
					})),
				},
			},
			include: {
				skill: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
				questions: {
					include: {
						choices: true,
					},
					orderBy: {
						order: "asc",
					},
				},
			},
		});

		res.status(201).json({ test });
	} catch (error) {
		console.error("Error creating test:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

export default router;
