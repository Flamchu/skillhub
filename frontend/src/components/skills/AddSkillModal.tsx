"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui";
import { X } from "lucide-react";

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
	onAddSkill: (skillId: string, proficiency: "BASIC" | "INTERMEDIATE" | "ADVANCED" | "EXPERT") => Promise<void>;
}

export function AddSkillModal({ isOpen, onClose, availableSkills, onAddSkill }: AddSkillModalProps) {
	const [selectedSkill, setSelectedSkill] = useState<string>("");
	const [selectedProficiency, setSelectedProficiency] = useState<"BASIC" | "INTERMEDIATE" | "ADVANCED" | "EXPERT">(
		"BASIC"
	);
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async () => {
		if (!selectedSkill) return;

		setSubmitting(true);
		try {
			await onAddSkill(selectedSkill, selectedProficiency);
			setSelectedSkill("");
			setSelectedProficiency("BASIC");
			onClose();
		} catch (error) {
			console.error("Failed to add skill:", error);
		} finally {
			setSubmitting(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
			<GlassCard className="w-full max-w-md">
				<div className="flex items-center justify-between mb-6">
					<h3 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Skill</h3>
					<button
						onClick={onClose}
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
							onChange={e => setSelectedProficiency(e.target.value as "BASIC" | "INTERMEDIATE" | "ADVANCED" | "EXPERT")}
							disabled={submitting}
							className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
						>
							<option value="BASIC">Basic (25%)</option>
							<option value="INTERMEDIATE">Intermediate (50%)</option>
							<option value="ADVANCED">Advanced (75%)</option>
							<option value="EXPERT">Expert (90%)</option>
						</select>
					</div>
				</div>

				<div className="flex gap-3 mt-6">
					<Button variant="outline" onClick={onClose} className="flex-1" disabled={submitting}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={!selectedSkill || submitting}
						className="flex-1 bg-gradient-to-r from-primary to-purple hover:from-primary-600 hover:to-purple-600"
					>
						{submitting ? "Adding..." : "Add Skill"}
					</Button>
				</div>
			</GlassCard>
		</div>
	);
}
