"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { AuthenticatedLayout } from "@/components/layout";
import { CardSkeleton, AvatarSkeleton } from "@/components/ui";
import { ProfileHeader, QuickActionCard, RecentActivityCard, EditProfileModal } from "@/components/profile";
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
				<div className="min-h-screen bg-linear-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
			<div className="min-h-screen bg-linear-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
				<main className="max-w-7xl mx-auto px-6 py-8">
					{/* profile header */}
					<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
						<div className="relative h-32 bg-linear-to-r from-primary via-purple to-pink">
							<div className="absolute inset-0 bg-black/10" />
							{/* edit button */}
							<button
								onClick={() => setIsEditModalOpen(true)}
								className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-foreground rounded-lg hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg transition-all"
							>
								<Edit3 className="w-4 h-4" />
								<span className="font-medium">Edit Profile</span>
							</button>
						</div>
						<ProfileHeader user={user} className="-mt-16 relative z-10" />

						{/* bio section */}
						{profile?.bio && (
							<div className="px-6 pb-6">
								<p className="text-foreground-muted leading-relaxed">{profile.bio}</p>
							</div>
						)}

						{/* quick stats */}
						<div className="grid grid-cols-3 gap-4 px-6 pb-6">
							<div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
								<div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.skillsCount}</div>
								<div className="text-sm text-foreground-muted">Skills</div>
							</div>
							<div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
								<div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.coursesCount}</div>
								<div className="text-sm text-foreground-muted">Courses</div>
							</div>
							<div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
								<div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.certificatesCount}</div>
								<div className="text-sm text-foreground-muted">Certificates</div>
							</div>
						</div>
					</div>

					{/* quick actions grid */}
					<div className="mb-8">
						<h2 className="text-2xl font-bold text-foreground mb-6">Quick Actions</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{quickActions.map(action => (
								<QuickActionCard key={action.title} {...action} />
							))}
						</div>
					</div>

					{/* recent activity */}
					<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-2xl font-bold text-foreground">Recent Activity</h2>
							<TrendingUp className="w-6 h-6 text-primary" />
						</div>

						{loadingActivity ? (
							<div className="space-y-4">
								{[1, 2, 3].map(i => (
									<div key={i} className="h-20 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
								))}
							</div>
						) : userActivity.length > 0 ? (
							<div className="space-y-3">
								{userActivity.map((activity, index) => (
									<RecentActivityCard key={index} activity={activity} />
								))}
							</div>
						) : (
							<div className="text-center py-12">
								<Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
								<h4 className="text-lg font-semibold text-foreground mb-2">No Activity Yet</h4>
								<p className="text-foreground-muted mb-6">Start learning to see your progress here!</p>
								<Link
									href="/courses"
									className="inline-flex items-center px-6 py-3 bg-linear-to-r from-primary to-purple text-white rounded-lg font-medium hover:shadow-lg transition-all"
								>
									Browse Courses
								</Link>
							</div>
						)}
					</div>
				</main>

				{/* edit profile modal */}
				<EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} user={user} />
			</div>
		</AuthenticatedLayout>
	);
}
