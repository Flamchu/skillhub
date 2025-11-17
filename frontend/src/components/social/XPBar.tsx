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
		<div className="flex items-center gap-3 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg">
			{/* level */}
			<div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 rounded-md">
				<Zap className="w-3.5 h-3.5 text-primary" />
				<span className="text-xs font-bold text-primary">Lv {level}</span>
			</div>

			{/* xp progress bar */}
			<div className="flex flex-col gap-1 min-w-[120px]">
				<div className="flex items-center justify-between text-xs">
					<span className="font-medium text-foreground-muted">
						{xpInCurrentLevel}/{xpNeededForNextLevel} XP
					</span>
					<span className="text-primary font-semibold">{progressPercentage}%</span>
				</div>
				<div className="h-1.5 bg-background-tertiary rounded-full overflow-hidden">
					<div
						className="h-full bg-linear-to-r from-primary to-purple transition-all duration-300"
						style={{ width: `${progressPercentage}%` }}
					/>
				</div>
			</div>

			{/* streak */}
			{currentStreak > 0 && (
				<div className="flex items-center gap-1 px-2 py-1 bg-orange-500/10 rounded-md">
					<Flame className="w-3.5 h-3.5 text-orange-500" />
					<span className="text-xs font-bold text-orange-500">{currentStreak}</span>
				</div>
			)}
		</div>
	);
}
