"use client";

import { BookOpen, Clock, Zap } from "lucide-react";

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
	const stats: Stat[] = [
		{
			label: "Enrolled Courses",
			value: enrolledCount,
			icon: <BookOpen className="w-5 h-5" />,
			color: "primary",
		},
		{
			label: "Skills Tracked",
			value: skillsCount,
			icon: <Zap className="w-5 h-5" />,
			color: "success",
		},
		{
			label: "Hours Learning",
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
					className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50"
				>
					<div className="flex items-center space-x-3 mb-2">
						<div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[stat.color]}`}>
							{stat.icon}
						</div>
						<div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</div>
					</div>
					<p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{stat.label}</p>
				</div>
			))}
		</div>
	);
}
