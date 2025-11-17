"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthProvider";
import { PageLayout, LoadingState } from "@/components/ui";
import { AuthenticatedLayout } from "@/components/layout";
import { AIWorkflowPrompt, QuickActions, EnrolledCourses, LearningStats, SocialZoneCard } from "@/components/dashboard";
import { api } from "@/lib/http";
import type { UserSkill } from "@/types";

export default function DashboardPage() {
	const tCommon = useTranslations("common");
	const { user, profile, loading } = useAuth();
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
		<AuthenticatedLayout>
			<PageLayout>
				{/* Main Content */}
				<main className="py-8">
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
		</AuthenticatedLayout>
	);
}
