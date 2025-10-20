"use client";

import { useState, useEffect } from "react";
import { http } from "@/lib/http";
import type {
	SkillVerificationQuestionsResponse,
	SkillVerificationAnswer,
	SkillVerificationSubmitResponse,
} from "@/types";

interface SkillVerificationQuizProps {
	skillId: string;
	attemptId?: string;
	onComplete: (results: SkillVerificationSubmitResponse) => void;
	onCancel?: () => void;
}

export default function SkillVerificationQuiz({
	skillId,
	attemptId: initialAttemptId,
	onComplete,
	onCancel,
}: SkillVerificationQuizProps) {
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [attemptId, setAttemptId] = useState<string | undefined>(initialAttemptId);
	const [incompleteAttemptId, setIncompleteAttemptId] = useState<string | null>(null);
	const [showResumeDialog, setShowResumeDialog] = useState(false);
	const [questionsData, setQuestionsData] = useState<SkillVerificationQuestionsResponse | null>(null);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [answers, setAnswers] = useState<Map<string, string[]>>(new Map());
	const [timeElapsed, setTimeElapsed] = useState(0);

	// fetch questions and create attempt on mount
	useEffect(() => {
		async function initialize() {
			try {
				setLoading(true);
				setError(null);

				// get questions from backend
				const questionsResponse = await http.get<SkillVerificationQuestionsResponse>(
					`/skills/${skillId}/verification/questions`
				);

				setQuestionsData(questionsResponse.data);

				// create new attempt if needed
				if (!attemptId) {
					try {
						const attemptResponse = await http.post<{ attempt: { id: string } }>(
							`/skills/${skillId}/verification/attempts`
						);
						setAttemptId(attemptResponse.data.attempt.id);
					} catch (attemptErr) {
						// http interceptor transforms errors to { status, message, data }
						const error = attemptErr as {
							status?: number;
							message?: string;
							data?: { error?: string; attemptId?: string };
						};

						if (error.status === 409 && error.data?.attemptId) {
							// incomplete attempt found, show dialog
							setIncompleteAttemptId(error.data.attemptId);
							setShowResumeDialog(true);
							setLoading(false);
							return;
						} else {
							// rethrow if not 409
							throw attemptErr;
						}
					}
				}
			} catch (err) {
				// handle errors from http interceptor
				let errorMessage = "Failed to load verification quiz";

				if (err && typeof err === "object") {
					// transformed error from http interceptor
					const transformedError = err as {
						status?: number;
						message?: string;
						data?: { error?: string; message?: string };
					};

					// fallback to axios format if not transformed
					const axiosError = err as {
						response?: {
							data?: { error?: string; message?: string };
							status?: number;
						};
						message?: string;
						code?: string;
					};

					const status = transformedError.status || axiosError.response?.status;
					const errorData = transformedError.data || axiosError.response?.data;

					if (status === 404) {
						errorMessage =
							errorData?.message ||
							errorData?.error ||
							"No verification questions found for this skill. Please contact an administrator.";
					} else if (status === 400) {
						errorMessage = errorData?.error || errorData?.message || "Invalid request";
					} else if (status === 401 || status === 403) {
						errorMessage = "Authentication required. Please log in again.";
					} else if (status === 409) {
						errorMessage = errorData?.error || "You already have an incomplete attempt";
					} else if (errorData?.error) {
						errorMessage = errorData.error;
					} else if (errorData?.message) {
						errorMessage = errorData.message;
					} else if (transformedError.message) {
						errorMessage = transformedError.message;
					} else if (axiosError.message) {
						errorMessage = axiosError.message;
					} else if (axiosError.code) {
						errorMessage = `Network error: ${axiosError.code}`;
					}
				} else if (typeof err === "string") {
					errorMessage = err;
				}

				setError(errorMessage);
			} finally {
				setLoading(false);
			}
		}

		initialize();
	}, [skillId, attemptId]);

	// track elapsed time
	useEffect(() => {
		const interval = setInterval(() => {
			setTimeElapsed(prev => prev + 1);
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	const handleAnswerChange = (questionId: string, choiceId: string, isMultiple: boolean) => {
		setAnswers(prev => {
			const newAnswers = new Map(prev);
			const currentAnswer = newAnswers.get(questionId) || [];

			if (isMultiple) {
				// toggle choice in multiple selection
				if (currentAnswer.includes(choiceId)) {
					const filtered = currentAnswer.filter(id => id !== choiceId);
					if (filtered.length > 0) {
						newAnswers.set(questionId, filtered);
					} else {
						newAnswers.delete(questionId);
					}
				} else {
					newAnswers.set(questionId, [...currentAnswer, choiceId]);
				}
			} else {
				// replace for single selection
				newAnswers.set(questionId, [choiceId]);
			}

			return newAnswers;
		});
	};

	const handleNext = () => {
		if (questionsData && currentQuestionIndex < questionsData.questions.length - 1) {
			setCurrentQuestionIndex(prev => prev + 1);
		}
	};

	const handlePrevious = () => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex(prev => prev - 1);
		}
	};

	const handleSubmit = async () => {
		if (!attemptId || !questionsData) return;

		try {
			setSubmitting(true);
			setError(null);

			// format answers for submission
			const answersArray: SkillVerificationAnswer[] = questionsData.questions.map(question => ({
				questionId: question.id,
				selectedChoices: answers.get(question.id) || [],
			}));

			const response = await http.patch<SkillVerificationSubmitResponse>(`/verification/attempts/${attemptId}/submit`, {
				answers: answersArray,
			});

			onComplete(response.data);
		} catch (err) {
			console.error("Failed to submit verification quiz:", err);
			const error = err as { response?: { data?: { error?: string } } };
			setError(error.response?.data?.error || "Failed to submit quiz");
			setSubmitting(false);
		}
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const getProgressPercentage = () => {
		if (!questionsData) return 0;
		return Math.round((answers.size / questionsData.questions.length) * 100);
	};

	const handleResumeAttempt = () => {
		setAttemptId(incompleteAttemptId!);
		setShowResumeDialog(false);
		setLoading(false);
	};

	const handleStartOver = async () => {
		if (!incompleteAttemptId) return;

		try {
			setLoading(true);
			setError(null);

			// remove old incomplete attempt
			await http.delete(`/verification/attempts/${incompleteAttemptId}`);

			// start fresh attempt
			const attemptResponse = await http.post<{ attempt: { id: string } }>(`/skills/${skillId}/verification/attempts`);
			setAttemptId(attemptResponse.data.attempt.id);
			setShowResumeDialog(false);
			setLoading(false);
		} catch (err) {
			console.error("Failed to start new attempt:", err);
			const error = err as { response?: { data?: { error?: string } } };
			setError(error.response?.data?.error || "Failed to start new quiz");
			setShowResumeDialog(false);
			setLoading(false);
		}
	};

	if (showResumeDialog) {
		return (
			<div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
				<h3 className="text-lg font-semibold text-blue-900 mb-2">Incomplete Attempt Found</h3>
				<p className="text-blue-700 mb-6">
					You have an incomplete verification attempt for this skill. Would you like to resume where you left off or
					start a fresh quiz?
				</p>
				<div className="flex gap-3">
					<button
						onClick={handleResumeAttempt}
						className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
					>
						Resume Attempt
					</button>
					<button
						onClick={handleStartOver}
						className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
					>
						Start Over
					</button>
					{onCancel && (
						<button
							onClick={onCancel}
							className="px-4 py-2 bg-white text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
						>
							Cancel
						</button>
					)}
				</div>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
					<p className="text-gray-600">Loading verification quiz...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-6 bg-red-50 border border-red-200 rounded-lg">
				<h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
				<p className="text-red-600 mb-4">{error}</p>
				{onCancel && (
					<button
						onClick={onCancel}
						className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
					>
						Go Back
					</button>
				)}
			</div>
		);
	}

	if (!questionsData) {
		return null;
	}

	const currentQuestion = questionsData.questions[currentQuestionIndex];
	const isLastQuestion = currentQuestionIndex === questionsData.questions.length - 1;
	const currentAnswer = answers.get(currentQuestion.id) || [];
	const allAnswered = answers.size === questionsData.questions.length;

	return (
		<div className="max-w-4xl mx-auto">
			{/* header */}
			<div className="bg-white border-b border-gray-200 p-6 rounded-t-lg">
				<div className="flex items-center justify-between mb-4">
					<div>
						<h2 className="text-2xl font-bold text-gray-900">{questionsData.skill.name}</h2>
						<p className="text-sm text-gray-600 mt-1">Skill Verification Quiz</p>
					</div>
					<div className="text-right">
						<div className="text-2xl font-mono font-bold text-gray-900">{formatTime(timeElapsed)}</div>
						<div className="text-xs text-gray-500">Time Elapsed</div>
					</div>
				</div>

				{/* progress bar */}
				<div className="space-y-2">
					<div className="flex items-center justify-between text-sm">
						<span className="text-gray-600">
							Question {currentQuestionIndex + 1} of {questionsData.questions.length}
						</span>
						<span className="text-gray-600">{getProgressPercentage()}% Answered</span>
					</div>
					<div className="w-full bg-gray-200 rounded-full h-2">
						<div
							className="bg-blue-600 h-2 rounded-full transition-all duration-300"
							style={{ width: `${getProgressPercentage()}%` }}
						/>
					</div>
				</div>
			</div>

			{/* question */}
			<div className="bg-white p-6 border-b border-gray-200">
				<div className="flex items-start gap-4 mb-6">
					<div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
						<span className="text-lg font-bold text-blue-600">{currentQuestionIndex + 1}</span>
					</div>
					<div className="flex-1">
						<div className="flex items-center gap-2 mb-2">
							<span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
								{currentQuestion.difficultyLevel}
							</span>
							<span className="text-xs text-gray-400">•</span>
							<span className="text-xs text-gray-500">{currentQuestion.points} point(s)</span>
						</div>
						<p className="text-lg text-gray-900 leading-relaxed">{currentQuestion.questionText}</p>
						<p className="text-sm text-gray-500 mt-2">Select all correct answers (A, B, C, or D)</p>
					</div>
				</div>

				{/* choices */}
				<div className="space-y-3 ml-16">
					{currentQuestion.choices.map(choice => {
						const isSelected = currentAnswer.includes(choice.id);

						return (
							<label
								key={choice.id}
								className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
									isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300 bg-white"
								}`}
							>
								<input
									type="checkbox"
									checked={isSelected}
									onChange={() => handleAnswerChange(currentQuestion.id, choice.id, true)}
									className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
								/>
								<div className="flex-1">
									<div className="flex items-center gap-2">
										<span className="font-bold text-gray-700">{choice.label}.</span>
										<span className="text-gray-900">{choice.choiceText}</span>
									</div>
								</div>
							</label>
						);
					})}
				</div>
			</div>

			{/* navigation */}
			<div className="bg-white p-6 rounded-b-lg flex items-center justify-between">
				<button
					onClick={handlePrevious}
					disabled={currentQuestionIndex === 0}
					className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					Previous
				</button>

				<div className="flex items-center gap-4">
					{onCancel && (
						<button
							onClick={onCancel}
							disabled={submitting}
							className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
						>
							Cancel
						</button>
					)}

					{isLastQuestion ? (
						<button
							onClick={handleSubmit}
							disabled={!allAnswered || submitting}
							className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
						>
							{submitting ? "Submitting..." : "Submit Quiz"}
						</button>
					) : (
						<button
							onClick={handleNext}
							className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
						>
							Next
						</button>
					)}
				</div>
			</div>

			{/* warning if not all answered */}
			{isLastQuestion && !allAnswered && (
				<div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
					<p className="text-sm text-yellow-800">
						⚠️ You have answered {answers.size} of {questionsData.questions.length} questions. Please answer all
						questions before submitting.
					</p>
				</div>
			)}
		</div>
	);
}
