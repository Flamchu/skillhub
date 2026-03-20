"use client";

import { Button } from "@/components/ui/Button";
import { Plus, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

interface SkillsHeaderProps {
	onAddSkill: () => void;
	onAISkills?: () => void;
}

export function SkillsHeader({ onAddSkill, onAISkills }: SkillsHeaderProps) {
	const t = useTranslations("skills.header");

	return (
		<div className="flex justify-between items-center mb-8">
			<div>
				<h1 className="text-4xl font-bold bg-linear-to-br from-primary via-purple to-pink text-transparent bg-clip-text mb-4">
					{t("title")}
				</h1>
				<p className="text-lg text-gray-600 dark:text-gray-300">
					{t("description")}
				</p>
			</div>
			<div className="flex gap-3">
				{onAISkills && (
					<Button
						onClick={onAISkills}
						variant="outline"
						className="border-primary text-primary hover:bg-primary hover:text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
					>
						<Sparkles className="w-4 h-4 mr-2" />
						{t("aiSkills")}
					</Button>
				)}
				<Button
					onClick={onAddSkill}
					className="bg-linear-to-r from-primary to-purple hover:from-primary-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
				>
					<Plus className="w-4 h-4 mr-2" />
					{t("addSkill")}
				</Button>
			</div>
		</div>
	);
}
