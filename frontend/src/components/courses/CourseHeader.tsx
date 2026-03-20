import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Bookmark, Share2, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatMinutesDuration, getCourseSourceLabel, getDifficultyLabel } from "@/lib/i18n-utils";
import type { Course } from "@/types";

interface CourseHeaderProps {
	course: Course;
	onBookmark?: () => void;
	onShare?: () => void;
}

export function CourseHeader({ course, onBookmark, onShare }: CourseHeaderProps) {
	const t = useTranslations("courses.courseHeader");
	const tCommon = useTranslations("common");

	return (
		<div className="mb-8">
			<div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
				<div className="flex-1">
					<h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-linear-to-br from-primary via-purple to-pink text-transparent bg-clip-text">
						{course.title}
					</h1>
					<div className="flex flex-wrap items-center gap-3 text-sm text-foreground-muted mb-4">
						<span className="font-medium">{course.provider}</span>
						<span>•</span>
						<span>{formatMinutesDuration(course.durationMinutes ?? 0, tCommon)}</span>
						<span>•</span>
						<Badge variant="primary">{getDifficultyLabel(course.difficulty, tCommon)}</Badge>
						{course.source === "YOUTUBE" && (
							<>
								<span>•</span>
								<Badge variant="info">{getCourseSourceLabel(course.source, tCommon)}</Badge>
							</>
						)}
					</div>

					{/* skills */}
					{course.skills && course.skills.length > 0 && (
						<div className="flex flex-wrap gap-2 mb-4">
							{course.skills?.map((courseSkill, index) => (
								<Badge key={index} variant="default" size="sm">
									{courseSkill.skill.name}
								</Badge>
							))}
						</div>
					)}
				</div>

				{/* action buttons */}
				<div className="flex gap-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={onBookmark}
						className="transition-all duration-200 hover:scale-105"
					>
						<Bookmark className="h-4 w-4 mr-2" />
						{t("actions.save")}
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={onShare}
						className="transition-all duration-200 hover:scale-105"
					>
						<Share2 className="h-4 w-4 mr-2" />
						{t("actions.share")}
					</Button>
					{course.url && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => window.open(course.url, "_blank")}
							className="transition-all duration-200 hover:scale-105"
						>
							<ExternalLink className="h-4 w-4 mr-2" />
							{t("actions.original")}
						</Button>
					)}
				</div>
			</div>

			{/* ai summary or fallback description */}
			{(course.aiSummary || course.description) && (
				<div className="bg-surface/60 dark:bg-gray-800/60 backdrop-blur-sm border border-border/20 rounded-2xl p-6 shadow-lg">
					<div className="flex items-start gap-3">
						<div className="flex-1">
							{course.aiSummary ? (
								<>
									<div className="flex items-center gap-2 mb-2">
										<div className="h-2 w-2 bg-linear-to-r from-primary to-purple rounded-full" />
										<span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
											{t("aiSummary")}
										</span>
									</div>
									<p className="text-foreground-alt leading-relaxed">{course.aiSummary}</p>
								</>
							) : (
								<p className="text-foreground-alt leading-relaxed">{course.description}</p>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
