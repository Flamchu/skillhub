"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";
import { useCourses } from "@/lib/courses";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/ui";
import { Footer } from "@/components/landing";
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

	const toggleBookmark = (_courseId: string) => {
		// implementation would make api call to toggle bookmark
	};

	const resetFilters = () => {
		setSearchQuery("");
		setSelectedDifficulty("all");
		setSelectedSource("all");
		setFreeOnly(false);
		setCurrentPage(1);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100">
			{/* Navigation */}
			<nav className="px-6 py-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-primary/20 dark:border-gray-700">
				<div className="max-w-7xl mx-auto flex justify-between items-center">
					<Link
						href="/"
						className="text-3xl font-bold bg-gradient-to-br from-primary via-purple to-pink text-transparent bg-clip-text hover:scale-105 transition-transform"
					>
						SkillHub ✨
					</Link>
					<div className="flex items-center gap-6">
						<LanguageSwitcher />
						<Link
							href="/dashboard"
							className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-colors rounded-lg hover:bg-gray-100/70 dark:hover:bg-gray-800"
						>
							Dashboard
						</Link>
						<Link
							href="/auth"
							className="px-8 py-3 bg-gradient-to-r from-primary to-purple text-white rounded-lg hover:from-primary-600 hover:to-purple-600 dark:hover:from-primary-500 dark:hover:to-purple-500 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
						>
							Get Started 🚀
						</Link>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<main className="px-6 py-20">
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-20">
						<div className="mb-6">
							<span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-success-50 to-info-50 dark:from-success-900/20 dark:to-info-900/20 text-success dark:text-success-400 rounded-full text-sm font-semibold border border-success/30 dark:border-success-400/30">
								📚 Discover Knowledge
							</span>
						</div>
						<h1 className="text-5xl md:text-6xl font-bold mb-6">
							<span className="bg-gradient-to-br from-primary via-purple to-pink text-transparent bg-clip-text">
								Expert Courses
							</span>
							<br />
							<span className="text-gray-900 dark:text-gray-100 text-3xl md:text-4xl">For Your Growth</span>
						</h1>
						<p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
							Discover high-quality courses from industry experts and level up your professional skills with interactive
							learning.
						</p>
					</div>

					{/* Search */}
					<div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-primary/20 dark:border-gray-700 rounded-2xl p-6 shadow-xl mb-8">
						<Input
							placeholder="Search courses, skills, or topics..."
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
							leftIcon={<Search className="w-4 h-4 text-gray-500" />}
							className="max-w-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
						/>
					</div>

					{/* Filters */}
					<div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-primary/20 dark:border-gray-700 rounded-2xl p-8 shadow-xl mb-8">
						<div className="flex flex-wrap gap-6">
							{/* Difficulty Filter */}
							<div className="flex flex-wrap gap-2 items-center">
								<span className="text-sm font-semibold text-primary uppercase tracking-wide">Difficulty:</span>
								{difficulties.map(difficulty => (
									<Button
										key={difficulty}
										variant={selectedDifficulty === difficulty ? "primary" : "outline"}
										size="sm"
										onClick={() => {
											setSelectedDifficulty(difficulty);
											setCurrentPage(1);
										}}
										className="transition-all duration-200 transform hover:scale-105"
									>
										{difficulty === "all" ? "All Levels" : difficulty.toLowerCase()}
									</Button>
								))}
							</div>

							{/* Source Filter */}
							<div className="flex flex-wrap gap-2 items-center">
								<span className="text-sm font-semibold text-success uppercase tracking-wide">Source:</span>
								{sources.map(source => (
									<Button
										key={source}
										variant={selectedSource === source ? "primary" : "outline"}
										size="sm"
										onClick={() => {
											setSelectedSource(source);
											setCurrentPage(1);
										}}
										className="transition-all duration-200 transform hover:scale-105"
									>
										{source === "all" ? "All Sources" : source === "INTERNAL" ? "SkillHub" : source.toLowerCase()}
									</Button>
								))}
							</div>

							{/* Free Only Toggle */}
							<div className="flex items-center gap-2">
								<span className="text-sm font-semibold text-info uppercase tracking-wide">Price:</span>
								<Button
									variant={freeOnly ? "primary" : "outline"}
									size="sm"
									onClick={() => {
										setFreeOnly(!freeOnly);
										setCurrentPage(1);
									}}
									className="transition-all duration-200 transform hover:scale-105"
								>
									{freeOnly ? "Free Only" : "All Courses"}
								</Button>
							</div>
						</div>
					</div>

					{/* Loading State */}
					{isLoading && (
						<div className="flex items-center justify-center py-20">
							<div className="text-center">
								<Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
								<span className="text-xl text-gray-600 dark:text-gray-300 font-medium">Loading amazing courses...</span>
							</div>
						</div>
					)}

					{/* Error State */}
					{error && (
						<div className="text-center py-20">
							<div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-red-200 dark:border-red-800 rounded-2xl p-8 max-w-md mx-auto">
								<div className="text-red-500 mb-4">
									<AlertCircle className="w-16 h-16 mx-auto" />
								</div>
								<h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Failed to load courses</h3>
								<p className="text-gray-600 dark:text-gray-300 mb-6">
									Something went wrong while fetching the courses.
								</p>
								<Button
									variant="outline"
									onClick={() => refetch()}
									className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 border-0"
								>
									Try Again
								</Button>
							</div>
						</div>
					)}

					{/* Courses Grid */}
					{!isLoading && !error && (
						<>
							<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
								{courses.map(course => (
									<div
										key={course.id}
										className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-primary/10 dark:border-gray-700 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
									>
										<div className="p-6">
											<div className="flex justify-between items-start mb-4">
												<div
													className={`px-3 py-1 rounded-full text-sm font-semibold ${
														course.source === "INTERNAL"
															? "bg-gradient-to-r from-primary to-purple text-white"
															: "bg-gradient-to-r from-info to-success text-white"
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
													{course._count && (
														<div className="flex items-center gap-1">
															<Users className="w-4 h-4" />
															<span>{course._count.Bookmark}</span>
														</div>
													)}
												</div>

												<div className="flex flex-wrap gap-1">
													{course.skills?.slice(0, 3).map((courseSkill, index) => (
														<span
															key={index}
															className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-lg font-medium"
														>
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
													onClick={() => window.open(course.url, "_blank")}
													className="bg-gradient-to-r from-primary to-purple hover:from-primary-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
												>
													{course.source !== "INTERNAL" && <ExternalLink className="w-4 h-4 mr-2" />}
													Enroll Now
												</Button>
											</div>
										</div>
									</div>
								))}
							</div>

							{/* Pagination */}
							{pagination && pagination.totalPages > 1 && (
								<div className="flex flex-col sm:flex-row items-center justify-between mt-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-primary/20 dark:border-gray-700 rounded-2xl p-6">
									<div className="text-sm text-gray-600 dark:text-gray-300 mb-4 sm:mb-0">
										Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
										{Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount}{" "}
										courses
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
									<div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-primary/20 dark:border-gray-700 rounded-2xl p-12 max-w-lg mx-auto">
										<div className="w-20 h-20 bg-gradient-to-br from-primary to-purple rounded-2xl flex items-center justify-center mx-auto mb-6">
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
											className="bg-gradient-to-r from-primary to-purple text-white hover:from-primary-600 hover:to-purple-600 border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
										>
											Clear All Filters
										</Button>
									</div>
								</div>
							)}
						</>
					)}
				</div>
			</main>

			<Footer />
		</div>
	);
}
