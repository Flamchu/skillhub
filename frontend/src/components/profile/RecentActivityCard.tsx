"use client";

import { Clock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { formatRelativeTime } from "@/lib/i18n-utils";

interface RecentActivityCardProps {
	activity: {
		type: string;
		description: string;
		timestamp: string;
	};
}

export function RecentActivityCard({ activity }: RecentActivityCardProps) {
	const locale = useLocale();
	const tCommon = useTranslations("common");

	// icon based on activity type
	const getActivityIcon = (type: string) => {
		switch (type) {
			case "skill_added":
				return "🎯";
			case "course_enrolled":
				return "📚";
			case "lesson_completed":
				return "✅";
			case "certificate_earned":
				return "🏆";
			default:
				return "📝";
		}
	};

	return (
		<div className="group flex items-start gap-4 p-5 rounded-xl bg-gray-50/80 dark:bg-gray-700/30 border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-primary/30 hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
			<div className="shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-linear-to-br from-primary/10 to-purple/10 group-hover:from-primary/20 group-hover:to-purple/20 transition-all duration-300">
				<span className="text-2xl">{getActivityIcon(activity.type)}</span>
			</div>
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed">{activity.description}</p>
				<div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
					<Clock className="w-3.5 h-3.5" />
					<span>{formatRelativeTime(activity.timestamp, locale, tCommon)}</span>
				</div>
			</div>
		</div>
	);
}
