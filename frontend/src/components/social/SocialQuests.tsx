"use client";

import { useEffect, useState } from "react";
import { Target, Zap, CheckCircle2, Circle } from "lucide-react";

interface Quest {
	id: string;
	title: string;
	description: string;
	type: string;
	xpReward: number;
	progress: number;
	targetCount: number;
	isCompleted: boolean;
}

export default function SocialQuests() {
	const [quests, setQuests] = useState<Quest[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchQuests = async () => {
			try {
				const token = localStorage.getItem("auth_token");
				if (!token) return;

				const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/social/quests/daily`, {
					headers: { Authorization: `Bearer ${token}` },
				});

				if (res.ok) {
					const data = await res.json();
					setQuests(data.quests || []);
				}
			} catch (error) {
				console.error("Failed to fetch quests:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchQuests();

		// refresh every minute to update progress
		const interval = setInterval(fetchQuests, 60000);
		return () => clearInterval(interval);
	}, []);

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
			</div>
		);
	}

	const completedQuests = quests.filter(q => q.isCompleted);
	const activeQuests = quests.filter(q => !q.isCompleted);

	return (
		<div className="space-y-6">
			{/* progress header */}
			<div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Target className="w-8 h-8 text-primary" />
						<div>
							<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Daily Quests</h2>
							<p className="text-sm text-gray-600 dark:text-gray-400">complete quests to earn bonus xp</p>
						</div>
					</div>
					<div className="text-right">
						<div className="text-3xl font-bold text-primary">
							{completedQuests.length}/{quests.length}
						</div>
						<p className="text-xs text-gray-500 dark:text-gray-400">completed</p>
					</div>
				</div>

				{/* progress bar */}
				<div className="mt-4">
					<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
						<div
							className="h-full bg-gradient-to-r from-primary to-purple transition-all duration-500"
							style={{ width: `${quests.length > 0 ? (completedQuests.length / quests.length) * 100 : 0}%` }}
						/>
					</div>
				</div>
			</div>

			{/* active quests */}
			{activeQuests.length > 0 && (
				<div>
					<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Active Quests</h3>
					<div className="space-y-3">
						{activeQuests.map(quest => {
							const progressPercent = (quest.progress / quest.targetCount) * 100;
							return (
								<div
									key={quest.id}
									className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
								>
									<div className="flex items-start gap-4">
										<div className="p-2 bg-primary/10 rounded-lg">
											<Circle className="w-6 h-6 text-primary" />
										</div>
										<div className="flex-1 min-w-0">
											<div className="flex items-start justify-between mb-2">
												<div className="flex-1">
													<h4 className="font-semibold text-gray-900 dark:text-gray-100">{quest.title}</h4>
													<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{quest.description}</p>
												</div>
												<div className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-lg ml-3">
													<Zap className="w-4 h-4 text-primary" />
													<span className="text-sm font-bold text-primary">+{quest.xpReward} XP</span>
												</div>
											</div>

											{/* progress */}
											<div className="mt-3 space-y-1">
												<div className="flex items-center justify-between text-sm">
													<span className="text-gray-600 dark:text-gray-400">
														Progress: {quest.progress} / {quest.targetCount}
													</span>
													<span className="font-semibold text-primary">{Math.floor(progressPercent)}%</span>
												</div>
												<div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
													<div
														className="h-full bg-primary transition-all duration-300"
														style={{ width: `${progressPercent}%` }}
													/>
												</div>
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* completed quests */}
			{completedQuests.length > 0 && (
				<div>
					<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Completed Today</h3>
					<div className="space-y-3">
						{completedQuests.map(quest => (
							<div
								key={quest.id}
								className="bg-green-50 dark:bg-green-900/10 rounded-xl p-5 border border-green-200 dark:border-green-800 opacity-75"
							>
								<div className="flex items-start gap-4">
									<div className="p-2 bg-green-500/20 rounded-lg">
										<CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<h4 className="font-semibold text-gray-900 dark:text-gray-100">{quest.title}</h4>
												<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{quest.description}</p>
											</div>
											<div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 rounded-lg ml-3">
												<Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
												<span className="text-sm font-bold text-green-600 dark:text-green-400">
													+{quest.xpReward} XP
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* empty state */}
			{quests.length === 0 && (
				<div className="text-center py-12">
					<Target className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-50" />
					<p className="text-gray-600 dark:text-gray-400">no quests available today</p>
				</div>
			)}
		</div>
	);
}
