"use client";

import { Input } from "@/components/ui/Input";
import { GlassCard } from "@/components/ui";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

interface SkillsSearchProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	placeholder?: string;
}

export function SkillsSearch({
	searchQuery,
	onSearchChange,
	placeholder,
}: SkillsSearchProps) {
	const t = useTranslations("skills.search");

	return (
		<GlassCard className="p-6 mb-8">
			<div className="max-w-md">
				<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("label")}</label>
				<Input
					placeholder={placeholder || t("placeholder")}
					value={searchQuery}
					onChange={e => onSearchChange(e.target.value)}
					leftIcon={<Search className="w-4 h-4" />}
				/>
			</div>
		</GlassCard>
	);
}
