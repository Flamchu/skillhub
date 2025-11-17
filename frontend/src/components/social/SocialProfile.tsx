"use client";

import { useEffect, useState } from "react";
import { User, Zap, TrendingUp, Flame, Award, Calendar } from "lucide-react";
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

interface XPTransaction {
	id: string;
	amount: number;
	source: string;
	description: string | null;
	createdAt: string;
}

export default function SocialProfile() {
	const { user } = useAuth();
	const [profile, setProfile] = useState<SocialProfile | null>(null);
	const [xpHistory, setXpHistory] = useState<XPTransaction[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const token = localStorage.getItem("auth_token");
				if (!token) return;

				// fetch profile and xp history
				const [profileRes, historyRes] = await Promise.all([
					fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/social/profile`, {
						headers: { Authorization: `Bearer ${token}` },
					}),
					fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/social/xp/history?limit=20`, {
						headers: { Authorization: `Bearer ${token}` },
					}),
				]);

				if (profileRes.ok) {
					const data = await profileRes.json();
					setProfile(data);
				}

				if (historyRes.ok) {
					const data = await historyRes.json();
					setXpHistory(data.transactions || []);
				}
			} catch (error) {
				console.error("Failed to fetch social profile:", error);
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
				<p className="text-gray-600 dark:text-gray-400">failed to load profile</p>
			</div>
		);
	}

	const {
		level,
		xp,
		xpInCurrentLevel,
		xpNeededForNextLevel,
		progressPercentage,
		currentStreak,
		longestStreak,
		lastActivityDate,
	} = profile.user;

	const getSourceIcon = (source: string) => {
		switch (source) {
			case "QUEST_COMPLETION":
				return "🎯";
			case "COURSE_COMPLETION":
				return "📚";
			case "LESSON_COMPLETION":
				return "📖";
			case "SKILL_VERIFICATION":
				return "✅";
			case "DAILY_LOGIN":
				return "📅";
			case "STREAK_BONUS":
				return "🔥";
			default:
				return "⭐";
		}
	};

	const formatSource = (source: string) => {
		return source
			.split("_")
			.map(word => word.charAt(0) + word.slice(1).toLowerCase())
			.join(" ");
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return "just now";
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		return date.toLocaleDateString();
	};

	return (
		<div className="space-y-6">
			{/* profile header */}
			<div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
				<div className="flex items-start gap-6">
					<div className="w-20 h-20 bg-gradient-to-br from-primary to-purple rounded-2xl flex items-center justify-center text-3xl font-bold text-white">
						{user?.name?.charAt(0).toUpperCase() || "U"}
					</div>
					<div className="flex-1">
						<div className="flex items-center gap-3 mb-2">
							<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user?.name || "Anonymous"}</h2>
							<div className="px-3 py-1 bg-primary/10 rounded-full">
								<span className="text-sm font-bold text-primary">Level {level}</span>
							</div>
						</div>
						<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
							{lastActivityDate ? `last active ${formatDate(lastActivityDate)}` : "welcome to skillhub social!"}
						</p>

						{/* level progress */}
						<div className="space-y-2">
							<div className="flex items-center justify-between text-sm">
								<span className="text-gray-600 dark:text-gray-400">Level Progress</span>
								<span className="font-semibold text-gray-900 dark:text-gray-100">
									{xpInCurrentLevel} / {xpNeededForNextLevel} XP ({progressPercentage}%)
								</span>
							</div>
							<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
								<div
									className="h-full bg-gradient-to-r from-primary to-purple transition-all duration-500"
									style={{ width: `${progressPercentage}%` }}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* stats grid */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm text-center">
					<Zap className="w-8 h-8 text-primary mx-auto mb-2" />
					<div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{level}</div>
					<div className="text-xs text-gray-500 dark:text-gray-400">current level</div>
				</div>

				<div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm text-center">
					<TrendingUp className="w-8 h-8 text-purple mx-auto mb-2" />
					<div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{xp.toLocaleString()}</div>
					<div className="text-xs text-gray-500 dark:text-gray-400">total xp</div>
				</div>

				<div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm text-center">
					<Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
					<div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{currentStreak}</div>
					<div className="text-xs text-gray-500 dark:text-gray-400">current streak</div>
				</div>

				<div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm text-center">
					<Award className="w-8 h-8 text-pink mx-auto mb-2" />
					<div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{longestStreak}</div>
					<div className="text-xs text-gray-500 dark:text-gray-400">longest streak</div>
				</div>
			</div>

			{/* xp history */}
			<div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
				<div className="p-6 border-b border-gray-200 dark:border-gray-700">
					<div className="flex items-center gap-2">
						<Calendar className="w-5 h-5 text-primary" />
						<h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">XP History</h3>
					</div>
					<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">recent xp transactions</p>
				</div>

				{xpHistory.length === 0 ? (
					<div className="text-center py-12">
						<User className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-50" />
						<p className="text-gray-600 dark:text-gray-400">no xp earned yet</p>
					</div>
				) : (
					<div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[500px] overflow-y-auto">
						{xpHistory.map(tx => (
							<div key={tx.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<span className="text-2xl">{getSourceIcon(tx.source)}</span>
										<div>
											<h4 className="font-medium text-gray-900 dark:text-gray-100">{formatSource(tx.source)}</h4>
											{tx.description && (
												<p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{tx.description}</p>
											)}
											<p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatDate(tx.createdAt)}</p>
										</div>
									</div>
									<div className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-lg">
										<Zap className="w-4 h-4 text-primary" />
										<span className="text-sm font-bold text-primary">+{tx.amount}</span>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
