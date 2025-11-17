import type { Course } from "@/types";

interface Chapter {
	time: number;
	title: string;
}

/**
 * server-side function to fetch video chapters
 * uses backend api with redis caching
 */
export async function fetchVideoChaptersServer(videoId: string): Promise<Chapter[]> {
	if (!videoId || videoId.length !== 11) {
		return [];
	}

	try {
		const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api";
		const response = await fetch(`${backendUrl}/chapters/video/${videoId}`, {
			next: { revalidate: 60 * 60 * 24 }, // cache for 24 hours (Next.js)
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			console.warn(`failed to fetch chapters for video ${videoId}: ${response.status}`);
			return [];
		}

		const data = await response.json();
		return data.chapters || [];
	} catch (error) {
		console.error(`error fetching chapters for video ${videoId}:`, error);
		return [];
	}
}

/**
 * enriches course data with chapters for single-video courses
 */
export async function enrichCourseWithChapters(course: Course): Promise<Course & { chapters?: Chapter[] }> {
	// only fetch chapters for single-video courses
	if (!course.lessons || course.lessons.length !== 1) {
		return course;
	}

	const lesson = course.lessons[0];
	const videoId = lesson.providerVideoId || course.externalId;

	if (!videoId || videoId.length !== 11) {
		return course;
	}

	// try to fetch chapters from backend (redis-cached)
	const chapters = await fetchVideoChaptersServer(videoId);

	// if no chapters from API, the component will fall back to parsing description
	return {
		...course,
		chapters: chapters.length > 0 ? chapters : undefined,
	};
}
