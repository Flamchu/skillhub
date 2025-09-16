import { useQuery } from "@tanstack/react-query";
import { api, type QueryParams } from "./http";
import { qk } from "./queryKeys";
import type { CoursesResponse, Course, CourseFilters } from "@/types";

// courses list hook
export function useCourses(filters?: CourseFilters) {
	return useQuery({
		queryKey: qk.courses(filters as Record<string, unknown>),
		queryFn: () => api.getCourses(filters as QueryParams) as Promise<CoursesResponse>,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// single course hook
export function useCourse(id: string) {
	return useQuery({
		queryKey: qk.course(id),
		queryFn: () => api.getCourse(id) as Promise<{ course: Course }>,
		enabled: !!id,
		staleTime: 10 * 60 * 1000, // 10 minutes
	});
}

// bookmark course helper (would need backend integration)
export const bookmarkCourse = async (courseId: string) => {
	// implementation would make api call to bookmark course
	console.log("Bookmark course:", courseId);
};

// remove bookmark helper
export const removeBookmark = async (courseId: string) => {
	// implementation would make api call to remove bookmark
	console.log("Remove bookmark:", courseId);
};
