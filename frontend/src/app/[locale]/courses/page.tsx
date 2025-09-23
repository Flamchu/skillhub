"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { useCourses, enrollInCourse } from "@/lib/courses";
import { Footer } from "@/components/landing";
import { CoursesNavigation, CoursesHero, CoursesFilters, CoursesGrid } from "@/components/courses";
import type { CourseFilters } from "@/types";

export default function CoursesPage() {
	const { user } = useAuth();
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedDifficulty, setSelectedDifficulty] = useState<CourseFilters["difficulty"] | "all">("all");
	const [selectedSource, setSelectedSource] = useState<CourseFilters["source"] | "all">("all");
	const [freeOnly, setFreeOnly] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [enrollingCourses, setEnrollingCourses] = useState<Set<string>>(new Set());

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

	// handle enrollment and redirect to course page
	const handleEnrollClick = async (courseId: string) => {
		if (!user) {
			// redirect to login if not authenticated
			router.push("/login");
			return;
		}

		setEnrollingCourses(prev => new Set(prev).add(courseId));
		try {
			await enrollInCourse(courseId);
			// redirect to course page after enrollment
			router.push(`/courses/${courseId}`);
		} catch (error) {
			console.error("Enrollment failed:", error);
			// could show a toast notification here
		} finally {
			setEnrollingCourses(prev => {
				const newSet = new Set(prev);
				newSet.delete(courseId);
				return newSet;
			});
		}
	};

	// fetch courses data
	const { data, isLoading, error, refetch } = useCourses(filters);

	const courses = data?.courses || [];
	const pagination = data?.pagination;

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
			<CoursesNavigation />
			<main className="px-6 py-20">
				<div className="max-w-7xl mx-auto">
					<CoursesHero />
					<CoursesFilters
						searchQuery={searchQuery}
						setSearchQuery={setSearchQuery}
						selectedDifficulty={selectedDifficulty}
						setSelectedDifficulty={setSelectedDifficulty}
						selectedSource={selectedSource}
						setSelectedSource={setSelectedSource}
						freeOnly={freeOnly}
						setFreeOnly={setFreeOnly}
						setCurrentPage={setCurrentPage}
					/>
					<CoursesGrid
						courses={courses}
						isLoading={isLoading}
						error={error}
						refetch={refetch}
						pagination={pagination}
						currentPage={currentPage}
						setCurrentPage={setCurrentPage}
						enrollingCourses={enrollingCourses}
						handleEnrollClick={handleEnrollClick}
						toggleBookmark={toggleBookmark}
						resetFilters={resetFilters}
						searchQuery={searchQuery}
						selectedDifficulty={selectedDifficulty}
						selectedSource={selectedSource}
						freeOnly={freeOnly}
					/>
				</div>
			</main>
			<Footer />
		</div>
	);
}
