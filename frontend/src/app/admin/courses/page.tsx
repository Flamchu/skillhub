"use client";

import React, { useState } from "react";
import { useCourses } from "@/lib/courses";
import { api } from "@/lib/http";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Plus, Edit2, Trash2, Search, Loader2, AlertCircle, Eye, Star, Clock, Users, BookOpen } from "lucide-react";
import Link from "next/link";
import type { CourseFilters } from "@/types";

export default function AdminCoursesPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedSource, setSelectedSource] = useState<CourseFilters["source"] | "all">("all");
	const [selectedDifficulty, setSelectedDifficulty] = useState<CourseFilters["difficulty"] | "all">("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [deletingId, setDeletingId] = useState<string | null>(null);

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

	const sources = ["all", "INTERNAL", "YOUTUBE", "UDEMY", "OTHER"] as const;
	const difficulties = ["all", "BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Course Management</h1>
					<p className="mt-2 text-gray-600 dark:text-gray-400">Manage all courses on your platform</p>
				</div>
				<Link href="/admin/courses/new">
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						Add Course
					</Button>
				</Link>
			</div>

			{/* Filters */}
			<Card>
				<CardContent className="p-6">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
							<Input placeholder="Search courses..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} leftIcon={<Search className="h-4 w-4" />} />
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Source</label>
							<select value={selectedSource} onChange={(e) => setSelectedSource(e.target.value as CourseFilters["source"] | "all")} className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
								{sources.map((source) => (
									<option key={source} value={source}>
										{source === "all" ? "All Sources" : source}
									</option>
								))}
							</select>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty</label>
							<select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value as CourseFilters["difficulty"] | "all")} className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
								{difficulties.map((difficulty) => (
									<option key={difficulty} value={difficulty}>
										{difficulty === "all" ? "All Levels" : difficulty}
									</option>
								))}
							</select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Loading State */}
			{isLoading && (
				<div className="flex items-center justify-center py-12">
					<Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
					<span className="ml-2 text-gray-600 dark:text-gray-400">Loading courses...</span>
				</div>
			)}

			{/* Error State */}
			{error && (
				<Card>
					<CardContent className="p-8 text-center">
						<AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Failed to load courses</h3>
						<p className="text-gray-600 dark:text-gray-400 mb-4">Something went wrong while fetching the courses.</p>
						<Button variant="outline" onClick={() => refetch()}>
							Try Again
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Courses List */}
			{!isLoading && !error && (
				<div className="space-y-4">
					{courses.map((course) => (
						<Card key={course.id}>
							<CardContent className="p-6">
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center space-x-3 mb-2">
											<h3 className="text-lg font-semibold text-gray-900 dark:text-white">{course.title}</h3>
											<Badge variant={course.source === "INTERNAL" ? "primary" : "default"} size="sm">
												{course.source}
											</Badge>
											<Badge variant="default" size="sm">
												{course.difficulty}
											</Badge>
											{course.isPaid && (
												<Badge variant="info" size="sm">
													${(course.priceCents || 0) / 100}
												</Badge>
											)}
										</div>

										<p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{course.description}</p>

										<div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
											{course.rating && (
												<div className="flex items-center space-x-1">
													<Star className="w-4 h-4 text-yellow-400 fill-current" />
													<span>{course.rating.toFixed(1)}</span>
												</div>
											)}
											{course.durationMinutes && (
												<div className="flex items-center space-x-1">
													<Clock className="w-4 h-4" />
													<span>
														{Math.floor(course.durationMinutes / 60)}h {course.durationMinutes % 60}m
													</span>
												</div>
											)}
											{course._count && (
												<div className="flex items-center space-x-1">
													<Users className="w-4 h-4" />
													<span>{course._count.Bookmark} bookmarks</span>
												</div>
											)}
										</div>

										{/* Skills */}
										{course.skills && course.skills.length > 0 && (
											<div className="mt-3 flex flex-wrap gap-1">
												{course.skills.slice(0, 3).map((courseSkill) => (
													<Badge key={courseSkill.skill.id} variant="default" size="sm">
														{courseSkill.skill.name}
													</Badge>
												))}
												{course.skills.length > 3 && (
													<Badge variant="default" size="sm">
														+{course.skills.length - 3} more
													</Badge>
												)}
											</div>
										)}
									</div>

									{/* Actions */}
									<div className="flex items-center space-x-2 ml-4">
										{course.url && (
											<Button variant="ghost" size="sm" onClick={() => window.open(course.url, "_blank")}>
												<Eye className="h-4 w-4" />
											</Button>
										)}

										<Link href={`/admin/courses/${course.id}/edit`}>
											<Button variant="ghost" size="sm">
												<Edit2 className="h-4 w-4" />
											</Button>
										</Link>

										<Button variant="ghost" size="sm" onClick={() => handleDelete(course.id, course.title)} disabled={deletingId === course.id} className="text-red-600 hover:text-red-700 hover:bg-red-50">
											{deletingId === course.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					))}

					{/* Pagination */}
					{pagination && pagination.totalPages > 1 && (
						<div className="flex items-center justify-between">
							<div className="text-sm text-gray-600">
								Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} courses
							</div>
							<div className="flex space-x-2">
								<Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage - 1)} disabled={!pagination.hasPrev}>
									Previous
								</Button>
								<span className="py-2 px-3 text-sm text-gray-700 dark:text-gray-300">
									Page {pagination.page} of {pagination.totalPages}
								</span>
								<Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage + 1)} disabled={!pagination.hasNext}>
									Next
								</Button>
							</div>
						</div>
					)}

					{/* Empty State */}
					{courses.length === 0 && (
						<Card>
							<CardContent className="p-12 text-center">
								<BookOpen className="w-12 h-12 text-gray-500 dark:text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No courses found</h3>
								<p className="text-gray-600 dark:text-gray-400 mb-4">{searchQuery || selectedSource !== "all" || selectedDifficulty !== "all" ? "Try adjusting your search criteria." : "Get started by creating your first course."}</p>
								<Link href="/admin/courses/new">
									<Button>
										<Plus className="h-4 w-4 mr-2" />
										Add Course
									</Button>
								</Link>
							</CardContent>
						</Card>
					)}
				</div>
			)}
		</div>
	);
}
