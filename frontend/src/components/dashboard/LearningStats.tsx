"use client";

import { BookOpen, Clock, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

interface Stat {
	label: string;
	value: string | number;
	icon: React.ReactNode;
	color: "primary" | "success" | "info";
}

interface LearningStatsProps {
	enrolledCount?: number;
	skillsCount?: number;
	completedCount?: number;
}

export function LearningStats({ enrolledCount = 0, skillsCount = 0, completedCount = 0 }: LearningStatsProps) {
	const t = useTranslations("dashboard.learningStats");

	const stats: Stat[] = [
		{
			label: t("skillsTracked"),
			value: skillsCount,
			icon: <Zap className="w-5 h-5" />,
			color: "success",
		},
		{
			label: t("enrolledCourses"),
			value: enrolledCount,
			icon: <BookOpen className="w-5 h-5" />,
			color: "primary",
		},
		{
			label: t("hoursLearning"),
			value: completedCount * 2, // rough estimate
			icon: <Clock className="w-5 h-5" />,
			color: "info",
		},
	];

	const colorClasses = {
		primary: "text-primary bg-primary/10 dark:bg-primary/20",
		success: "text-success bg-success/10 dark:bg-success/20",
		info: "text-info bg-info/10 dark:bg-info/20",
	};

	return (
		<div className="grid grid-cols-3 gap-4">
			{stats.map(stat => (
				<div
					key={stat.label}
					className="group bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-primary/30 dark:hover:border-primary/40 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
				>
					<div className="flex items-center space-x-4 mb-3">
						<div
							className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[stat.color]} group-hover:scale-110 transition-transform duration-300 shadow-lg`}
						>
							{stat.icon}
						</div>
						<div className="text-4xl font-bold bg-linear-to-br from-primary via-purple to-pink text-transparent bg-clip-text">
							{stat.value}
						</div>
					</div>
					<p className="text-sm text-gray-600 dark:text-gray-300 font-bold">{stat.label}</p>
				</div>
			))}
		</div>
	);
}
