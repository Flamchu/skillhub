"use client";

import React from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useUserEnrollments } from "@/lib/courses";
import { GlassCard } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Clock, BookOpen, ExternalLink, Loader2 } from "lucide-react";
import type { Enrollment } from "@/types";
import { formatDateByLocale, formatMinutesDuration, getDifficultyLabel } from "@/lib/i18n-utils";

interface EnrolledCoursesProps {
	limit?: number;
}

export function EnrolledCourses({ limit = 6 }: EnrolledCoursesProps) {
	const { data, isLoading, error } = useUserEnrollments();
	const t = useTranslations("dashboard.enrolledCourses");
	const tCommon = useTranslations("common");
	const locale = useLocale();

	if (isLoading) {
		return (
			<GlassCard>
				<div className="p-6">
					<div className="flex items-center justify-center h-32">
						<Loader2 className="w-6 h-6 animate-spin text-primary" />
						<span className="ml-2 text-gray-600 dark:text-gray-400">{t("loading")}</span>
					</div>
				</div>
			</GlassCard>
		);
	}

	if (error) {
		return (
			<GlassCard>
				<div className="p-6">
					<div className="text-center text-gray-600 dark:text-gray-400">
						<p>{t("error.title")}</p>
						<p className="text-sm mt-2">{t("error.description")}</p>
					</div>
				</div>
			</GlassCard>
		);
	}

	const enrollments = data?.enrollments || [];
	const displayEnrollments = limit ? enrollments.slice(0, limit) : enrollments;

	if (enrollments.length === 0) {
		return (
			<GlassCard>
				<div className="p-6 text-center">
					<BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
					<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t("empty.title")}</h3>
					<p className="text-gray-600 dark:text-gray-400 mb-4">{t("empty.description")}</p>
					<Link href="/courses">
						<Button size="sm" className="bg-primary hover:bg-primary-600">
							{t("empty.cta")}
						</Button>
					</Link>
				</div>
			</GlassCard>
		);
	}

	return (
		<GlassCard>
			<div className="p-6">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("title")}</h2>
					{enrollments.length > limit && (
						<Link href="/dashboard/enrollments">
							<Button variant="ghost" size="sm" className="text-primary hover:text-primary-600">
								{t("viewAllCount", { count: enrollments.length })}
							</Button>
						</Link>
					)}
				</div>

				<div className="space-y-4">
					{displayEnrollments.map((enrollment: Enrollment) => (
						<div
							key={enrollment.id}
							className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary/50 dark:hover:border-primary/50 transition-colors"
						>
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<h3 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
										{enrollment.course.title}
									</h3>
									<div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
										{enrollment.course.durationMinutes && (
											<div className="flex items-center">
												<Clock className="w-4 h-4 mr-1" />
												{formatMinutesDuration(enrollment.course.durationMinutes, tCommon)}
											</div>
										)}
										<div className="flex items-center">
											<BookOpen className="w-4 h-4 mr-1" />
											{getDifficultyLabel(enrollment.course.difficulty, tCommon)}
										</div>
									</div>
									<div className="flex items-center space-x-2">
										{enrollment.isCompleted ? (
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
												{t("status.completed")}
											</span>
										) : (
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
												{t("status.inProgress")}
											</span>
										)}
										<span className="text-xs text-gray-500">
											{t("enrolledOn", { date: formatDateByLocale(enrollment.enrolledAt, locale) })}
										</span>
									</div>
								</div>
								<div className="ml-4 shrink-0">
									<Link href={`/courses/${enrollment.course.id}`}>
										<Button
											size="sm"
											variant="outline"
											className="text-primary border-primary hover:bg-primary hover:text-white"
										>
											<ExternalLink className="w-4 h-4 mr-1" />
											{t("continue")}
										</Button>
									</Link>
								</div>
							</div>
						</div>
					))}
				</div>

				{enrollments.length > 3 && (
					<div className="mt-6 text-center">
						<Link href="/dashboard/enrollments">
							<Button variant="outline" className="text-primary border-primary hover:bg-primary hover:text-white">
								{t("viewAll")}
							</Button>
						</Link>
					</div>
				)}
			</div>
		</GlassCard>
	);
}
