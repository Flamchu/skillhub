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
export const bookmarkCourse = async (_courseId: string) => {
	// implementation would make api call to bookmark course
	throw new Error("Bookmark functionality not yet implemented");
};

// remove bookmark helper
export const removeBookmark = async (_courseId: string) => {
	// implementation would make api call to remove bookmark
	throw new Error("Remove bookmark functionality not yet implemented");
};

// enroll in course helper
export const enrollInCourse = async (courseId: string) => {
	return api.enrollInCourse(courseId);
};

// get user enrollments hook
export function useUserEnrollments() {
	return useQuery({
		queryKey: qk.userEnrollments(),
		queryFn: () => api.getUserEnrollments(),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}
