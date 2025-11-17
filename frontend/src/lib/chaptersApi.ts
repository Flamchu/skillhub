/**
 * youtube chapters api client
 * handles fetching video chapters from backend with caching
 */

import { http } from "./http";

export interface Chapter {
	time: number;
	title: string;
}

interface VideoChaptersResponse {
	chapters: Chapter[];
}

interface UpdateChaptersResponse {
	success: boolean;
	courseId: string;
	courseTitle: string;
	chaptersCount: number;
	message: string;
}

/**
 * fetches chapters for a youtube video (server-side cached)
 */
export async function fetchVideoChapters(videoId: string): Promise<Chapter[]> {
	if (!videoId || videoId.length !== 11) {
		return [];
	}

	try {
		const response = await http.get<VideoChaptersResponse>(`/chapters/video/${videoId}`);
		return response.data.chapters || [];
	} catch (error) {
		console.error(`failed to fetch chapters for video ${videoId}:`, error);
		return [];
	}
}

/**
 * triggers backend to fetch and store chapters for a course
 * requires authentication
 */
export async function updateCourseChapters(courseId: string): Promise<UpdateChaptersResponse | null> {
	try {
		const response = await http.post<UpdateChaptersResponse>(`/chapters/course/${courseId}/update`);
		return response.data;
	} catch (error) {
		console.error(`failed to update chapters for course ${courseId}:`, error);
		return null;
	}
}

/**
 * parses timestamps from text description (client-side fallback)
 */
export function parseTimestampsFromDescription(description: string): Chapter[] {
	if (!description) return [];

	// matches both formats: "0:00 Title" and "(0:00:00) Title"
	const timestampRegex = /\(?(\d{1,2}):(\d{2})(?::(\d{2}))?\)?\s+(.+?)(?=\n|$)/g;
	const timestamps: Chapter[] = [];
	let match;

	while ((match = timestampRegex.exec(description)) !== null) {
		const hours = match[3] ? parseInt(match[1]) : 0;
		const minutes = match[3] ? parseInt(match[2]) : parseInt(match[1]);
		const seconds = match[3] ? parseInt(match[3]) : parseInt(match[2]);
		const title = match[4].trim();

		// skip if title is empty
		if (!title || title.length === 0) continue;

		const timeInSeconds = hours * 3600 + minutes * 60 + seconds;
		timestamps.push({ time: timeInSeconds, title });
	}

	return timestamps.sort((a, b) => a.time - b.time);
}
