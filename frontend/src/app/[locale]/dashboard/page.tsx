"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";

export default function DashboardPage() {
	const tCommon = useTranslations("common");
	const { user, profile, loading, logout } = useAuth();
	const router = useRouter();

	useEffect(() => {
		console.log("dashboard auth check:", { loading, user: !!user, profile: !!profile });

		// add a small delay to let authprovider settle after login redirect
		const timer = setTimeout(() => {
			if (!loading && !user) {
				console.log("redirecting to login because user is null after delay");
				router.push("/login");
			}
		}, 200);

		// if we have a user, clear the timer
		if (user) {
			clearTimeout(timer);
		}

		return () => clearTimeout(timer);
	}, [user, loading, profile, router]);

	if (loading) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
					<p className="text-foreground-muted mt-4">{tCommon("loading")}</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return null; // will redirect
	}

	return (
		<div className="min-h-screen bg-background-alt">
			{/* navigation */}
			<nav className="bg-surface shadow-sm border-b border-border px-6 py-4">
				<div className="max-w-7xl mx-auto flex justify-between items-center">
					<Link href="/" className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
						SkillHub
					</Link>
					<div className="flex items-center gap-6">
						<span className="text-foreground-alt font-medium">Welcome, {profile?.name || user?.email}</span>
						<button
							onClick={() => {
								logout();
								router.push("/");
							}}
							className="px-4 py-2 text-foreground-muted hover:text-foreground hover:bg-surface-hover rounded-sm transition-all duration-200 font-medium"
						>
							Sign Out
						</button>
					</div>
				</div>
			</nav>

			{/* dashboard content */}
			<main className="max-w-7xl mx-auto px-6 py-8">
				<div className="mb-10">
					<h1 className="text-4xl font-bold text-foreground mb-3">Dashboard</h1>
					<p className="text-lg text-foreground-alt">Track your learning progress and explore new skills</p>
				</div>

				<div className="grid md:grid-cols-3 gap-8">
					<div className="bg-surface border border-border rounded-sm shadow-sm p-8 hover:shadow-md transition-shadow duration-200">
						<div className="w-12 h-12 bg-primary-100 rounded-sm flex items-center justify-center mb-6">
							<svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
						</div>
						<h2 className="text-xl font-bold text-foreground mb-4">Your Skills</h2>
						<p className="text-foreground-muted mb-6 leading-relaxed">Track and improve your current skill levels</p>
						<Link href="/skills" className="text-primary hover:text-primary-600 font-semibold hover:underline transition-colors">
							View All Skills →
						</Link>
					</div>

					<div className="bg-surface border border-border rounded-sm shadow-sm p-8 hover:shadow-md transition-shadow duration-200">
						<div className="w-12 h-12 bg-success-100 rounded-sm flex items-center justify-center mb-6">
							<svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
							</svg>
						</div>
						<h2 className="text-xl font-bold text-foreground mb-4">Recommended Courses</h2>
						<p className="text-foreground-muted mb-6 leading-relaxed">Personalized course recommendations for you</p>
						<Link href="/courses" className="text-success hover:text-success-600 font-semibold hover:underline transition-colors">
							Explore Courses →
						</Link>
					</div>

					<div className="bg-surface border border-border rounded-sm shadow-sm p-8 hover:shadow-md transition-shadow duration-200">
						<div className="w-12 h-12 bg-info-100 rounded-sm flex items-center justify-center mb-6">
							<svg className="w-6 h-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<h2 className="text-xl font-bold text-foreground mb-4">Take a Test</h2>
						<p className="text-foreground-muted mb-6 leading-relaxed">Assess your knowledge and track progress</p>
						<button className="text-info hover:text-info-600 font-semibold hover:underline transition-colors">Start Test →</button>
					</div>
				</div>

				{/* profile section */}
				{profile && (
					<div className="mt-12 bg-surface border border-border rounded-sm shadow-sm p-8">
						<h2 className="text-2xl font-bold text-foreground mb-6">Profile Information</h2>
						<div className="grid md:grid-cols-2 gap-6">
							<div className="space-y-4">
								<div>
									<span className="text-sm font-semibold text-foreground-subtle uppercase tracking-wide">Name</span>
									<p className="text-lg text-foreground font-medium">{profile.name}</p>
								</div>
								<div>
									<span className="text-sm font-semibold text-foreground-subtle uppercase tracking-wide">Email</span>
									<p className="text-lg text-foreground font-medium">{profile.email}</p>
								</div>
								<div>
									<span className="text-sm font-semibold text-foreground-subtle uppercase tracking-wide">Role</span>
									<p className="text-lg text-foreground font-medium">
										<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary">{profile.role}</span>
									</p>
								</div>
							</div>
							{(profile.headline || profile.bio) && (
								<div className="space-y-4">
									{profile.headline && (
										<div>
											<span className="text-sm font-semibold text-foreground-subtle uppercase tracking-wide">Headline</span>
											<p className="text-lg text-foreground font-medium">{profile.headline}</p>
										</div>
									)}
									{profile.bio && (
										<div>
											<span className="text-sm font-semibold text-foreground-subtle uppercase tracking-wide">Bio</span>
											<p className="text-lg text-foreground leading-relaxed">{profile.bio}</p>
										</div>
									)}
								</div>
							)}
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
