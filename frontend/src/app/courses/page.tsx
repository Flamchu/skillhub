"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthProvider";
import { useCourses } from "@/lib/courses";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Search, Star, Clock, Users, Bookmark, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import type { CourseFilters } from "@/types";

export default function CoursesPage() {
	const {} = useAuth(); // authentication context available if needed
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedDifficulty, setSelectedDifficulty] = useState<CourseFilters["difficulty"] | "all">("all");
	const [selectedSource, setSelectedSource] = useState<CourseFilters["source"] | "all">("all");
	const [freeOnly, setFreeOnly] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);

	// build filters for api call
	const filters = useMemo<CourseFilters>(() => {
		const params: CourseFilters = {
			page: currentPage,
			limit: 12,
			sortBy: "createdAt",
			sortOrder: "desc",
		};

		if (searchQuery.trim()) {
			params.search = searchQuery.trim();
		}

		if (selectedDifficulty !== "all") {
			params.difficulty = selectedDifficulty;
		}

		if (selectedSource !== "all") {
			params.source = selectedSource;
		}

		if (freeOnly) {
			params.freeOnly = true;
		}

		return params;
	}, [searchQuery, selectedDifficulty, selectedSource, freeOnly, currentPage]);

	// fetch courses data
	const { data, isLoading, error, refetch } = useCourses(filters);

	const courses = data?.courses || [];
	const pagination = data?.pagination;

	const difficulties = ["all", "BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
	const sources = ["all", "INTERNAL", "YOUTUBE", "UDEMY", "OTHER"] as const;

	const toggleBookmark = (courseId: string) => {
		// implementation would make api call to toggle bookmark
		console.log("Toggle bookmark for course:", courseId);
	};

	const resetFilters = () => {
		setSearchQuery("");
		setSelectedDifficulty("all");
		setSelectedSource("all");
		setFreeOnly(false);
		setCurrentPage(1);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Navigation */}
			<nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
				<div className="max-w-7xl mx-auto">
					<h1 className="text-2xl font-bold text-gray-900">Courses</h1>
				</div>
			</nav>

			{/* Content */}
			<main className="max-w-7xl mx-auto px-6 py-8">
				{/* Header */}
				<div className="mb-8">
					<h2 className="text-3xl font-bold text-gray-900 mb-4">Expand Your Skillset</h2>
					<p className="text-lg text-gray-600">Discover high-quality courses from industry experts and level up your professional skills.</p>
				</div>

				{/* Filters */}
				<div className="mb-8 space-y-4">
					<Input placeholder="Search courses, skills, or topics..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} leftIcon={<Search className="w-4 h-4" />} className="max-w-md" />

					<div className="flex flex-wrap gap-4">
						{/* Difficulty Filter */}
						<div className="flex flex-wrap gap-2">
							<span className="text-sm font-medium text-gray-700 py-2">Difficulty:</span>
							{difficulties.map((difficulty) => (
								<Button
									key={difficulty}
									variant={selectedDifficulty === difficulty ? "primary" : "outline"}
									size="sm"
									onClick={() => {
										setSelectedDifficulty(difficulty);
										setCurrentPage(1);
									}}
								>
									{difficulty === "all" ? "All Levels" : difficulty.toLowerCase()}
								</Button>
							))}
						</div>

						{/* Source Filter */}
						<div className="flex flex-wrap gap-2">
							<span className="text-sm font-medium text-gray-700 py-2">Source:</span>
							{sources.map((source) => (
								<Button
									key={source}
									variant={selectedSource === source ? "primary" : "outline"}
									size="sm"
									onClick={() => {
										setSelectedSource(source);
										setCurrentPage(1);
									}}
								>
									{source === "all" ? "All Sources" : source === "INTERNAL" ? "SkillHub" : source.toLowerCase()}
								</Button>
							))}
						</div>

						{/* Free Only Toggle */}
						<Button
							variant={freeOnly ? "primary" : "outline"}
							size="sm"
							onClick={() => {
								setFreeOnly(!freeOnly);
								setCurrentPage(1);
							}}
						>
							Free Only
						</Button>
					</div>
				</div>

				{/* Loading State */}
				{isLoading && (
					<div className="flex items-center justify-center py-12">
						<Loader2 className="w-8 h-8 animate-spin text-blue-600" />
						<span className="ml-2 text-gray-600">Loading courses...</span>
					</div>
				)}

				{/* Error State */}
				{error && (
					<div className="text-center py-12">
						<div className="text-red-400 mb-4">
							<AlertCircle className="w-12 h-12 mx-auto" />
						</div>
						<h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load courses</h3>
						<p className="text-gray-600 mb-4">Something went wrong while fetching the courses.</p>
						<Button variant="outline" onClick={() => refetch()}>
							Try Again
						</Button>
					</div>
				)}

				{/* Courses Grid */}
				{!isLoading && !error && (
					<>
						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
							{courses.map((course) => (
								<Card key={course.id} variant="default" className="hover:shadow-lg transition-shadow">
									<CardHeader>
										<div className="flex justify-between items-start mb-2">
											<Badge variant={course.source === "INTERNAL" ? "primary" : "info"} size="sm">
												{course.source === "INTERNAL" ? "SkillHub" : course.source.toLowerCase()}
											</Badge>
											<Button variant="ghost" size="sm" onClick={() => toggleBookmark(course.id)} className="p-1 h-8 w-8">
												<Bookmark className="w-4 h-4" />
											</Button>
										</div>
										<CardTitle as="h3" className="text-lg">
											{course.title}
										</CardTitle>
										<Badge variant="default" size="sm">
											{course.difficulty.toLowerCase()}
										</Badge>
									</CardHeader>

									<CardContent>
										<p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

										<div className="space-y-3">
											<div className="flex items-center gap-4 text-sm text-gray-600">
												{course.rating && (
													<div className="flex items-center gap-1">
														<Star className="w-4 h-4 fill-current text-yellow-400" />
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
												{course._count && (
													<div className="flex items-center gap-1">
														<Users className="w-4 h-4" />
														<span>{course._count.Bookmark}</span>
													</div>
												)}
											</div>

											<div className="flex flex-wrap gap-1">
												{course.skills?.slice(0, 3).map((courseSkill, index) => (
													<Badge key={index} variant="default" size="sm" className="text-xs">
														{courseSkill.skill.name}
													</Badge>
												))}
												{course.skills && course.skills.length > 3 && (
													<Badge variant="default" size="sm" className="text-xs">
														+{course.skills.length - 3}
													</Badge>
												)}
											</div>
										</div>
									</CardContent>

									<CardFooter>
										<div className="flex justify-between items-center w-full">
											<span className="text-lg font-bold text-gray-900">{course.isPaid && course.priceCents ? `$${(course.priceCents / 100).toFixed(2)}` : "Free"}</span>
											<Button size="sm" onClick={() => window.open(course.url, "_blank")}>
												{course.source !== "INTERNAL" && <ExternalLink className="w-4 h-4 mr-2" />}
												Enroll Now
											</Button>
										</div>
									</CardFooter>
								</Card>
							))}
						</div>

						{/* Pagination */}
						{pagination && pagination.totalPages > 1 && (
							<div className="flex items-center justify-between mt-8">
								<div className="text-sm text-gray-600">
									Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} courses
								</div>
								<div className="flex gap-2">
									<Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage - 1)} disabled={!pagination.hasPrev}>
										Previous
									</Button>
									<span className="py-2 px-3 text-sm">
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
							<div className="text-center py-12">
								<div className="text-gray-400 mb-4">
									<Search className="w-12 h-12 mx-auto" />
								</div>
								<h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
								<p className="text-gray-600 mb-4">{searchQuery || selectedDifficulty !== "all" || selectedSource !== "all" || freeOnly ? "Try adjusting your search or filter criteria." : "Check back later for new courses!"}</p>
								<Button variant="outline" onClick={resetFilters}>
									Clear Filters
								</Button>
							</div>
						)}
					</>
				)}
			</main>
		</div>
	);
}
