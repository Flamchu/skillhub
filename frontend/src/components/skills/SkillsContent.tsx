"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthProvider";
import { LoadingState, ErrorState } from "@/components/ui";
import { SkillsHeader, SkillsSearch, SkillsGrid, AddSkillModal, UpdateSkillModal } from "./";

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
	const [selectedSkill, setSelectedSkill] = useState<UserSkill | null>(null);

	// load available skills from api
	const loadAvailableSkills = useCallback(async () => {
		try {
			const { api } = await import("@/lib/http");
			const response = await api.listSkills();
			setAvailableSkills((response as { skills: Skill[] }).skills || []);
		} catch (err) {
			console.error("failed to load available skills:", err);
		}
	}, []);

	// load user skills from api
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
	const handleAddSkill = async (skillId: string, proficiency: "BASIC" | "INTERMEDIATE" | "ADVANCED" | "EXPERT") => {
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

		const { api } = await import("@/lib/http");
		const progress =
			proficiency === "BASIC" ? 25 : proficiency === "INTERMEDIATE" ? 50 : proficiency === "ADVANCED" ? 75 : 90;

		await api.updateUserSkill(user.id, skillId, { proficiency, progress });

		// refresh skills list
		await loadUserSkills();
		setShowUpdateModal(false);
		setSelectedSkill(null);
	};

	const handleLearnMore = (skillId: string) => {
		// navigate to courses page with skill filter
		router.push(`/courses?skill=${skillId}`);
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
		return <LoadingState message="Loading your skills..." />;
	}

	if (error) {
		return <ErrorState title="Failed to load skills" message={error} onRetry={loadUserSkills} />;
	}

	return (
		<main className="py-8 pt-24">
			<div className="max-w-7xl mx-auto px-6">
				<SkillsHeader onAddSkill={() => setShowAddModal(true)} />

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
			/>
		</main>
	);
}
