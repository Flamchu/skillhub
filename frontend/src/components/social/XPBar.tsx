"use client";

import { useMemo } from "react";
import { Zap, Flame } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { getProgressToNextLevel } from "@/lib/socialUtils";

export default function XPBar() {
	const { user } = useAuth();

	// calculate xp progress client-side from user data
	const xpData = useMemo(() => {
		if (!user?.socialEnabled) return null;

		const progress = getProgressToNextLevel(user.xp || 0);

		return {
			level: progress.currentLevel,
			xpInCurrentLevel: progress.xpInCurrentLevel,
			xpNeededForNextLevel: progress.xpNeededForNextLevel,
			progressPercentage: progress.progressPercentage,
			currentStreak: user.currentStreak || 0,
		};
	}, [user?.socialEnabled, user?.xp, user?.currentStreak]);

	// don't show if user doesn't have social enabled or no data
	if (!xpData) {
		return null;
	}

	const { level, xpInCurrentLevel, xpNeededForNextLevel, progressPercentage, currentStreak } = xpData;

	return (
		<div className="flex items-center gap-2 px-3 py-2 bg-linear-to-br from-primary/5 via-purple/5 to-pink/5 dark:from-primary/10 dark:via-purple/10 dark:to-pink/10 border border-primary/20 dark:border-primary/30 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
			{/* level badge */}
			<div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-linear-to-br from-primary to-purple rounded-lg shadow-sm">
				<Zap className="w-3.5 h-3.5 text-white" />
				<span className="text-xs font-bold text-white">Lv {level}</span>
			</div>

			{/* xp progress bar */}
			<div className="flex flex-col gap-1 min-w-[120px]">
				<div className="flex items-center justify-between text-xs">
					<span className="font-medium text-gray-600 dark:text-gray-400">
						{xpInCurrentLevel}/{xpNeededForNextLevel} XP
					</span>
					<span className="text-primary dark:text-primary-400 font-bold">{progressPercentage}%</span>
				</div>
				<div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
					<div
						className="h-full bg-linear-to-r from-primary via-purple to-pink transition-all duration-500 ease-out shadow-sm"
						style={{ width: `${progressPercentage}%` }}
					/>
				</div>
			</div>

			{/* streak badge */}
			{currentStreak > 0 && (
				<div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-linear-to-br from-orange-400 to-orange-500 rounded-lg shadow-sm">
					<Flame className="w-3.5 h-3.5 text-white" />
					<span className="text-xs font-bold text-white">{currentStreak}</span>
				</div>
			)}
		</div>
	);
}
