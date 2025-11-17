"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthProvider";
import { ErrorState, CardSkeleton } from "@/components/ui";
import { SuccessAnimation } from "@/components/ui/SuccessAnimation";
import { SkillsHeader, SkillsSearch, SkillsGrid, AddSkillModal, UpdateSkillModal, AISkillGenerator } from "./";
import type { AISkillSuggestion, ProficiencyLevel } from "@/types";

interface UserSkill {
	id: string;
	skillId: string;
	proficiency: "NONE" | "BASIC" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
	progress: number;
	skill: {
		id: string;
		name: string;
		slug: string;
		description?: string;
	};
}

interface Skill {
	id: string;
	name: string;
	slug: string;
	description?: string;
}

export function SkillsContent() {
	const { user } = useAuth();
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
	const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showAddModal, setShowAddModal] = useState(false);
	const [showUpdateModal, setShowUpdateModal] = useState(false);
	const [showAIModal, setShowAIModal] = useState(false);
	const [selectedSkill, setSelectedSkill] = useState<UserSkill | null>(null);
	const [showSuccess, setShowSuccess] = useState(false);
	const [successMessage, setSuccessMessage] = useState("");

	// load available skills
	const loadAvailableSkills = useCallback(async () => {
		try {
			const { api } = await import("@/lib/http");
			const response = await api.listSkills();
			setAvailableSkills((response as { skills: Skill[] }).skills || []);
		} catch (err) {
			console.error("failed to load available skills:", err);
		}
	}, []);

	// load user skills
	const loadUserSkills = useCallback(async () => {
		if (!user?.id) return;

		setLoading(true);
		setError(null);

		try {
			const { http } = await import("@/lib/http");
			const response = await http.get(`/users/${user.id}/skills`);
			setUserSkills(response.data.skills || []);
		} catch (err) {
			setError(err instanceof Error ? err.message : "failed to load skills");
		} finally {
			setLoading(false);
		}
	}, [user?.id]);

	// add new skill to user profile
	const handleAddSkill = async (skillId: string, proficiency: Exclude<ProficiencyLevel, "NONE">) => {
		if (!user?.id) return;

		const { http } = await import("@/lib/http");
		await http.post(`/users/${user.id}/skills`, {
			skillId,
			proficiency,
			progress:
				proficiency === "BASIC" ? 25 : proficiency === "INTERMEDIATE" ? 50 : proficiency === "ADVANCED" ? 75 : 90,
		});

		// refresh skills list
		await loadUserSkills();
	};

	const handleUpdateSkill = (skillId: string) => {
		const skill = userSkills.find(s => s.skillId === skillId);
		if (skill) {
			setSelectedSkill(skill);
			setShowUpdateModal(true);
		}
	};

	// update user skill proficiency
	const handleUpdateSkillLevel = async (
		skillId: string,
		proficiency: "BASIC" | "INTERMEDIATE" | "ADVANCED" | "EXPERT"
	) => {
		if (!user?.id) return;

		try {
			const { api } = await import("@/lib/http");
			const progress =
				proficiency === "BASIC" ? 25 : proficiency === "INTERMEDIATE" ? 50 : proficiency === "ADVANCED" ? 75 : 90;

			await api.updateUserSkill(user.id, skillId, { proficiency, progress });

			// refresh skills list
			await loadUserSkills();
			setShowUpdateModal(false);
			setSelectedSkill(null);
			setSuccessMessage("Skill level updated successfully!");
			setShowSuccess(true);
		} catch (error: unknown) {
			// check if verification is required
			if (error && typeof error === "object" && "status" in error && error.status === 428) {
				// verification required - redirect to verification page
				const errorData = error as { data?: { skillId?: string; requiresVerification?: boolean } };
				if (errorData.data?.requiresVerification && errorData.data?.skillId) {
					setShowUpdateModal(false);
					setSelectedSkill(null);
					router.push(`/skills/${errorData.data.skillId}/verify`);
					return;
				}
			}

			console.error("Failed to update skill:", error);
			const errorMessage =
				(error && typeof error === "object" && "message" in error ? String(error.message) : null) ||
				"Failed to update skill. Please try again.";
			setSuccessMessage(errorMessage);
			setShowSuccess(true);
		}
	};

	// remove skill from user profile
	const handleRemoveSkill = async (skillId: string) => {
		if (!user?.id) return;

		try {
			const { http } = await import("@/lib/http");
			await http.delete(`/users/${user.id}/skills/${skillId}`);

			// refresh skills list
			await loadUserSkills();
			setShowUpdateModal(false);
			setSelectedSkill(null);
			setSuccessMessage("Skill removed from your profile");
			setShowSuccess(true);
		} catch (error) {
			console.error("Failed to remove skill:", error);
			setSuccessMessage("Failed to remove skill. Please try again.");
			setShowSuccess(true);
		}
	};

	const handleLearnMore = (skillId: string) => {
		// navigate to courses page with skill filter
		router.push(`/courses?skill=${skillId}`);
	};

	// handle ai generated skills
	const handleAISkillsGenerated = async (skills: AISkillSuggestion[]) => {
		if (!user?.id) return;

		try {
			// add each selected skill to user profile
			for (const skillSuggestion of skills) {
				try {
					await handleAddSkill(
						skillSuggestion.skill.id,
						skillSuggestion.suggestedProficiency === "NONE"
							? "BASIC"
							: (skillSuggestion.suggestedProficiency as "BASIC" | "INTERMEDIATE" | "ADVANCED" | "EXPERT")
					);
				} catch (error) {
					console.warn(`Failed to add skill ${skillSuggestion.skill.name}:`, error);
				}
			}

			// close AI modal and show success message
			setShowAIModal(false);
			setSuccessMessage(`Successfully added ${skills.length} skills to your profile!`);
			setShowSuccess(true);
		} catch (error) {
			console.error("Failed to add AI generated skills:", error);
			setSuccessMessage("Failed to add some skills. Please try again.");
			setShowSuccess(true);
		}
	};

	useEffect(() => {
		loadUserSkills();
		loadAvailableSkills();
	}, [loadUserSkills, loadAvailableSkills]);

	// filter skills based on search query
	const filteredSkills = userSkills.filter(
		userSkill =>
			userSkill.skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			userSkill.skill.description?.toLowerCase().includes(searchQuery.toLowerCase())
	);

	// get available skills that user doesn't already have
	const availableSkillsFiltered = availableSkills.filter(
		skill => !userSkills.some(userSkill => userSkill.skillId === skill.id)
	);

	if (loading) {
		return (
			<main className="py-8 pt-24">
				<div className="max-w-7xl mx-auto px-6">
					{/* Header Skeleton */}
					<div className="mb-8 space-y-4">
						<div className="h-12 w-1/3 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
						<div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
					</div>

					{/* Search Skeleton */}
					<div className="mb-8 h-14 bg-white/50 dark:bg-gray-800/50 rounded-xl border-2 border-gray-200/50 dark:border-gray-700/50 animate-pulse" />

					{/* Grid Skeleton */}
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{Array.from({ length: 6 }).map((_, i) => (
							<CardSkeleton key={i} />
						))}
					</div>
				</div>
			</main>
		);
	}

	if (error) {
		return <ErrorState title="Failed to load skills" message={error} onRetry={loadUserSkills} />;
	}

	return (
		<main className="py-8 pt-24">
			<div className="max-w-7xl mx-auto px-6">
				<SkillsHeader onAddSkill={() => setShowAddModal(true)} onAISkills={() => setShowAIModal(true)} />

				<SkillsSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />

				<SkillsGrid
					skills={filteredSkills}
					searchQuery={searchQuery}
					onAddSkill={() => setShowAddModal(true)}
					onUpdateSkill={handleUpdateSkill}
					onLearnMore={handleLearnMore}
				/>
			</div>

			<AddSkillModal
				isOpen={showAddModal}
				onClose={() => setShowAddModal(false)}
				availableSkills={availableSkillsFiltered}
				onAddSkill={handleAddSkill}
			/>

			<UpdateSkillModal
				isOpen={showUpdateModal}
				onClose={() => {
					setShowUpdateModal(false);
					setSelectedSkill(null);
				}}
				skill={selectedSkill}
				onUpdateSkill={handleUpdateSkillLevel}
				onRemoveSkill={handleRemoveSkill}
			/>

			{/* AI Skills Modal */}
			{showAIModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6">
							<div className="flex justify-between items-center mb-6">
								<h3 className="text-2xl font-bold text-gray-900 dark:text-white">AI Skill Generator</h3>
								<button
									onClick={() => setShowAIModal(false)}
									className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
								>
									×
								</button>
							</div>
							<AISkillGenerator onSkillsGenerated={handleAISkillsGenerated} />
						</div>
					</div>
				</div>
			)}

			<SuccessAnimation message={successMessage} isVisible={showSuccess} onComplete={() => setShowSuccess(false)} />
		</main>
	);
}
