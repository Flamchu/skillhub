"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { PageLayout, LoadingState } from "@/components/ui";
import { Trophy, Target, User, BarChart3, Sparkles } from "lucide-react";
import Link from "next/link";
import SocialDashboard from "@/components/social/SocialDashboard";
import SocialLeaderboard from "@/components/social/SocialLeaderboard";
import SocialQuests from "@/components/social/SocialQuests";
import SocialProfile from "@/components/social/SocialProfile";

type Tab = "dashboard" | "leaderboard" | "quests" | "profile";

export default function SocialPage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [activeTab, setActiveTab] = useState<Tab>("dashboard");

	useEffect(() => {
		if (!loading && (!user || !user.socialEnabled)) {
			router.push("/dashboard");
		}
	}, [user, loading, router]);

	useEffect(() => {
		const tab = searchParams.get("tab") as Tab;
		if (tab && ["dashboard", "leaderboard", "quests", "profile"].includes(tab)) {
			setActiveTab(tab);
		}
	}, [searchParams]);

	const updateTab = (tab: Tab) => {
		setActiveTab(tab);
		router.push(`/social?tab=${tab}`, { scroll: false });
	};

	if (loading) {
		return <LoadingState message="loading social zone..." />;
	}

	if (!user || !user.socialEnabled) {
		return null;
	}

	const tabs = [
		{ id: "dashboard" as Tab, label: "Dashboard", icon: BarChart3 },
		{ id: "leaderboard" as Tab, label: "Leaderboard", icon: Trophy },
		{ id: "quests" as Tab, label: "Quests", icon: Target },
		{ id: "profile" as Tab, label: "Profile", icon: User },
	];

	return (
		<PageLayout>
			{/* navigation */}
			<nav className="fixed top-0 left-0 right-0 z-10 px-6 py-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-primary/20 dark:border-gray-700">
				<div className="max-w-7xl mx-auto flex justify-between items-center">
					<Link
						href="/dashboard"
						className="text-3xl font-bold bg-linear-to-br from-primary via-purple to-pink text-transparent bg-clip-text hover:scale-105 transition-transform"
					>
						SkillHub ✨
					</Link>
					<div className="flex items-center gap-4">
						<Link
							href="/dashboard"
							className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-colors rounded-lg hover:bg-gray-100/70 dark:hover:bg-gray-800"
						>
							← Back to Dashboard
						</Link>
					</div>
				</div>
			</nav>

			{/* main content */}
			<main className="py-8 pt-24">
				{/* header */}
				<div className="mb-8">
					<div className="flex items-center gap-3 mb-3">
						<Sparkles className="w-10 h-10 text-primary" />
						<h1 className="text-4xl md:text-5xl font-bold bg-linear-to-br from-primary via-purple to-pink text-transparent bg-clip-text">
							Social Zone
						</h1>
					</div>
					<p className="text-lg text-gray-600 dark:text-gray-300">
						compete with others, complete quests, and level up your skills
					</p>
				</div>

				{/* tabs */}
				<div className="mb-8">
					<div className="flex flex-wrap gap-2 p-2 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
						{tabs.map(tab => {
							const Icon = tab.icon;
							const isActive = activeTab === tab.id;
							return (
								<button
									key={tab.id}
									onClick={() => updateTab(tab.id)}
									className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
										isActive
											? "bg-white dark:bg-gray-900 text-primary shadow-md"
											: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-gray-900/50"
									}`}
								>
									<Icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
									{tab.label}
								</button>
							);
						})}
					</div>
				</div>

				{/* tab content */}
				<div className="min-h-[600px]">
					{activeTab === "dashboard" && <SocialDashboard />}
					{activeTab === "leaderboard" && <SocialLeaderboard />}
					{activeTab === "quests" && <SocialQuests />}
					{activeTab === "profile" && <SocialProfile />}
				</div>
			</main>
		</PageLayout>
	);
}
