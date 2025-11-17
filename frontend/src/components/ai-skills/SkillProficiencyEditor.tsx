"use client";

import { useState } from "react";
import { CheckCircle, Edit3, Save, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { AISkillSuggestion } from "@/types";

interface SkillProficiencyEditorProps {
	suggestions: AISkillSuggestion[];
	onSave: (updatedSkills: AISkillSuggestion[]) => void;
	onCancel: () => void;
	className?: string;
}

const PROFICIENCY_LEVELS = [
	{ value: "BASIC", label: "Basic", color: "from-gray-500 to-gray-600" },
	{ value: "INTERMEDIATE", label: "Intermediate", color: "from-blue-500 to-blue-600" },
	{ value: "ADVANCED", label: "Advanced", color: "from-purple-500 to-purple-600" },
	{ value: "EXPERT", label: "Expert", color: "from-pink-500 to-pink-600" },
];

export function SkillProficiencyEditor({ suggestions, onSave, onCancel, className = "" }: SkillProficiencyEditorProps) {
	const [editedSkills, setEditedSkills] = useState<AISkillSuggestion[]>(suggestions);
	// start with all skills deselected - user must opt-in
	const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());

	const handleProficiencyChange = (skillId: string, newProficiency: string) => {
		setEditedSkills(prev =>
			prev.map(skill =>
				skill.skill.id === skillId
					? { ...skill, suggestedProficiency: newProficiency as AISkillSuggestion["suggestedProficiency"] }
					: skill
			)
		);
	};

	const toggleSkillSelection = (skillId: string) => {
		setSelectedSkills(prev => {
			const newSet = new Set(prev);
			if (newSet.has(skillId)) {
				newSet.delete(skillId);
			} else {
				newSet.add(skillId);
			}
			return newSet;
		});
	};

	const handleSave = () => {
		const selectedSkillsList = editedSkills.filter(skill => selectedSkills.has(skill.skill.id));
		onSave(selectedSkillsList);
	};

	return (
		<div className={`space-y-6 ${className}`}>
			{/* header */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
						<Edit3 className="w-5 h-5 text-primary" />
						Review & Select Your Skills
					</h3>
					<p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
						Check the skills you want to add, then adjust proficiency levels
					</p>
				</div>
				<div className="text-sm font-medium text-gray-600 dark:text-gray-300">
					{selectedSkills.size} of {editedSkills.length} selected
				</div>
			</div>

			{/* skills list */}
			<div className="space-y-3 max-h-96 overflow-y-auto pr-2">
				{editedSkills.map(suggestion => {
					const isSelected = selectedSkills.has(suggestion.skill.id);

					return (
						<div
							key={suggestion.skill.id}
							className={`relative p-4 rounded-xl border transition-all ${
								isSelected
									? "border-primary bg-primary/5 dark:bg-primary/10"
									: "border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
							}`}
						>
							<div className="flex items-start gap-4">
								{/* checkbox */}
								<button
									onClick={() => toggleSkillSelection(suggestion.skill.id)}
									className={`w-6 h-6 rounded-lg border-2 shrink-0 mt-1 flex items-center justify-center transition-all ${
										isSelected
											? "bg-primary border-primary"
											: "border-gray-300 dark:border-gray-600 hover:border-primary"
									}`}
								>
									{isSelected && <CheckCircle className="w-4 h-4 text-white" />}
								</button>

								<div className="flex-1 min-w-0">
									{/* skill name */}
									<h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{suggestion.skill.name}</h4>

									{/* proficiency selector */}
									<div className="space-y-2 mt-3">
										<label className="text-xs font-medium text-gray-600 dark:text-gray-300 block">
											Proficiency Level
										</label>
										<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
											{PROFICIENCY_LEVELS.map(level => (
												<button
													key={level.value}
													onClick={() => handleProficiencyChange(suggestion.skill.id, level.value)}
													disabled={!isSelected}
													className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
														suggestion.suggestedProficiency === level.value
															? `bg-gradient-to-r ${level.color} text-white shadow-md`
															: isSelected
																? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
																: "bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
													}`}
												>
													{level.label}
												</button>
											))}
										</div>
									</div>

									{/* reasoning */}
									{suggestion.reason && (
										<p className="text-xs text-gray-600 dark:text-gray-400 mt-3 italic">
											AI suggestion: {suggestion.reason}
										</p>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* actions */}
			<div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
				<Button variant="outline" onClick={onCancel} size="lg">
					<X className="w-4 h-4 mr-2" />
					Cancel
				</Button>
				<Button
					variant="primary"
					onClick={handleSave}
					disabled={selectedSkills.size === 0}
					size="lg"
					className="bg-gradient-to-r from-primary to-purple"
				>
					<Save className="w-4 h-4 mr-2" />
					Add {selectedSkills.size} Skill{selectedSkills.size !== 1 ? "s" : ""} to Profile
				</Button>
			</div>
		</div>
	);
}
