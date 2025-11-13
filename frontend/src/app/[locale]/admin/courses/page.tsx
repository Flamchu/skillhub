"use client";

import React, { useState } from "react";
import { useCourses } from "@/lib/courses";
import { api } from "@/lib/http";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageLayout, PageHeader, GlassCard, LoadingState, ErrorState } from "@/components/ui";
import { CourseCard, YouTubeImportModal } from "@/components/admin";
import { Plus, Search, BookOpen, Youtube } from "lucide-react";
import Link from "next/link";
import type { CourseFilters } from "@/types";

export default function AdminCoursesPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedSource, setSelectedSource] = useState<CourseFilters["source"] | "all">("all");
	const [selectedDifficulty, setSelectedDifficulty] = useState<CourseFilters["difficulty"] | "all">("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [showYouTubeImport, setShowYouTubeImport] = useState(false);

	// build filters
	const filters: CourseFilters = {
		page: currentPage,
		limit: 12,
		sortBy: "createdAt",
		sortOrder: "desc",
		...(searchQuery.trim() && { search: searchQuery.trim() }),
		...(selectedSource !== "all" && { source: selectedSource }),
		...(selectedDifficulty !== "all" && { difficulty: selectedDifficulty }),
	};

	const { data, isLoading, error, refetch } = useCourses(filters);
	const courses = data?.courses || [];
	const pagination = data?.pagination;

	const handleDelete = async (courseId: string, courseName: string) => {
		if (!confirm(`Are you sure you want to delete "${courseName}"? This action cannot be undone.`)) {
			return;
		}

		setDeletingId(courseId);
		try {
			await api.deleteCourse(courseId);
			refetch();
		} catch (error) {
			alert(`Failed to delete course: ${error instanceof Error ? error.message : "Unknown error"}`);
		} finally {
			setDeletingId(null);
		}
	};

	const handleYouTubeImportSuccess = () => {
		setShowYouTubeImport(false);
		refetch(); // refresh the course list
	};

	const sources = ["all", "INTERNAL", "YOUTUBE", "UDEMY", "OTHER"] as const;
	const difficulties = ["all", "BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

	return (
		<PageLayout>
			<PageHeader
				title="Course Management"
				description="Manage all courses on your platform"
				action={
					<div className="flex gap-3">
						<Button
							onClick={() => setShowYouTubeImport(true)}
							variant="ghost"
							size="sm"
							className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 shadow-sm hover:shadow-md transition-all duration-200"
						>
							<Youtube className="h-4 w-4 mr-2" />
							YouTube Import
						</Button>
						<Link href="/admin/courses/new">
							<Button className="bg-gradient-to-r from-primary to-purple hover:from-primary-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
								<Plus className="h-4 w-4 mr-2" />
								Add Course
							</Button>
						</Link>
					</div>
				}
			/>

			{/* Filters */}
			<GlassCard className="p-6 mb-8">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
						<Input
							placeholder="Search courses..."
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
							leftIcon={<Search className="h-4 w-4" />}
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Source</label>
						<select
							value={selectedSource}
							onChange={e => setSelectedSource(e.target.value as CourseFilters["source"] | "all")}
							className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white backdrop-blur-sm transition-all duration-200"
						>
							{sources.map(source => (
								<option key={source} value={source}>
									{source === "all" ? "All Sources" : source}
								</option>
							))}
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty</label>
						<select
							value={selectedDifficulty}
							onChange={e => setSelectedDifficulty(e.target.value as CourseFilters["difficulty"] | "all")}
							className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white backdrop-blur-sm transition-all duration-200"
						>
							{difficulties.map(difficulty => (
								<option key={difficulty} value={difficulty}>
									{difficulty === "all" ? "All Levels" : difficulty}
								</option>
							))}
						</select>
					</div>
				</div>
			</GlassCard>

			{/* Loading State */}
			{isLoading && <LoadingState message="Loading courses..." />}

			{/* Error State */}
			{error && (
				<ErrorState
					title="Failed to load courses"
					message="Something went wrong while fetching the courses."
					onRetry={() => refetch()}
				/>
			)}

			{/* Courses List */}
			{!isLoading && !error && (
				<div className="space-y-4">
					{courses.map(course => (
						<CourseCard key={course.id} course={course} onDelete={handleDelete} deletingId={deletingId} />
					))}

					{/* Pagination */}
					{pagination && pagination.totalPages > 1 && (
						<GlassCard className="p-6">
							<div className="flex items-center justify-between">
								<div className="text-sm text-gray-600 dark:text-gray-400">
									Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
									{Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount}{" "}
									courses
								</div>
								<div className="flex space-x-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setCurrentPage(currentPage - 1)}
										disabled={!pagination.hasPrev}
									>
										Previous
									</Button>
									<span className="py-2 px-3 text-sm text-gray-700 dark:text-gray-300">
										Page {pagination.page} of {pagination.totalPages}
									</span>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setCurrentPage(currentPage + 1)}
										disabled={!pagination.hasNext}
									>
										Next
									</Button>
								</div>
							</div>
						</GlassCard>
					)}

					{/* Empty State */}
					{courses.length === 0 && (
						<GlassCard className="p-12 text-center">
							<BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No courses found</h3>
							<p className="text-gray-600 dark:text-gray-400 mb-6">
								{searchQuery || selectedSource !== "all" || selectedDifficulty !== "all"
									? "Try adjusting your search criteria."
									: "Get started by creating your first course."}
							</p>
							<div className="flex gap-3 justify-center">
								<Button
									onClick={() => setShowYouTubeImport(true)}
									variant="ghost"
									className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
								>
									<Youtube className="h-4 w-4 mr-2" />
									Import from YouTube
								</Button>
								<Link href="/admin/courses/new">
									<Button className="bg-gradient-to-r from-primary to-purple hover:from-primary-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
										<Plus className="h-4 w-4 mr-2" />
										Add Course
									</Button>
								</Link>
							</div>
						</GlassCard>
					)}
				</div>
			)}

			{/* YouTube Import Modal */}
			<YouTubeImportModal
				isOpen={showYouTubeImport}
				onClose={() => setShowYouTubeImport(false)}
				onSuccess={handleYouTubeImportSuccess}
			/>
		</PageLayout>
	);
}
