"use client";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CourseFilters } from "@/types";
import { getCourseSourceLabel, getDifficultyLabel } from "@/lib/i18n-utils";

interface CoursesFiltersProps {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	selectedDifficulty: CourseFilters["difficulty"] | "all";
	setSelectedDifficulty: (difficulty: CourseFilters["difficulty"] | "all") => void;
	selectedSource: CourseFilters["source"] | "all";
	setSelectedSource: (source: CourseFilters["source"] | "all") => void;
	freeOnly: boolean;
	setFreeOnly: (freeOnly: boolean) => void;
	setCurrentPage: (page: number) => void;
}

export function CoursesFilters({
	searchQuery,
	setSearchQuery,
	selectedDifficulty,
	setSelectedDifficulty,
	selectedSource,
	setSelectedSource,
	freeOnly,
	setFreeOnly,
	setCurrentPage,
}: CoursesFiltersProps) {
	const t = useTranslations("courses.filters");
	const tCommon = useTranslations("common");
	const difficulties = ["all", "BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
	const sources = ["all", "INTERNAL", "YOUTUBE", "UDEMY", "OTHER"] as const;

	return (
		<>
			{/* Search */}
			<div className="bg-surface/60 dark:bg-gray-800/60 backdrop-blur-sm border border-border/20 rounded-2xl p-6 shadow-xl mb-8">
				<Input
					placeholder={t("searchPlaceholder")}
					value={searchQuery}
					onChange={e => setSearchQuery(e.target.value)}
					leftIcon={<Search className="w-4 h-4 text-gray-500" />}
					className="max-w-md bg-surface border-border"
				/>
			</div>

			{/* Filters */}
			<div className="bg-surface/60 dark:bg-gray-800/60 backdrop-blur-sm border border-border/20 rounded-2xl p-8 shadow-xl mb-8">
				<div className="flex flex-wrap gap-6">
					{/* Difficulty Filter */}
					<div className="flex flex-wrap gap-2 items-center">
						<span className="text-sm font-semibold text-primary uppercase tracking-wide">{t("difficulty")}:</span>
						{difficulties.map(difficulty => (
							<Button
								key={difficulty}
								variant={selectedDifficulty === difficulty ? "primary" : "outline"}
								size="sm"
								onClick={() => {
									setSelectedDifficulty(difficulty);
									setCurrentPage(1);
								}}
								className="transition-all duration-200 hover:scale-105"
							>
								{difficulty === "all" ? tCommon("difficulties.allLevels") : getDifficultyLabel(difficulty, tCommon)}
							</Button>
						))}
					</div>

					{/* Source Filter */}
					<div className="flex flex-wrap gap-2 items-center">
						<span className="text-sm font-semibold text-success uppercase tracking-wide">{t("source")}:</span>
						{sources.map(source => (
							<Button
								key={source}
								variant={selectedSource === source ? "primary" : "outline"}
								size="sm"
								onClick={() => {
									setSelectedSource(source);
									setCurrentPage(1);
								}}
								className="transition-all duration-200 hover:scale-105"
							>
								{source === "all" ? t("allSources") : getCourseSourceLabel(source, tCommon)}
							</Button>
						))}
					</div>

					{/* Free Only Toggle */}
					<div className="flex items-center gap-2">
						<span className="text-sm font-semibold text-info uppercase tracking-wide">{t("price")}:</span>
						<Button
							variant={freeOnly ? "primary" : "outline"}
							size="sm"
							onClick={() => {
								setFreeOnly(!freeOnly);
								setCurrentPage(1);
							}}
							className="transition-all duration-200 hover:scale-105"
						>
							{freeOnly ? t("freeOnly") : t("allCourses")}
						</Button>
					</div>
				</div>
			</div>
		</>
	);
}
