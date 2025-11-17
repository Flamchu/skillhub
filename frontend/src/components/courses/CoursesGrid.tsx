import { Button } from "@/components/ui/Button";
import { CourseCardSkeleton } from "@/components/ui";
import { Search, Star, Clock, Users, Bookmark, AlertCircle, Loader } from "lucide-react";
import type { Course, CourseFilters } from "@/types";

interface CoursesGridProps {
	courses: Course[];
	isLoading: boolean;
	error: unknown;
	refetch: () => void;
	pagination?: {
		page: number;
		limit: number;
		totalCount: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
	currentPage: number;
	setCurrentPage: (page: number) => void;
	enrollingCourses: Set<string>;
	handleEnrollClick: (courseId: string) => void;
	toggleBookmark: (courseId: string) => void;
	resetFilters: () => void;
	searchQuery: string;
	selectedDifficulty: CourseFilters["difficulty"] | "all";
	selectedSource: CourseFilters["source"] | "all";
	freeOnly: boolean;
}

export function CoursesGrid({
	courses,
	isLoading,
	error,
	refetch,
	pagination,
	currentPage,
	setCurrentPage,
	enrollingCourses,
	handleEnrollClick,
	toggleBookmark,
	resetFilters,
	searchQuery,
	selectedDifficulty,
	selectedSource,
	freeOnly,
}: CoursesGridProps) {
	// Loading State
	if (isLoading) {
		return (
			<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
				{Array.from({ length: 6 }).map((_, i) => (
					<CourseCardSkeleton key={i} />
				))}
			</div>
		);
	}

	// Error State
	if (error) {
		return (
			<div className="text-center py-20">
				<div className="bg-surface/60 dark:bg-gray-800/60 backdrop-blur-sm border border-danger/30 rounded-2xl p-8 max-w-md mx-auto">
					<div className="text-red-500 mb-4">
						<AlertCircle className="w-16 h-16 mx-auto" />
					</div>
					<h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Failed to load courses</h3>
					<p className="text-gray-600 dark:text-gray-300 mb-6">Something went wrong while fetching the courses.</p>
					<Button
						variant="outline"
						onClick={() => refetch()}
						className="bg-linear-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 border-0"
					>
						Try Again
					</Button>
				</div>
			</div>
		);
	}

	return (
		<>
			{/* Courses Grid */}
			<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
				{courses.map(course => (
					<div
						key={course.id}
						className="bg-surface/80 dark:bg-gray-800/80 backdrop-blur-sm border border-border/10 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
					>
						<div className="p-6">
							<div className="flex justify-between items-start mb-4">
								<div
									className={`px-3 py-1 rounded-full text-sm font-semibold ${
										course.source === "INTERNAL"
											? "bg-linear-to-r from-primary to-purple text-white"
											: "bg-linear-to-r from-info to-success text-white"
									}`}
								>
									{course.source === "INTERNAL" ? "SkillHub" : course.source.toLowerCase()}
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => toggleBookmark(course.id)}
									className="p-1 h-8 w-8 text-gray-400 hover:text-primary transition-colors"
								>
									<Bookmark className="w-4 h-4" />
								</Button>
							</div>
							<h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-primary transition-colors">
								{course.title}
							</h3>
							<div
								className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold mb-4 ${
									course.difficulty === "BEGINNER"
										? "bg-success/20 text-success"
										: course.difficulty === "INTERMEDIATE"
											? "bg-warning/20 text-warning"
											: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
								}`}
							>
								{course.difficulty.toLowerCase()}
							</div>

							<p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">
								{course.description}
							</p>

							<div className="space-y-3">
								<div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
									{course.rating && (
										<div className="flex items-center gap-1">
											<Star className="w-4 h-4 fill-current text-warning" />
											<span>{course.rating.toFixed(1)}</span>
										</div>
									)}
									{course.durationMinutes && (
										<div className="flex items-center gap-1">
											<Clock className="w-4 h-4" />
											<span>
												{Math.floor(course.durationMinutes / 60)}h {course.durationMinutes % 60}m
											</span>
										</div>
									)}
									{course._count && course._count.enrollments !== undefined && (
										<div className="flex items-center gap-1">
											<Users className="w-4 h-4" />
											<span>{course._count.enrollments} enrolled</span>
										</div>
									)}
								</div>

								<div className="flex flex-wrap gap-1">
									{course.skills?.slice(0, 3).map((courseSkill, index) => (
										<span key={index} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-lg font-medium">
											{courseSkill.skill.name}
										</span>
									))}
									{course.skills && course.skills.length > 3 && (
										<span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-lg font-medium">
											+{course.skills.length - 3}
										</span>
									)}
								</div>
							</div>

							<div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
								<span className="text-2xl font-bold text-primary">
									{course.isPaid && course.priceCents ? `$${(course.priceCents / 100).toFixed(2)}` : "Free"}
								</span>
								<Button
									size="sm"
									onClick={() => handleEnrollClick(course.id)}
									disabled={enrollingCourses.has(course.id)}
									className="bg-linear-to-r from-primary to-purple hover:from-primary-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
								>
									{enrollingCourses.has(course.id) ? (
										<>
											<Loader className="w-4 h-4 animate-spin mr-2" />
											Enrolling...
										</>
									) : (
										"Enroll Now"
									)}
								</Button>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Pagination */}
			{pagination && pagination.totalPages > 1 && (
				<div className="flex flex-col sm:flex-row items-center justify-between mt-12 bg-surface/60 dark:bg-gray-800/60 backdrop-blur-sm border border-border/20 rounded-2xl p-6">
					<div className="text-sm text-gray-600 dark:text-gray-300 mb-4 sm:mb-0">
						Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
						{Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} courses
					</div>
					<div className="flex items-center gap-3">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setCurrentPage(currentPage - 1)}
							disabled={!pagination.hasPrev}
							className="transition-all duration-200 transform hover:scale-105"
						>
							← Previous
						</Button>
						<span className="px-4 py-2 text-sm font-semibold text-primary bg-primary/10 rounded-lg">
							Page {pagination.page} of {pagination.totalPages}
						</span>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setCurrentPage(currentPage + 1)}
							disabled={!pagination.hasNext}
							className="transition-all duration-200 transform hover:scale-105"
						>
							Next →
						</Button>
					</div>
				</div>
			)}

			{/* Empty State */}
			{courses.length === 0 && (
				<div className="text-center py-20">
					<div className="bg-surface/60 dark:bg-gray-800/60 backdrop-blur-sm border border-border/20 rounded-2xl p-12 max-w-lg mx-auto">
						<div className="w-20 h-20 bg-linear-to-br from-primary to-purple rounded-2xl flex items-center justify-center mx-auto mb-6">
							<Search className="w-10 h-10 text-white" />
						</div>
						<h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">No courses found</h3>
						<p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
							{searchQuery || selectedDifficulty !== "all" || selectedSource !== "all" || freeOnly
								? "Try adjusting your search or filter criteria to find more courses."
								: "Check back later for new amazing courses!"}
						</p>
						<Button
							variant="outline"
							onClick={resetFilters}
							className="bg-linear-to-r from-primary to-purple text-white hover:from-primary-600 hover:to-purple-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
						>
							Clear All Filters
						</Button>
					</div>
				</div>
			)}
		</>
	);
}
