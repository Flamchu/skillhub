"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthProvider";
import { AuthenticatedLayout } from "@/components/layout";
import { CardSkeleton, AvatarSkeleton } from "@/components/ui";
import { QuickActionCard, RecentActivityCard, EditProfileModal } from "@/components/profile";
import { BookOpen, Target, Star, Award, TrendingUp, Settings, Sparkles, GraduationCap, Edit3 } from "lucide-react";
import type { UserActivity, UserActivityResponse } from "@/types";
import { fetchUserActivity } from "@/lib/auth";
import Link from "next/link";

export default function ProfilePage() {
	const { user, profile, loading } = useAuth();
	const router = useRouter();
	const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
	const [loadingActivity, setLoadingActivity] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [stats, setStats] = useState({
		skillsCount: 0,
		coursesCount: 0,
		certificatesCount: 0,
	});

	useEffect(() => {
		if (!loading && !user) {
			router.push("/auth");
			return;
		}

		const loadUserData = async () => {
			try {
				setLoadingActivity(true);

				// load recent activity
				const activityData: UserActivityResponse = await fetchUserActivity(user!.id, 5);
				setUserActivity(activityData.activity);

				// load user stats (you can add api endpoints for these later)
				// for now using placeholder data
				setStats({
					skillsCount: 12, // todo: fetch from api
					coursesCount: 4, // todo: fetch from api
					certificatesCount: 2, // todo: fetch from api
				});
			} catch (error) {
				console.error("Failed to load user data:", error);
			} finally {
				setLoadingActivity(false);
			}
		};

		if (user) {
			loadUserData();
		}
	}, [user, loading, router]);

	if (loading) {
		return (
			<AuthenticatedLayout>
				<div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
					<main className="py-12 px-6">
						<div className="max-w-7xl mx-auto">
							{/* Profile Header Skeleton */}
							<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200/50 dark:border-gray-700/50 p-8 mb-8 shadow-xl">
								<div className="flex items-start gap-6">
									<AvatarSkeleton className="w-24 h-24" />
									<div className="flex-1 space-y-3">
										<div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
										<div className="h-5 w-1/2 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
										<div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
									</div>
								</div>
							</div>

							{/* Quick Actions Skeleton */}
							<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
								{Array.from({ length: 6 }).map((_, i) => (
									<CardSkeleton key={i} />
								))}
							</div>

							{/* Recent Activity Skeleton */}
							<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200/50 dark:border-gray-700/50 p-8 shadow-xl">
								<div className="h-6 w-1/4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-6" />
								<div className="space-y-4">
									{Array.from({ length: 3 }).map((_, i) => (
										<div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
									))}
								</div>
							</div>
						</div>
					</main>
				</div>
			</AuthenticatedLayout>
		);
	}

	if (!user) return null;

	const quickActions = [
		{
			title: "My Skills",
			description: "View and manage your skills, track proficiency levels",
			icon: Target,
			href: "/skills",
			badge: `${stats.skillsCount} skills`,
			gradient: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
		},
		{
			title: "AI Skill Generator",
			description: "Let AI recommend skills based on your goals and interests",
			icon: Sparkles,
			href: "/ai-skills",
			badge: "New",
			gradient: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
		},
		{
			title: "Course Recommendations",
			description: "Personalized course suggestions based on your skills",
			icon: Star,
			href: "/courses/recommended",
			gradient: "from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20",
		},
		{
			title: "Browse Courses",
			description: "Explore our full catalog of courses and learning paths",
			icon: BookOpen,
			href: "/courses",
			gradient: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
		},
		{
			title: "My Learning",
			description: "View enrolled courses, track progress, and continue learning",
			icon: GraduationCap,
			href: "/dashboard",
			badge: `${stats.coursesCount} active`,
			gradient: "from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20",
		},
		{
			title: "Account Settings",
			description: "Update profile information, preferences, and security",
			icon: Settings,
			href: "/settings",
			gradient: "from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20",
		},
	];

	return (
		<AuthenticatedLayout>
			<div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
				<main className="max-w-7xl mx-auto px-6 py-8">
					{/* Modern Profile Header Card */}
					<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden mb-8 border-2 border-gray-200/50 dark:border-gray-700/50">
						{/* Cover Banner with Gradient */}
						<div className="relative h-32 bg-gradient-to-r from-primary via-purple to-pink">
							<div className="absolute inset-0 bg-black/10" />
							<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

							{/* Edit Button - Top Right */}
							<button
								onClick={() => setIsEditModalOpen(true)}
								className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm text-gray-900 dark:text-gray-100 rounded-xl hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold border-2 border-white/20 dark:border-gray-700/50"
							>
								<Edit3 className="w-4 h-4" />
								<span>Edit Profile</span>
							</button>
						</div>

						<div className="px-6 sm:px-8 pb-6">
							{/* Avatar and Basic Info */}
							<div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16 mb-6">
								<div className="relative group shrink-0">
									<div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary via-purple to-pink p-1 shadow-2xl ring-4 ring-white dark:ring-gray-800">
										<div className="w-full h-full rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden relative">
											{profile?.profilePicture ? (
												<Image
													src={profile.profilePicture}
													alt={profile.name || "Profile"}
													fill
													className="object-cover"
													sizes="128px"
												/>
											) : (
												<span className="text-5xl font-bold bg-gradient-to-br from-primary via-purple to-pink text-transparent bg-clip-text">
													{profile?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
												</span>
											)}
										</div>
									</div>
									{/* Upload indicator overlay */}
									<button
										onClick={() => setIsEditModalOpen(true)}
										className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
									>
										<div className="text-center text-white">
											<Edit3 className="w-6 h-6 mx-auto mb-1" />
											<span className="text-xs font-semibold">Upload</span>
										</div>
									</button>
								</div>

								<div className="flex-1 min-w-0 sm:pt-16">
									<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
										{profile?.name || "No name set"}
									</h1>
									{profile?.headline && (
										<p className="text-xl text-gray-600 dark:text-gray-300 font-medium mb-3">{profile.headline}</p>
									)}
									<div className="flex flex-wrap items-center gap-3">
										<span className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm">
											<span>📧</span>
											<span className="font-medium">{user.email}</span>
										</span>
										{user.role && (
											<span className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary/10 to-purple/10 text-primary dark:text-primary-400 rounded-lg text-sm font-bold capitalize border-2 border-primary/20">
												<span>👤</span>
												{user.role.toLowerCase()}
											</span>
										)}
									</div>
								</div>
							</div>

							{/* Bio Section */}
							{profile?.bio && (
								<div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border-2 border-gray-200/50 dark:border-gray-700/50">
									<p className="text-gray-700 dark:text-gray-300 leading-relaxed">{profile.bio}</p>
								</div>
							)}

							{/* Stats Cards */}
							<div className="grid grid-cols-3 gap-4 pb-6">
								<div className="group relative p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border-2 border-blue-200/50 dark:border-blue-700/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
									<div className="flex flex-col items-center">
										<div className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 text-transparent bg-clip-text">
											{stats.skillsCount}
										</div>
										<div className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">Skills</div>
									</div>
								</div>
								<div className="group relative p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200/50 dark:border-green-700/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
									<div className="flex flex-col items-center">
										<div className="text-4xl font-bold bg-gradient-to-br from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 text-transparent bg-clip-text">
											{stats.coursesCount}
										</div>
										<div className="text-sm font-bold text-green-600 dark:text-green-400 mt-1">Courses</div>
									</div>
								</div>
								<div className="group relative p-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-purple-200/50 dark:border-purple-700/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
									<div className="flex flex-col items-center">
										<div className="text-4xl font-bold bg-gradient-to-br from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 text-transparent bg-clip-text">
											{stats.certificatesCount}
										</div>
										<div className="text-sm font-bold text-purple-600 dark:text-purple-400 mt-1">Certificates</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Quick Actions Grid - Modernized */}
					<div className="mb-8">
						<h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
							<span className="text-4xl">⚡</span>
							Quick Actions
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{quickActions.map(action => (
								<QuickActionCard key={action.title} {...action} />
							))}
						</div>
					</div>

					{/* Recent Activity - Modernized */}
					<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 sm:p-8 border-2 border-gray-200/50 dark:border-gray-700/50">
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
								<TrendingUp className="w-8 h-8 text-primary" />
								Recent Activity
							</h2>
						</div>

						{loadingActivity ? (
							<div className="space-y-4">
								{[1, 2, 3].map(i => (
									<div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
								))}
							</div>
						) : userActivity.length > 0 ? (
							<div className="space-y-3">
								{userActivity.map((activity, index) => (
									<RecentActivityCard key={index} activity={activity} />
								))}
							</div>
						) : (
							<div className="text-center py-16">
								<div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center">
									<Award className="w-10 h-10 text-gray-400" />
								</div>
								<h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Activity Yet</h4>
								<p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
									Start learning to see your progress here! Enroll in courses and track your journey.
								</p>
								<Link
									href="/courses"
									className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-purple text-white rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all duration-300"
								>
									<BookOpen className="w-5 h-5" />
									Browse Courses
								</Link>
							</div>
						)}
					</div>
				</main>

				{/* Edit Profile Modal */}
				<EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} user={user} />
			</div>
		</AuthenticatedLayout>
	);
}
