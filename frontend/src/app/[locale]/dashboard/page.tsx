"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";
import { PageLayout, LoadingState, LanguageSwitcher } from "@/components/ui";
import { AIWorkflowPrompt, QuickActions, EnrolledCourses, LearningStats, SocialZoneCard } from "@/components/dashboard";
import XPBar from "@/components/social/XPBar";
import { api } from "@/lib/http";
import type { UserSkill } from "@/types";

export default function DashboardPage() {
	const tCommon = useTranslations("common");
	const { user, profile, loading, logout } = useAuth();
	const router = useRouter();
	const [skillsCount, setSkillsCount] = useState(0);

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
			try {
				const response = await api.getUserSkills(user.id);
				const skills = response.skills as UserSkill[];
				setSkillsCount(skills.length);
			} catch (error) {
				console.error("Failed to fetch skills count:", error);
			}
		};

		fetchSkillsCount();
	}, [user]);

	if (loading) {
		return <LoadingState message={tCommon("loading")} />;
	}

	if (!user) {
		return null; // will redirect
	}

	return (
		<PageLayout>
			{/* Navigation */}
			<nav className="fixed top-0 left-0 right-0 z-10 px-6 py-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-primary/20 dark:border-gray-700">
				<div className="max-w-7xl mx-auto flex justify-between items-center">
					<Link
						href="/"
						className="text-3xl font-bold bg-linear-to-br from-primary via-purple to-pink text-transparent bg-clip-text hover:scale-105 transition-transform"
					>
						SkillHub ✨
					</Link>
					<div className="flex items-center gap-6">
						<LanguageSwitcher />
						{/* xp bar - only shows if social enabled */}
						<XPBar />
						<span className="text-gray-600 dark:text-gray-300 font-medium hidden md:block">
							Welcome, <span className="text-primary font-semibold">{profile?.name || user?.email}</span>
						</span>
						<Link
							href="/profile"
							className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-colors rounded-lg hover:bg-gray-100/70 dark:hover:bg-gray-800"
						>
							Profile
						</Link>
						<button
							onClick={() => {
								logout();
								router.push("/");
							}}
							className="px-6 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-colors rounded-lg hover:bg-gray-100/70 dark:hover:bg-gray-800"
						>
							Sign Out
						</button>
					</div>
				</div>
			</nav>

			{/* Main Content */}
			<main className="py-8 pt-24">
				{/* Welcome Header */}
				<div className="mb-8">
					<h1 className="text-4xl md:text-5xl font-bold mb-3">
						<span className="bg-linear-to-br from-primary via-purple to-pink text-transparent bg-clip-text">
							Welcome back, {profile?.name?.split(" ")[0] || "Learner"}! 👋
						</span>
					</h1>
					<p className="text-lg text-gray-600 dark:text-gray-300">
						Ready to continue your learning journey? Let&apos;s make today count.
					</p>
				</div>

				{/* AI Workflow Prompt - Primary Focus */}
				<div className="mb-8">
					<AIWorkflowPrompt />
				</div>

				{/* Learning Stats */}
				<div className="mb-8">
					<LearningStats skillsCount={skillsCount} enrolledCount={0} completedCount={0} />
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
							<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Continue Learning</h2>
							<p className="text-gray-600 dark:text-gray-300">Pick up where you left off</p>
						</div>
					</div>
					<EnrolledCourses limit={3} />
				</div>
			</main>
		</PageLayout>
	);
}
