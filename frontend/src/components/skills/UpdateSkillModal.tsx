"use client";

import { useState, useEffect } from "react";
import { X, Award, BookOpen, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";

interface UpdateSkillModalProps {
	isOpen: boolean;
	onClose: () => void;
	skill: {
		id: string;
		skillId: string;
		proficiency: "NONE" | "BASIC" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
		skill: {
			id: string;
			name: string;
			description?: string;
		};
	} | null;
	onUpdateSkill: (skillId: string, proficiency: "BASIC" | "INTERMEDIATE" | "ADVANCED" | "EXPERT") => Promise<void>;
	onRemoveSkill?: (skillId: string) => Promise<void>;
}

type ProficiencyLevel = "BASIC" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

export function UpdateSkillModal({ isOpen, onClose, skill, onUpdateSkill, onRemoveSkill }: UpdateSkillModalProps) {
	const [selectedProficiency, setSelectedProficiency] = useState<ProficiencyLevel>("BASIC");
	const [updating, setUpdating] = useState(false);
	const [removing, setRemoving] = useState(false);
	const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

	// initialize selected proficiency when skill changes
	useEffect(() => {
		if (skill && skill.proficiency !== "NONE") {
			setSelectedProficiency(skill.proficiency as ProficiencyLevel);
		}
	}, [skill]);

	if (!isOpen || !skill) return null;

	const proficiencyOptions: Array<{
		value: ProficiencyLevel;
		label: string;
		description: string;
		percentage: number;
		icon: React.ReactNode;
		color: string;
	}> = [
		{
			value: "BASIC",
			label: "Basic",
			description: "Just getting started with this skill",
			percentage: 25,
			icon: <BookOpen className="h-4 w-4" />,
			color: "text-blue-600",
		},
		{
			value: "INTERMEDIATE",
			label: "Intermediate",
			description: "Have some experience and understanding",
			percentage: 50,
			icon: <TrendingUp className="h-4 w-4" />,
			color: "text-yellow-600",
		},
		{
			value: "ADVANCED",
			label: "Advanced",
			description: "Confident and skilled in most areas",
			percentage: 75,
			icon: <TrendingUp className="h-4 w-4" />,
			color: "text-primary",
		},
		{
			value: "EXPERT",
			label: "Expert",
			description: "Mastery level with deep expertise",
			percentage: 90,
			icon: <Award className="h-4 w-4" />,
			color: "text-green-600",
		},
	];

	const handleUpdate = async () => {
		setUpdating(true);
		try {
			await onUpdateSkill(skill.skillId, selectedProficiency);
			onClose();
		} catch (error) {
			console.error("Failed to update skill:", error);
		} finally {
			setUpdating(false);
		}
	};

	const handleRemove = async () => {
		if (!onRemoveSkill) return;

		setRemoving(true);
		try {
			await onRemoveSkill(skill.skillId);
			setShowRemoveConfirm(false);
			onClose();
		} catch (error) {
			console.error("Failed to remove skill:", error);
		} finally {
			setRemoving(false);
		}
	};

	// check if upgrading proficiency (may require verification)
	const isUpgrading = () => {
		const levels = ["BASIC", "INTERMEDIATE", "ADVANCED", "EXPERT"];
		const currentIndex = levels.indexOf(skill.proficiency);
		const selectedIndex = levels.indexOf(selectedProficiency);
		return selectedIndex > currentIndex;
	};

	// get current proficiency display info
	const currentProficiency = proficiencyOptions.find(option => option.value === skill.proficiency);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
			<GlassCard className="w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="flex items-center justify-between mb-6">
					<div>
						<h2 className="text-xl font-bold text-gray-900 dark:text-white">Update Skill Level</h2>
						<p className="text-sm text-gray-600 dark:text-gray-400">Update your proficiency in {skill.skill.name}</p>
					</div>
					<button
						onClick={onClose}
						className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Current Level */}
				<div className="mb-6">
					<h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Level</h3>
					<div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
						<div className={`${currentProficiency?.color || "text-gray-500"} shrink-0`}>{currentProficiency?.icon}</div>
						<div>
							<div className="font-medium text-gray-900 dark:text-white">
								{currentProficiency?.label || skill.proficiency}
							</div>
							<div className="text-sm text-gray-600 dark:text-gray-400">
								{currentProficiency?.description || "No description"}
							</div>
						</div>
					</div>
				</div>

				{/* New Level Selection */}
				<div className="mb-6">
					<h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select New Level</h3>
					<div className="space-y-3">
						{proficiencyOptions.map(option => (
							<button
								key={option.value}
								onClick={() => setSelectedProficiency(option.value)}
								className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
									selectedProficiency === option.value
										? "border-primary bg-primary/5 dark:bg-primary/10"
										: "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
								}`}
							>
								<div className="flex items-center space-x-3">
									<div className={`${option.color} shrink-0`}>{option.icon}</div>
									<div className="flex-1">
										<div className="flex items-center justify-between">
											<span className="font-medium text-gray-900 dark:text-white">{option.label}</span>
											<span className="text-sm text-gray-500 dark:text-gray-400">{option.percentage}%</span>
										</div>
										<div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{option.description}</div>
										{/* Progress Bar */}
										<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
											<div
												className="bg-gradient-to-r from-primary to-purple h-1.5 rounded-full transition-all duration-500"
												style={{ width: `${option.percentage}%` }}
											/>
										</div>
									</div>
								</div>
							</button>
						))}
					</div>
				</div>

				{/* Actions */}
				<div className="space-y-3">
					{/* Remove Skill Section */}
					{onRemoveSkill && (
						<div className="pt-4 border-t border-gray-200 dark:border-gray-700">
							{!showRemoveConfirm ? (
								<Button
									variant="outline"
									onClick={() => setShowRemoveConfirm(true)}
									className="w-full text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
									disabled={updating || removing}
								>
									Remove Skill from Profile
								</Button>
							) : (
								<div className="space-y-3">
									<p className="text-sm text-gray-600 dark:text-gray-400 text-center">
										Are you sure you want to remove <strong>{skill.skill.name}</strong> from your profile?
									</p>
									<div className="flex items-center space-x-3">
										<Button
											variant="outline"
											onClick={() => setShowRemoveConfirm(false)}
											className="flex-1"
											disabled={removing}
										>
											Cancel
										</Button>
										<Button
											onClick={handleRemove}
											disabled={removing}
											className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0"
										>
											{removing ? "Removing..." : "Yes, Remove"}
										</Button>
									</div>
								</div>
							)}
						</div>
					)}

					{/* Update/Cancel Buttons */}
					{!showRemoveConfirm && (
						<div className="flex items-center space-x-3">
							<Button variant="outline" onClick={onClose} className="flex-1" disabled={updating || removing}>
								Cancel
							</Button>
							<Button
								onClick={handleUpdate}
								disabled={updating || removing || selectedProficiency === skill.proficiency}
								className="flex-1 bg-gradient-to-r from-primary to-purple hover:from-primary-600 hover:to-purple-600 text-white border-0"
							>
								{updating ? "Updating..." : isUpgrading() ? "Update & Verify" : "Update Level"}
							</Button>
						</div>
					)}
				</div>
			</GlassCard>
		</div>
	);
}
