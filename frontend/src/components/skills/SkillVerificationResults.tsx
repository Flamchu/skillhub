"use client";

import { useState } from "react";
import { http } from "@/lib/http";
import type { SkillVerificationSubmitResponse, ProficiencyLevel } from "@/types";

interface SkillVerificationResultsProps {
	results: SkillVerificationSubmitResponse;
	onApply: () => void;
	onRetake: () => void;
	onCancel?: () => void;
}

const proficiencyColors: Record<ProficiencyLevel, string> = {
	NONE: "bg-gray-100 text-gray-800",
	BASIC: "bg-blue-100 text-blue-800",
	INTERMEDIATE: "bg-green-100 text-green-800",
	ADVANCED: "bg-purple-100 text-purple-800",
	EXPERT: "bg-yellow-100 text-yellow-800",
};

const proficiencyIcons: Record<ProficiencyLevel, string> = {
	NONE: "❌",
	BASIC: "📘",
	INTERMEDIATE: "📗",
	ADVANCED: "📙",
	EXPERT: "🏆",
};

export default function SkillVerificationResults({
	results,
	onApply,
	onRetake,
	onCancel,
}: SkillVerificationResultsProps) {
	const [applying, setApplying] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { attempt, results: testResults } = results;
	const passed = testResults.passedVerification;

	const handleApply = async () => {
		if (!passed) {
			return;
		}

		try {
			setApplying(true);
			setError(null);

			await http.post(`/verification/attempts/${attempt.id}/apply`);
			onApply();
		} catch (err) {
			console.error("Failed to apply verification:", err);
			const error = err as { response?: { data?: { error?: string } } };
			setError(error.response?.data?.error || "Failed to apply verification");
			setApplying(false);
		}
	};

	const getScoreMessage = () => {
		const percentage = testResults.scorePercentage;
		if (percentage >= 90) return "Outstanding! You're an expert!";
		if (percentage >= 75) return "Excellent work! Advanced level achieved!";
		if (percentage >= 60) return "Good job! Intermediate level achieved!";
		return "Keep learning! You'll get there!";
	};

	const getScoreColor = () => {
		const percentage = testResults.scorePercentage;
		if (percentage >= 90) return "text-yellow-600";
		if (percentage >= 75) return "text-purple-600";
		if (percentage >= 60) return "text-green-600";
		return "text-red-600";
	};

	return (
		<div className="max-w-2xl mx-auto">
			<div className="bg-white rounded-lg shadow-lg overflow-hidden">
				{/* header */}
				<div className={`p-6 ${passed ? "bg-green-50" : "bg-red-50"}`}>
					<div className="text-center">
						<div className="text-6xl mb-4">{passed ? "🎉" : "📚"}</div>
						<h2 className="text-3xl font-bold text-gray-900 mb-2">
							{passed ? "Verification Passed!" : "Keep Learning!"}
						</h2>
						<p className={`text-lg font-medium ${getScoreColor()}`}>{getScoreMessage()}</p>
					</div>
				</div>

				{/* results */}
				<div className="p-6 space-y-6">
					{/* score summary */}
					<div className="grid grid-cols-2 gap-4">
						<div className="bg-gray-50 p-4 rounded-lg text-center">
							<div className="text-3xl font-bold text-gray-900">{testResults.scorePercentage}%</div>
							<div className="text-sm text-gray-600 mt-1">Score</div>
						</div>
						<div className="bg-gray-50 p-4 rounded-lg text-center">
							<div className="text-3xl font-bold text-gray-900">
								{testResults.earnedPoints}/{testResults.totalPoints}
							</div>
							<div className="text-sm text-gray-600 mt-1">Points</div>
						</div>
					</div>

					{/* detailed stats */}
					<div className="border-t border-gray-200 pt-4 space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-gray-600">Questions Answered</span>
							<span className="font-semibold text-gray-900">{testResults.answersCount}</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-gray-600">Correct Answers</span>
							<span className="font-semibold text-green-600">{testResults.correctAnswersCount}</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-gray-600">Incorrect Answers</span>
							<span className="font-semibold text-red-600">
								{testResults.answersCount - testResults.correctAnswersCount}
							</span>
						</div>
					</div>

					{/* achieved level */}
					<div className="border-t border-gray-200 pt-4">
						<h3 className="text-sm font-semibold text-gray-700 mb-3">Achieved Proficiency Level</h3>
						<div className="flex items-center gap-3">
							<div className="text-4xl">{proficiencyIcons[testResults.achievedLevel]}</div>
							<div className="flex-1">
								<div
									className={`inline-block px-4 py-2 rounded-full font-semibold ${
										proficiencyColors[testResults.achievedLevel]
									}`}
								>
									{testResults.achievedLevel}
								</div>
								<p className="text-sm text-gray-600 mt-2">
									{passed
										? "This proficiency level will be added to your profile."
										: "You need to score at least 60% to verify your skill proficiency."}
								</p>
							</div>
						</div>
					</div>

					{/* scoring guide */}
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<h4 className="text-sm font-semibold text-blue-900 mb-2">Scoring Guide</h4>
						<div className="space-y-1 text-sm text-blue-800">
							<div>• 90%+ = Expert Level</div>
							<div>• 75-89% = Advanced Level</div>
							<div>• 60-74% = Intermediate Level</div>
							<div>• Below 60% = Not Verified</div>
						</div>
					</div>

					{error && (
						<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
							<p className="text-sm text-red-600">{error}</p>
						</div>
					)}
				</div>

				{/* actions */}
				<div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
					<div className="flex gap-3">
						{onCancel && (
							<button
								onClick={onCancel}
								disabled={applying}
								className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
							>
								Close
							</button>
						)}
						<button
							onClick={onRetake}
							disabled={applying}
							className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							Retake Quiz
						</button>
					</div>

					{passed && (
						<button
							onClick={handleApply}
							disabled={applying}
							className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
						>
							{applying ? "Applying..." : "Apply to Profile"}
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
