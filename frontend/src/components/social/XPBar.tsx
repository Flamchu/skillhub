"use client";

import { useEffect, useState } from "react";
import { Zap, Flame } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";

interface SocialProfile {
	user: {
		id: string;
		name: string | null;
		xp: number;
		level: number;
		currentStreak: number;
		longestStreak: number;
		lastActivityDate: string | null;
		currentLevel: number;
		xpInCurrentLevel: number;
		xpNeededForNextLevel: number;
		progressPercentage: number;
	};
}

export default function XPBar() {
	const { user } = useAuth();
	const [profile, setProfile] = useState<SocialProfile | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// only fetch if user has social enabled
		if (!user?.socialEnabled) {
			setLoading(false);
			return;
		}

		const fetchProfile = async () => {
			try {
				const token = localStorage.getItem("auth_token");
				if (!token) return;

				const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/social/profile`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (res.ok) {
					const data = await res.json();
					setProfile(data);
				}
			} catch (error) {
				console.error("Failed to fetch social profile:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchProfile();

		// refresh every 5 minutes
		const interval = setInterval(fetchProfile, 5 * 60 * 1000);
		return () => clearInterval(interval);
	}, [user?.socialEnabled]);

	// don't show if user doesn't have social enabled
	if (!user?.socialEnabled || loading || !profile) {
		return null;
	}

	const { level, xpInCurrentLevel, xpNeededForNextLevel, progressPercentage, currentStreak } = profile.user;

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
