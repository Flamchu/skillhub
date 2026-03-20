"use client";

import { SkillCard } from "./SkillCard";
import { GlassCard } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Plus, BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";

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

interface SkillsGridProps {
	skills: UserSkill[];
	searchQuery: string;
	onAddSkill: () => void;
	onUpdateSkill: (skillId: string) => void;
	onLearnMore: (skillId: string) => void;
}

export function SkillsGrid({ skills, searchQuery, onAddSkill, onUpdateSkill, onLearnMore }: SkillsGridProps) {
	const t = useTranslations("skills.grid");

	if (skills.length === 0) {
		return (
			<GlassCard className="p-12 text-center">
				<BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
				<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
					{searchQuery ? t("empty.searchTitle") : t("empty.defaultTitle")}
				</h3>
				<p className="text-gray-600 dark:text-gray-400 mb-6">
					{searchQuery
						? t("empty.searchDescription")
						: t("empty.defaultDescription")}
				</p>
				<Button
					onClick={onAddSkill}
					className="bg-linear-to-r from-primary to-purple hover:from-primary-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
				>
					<Plus className="w-4 h-4 mr-2" />
					{searchQuery ? t("empty.searchAction") : t("empty.defaultAction")}
				</Button>
			</GlassCard>
		);
	}

	return (
		<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
			{skills.map(userSkill => (
				<SkillCard
					key={userSkill.id}
					skill={{
						id: userSkill.skill.id,
						name: userSkill.skill.name,
						category: userSkill.skill.description || t("uncategorized"),
						proficiency: userSkill.proficiency,
					}}
					onUpdate={onUpdateSkill}
					onLearnMore={onLearnMore}
				/>
			))}
		</div>
	);
}
