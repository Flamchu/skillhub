"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { XPManager } from "@/components/admin";
import { Users, BookOpen, Target, BarChart3, Plus, TrendingUp, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/http";
import type { DashboardStats, DashboardStatsResponse } from "@/types";
import { useLocale, useTranslations } from "next-intl";

export default function AdminDashboard() {
	const { user } = useAuth();
	const locale = useLocale();
	const t = useTranslations("admin.dashboard");
	const tCommon = useTranslations("common");
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const numberFormatter = new Intl.NumberFormat(locale);

	useEffect(() => {
		const loadStats = async () => {
			try {
				setLoading(true);
				setError(null);
				const response = (await api.getDashboardStats()) as DashboardStatsResponse;
				setStats(response.stats);
			} catch (err) {
				setError(err instanceof Error ? err.message : t("errors.loadStats"));
			} finally {
				setLoading(false);
			}
		};
		loadStats();
	}, [t]);

	const getActivityTypeLabel = (type: string) => {
		switch (type) {
			case "user":
				return t("recentActivity.types.user");
			case "course":
				return t("recentActivity.types.course");
			case "skill":
				return t("recentActivity.types.skill");
			default:
				return type;
		}
	};

	if (loading) {
		return (
			<div className="p-8">
				<div className="text-center py-20">
					<div className="w-20 h-20 bg-linear-to-br from-primary to-purple rounded-2xl flex items-center justify-center mx-auto mb-6">
						<Loader2 className="w-10 h-10 animate-spin text-white" />
					</div>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t("loading.title")}</h2>
					<p className="text-gray-600 dark:text-gray-300">{t("loading.description")}</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-8">
				<div className="text-center py-20">
					<div className="w-20 h-20 bg-linear-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
						<AlertCircle className="w-10 h-10 text-white" />
					</div>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t("errors.title")}</h2>
					<p className="text-gray-600 dark:text-gray-300 mb-8">{error}</p>
					<Button
						variant="outline"
						onClick={() => window.location.reload()}
						className="bg-linear-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 border-0"
					>
						{tCommon("tryAgain")}
					</Button>
				</div>
			</div>
		);
	}

	if (!stats) return null;

	return (
		<div className="p-8">
			{/* Header */}
			<div className="text-center mb-12">
				<div className="mb-6">
					<span className="inline-flex items-center px-4 py-2 bg-linear-to-r from-success-50 to-info-50 dark:from-success-900/20 dark:to-info-900/20 text-success dark:text-success-400 rounded-full text-sm font-semibold border border-success/30 dark:border-success-400/30">
						🛠️ {t("badge")}
					</span>
				</div>
				<h1 className="text-4xl md:text-5xl font-bold mb-4">
					<span className="bg-linear-to-br from-primary via-purple to-pink text-transparent bg-clip-text">
						{t("title")}
					</span>
				</h1>
				<p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
					{t("welcome", { name: user?.name || t("fallbackAdmin") })}
				</p>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-12">
				<div className="bg-linear-to-br from-primary/5 to-purple/5 dark:from-primary/10 dark:to-purple/10 border border-primary/20 dark:border-primary/30 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300">
					<div className="flex items-center justify-between mb-4">
						<div className="w-12 h-12 bg-linear-to-br from-primary to-purple rounded-2xl flex items-center justify-center shadow-lg">
							<Users className="h-6 w-6 text-white" />
						</div>
					</div>
					<div className="space-y-2">
						<p className="text-sm font-semibold text-primary uppercase tracking-wide">{t("stats.totalUsers")}</p>
						<p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{numberFormatter.format(stats.totals.users)}</p>
						<div className="flex items-center text-sm text-success">
							<TrendingUp className="h-4 w-4 mr-1" />
							<span>{t("stats.thisWeek", { count: numberFormatter.format(stats.growth.usersThisWeek) })}</span>
						</div>
					</div>
				</div>

				<div className="bg-linear-to-br from-success/5 to-info/5 dark:from-success/10 dark:to-info/10 border border-success/20 dark:border-success/30 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300">
					<div className="flex items-center justify-between mb-4">
						<div className="w-12 h-12 bg-linear-to-br from-success to-info rounded-2xl flex items-center justify-center shadow-lg">
							<BookOpen className="h-6 w-6 text-white" />
						</div>
					</div>
					<div className="space-y-2">
						<p className="text-sm font-semibold text-success uppercase tracking-wide">{t("stats.totalCourses")}</p>
						<p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
							{numberFormatter.format(stats.totals.courses)}
						</p>
						<div className="flex items-center text-sm text-success">
							<TrendingUp className="h-4 w-4 mr-1" />
							<span>{t("stats.thisWeek", { count: numberFormatter.format(stats.growth.coursesThisWeek) })}</span>
						</div>
					</div>
				</div>

				<div className="bg-linear-to-br from-info/5 to-primary/5 dark:from-info/10 dark:to-primary/10 border border-info/20 dark:border-info/30 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300">
					<div className="flex items-center justify-between mb-4">
						<div className="w-12 h-12 bg-linear-to-br from-info to-primary rounded-2xl flex items-center justify-center shadow-lg">
							<Target className="h-6 w-6 text-white" />
						</div>
					</div>
					<div className="space-y-2">
						<p className="text-sm font-semibold text-info uppercase tracking-wide">{t("stats.totalSkills")}</p>
						<p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
							{numberFormatter.format(stats.totals.skills)}
						</p>
						<div className="flex items-center text-sm text-success">
							<TrendingUp className="h-4 w-4 mr-1" />
							<span>{t("stats.thisWeek", { count: numberFormatter.format(stats.growth.skillsThisWeek) })}</span>
						</div>
					</div>
				</div>

				<div className="bg-linear-to-br from-warning-50 to-warning-100 dark:from-warning-900/30 dark:to-warning-800/30 backdrop-blur-sm rounded-2xl border border-warning-200/50 dark:border-warning-700/50 p-6 hover:scale-105 transition-all duration-200 shadow-sm">
					<div className="flex items-center mb-4">
						<BarChart3 className="h-8 w-8 text-warning-600 dark:text-warning-400 mr-3" />
						<div>
							<p className="text-sm text-warning-700 dark:text-warning-300">{t("stats.totalTests")}</p>
							<p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
								{numberFormatter.format(stats.totals.tests)}
							</p>
						</div>
					</div>
					<div className="text-sm text-warning-600 dark:text-warning-400">
						<span>{t("stats.testsDescription")}</span>
					</div>
				</div>
			</div>

			{/* Quick Actions */}
			<div className="mb-12">
				<div className="text-center mb-8">
					<h2 className="text-3xl font-bold mb-2">
						<span className="bg-linear-to-br from-primary via-purple to-pink text-transparent bg-clip-text">
							{t("quickActions.title")}
						</span>
					</h2>
					<p className="text-gray-600 dark:text-gray-300">{t("quickActions.description")}</p>
				</div>

				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					<Link href="/admin/courses/new" className="group">
						<div className="bg-linear-to-br from-primary/5 to-purple/5 dark:from-primary/10 dark:to-purple/10 border border-primary/20 dark:border-primary/30 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300">
							<div className="w-12 h-12 bg-linear-to-br from-primary to-purple rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
								<Plus className="h-6 w-6 text-white" />
							</div>
							<h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-primary transition-colors">
								{t("quickActions.cards.createCourse.title")}
							</h3>
							<p className="text-gray-600 dark:text-gray-300 text-sm">{t("quickActions.cards.createCourse.description")}</p>
						</div>
					</Link>

					<Link href="/admin/skills" className="group">
						<div className="bg-linear-to-br from-success/5 to-info/5 dark:from-success/10 dark:to-info/10 border border-success/20 dark:border-success/30 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300">
							<div className="w-12 h-12 bg-linear-to-br from-success to-info rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
								<Target className="h-6 w-6 text-white" />
							</div>
							<h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-success transition-colors">
								{t("quickActions.cards.createSkill.title")}
							</h3>
							<p className="text-gray-600 dark:text-gray-300 text-sm">{t("quickActions.cards.createSkill.description")}</p>
						</div>
					</Link>

					<Link href="/admin/users" className="group">
						<div className="bg-linear-to-br from-warning/5 to-pink/5 dark:from-warning/10 dark:to-pink/10 border border-warning/20 dark:border-warning/30 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300">
							<div className="w-12 h-12 bg-linear-to-br from-warning to-pink rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
								<Users className="h-6 w-6 text-white" />
							</div>
							<h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-warning transition-colors">
								{t("quickActions.cards.manageUsers.title")}
							</h3>
							<p className="text-gray-600 dark:text-gray-300 text-sm">{t("quickActions.cards.manageUsers.description")}</p>
						</div>
					</Link>
				</div>
			</div>

			{/* XP Manager Section */}
			<div className="mb-12">
				<div className="text-center mb-8">
					<h2 className="text-3xl font-bold mb-2">
						<span className="bg-linear-to-br from-primary via-purple to-pink text-transparent bg-clip-text">
							{t("socialTools.title")}
						</span>
					</h2>
					<p className="text-gray-600 dark:text-gray-300">{t("socialTools.description")}</p>
				</div>
				<XPManager />
			</div>

			{/* Recent Activity */}
			<div>
				<div className="text-center mb-8">
					<h2 className="text-3xl font-bold mb-2">
						<span className="bg-linear-to-br from-primary via-purple to-pink text-transparent bg-clip-text">
							{t("recentActivity.title")}
						</span>
					</h2>
					<p className="text-gray-600 dark:text-gray-300">{t("recentActivity.description")}</p>
				</div>

				<div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-primary/20 dark:border-gray-700 rounded-2xl p-8">
					<div className="space-y-6">
						{stats.recentActivity.length > 0 ? (
							stats.recentActivity.map((activity, index) => (
								<div
									key={`${activity.type}-${activity.id}-${index}`}
									className="flex items-start space-x-4 p-4 bg-linear-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-200"
								>
									<div
										className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
											activity.type === "user"
												? "bg-linear-to-br from-primary to-purple"
												: activity.type === "course"
													? "bg-linear-to-br from-success to-info"
													: "bg-linear-to-br from-warning to-pink"
										}`}
									>
										{activity.type === "user" && <Users className="h-5 w-5 text-white" />}
										{activity.type === "course" && <BookOpen className="h-5 w-5 text-white" />}
										{activity.type === "skill" && <Target className="h-5 w-5 text-white" />}
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{activity.message}</p>
										<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
									</div>
									<Badge
										variant="default"
										size="sm"
										className={`${
											activity.type === "user"
												? "bg-primary/20 text-primary"
												: activity.type === "course"
													? "bg-success/20 text-success"
													: "bg-warning/20 text-warning"
										}`}
									>
										{getActivityTypeLabel(activity.type)}
									</Badge>
								</div>
							))
						) : (
							<div className="text-center py-12">
								<div className="w-16 h-16 bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
									<BarChart3 className="w-8 h-8 text-gray-400" />
								</div>
								<p className="text-gray-500 dark:text-gray-400 font-medium">{t("recentActivity.empty")}</p>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Add the missing closing div and missing stats part */}
			<div className="bg-linear-to-br from-warning/5 to-pink/5 dark:from-warning/10 dark:to-pink/10 border border-warning/20 dark:border-warning/30 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300">
				<div className="flex items-center justify-between mb-4">
					<div className="w-12 h-12 bg-linear-to-br from-warning to-pink rounded-2xl flex items-center justify-center shadow-lg">
						<BarChart3 className="h-6 w-6 text-white" />
					</div>
				</div>
				<div className="space-y-2">
					<p className="text-sm font-semibold text-warning uppercase tracking-wide">{t("testResults.title")}</p>
					<p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{numberFormatter.format(stats.totals.tests)}</p>
					<div className="text-sm text-gray-500 dark:text-gray-400">
						<span>{t("testResults.description")}</span>
					</div>
				</div>
			</div>
		</div>
	);
}
