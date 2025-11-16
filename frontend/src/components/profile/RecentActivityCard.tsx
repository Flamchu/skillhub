"use client";

import { Clock } from "lucide-react";

interface RecentActivityCardProps {
	activity: {
		type: string;
		description: string;
		timestamp: string;
	};
}

export function RecentActivityCard({ activity }: RecentActivityCardProps) {
	// format timestamp to relative time
	const getRelativeTime = (timestamp: string) => {
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		return date.toLocaleDateString();
	};

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
		<div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
			<span className="text-2xl shrink-0">{getActivityIcon(activity.type)}</span>
			<div className="flex-1 min-w-0">
				<p className="text-sm text-foreground">{activity.description}</p>
				<div className="flex items-center gap-1.5 mt-1 text-xs text-foreground-subtle">
					<Clock className="w-3 h-3" />
					<span>{getRelativeTime(activity.timestamp)}</span>
				</div>
			</div>
		</div>
	);
}
