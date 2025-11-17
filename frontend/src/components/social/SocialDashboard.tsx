"use client";

import { useEffect, useState } from "react";
import { Zap, TrendingUp, Flame, Calendar, Trophy } from "lucide-react";

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

interface Quest {
	id: string;
	title: string;
	description: string;
	xpReward: number;
	progress: number;
	targetCount: number;
	isCompleted: boolean;
}

export default function SocialDashboard() {
	const [profile, setProfile] = useState<SocialProfile | null>(null);
	const [quests, setQuests] = useState<Quest[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const token = localStorage.getItem("auth_token");
				if (!token) return;

				// fetch profile and quests in parallel
				const [profileRes, questsRes] = await Promise.all([
					fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/social/profile`, {
						headers: { Authorization: `Bearer ${token}` },
					}),
					fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/social/quests/daily`, {
						headers: { Authorization: `Bearer ${token}` },
					}),
				]);

				if (profileRes.ok) {
					const data = await profileRes.json();
					setProfile(data);
				}

				if (questsRes.ok) {
					const data = await questsRes.json();
					setQuests(data.quests || []);
				}
			} catch (error) {
				console.error("Failed to fetch social data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-600 dark:text-gray-400">failed to load profile data</p>
			</div>
		);
	}

	const { level, xp, xpInCurrentLevel, xpNeededForNextLevel, progressPercentage, currentStreak, longestStreak } =
		profile.user;

	// filter active quests (not completed)
	const activeQuests = quests.filter(q => !q.isCompleted);
	const completedToday = quests.filter(q => q.isCompleted).length;

	return (
		<div className="space-y-6">
			{/* stats grid */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* level card */}
				<div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-2">
							<Zap className="w-5 h-5 text-primary" />
							<h3 className="font-semibold text-gray-900 dark:text-gray-100">Level</h3>
						</div>
						<div className="px-3 py-1 bg-primary/10 rounded-full">
							<span className="text-lg font-bold text-primary">Lv {level}</span>
						</div>
					</div>
					<div className="space-y-2">
						<div className="flex items-center justify-between text-sm">
							<span className="text-gray-600 dark:text-gray-400">Progress</span>
							<span className="font-semibold text-gray-900 dark:text-gray-100">{progressPercentage}%</span>
						</div>
						<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
							<div
								className="h-full bg-gradient-to-r from-primary to-purple transition-all duration-500"
								style={{ width: `${progressPercentage}%` }}
							/>
						</div>
						<p className="text-xs text-gray-500 dark:text-gray-400 text-center">
							{xpInCurrentLevel} / {xpNeededForNextLevel} XP
						</p>
					</div>
				</div>

				{/* total xp card */}
				<div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-2">
							<TrendingUp className="w-5 h-5 text-purple" />
							<h3 className="font-semibold text-gray-900 dark:text-gray-100">Total XP</h3>
						</div>
					</div>
					<div className="text-center">
						<div className="text-4xl font-bold bg-gradient-to-r from-purple to-pink text-transparent bg-clip-text">
							{xp.toLocaleString()}
						</div>
						<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">experience points earned</p>
					</div>
				</div>

				{/* streak card */}
				<div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-2">
							<Flame className="w-5 h-5 text-orange-500" />
							<h3 className="font-semibold text-gray-900 dark:text-gray-100">Streak</h3>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="text-center">
							<div className="text-3xl font-bold text-orange-500">{currentStreak}</div>
							<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">current</p>
						</div>
						<div className="text-center">
							<div className="text-3xl font-bold text-gray-400">{longestStreak}</div>
							<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">longest</p>
						</div>
					</div>
				</div>
			</div>

			{/* daily quests preview */}
			<div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-2">
						<Calendar className="w-5 h-5 text-primary" />
						<h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Today&apos;s Quests</h3>
					</div>
					<span className="text-sm text-gray-500 dark:text-gray-400">
						{completedToday} / {quests.length} completed
					</span>
				</div>

				{activeQuests.length === 0 ? (
					<div className="text-center py-8">
						<Trophy className="w-12 h-12 text-primary mx-auto mb-3 opacity-50" />
						<p className="text-gray-600 dark:text-gray-400">all quests completed! 🎉</p>
					</div>
				) : (
					<div className="space-y-3">
						{activeQuests.slice(0, 3).map(quest => (
							<div
								key={quest.id}
								className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
							>
								<div className="flex items-start justify-between mb-2">
									<div className="flex-1">
										<h4 className="font-semibold text-gray-900 dark:text-gray-100">{quest.title}</h4>
										<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{quest.description}</p>
									</div>
									<div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-md">
										<Zap className="w-3 h-3 text-primary" />
										<span className="text-xs font-bold text-primary">+{quest.xpReward}</span>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
										<div
											className="h-full bg-primary transition-all duration-300"
											style={{ width: `${(quest.progress / quest.targetCount) * 100}%` }}
										/>
									</div>
									<span className="text-xs text-gray-500 dark:text-gray-400">
										{quest.progress}/{quest.targetCount}
									</span>
								</div>
							</div>
						))}
						{activeQuests.length > 3 && (
							<p className="text-sm text-center text-gray-500 dark:text-gray-400 pt-2">
								+ {activeQuests.length - 3} more quests
							</p>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
