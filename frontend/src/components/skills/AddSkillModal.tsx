"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui";
import { X, AlertCircle } from "lucide-react";
import SkillVerificationQuiz from "./SkillVerificationQuiz";
import SkillVerificationResults from "./SkillVerificationResults";
import type { SkillVerificationSubmitResponse, ProficiencyLevel } from "@/types";

interface Skill {
	id: string;
	name: string;
	slug: string;
	description?: string;
}

interface AddSkillModalProps {
	isOpen: boolean;
	onClose: () => void;
	availableSkills: Skill[];
	onAddSkill: (skillId: string, proficiency: Exclude<ProficiencyLevel, "NONE">) => Promise<void>;
}

type ModalView = "form" | "verification" | "results";

export function AddSkillModal({ isOpen, onClose, availableSkills, onAddSkill }: AddSkillModalProps) {
	const [selectedSkill, setSelectedSkill] = useState<string>("");
	const [selectedProficiency, setSelectedProficiency] = useState<ProficiencyLevel>("BASIC");
	const [submitting, setSubmitting] = useState(false);
	const [view, setView] = useState<ModalView>("form");
	const [verificationResults, setVerificationResults] = useState<SkillVerificationSubmitResponse | null>(null);
	const [error, setError] = useState<string | null>(null);

	const requiresVerification = selectedProficiency !== "NONE" && selectedProficiency !== "BASIC";

	const handleSubmit = async () => {
		if (!selectedSkill) return;
		if (selectedProficiency === "NONE") return; // guard against invalid state

		setSubmitting(true);
		setError(null);

		try {
			// proficiency requires verification, start flow
			if (requiresVerification) {
				setView("verification");
				setSubmitting(false); // quiz handles own loading
			} else {
				// add skill directly for basic proficiency (type-safe: NONE is already excluded)
				await onAddSkill(selectedSkill, selectedProficiency as Exclude<ProficiencyLevel, "NONE">);
				handleClose();
			}
		} catch (err) {
			console.error("Failed to add skill:", err);
			const error = err as { response?: { data?: { error?: string; message?: string } } };
			setError(error.response?.data?.error || error.response?.data?.message || "Failed to add skill");
			setSubmitting(false);
		}
	};

	const handleVerificationComplete = (results: SkillVerificationSubmitResponse) => {
		setVerificationResults(results);
		setView("results");
	};

	const handleApplyVerification = async () => {
		// skill added by backend when applying verification
		handleClose();
	};

	const handleRetakeVerification = () => {
		setView("verification");
		setVerificationResults(null);
	};

	const handleClose = () => {
		setSelectedSkill("");
		setSelectedProficiency("BASIC");
		setView("form");
		setVerificationResults(null);
		setError(null);
		setSubmitting(false);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
			<div className="w-full max-w-4xl my-8">
				{view === "form" && (
					<GlassCard className="w-full max-w-md mx-auto">
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Skill</h3>
							<button
								onClick={handleClose}
								className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
								disabled={submitting}
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Skill</label>
								<select
									value={selectedSkill}
									onChange={e => setSelectedSkill(e.target.value)}
									disabled={submitting}
									className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
								>
									<option value="">Choose a skill...</option>
									{availableSkills.map(skill => (
										<option key={skill.id} value={skill.id}>
											{skill.name}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Current Proficiency
								</label>
								<select
									value={selectedProficiency}
									onChange={e => setSelectedProficiency(e.target.value as ProficiencyLevel)}
									disabled={submitting}
									className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
								>
									<option value="BASIC">Basic (25%)</option>
									<option value="INTERMEDIATE">Intermediate (50%)</option>
									<option value="ADVANCED">Advanced (75%)</option>
									<option value="EXPERT">Expert (90%)</option>
								</select>

								{requiresVerification && (
									<div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-2">
										<AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
										<div className="text-sm text-blue-800 dark:text-blue-200">
											<p className="font-medium mb-1">Verification Required</p>
											<p>You&apos;ll need to complete a verification quiz to prove your proficiency at this level.</p>
										</div>
									</div>
								)}
							</div>

							{error && (
								<div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
									<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
								</div>
							)}
						</div>

						<div className="flex gap-3 mt-6">
							<Button variant="outline" onClick={handleClose} className="flex-1" disabled={submitting}>
								Cancel
							</Button>
							<Button
								onClick={handleSubmit}
								disabled={!selectedSkill || submitting}
								className="flex-1 bg-linear-to-r from-primary to-purple hover:from-primary-600 hover:to-purple-600"
							>
								{submitting ? "Processing..." : requiresVerification ? "Start Verification" : "Add Skill"}
							</Button>
						</div>
					</GlassCard>
				)}

				{view === "verification" && selectedSkill && (
					<SkillVerificationQuiz
						skillId={selectedSkill}
						onComplete={handleVerificationComplete}
						onCancel={handleClose}
					/>
				)}

				{view === "results" && verificationResults && (
					<SkillVerificationResults
						results={verificationResults}
						onApply={handleApplyVerification}
						onRetake={handleRetakeVerification}
						onCancel={handleClose}
					/>
				)}
			</div>
		</div>
	);
}
