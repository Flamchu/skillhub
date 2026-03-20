"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthProvider";
import { PageLayout, StatsCardSkeleton } from "@/components/ui";
import { AuthenticatedLayout } from "@/components/layout";
import { AIWorkflowPrompt, QuickActions, EnrolledCourses, LearningStats, SocialZoneCard } from "@/components/dashboard";
import { api } from "@/lib/http";
import type { UserSkill } from "@/types";

export default function DashboardPage() {
	const { user, profile, loading } = useAuth();
	const router = useRouter();
	const t = useTranslations("dashboard.page");
	const [skillsCount, setSkillsCount] = useState(0);
	const [loadingStats, setLoadingStats] = useState(true);

	useEffect(() => {
		// add a small delay to let authprovider settle after login redirect
		const timer = setTimeout(() => {
			if (!loading && !user) {
				router.push("/auth");
			}
		}, 200);

		// if we have a user, clear the timer
		if (user) {
			clearTimeout(timer);
		}

		return () => clearTimeout(timer);
	}, [user, loading, profile, router]);

	// fetch user skills count
	useEffect(() => {
		const fetchSkillsCount = async () => {
			if (!user) return;
			setLoadingStats(true);
			try {
				const response = await api.getUserSkills(user.id);
				const skills = response.skills as UserSkill[];
				setSkillsCount(skills.length);
			} catch (error) {
				console.error("Failed to fetch skills count:", error);
			} finally {
				setLoadingStats(false);
			}
		};

		fetchSkillsCount();
	}, [user]);

	if (loading || !user) {
		return (
			<AuthenticatedLayout>
				<PageLayout>
					<main className="py-8">
						{/* Welcome Header Skeleton */}
						<div className="mb-8 space-y-3">
							<div className="h-12 w-3/4 bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-xl animate-pulse" />
							<div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
						</div>

						{/* AI Workflow Skeleton */}
						<div className="mb-8">
							<div className="h-64 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border-2 border-gray-200/50 dark:border-gray-700/50 animate-pulse" />
						</div>

						{/* Stats Skeleton */}
						<div className="mb-8 grid grid-cols-3 gap-4">
							<StatsCardSkeleton />
							<StatsCardSkeleton />
							<StatsCardSkeleton />
						</div>

						{/* Quick Actions Skeleton */}
						<div className="mb-8 grid md:grid-cols-3 gap-4">
							{[1, 2, 3].map(i => (
								<div
									key={i}
									className="h-24 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border-2 border-gray-200/50 dark:border-gray-700/50 animate-pulse"
								/>
							))}
						</div>
					</main>
				</PageLayout>
			</AuthenticatedLayout>
		);
	}

	return (
		<AuthenticatedLayout>
			<PageLayout>
				{/* Main Content */}
				<main className="py-8">
					{/* Welcome Header */}
					<div className="mb-8">
						<h1 className="text-4xl md:text-5xl font-bold mb-3">
							<span className="bg-linear-to-br from-primary via-purple to-pink text-transparent bg-clip-text">
								{t("welcomeTitle", { name: profile?.name?.split(" ")[0] || t("learnerFallback") })}
							</span>
						</h1>
						<p className="text-lg text-gray-600 dark:text-gray-300">{t("welcomeDescription")}</p>
					</div>

					{/* AI Workflow Prompt - Primary Focus */}
					<div className="mb-8">
						<AIWorkflowPrompt />
					</div>

					{/* Learning Stats */}
					<div className="mb-8">
						{loadingStats ? (
							<div className="grid grid-cols-3 gap-4">
								<StatsCardSkeleton />
								<StatsCardSkeleton />
								<StatsCardSkeleton />
							</div>
						) : (
							<LearningStats skillsCount={skillsCount} enrolledCount={0} completedCount={0} />
						)}
					</div>

					{/* Quick Actions */}
					<div className="mb-8">
						<QuickActions />
					</div>

					{/* Social Zone Card - only visible if social enabled */}
					<div className="mb-8">
						<SocialZoneCard />
					</div>

					{/* Enrolled Courses Section */}
					<div className="mb-8">
						<div className="flex items-center justify-between mb-4">
							<div>
								<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t("continueLearningTitle")}</h2>
								<p className="text-gray-600 dark:text-gray-300">{t("continueLearningDescription")}</p>
							</div>
						</div>
						<EnrolledCourses limit={3} />
					</div>
				</main>
			</PageLayout>
		</AuthenticatedLayout>
	);
}
