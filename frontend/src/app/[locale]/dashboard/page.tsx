"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";
import { PageLayout, PageHeader, LoadingState, LanguageSwitcher, GlassCard } from "@/components/ui";
import { DashboardCard } from "@/components/dashboard";

export default function DashboardPage() {
	const tCommon = useTranslations("common");
	const tDashboard = useTranslations("dashboard");
	const { user, profile, loading, logout } = useAuth();
	const router = useRouter();

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
						className="text-3xl font-bold bg-gradient-to-br from-primary via-purple to-pink text-transparent bg-clip-text hover:scale-105 transition-transform"
					>
						SkillHub ✨
					</Link>
					<div className="flex items-center gap-6">
						<LanguageSwitcher />
						<span className="text-gray-600 dark:text-gray-300 font-medium">
							Welcome, <span className="text-primary font-semibold">{profile?.name || user?.email}</span>
						</span>
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

			{/* Hero Section */}
			<main className="py-8 pt-24">
				<div className="text-center mb-20">
					<div className="mb-6">
						<span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-success-50 to-info-50 dark:from-success-900/20 dark:to-info-900/20 text-success dark:text-success-400 rounded-full text-sm font-semibold border border-success/30 dark:border-success-400/30">
							🎯 {tDashboard("welcome")}
						</span>
					</div>
					<h1 className="text-5xl md:text-6xl font-bold mb-6">
						<span className="bg-gradient-to-br from-primary via-purple to-pink text-transparent bg-clip-text">
							{tDashboard("title")}
						</span>
					</h1>
					<p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
						Track your learning progress, explore new skills, and continue your journey to success.
					</p>
				</div>

				{/* Dashboard Cards */}
				<div className="grid md:grid-cols-3 gap-6 mb-12">
					<DashboardCard
						icon="⚡"
						title="Your Skills"
						description="Track and improve your current skill levels with personalized recommendations."
						linkText="View All Skills"
						href="/skills"
						colorScheme="primary"
					/>

					<DashboardCard
						icon="📚"
						title="Recommended Courses"
						description="Discover curated courses tailored to your learning goals and interests."
						linkText="Explore Courses"
						href="/courses"
						colorScheme="success"
					/>

					<DashboardCard
						icon="🎯"
						title="Skill Assessment"
						description="Test your knowledge and get insights into your learning progress."
						linkText="Start Assessment"
						onClick={() => {
							// Add assessment logic here
						}}
						colorScheme="info"
					/>
				</div>

				{/* Profile Section */}
				{profile && (
					<GlassCard padding="lg" hover={false}>
						<PageHeader title="Profile Overview" description="Your learning profile and achievements" centered />

						<div className="grid md:grid-cols-2 gap-6">
							<div className="space-y-6 space-x-2">
								<DashboardCard
									icon="👤"
									title="Name"
									description={profile.name || "No name set"}
									linkText="Edit Profile"
									href="/profile/edit"
									colorScheme="primary"
								/>

								<DashboardCard
									icon="📧"
									title="Email"
									description={profile.email || "No email set"}
									linkText="Update Email"
									href="/profile/edit"
									colorScheme="success"
								/>

								<DashboardCard
									icon="🎭"
									title="Role"
									description={`You are a ${profile.role.toLowerCase()}`}
									linkText="View Permissions"
									onClick={() => {
										// Add role info logic here
									}}
									colorScheme="info"
								/>
							</div>

							<div className="space-y-6 space-x-2">
								{profile.headline && (
									<DashboardCard
										icon="💡"
										title="Headline"
										description={profile.headline}
										linkText="Update Headline"
										href="/profile/edit"
										colorScheme="info"
									/>
								)}

								{profile.bio && (
									<DashboardCard
										icon="📝"
										title="Bio"
										description={profile.bio}
										linkText="Edit Bio"
										href="/profile/edit"
										colorScheme="primary"
									/>
								)}

								{!profile.headline && !profile.bio && (
									<DashboardCard
										icon="✨"
										title="Complete Your Profile"
										description="Add a headline and bio to showcase your expertise and interests"
										linkText="Complete Profile"
										href="/profile/edit"
										colorScheme="success"
									/>
								)}
							</div>
						</div>
					</GlassCard>
				)}
			</main>
		</PageLayout>
	);
}
