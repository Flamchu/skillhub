"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Users, BookOpen, Target, BarChart3, Plus, TrendingUp, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/http";
import type { DashboardStats, DashboardStatsResponse } from "@/types";

export default function AdminDashboard() {
	const { user } = useAuth();
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const loadStats = async () => {
			try {
				setLoading(true);
				setError(null);
				const response = (await api.getDashboardStats()) as DashboardStatsResponse;
				setStats(response.stats);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load dashboard statistics");
			} finally {
				setLoading(false);
			}
		};

		loadStats();
	}, []);

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="border-b border-gray-200 dark:border-gray-700 pb-6">
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
					<p className="mt-2 text-gray-600 dark:text-gray-400">Loading dashboard statistics...</p>
				</div>
				<div className="flex items-center justify-center py-12">
					<Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
					<span className="ml-2 text-gray-600 dark:text-gray-400">Loading dashboard data...</span>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-6">
				<div className="border-b border-gray-200 dark:border-gray-700 pb-6">
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
					<p className="mt-2 text-gray-600 dark:text-gray-400">Welcome back, {user?.name || "Admin"}!</p>
				</div>
				<Card>
					<CardContent className="p-8 text-center">
						<AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Failed to load dashboard</h3>
						<p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
						<Button variant="outline" onClick={() => window.location.reload()}>
							Try Again
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!stats) {
		return null;
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="border-b border-gray-200 dark:border-gray-700 pb-6">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
				<p className="mt-2 text-gray-600 dark:text-gray-400">Welcome back, {user?.name || "Admin"}! Here&apos;s what&apos;s happening with your platform.</p>
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
								<p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totals.users.toLocaleString()}</p>
							</div>
						</div>
						<div className="mt-4">
							<div className="flex items-center text-sm text-green-600 dark:text-green-400">
								<TrendingUp className="h-4 w-4 mr-1" />
								<span>+{stats.growth.usersThisWeek} this week</span>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<BookOpen className="h-8 w-8 text-green-600 dark:text-green-400" />
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Courses</p>
								<p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totals.courses.toLocaleString()}</p>
							</div>
						</div>
						<div className="mt-4">
							<div className="flex items-center text-sm text-green-600 dark:text-green-400">
								<TrendingUp className="h-4 w-4 mr-1" />
								<span>+{stats.growth.coursesThisWeek} this week</span>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<Target className="h-8 w-8 text-purple-600 dark:text-purple-400" />
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Skills</p>
								<p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totals.skills.toLocaleString()}</p>
							</div>
						</div>
						<div className="mt-4">
							<div className="flex items-center text-sm text-green-600 dark:text-green-400">
								<TrendingUp className="h-4 w-4 mr-1" />
								<span>+{stats.growth.skillsThisWeek} this week</span>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<BarChart3 className="h-8 w-8 text-orange-600 dark:text-orange-400" />
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tests</p>
								<p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totals.tests.toLocaleString()}</p>
							</div>
						</div>
						<div className="mt-4">
							<div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
								<span>Assessment & evaluation system</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Quick Actions */}
			<Card>
				<CardHeader>
					<CardTitle>Quick Actions</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<Link href="/admin/courses/new">
							<Button className="w-full justify-start h-auto p-4" variant="outline">
								<Plus className="h-5 w-5 mr-3" />
								<div className="text-left">
									<div className="font-medium">Create Course</div>
									<div className="text-sm text-gray-500">Add a new course to the platform</div>
								</div>
							</Button>
						</Link>

						<Link href="/admin/skills">
							<Button className="w-full justify-start h-auto p-4" variant="outline">
								<Plus className="h-5 w-5 mr-3" />
								<div className="text-left">
									<div className="font-medium">Create Skill</div>
									<div className="text-sm text-gray-500">Add a new skill to the catalog</div>
								</div>
							</Button>
						</Link>

						<Link href="/admin/users">
							<Button className="w-full justify-start h-auto p-4" variant="outline">
								<Users className="h-5 w-5 mr-3" />
								<div className="text-left">
									<div className="font-medium">Manage Users</div>
									<div className="text-sm text-gray-500">View and manage user accounts</div>
								</div>
							</Button>
						</Link>
					</div>
				</CardContent>
			</Card>

			{/* Recent Activity */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Activity</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{stats.recentActivity.length > 0 ? (
							stats.recentActivity.map((activity, index) => (
								<div key={`${activity.type}-${activity.id}-${index}`} className="flex items-start space-x-3">
									<div className="flex-shrink-0">
										{activity.type === "user" && <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
										{activity.type === "course" && <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />}
										{activity.type === "skill" && <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
										<p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
									</div>
									<Badge variant="default" size="sm">
										{activity.type}
									</Badge>
								</div>
							))
						) : (
							<div className="text-center py-8">
								<p className="text-gray-500 dark:text-gray-400">No recent activity</p>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
