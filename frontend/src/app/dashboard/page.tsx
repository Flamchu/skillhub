"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";

export default function DashboardPage() {
	const { user, profile, loading, logout } = useAuth();
	const router = useRouter();

	useEffect(() => {
		console.log("Dashboard auth check:", { loading, user: !!user, profile: !!profile });

		// add a small delay to let AuthProvider settle after login redirect
		const timer = setTimeout(() => {
			if (!loading && !user) {
				console.log("Redirecting to login because user is null after delay");
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
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="text-gray-600 mt-4">Loading your dashboard...</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return null; // will redirect
	}

	return (
		<div className="min-h-screen bg-gray-100">
			{/* navigation */}
			<nav className="bg-white shadow-md border-b border-gray-200 px-6 py-4">
				<div className="max-w-7xl mx-auto flex justify-between items-center">
					<Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
						SkillHub
					</Link>
					<div className="flex items-center gap-6">
						<span className="text-gray-800 font-medium">Welcome, {profile?.name || user?.email}</span>
						<button
							onClick={() => {
								logout();
								router.push("/");
							}}
							className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium"
						>
							Sign Out
						</button>
					</div>
				</div>
			</nav>

			{/* dashboard content */}
			<main className="max-w-7xl mx-auto px-6 py-8">
				<div className="mb-10">
					<h1 className="text-4xl font-bold text-gray-900 mb-3">Dashboard</h1>
					<p className="text-lg text-gray-700">Track your learning progress and explore new skills</p>
				</div>

				<div className="grid md:grid-cols-3 gap-8">
					<div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow duration-200">
						<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
							<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
						</div>
						<h2 className="text-xl font-bold text-gray-900 mb-4">Your Skills</h2>
						<p className="text-gray-700 mb-6 leading-relaxed">Track and improve your current skill levels</p>
						<button className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors">View All Skills →</button>
					</div>

					<div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow duration-200">
						<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
							<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
							</svg>
						</div>
						<h2 className="text-xl font-bold text-gray-900 mb-4">Recommended Courses</h2>
						<p className="text-gray-700 mb-6 leading-relaxed">Personalized course recommendations for you</p>
						<button className="text-green-600 hover:text-green-800 font-semibold hover:underline transition-colors">Explore Courses →</button>
					</div>

					<div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow duration-200">
						<div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
							<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<h2 className="text-xl font-bold text-gray-900 mb-4">Take a Test</h2>
						<p className="text-gray-700 mb-6 leading-relaxed">Assess your knowledge and track progress</p>
						<button className="text-purple-600 hover:text-purple-800 font-semibold hover:underline transition-colors">Start Test →</button>
					</div>
				</div>

				{/* profile section */}
				{profile && (
					<div className="mt-12 bg-white rounded-xl shadow-lg border border-gray-200 p-8">
						<h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
						<div className="grid md:grid-cols-2 gap-6">
							<div className="space-y-4">
								<div>
									<span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Name</span>
									<p className="text-lg text-gray-900 font-medium">{profile.name}</p>
								</div>
								<div>
									<span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Email</span>
									<p className="text-lg text-gray-900 font-medium">{profile.email}</p>
								</div>
								<div>
									<span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Role</span>
									<p className="text-lg text-gray-900 font-medium">
										<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">{profile.role}</span>
									</p>
								</div>
							</div>
							{(profile.headline || profile.bio) && (
								<div className="space-y-4">
									{profile.headline && (
										<div>
											<span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Headline</span>
											<p className="text-lg text-gray-900 font-medium">{profile.headline}</p>
										</div>
									)}
									{profile.bio && (
										<div>
											<span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Bio</span>
											<p className="text-lg text-gray-900 leading-relaxed">{profile.bio}</p>
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
