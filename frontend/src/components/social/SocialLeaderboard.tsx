"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Trophy, Medal, Flame, Zap } from "lucide-react";

interface LeaderboardEntry {
	rank: number;
	user: {
		id: string;
		name: string;
		xp: number;
		level: number;
		currentStreak: number;
		region?: {
			id: string;
			name: string;
			code: string;
		};
	};
	weeklyXP?: number;
}

type LeaderboardType = "weekly" | "global";

export default function SocialLeaderboard() {
	const locale = useLocale();
	const t = useTranslations("social.leaderboard");
	const [type, setType] = useState<LeaderboardType>("weekly");
	const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchLeaderboard = async () => {
			setLoading(true);
			try {
				const endpoint = type === "weekly" ? "/social/leaderboard/weekly" : "/social/leaderboard/global";
				const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${endpoint}?limit=50`);

				if (res.ok) {
					const data = await res.json();
					setLeaderboard(data.leaderboard || []);
				}
			} catch (error) {
				console.error("Failed to fetch leaderboard:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchLeaderboard();
	}, [type]);

	const getRankBadge = (rank: number) => {
		if (rank === 1) return <Medal className="w-6 h-6 text-yellow-500" />;
		if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
		if (rank === 3) return <Medal className="w-6 h-6 text-orange-600" />;
		return <span className="text-sm font-bold text-gray-500 dark:text-gray-400">#{rank}</span>;
	};

	const numberFormatter = new Intl.NumberFormat(locale);

	return (
		<div className="space-y-6">
			<div className="flex gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
				<button
					onClick={() => setType("weekly")}
					className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
						type === "weekly"
							? "bg-white dark:bg-gray-900 text-primary shadow-md"
							: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
					}`}
				>
					{t("filters.weekly")}
				</button>
				<button
					onClick={() => setType("global")}
					className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
						type === "global"
							? "bg-white dark:bg-gray-900 text-primary shadow-md"
							: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
					}`}
				>
					{t("filters.global")}
				</button>
			</div>

			<div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
				<div className="p-6 border-b border-gray-200 dark:border-gray-700">
					<div className="flex items-center gap-2">
						<Trophy className="w-6 h-6 text-primary" />
						<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
							{type === "weekly" ? t("weekly.title") : t("global.title")}
						</h2>
					</div>
					<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
						{type === "weekly" ? t("weekly.description") : t("global.description")}
					</p>
				</div>

				{loading ? (
					<div className="flex items-center justify-center py-12">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
					</div>
				) : leaderboard.length === 0 ? (
					<div className="text-center py-12">
						<Trophy className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-50" />
						<p className="text-gray-600 dark:text-gray-400">{t("empty")}</p>
					</div>
				) : (
					<div className="divide-y divide-gray-200 dark:divide-gray-700">
						{leaderboard.map(entry => (
							<div
								key={entry.user.id}
								className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors ${
									entry.rank <= 3 ? "bg-linear-to-r from-primary/5 to-transparent dark:from-primary/10" : ""
								}`}
							>
								<div className="flex items-center gap-4">
									<div className="w-12 flex items-center justify-center">{getRankBadge(entry.rank)}</div>

									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{entry.user.name}</h3>
											<div className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 rounded-md">
												<Zap className="w-3 h-3 text-primary" />
												<span className="text-xs font-bold text-primary">
													{t("levelBadge", { level: entry.user.level })}
												</span>
											</div>
										</div>
										{entry.user.region && (
											<p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
												{entry.user.region.name} ({entry.user.region.code})
											</p>
										)}
									</div>

									<div className="flex items-center gap-6">
										{entry.user.currentStreak > 0 && (
											<div className="flex items-center gap-1">
												<Flame className="w-4 h-4 text-orange-500" />
												<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
													{numberFormatter.format(entry.user.currentStreak)}
												</span>
											</div>
										)}

										<div className="text-right min-w-[100px]">
											<div className="text-lg font-bold text-primary">
												{type === "weekly" && entry.weeklyXP
													? numberFormatter.format(entry.weeklyXP)
													: numberFormatter.format(entry.user.xp)}
											</div>
											<div className="text-xs text-gray-500 dark:text-gray-400">
												{type === "weekly" ? t("weekly.scoreLabel") : t("global.scoreLabel")}
											</div>
										</div>
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
