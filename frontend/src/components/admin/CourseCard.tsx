"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Edit2, Trash2, Eye, Star, Clock, Users, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatMinutesDuration, getCourseSourceLabel, getDifficultyLabel } from "@/lib/i18n-utils";
import type { Course } from "@/types";

interface CourseCardProps {
	course: Course;
	onDelete: (courseId: string, courseName: string) => void;
	deletingId?: string | null;
}

/**
 * Admin course management card component
 */
export function CourseCard({ course, onDelete, deletingId }: CourseCardProps) {
	const t = useTranslations("admin.courseCard");
	const tCommon = useTranslations("common");

	return (
		<GlassCard>
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<div className="flex items-center space-x-3 mb-3">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white">{course.title}</h3>
						<Badge variant={course.source === "INTERNAL" ? "primary" : "default"} size="sm">
							{getCourseSourceLabel(course.source, tCommon)}
						</Badge>
						<Badge variant="default" size="sm">
							{getDifficultyLabel(course.difficulty, tCommon)}
						</Badge>
						{course.isPaid && (
							<Badge variant="info" size="sm">
								${(course.priceCents || 0) / 100}
							</Badge>
						)}
					</div>

					<p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{course.description}</p>

					<div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400 mb-3">
						{course.rating && (
							<div className="flex items-center space-x-1">
								<Star className="w-4 h-4 text-yellow-500 fill-current" />
								<span>{course.rating.toFixed(1)}</span>
							</div>
						)}
						{course.durationMinutes && (
							<div className="flex items-center space-x-1">
								<Clock className="w-4 h-4" />
								<span>{formatMinutesDuration(course.durationMinutes, tCommon)}</span>
							</div>
						)}
						{course._count && (
							<div className="flex items-center space-x-1">
								<Users className="w-4 h-4" />
								<span>{t("bookmarks", { count: course._count.Bookmark })}</span>
							</div>
						)}
					</div>

					{/* Skills */}
					{course.skills && course.skills.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{course.skills.slice(0, 3).map(courseSkill => (
								<Badge key={courseSkill.skill.id} variant="default" size="sm">
									{courseSkill.skill.name}
								</Badge>
							))}
							{course.skills.length > 3 && (
								<Badge variant="default" size="sm">
									{t("moreSkills", { count: course.skills.length - 3 })}
								</Badge>
							)}
						</div>
					)}
				</div>

				{/* Actions */}
				<div className="flex items-center space-x-2 ml-6">
					{course.url && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => window.open(course.url, "_blank")}
							className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
							aria-label={t("actions.view")}
							title={t("actions.view")}
						>
							<Eye className="h-4 w-4" />
						</Button>
					)}

					<Link href={`/admin/courses/${course.id}/edit`}>
						<Button
							variant="ghost"
							size="sm"
							className="hover:bg-green-50 dark:hover:bg-green-900/20"
							aria-label={tCommon("edit")}
							title={tCommon("edit")}
						>
							<Edit2 className="h-4 w-4" />
						</Button>
					</Link>

					<Button
						variant="ghost"
						size="sm"
						onClick={() => onDelete(course.id, course.title)}
						disabled={deletingId === course.id}
						className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
						aria-label={deletingId === course.id ? t("actions.deleting") : tCommon("delete")}
						title={deletingId === course.id ? t("actions.deleting") : tCommon("delete")}
					>
						{deletingId === course.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
					</Button>
				</div>
			</div>
		</GlassCard>
	);
}
