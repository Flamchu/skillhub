"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { http } from "@/lib/http";
import type { SkillVerificationSubmitResponse, ProficiencyLevel } from "@/types";
import { getProficiencyLabel } from "@/lib/i18n-utils";

interface SkillVerificationResultsProps {
	results: SkillVerificationSubmitResponse;
	onApply: () => void;
	onRetake: () => void;
	onCancel?: () => void;
}

const proficiencyColors: Record<ProficiencyLevel, string> = {
	NONE: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
	BASIC: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200",
	INTERMEDIATE: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200",
	ADVANCED: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200",
	EXPERT: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200",
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
	const t = useTranslations("skills.verificationResults");
	const tCommon = useTranslations("common");
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
			setError(error.response?.data?.error || t("errors.apply"));
			setApplying(false);
		}
	};

	const getScoreMessage = () => {
		const percentage = testResults.scorePercentage;
		if (percentage >= 90) return t("messages.expert");
		if (percentage >= 75) return t("messages.advanced");
		if (percentage >= 60) return t("messages.intermediate");
		return t("messages.keepLearning");
	};

	const getScoreColor = () => {
		const percentage = testResults.scorePercentage;
		if (percentage >= 90) return "text-yellow-600 dark:text-yellow-400";
		if (percentage >= 75) return "text-purple-600 dark:text-purple-400";
		if (percentage >= 60) return "text-green-600 dark:text-green-400";
		return "text-red-600 dark:text-red-400";
	};

	return (
		<div className="max-w-2xl mx-auto">
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
				{/* header */}
				<div className={`p-6 ${passed ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
					<div className="text-center">
						<div className="text-6xl mb-4">{passed ? "🎉" : "📚"}</div>
						<h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
							{passed ? t("passedTitle") : t("failedTitle")}
						</h2>
						<p className={`text-lg font-medium ${getScoreColor()}`}>{getScoreMessage()}</p>
					</div>
				</div>

				{/* results */}
				<div className="p-6 space-y-6">
					{/* score summary */}
					<div className="grid grid-cols-2 gap-4">
						<div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center border border-gray-200 dark:border-gray-600">
							<div className="text-3xl font-bold bg-linear-to-br from-primary to-purple text-transparent bg-clip-text">
								{testResults.scorePercentage}%
							</div>
							<div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{t("summary.score")}</div>
						</div>
						<div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center border border-gray-200 dark:border-gray-600">
							<div className="text-3xl font-bold text-gray-900 dark:text-white">
								{testResults.earnedPoints}/{testResults.totalPoints}
							</div>
							<div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{t("summary.points")}</div>
						</div>
					</div>

					{/* detailed stats */}
					<div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-gray-600 dark:text-gray-300">{t("stats.questionsAnswered")}</span>
							<span className="font-semibold text-gray-900 dark:text-white">{testResults.answersCount}</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-gray-600 dark:text-gray-300">{t("stats.correctAnswers")}</span>
							<span className="font-semibold text-green-600 dark:text-green-400">
								{testResults.correctAnswersCount}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-gray-600 dark:text-gray-300">{t("stats.incorrectAnswers")}</span>
							<span className="font-semibold text-red-600 dark:text-red-400">
								{testResults.answersCount - testResults.correctAnswersCount}
							</span>
						</div>
					</div>

					{/* achieved level */}
					<div className="border-t border-gray-200 dark:border-gray-700 pt-4">
						<h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t("achievedLevel.title")}</h3>
						<div className="flex items-center gap-3">
							<div className="text-4xl">{proficiencyIcons[testResults.achievedLevel]}</div>
							<div className="flex-1">
								<div
									className={`inline-block px-4 py-2 rounded-full font-semibold ${
										proficiencyColors[testResults.achievedLevel]
									}`}
								>
									{getProficiencyLabel(testResults.achievedLevel, tCommon)}
								</div>
								<p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
									{passed ? t("achievedLevel.passedDescription") : t("achievedLevel.failedDescription")}
								</p>
							</div>
						</div>
					</div>

					{/* scoring guide */}
					<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
						<h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">{t("guide.title")}</h4>
						<div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
							<div>{t("guide.expert")}</div>
							<div>{t("guide.advanced")}</div>
							<div>{t("guide.intermediate")}</div>
							<div>{t("guide.none")}</div>
						</div>
					</div>

					{error && (
						<div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
							<p className="text-sm text-red-600 dark:text-red-300">{error}</p>
						</div>
					)}
				</div>

				{/* actions */}
				<div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
					<div className="flex gap-3">
						{onCancel && (
							<button
							onClick={onCancel}
							disabled={applying}
							className="px-6 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
						>
							{tCommon("close")}
						</button>
					)}
					<button
						onClick={onRetake}
						disabled={applying}
						className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						{t("actions.retake")}
					</button>
				</div>

					{passed && (
						<button
							onClick={handleApply}
							disabled={applying}
							className="px-8 py-2 bg-linear-to-r from-success to-green-600 text-white rounded-lg hover:from-success-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
						>
							{applying ? t("actions.applying") : t("actions.apply")}
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
