"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";
import { PageLayout, PageHeader, LoadingState, LanguageSwitcher, GlassCard } from "@/components/ui";
import { DashboardCard, EnrolledCourses } from "@/components/dashboard";

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
				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 items-stretch">
					<div className="h-full">
						<DashboardCard
							icon="⚡"
							title="Your Skills"
							description="Track and improve your current skill levels with personalized recommendations."
							linkText="View All Skills"
							href="/skills"
							colorScheme="primary"
						/>
					</div>

					<div className="h-full">
						<DashboardCard
							icon="🎯"
							title="Personalized Recommendations"
							description="AI-powered course recommendations based on your skills and learning path."
							linkText="View Recommendations"
							href="/courses/recommended"
							colorScheme="success"
						/>
					</div>

					<div className="h-full">
						<DashboardCard
							icon="�"
							title="Browse All Courses"
							description="Explore our complete catalog of courses across all skill levels and topics."
							linkText="Browse Courses"
							href="/courses"
							colorScheme="info"
						/>
					</div>

					<div className="h-full">
						<DashboardCard
							icon="👤"
							title="Enhanced Profile"
							description="Manage your profile, generate AI skills, and track your learning journey."
							linkText="View Profile"
							href="/profile"
							colorScheme="primary"
						/>
					</div>
				</div>

				{/* Enrolled Courses Section */}
				<div className="mb-12">
					<EnrolledCourses limit={6} />
				</div>

				{/* Quick Recommendations Section */}
				<div className="mb-12">
					<GlassCard padding="lg" hover={false}>
						<div className="flex items-center justify-between mb-6">
							<div>
								<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🎯 Recommended For You</h2>
								<p className="text-gray-600 dark:text-gray-300 mt-1">
									Courses tailored to your skills and learning path
								</p>
							</div>
							<Link
								href="/courses/recommended"
								className="px-6 py-3 bg-gradient-to-r from-primary to-purple text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105"
							>
								View All Recommendations
							</Link>
						</div>

						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
							<DashboardCard
								icon="🚀"
								title="Advanced JavaScript"
								description="Take your JavaScript skills to the next level with advanced concepts and patterns."
								linkText="Enroll Now"
								href="/courses/advanced-javascript"
								colorScheme="primary"
								size="compact"
							/>
							<DashboardCard
								icon="⚛️"
								title="React Mastery"
								description="Master React with hooks, context, and modern development practices."
								linkText="Learn More"
								href="/courses/react-mastery"
								colorScheme="success"
								size="compact"
							/>
							<DashboardCard
								icon="🎨"
								title="UI/UX Design Fundamentals"
								description="Learn design principles and create beautiful, user-friendly interfaces."
								linkText="Start Learning"
								href="/courses/ui-ux-design"
								colorScheme="info"
								size="compact"
							/>
						</div>

						<div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-purple/10 rounded-lg border border-primary/20">
							<div className="flex items-center space-x-3">
								<div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
									<span className="text-white font-bold text-sm">AI</span>
								</div>
								<div className="flex-1">
									<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
										Want more personalized recommendations?
									</p>
									<p className="text-xs text-gray-600 dark:text-gray-300">
										Use our AI skill generator to get courses tailored to your goals
									</p>
								</div>
								<Link
									href="/profile?tab=ai-skills"
									className="px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors text-sm font-medium"
								>
									Try AI Generator
								</Link>
							</div>
						</div>
					</GlassCard>
				</div>

				{/* Profile Section */}
				{profile && (
					<GlassCard padding="lg" hover={false}>
						<PageHeader title="Profile Overview" description="Your learning profile and achievements" centered />

						<div className="grid md:grid-cols-2 gap-6">
							<div className="space-y-6 flex flex-col">
								<DashboardCard
									icon="👤"
									title="Name"
									description={profile.name || "No name set"}
									linkText="Edit Profile"
									href="/profile"
									colorScheme="primary"
									size="compact"
								/>{" "}
								<DashboardCard
									icon="📧"
									title="Email"
									description={profile.email || "No email set"}
									linkText="View Profile"
									href="/profile"
									colorScheme="success"
									size="compact"
								/>{" "}
								<DashboardCard
									icon="🎭"
									title="Role"
									description={`You are a ${profile.role.toLowerCase()}`}
									linkText="View Permissions"
									onClick={() => {
										// add role info logic here
									}}
									colorScheme="info"
									size="compact"
								/>
							</div>

							<div className="space-y-6 flex flex-col">
								{profile.headline && (
									<DashboardCard
										icon="💡"
										title="Headline"
										description={profile.headline}
										linkText="Edit Profile"
										href="/profile"
										colorScheme="info"
										size="compact"
									/>
								)}

								{profile.bio && (
									<DashboardCard
										icon="📝"
										title="Bio"
										description={profile.bio}
										linkText="Edit Profile"
										href="/profile"
										colorScheme="primary"
										size="compact"
									/>
								)}

								{!profile.headline && !profile.bio && (
									<DashboardCard
										icon="✨"
										title="Complete Your Profile"
										description="Add a headline and bio to showcase your expertise and interests"
										linkText="Complete Profile"
										href="/profile"
										colorScheme="success"
										size="compact"
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
