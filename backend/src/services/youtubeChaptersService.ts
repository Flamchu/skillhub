import { redis } from "../config/redis";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Chapter {
	time: number;
	title: string;
}

interface YouTubeChapter {
	title: string;
	timeRangeStartMillis: number;
}

/**
 * extracts video id from youtube url or returns if already a video id
 */
function extractVideoId(input: string): string | null {
	if (!input) return null;

	// if already a video id (11 characters, alphanumeric)
	if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
		return input;
	}

	// extract from various youtube url formats
	const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/, /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/, /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/];

	for (const pattern of patterns) {
		const match = input.match(pattern);
		if (match) return match[1];
	}

	return null;
}

/**
 * fetches video chapters from youtube's page html (no api key required)
 */
async function fetchChaptersFromYouTube(videoId: string): Promise<Chapter[]> {
	try {
		const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
			headers: {
				"Accept-Language": "en-US,en;q=0.9",
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
			},
		});

		if (!response.ok) {
			console.warn(`failed to fetch youtube page for video ${videoId}: ${response.status}`);
			return [];
		}

		const html = await response.text();

		// extract ytInitialData from page
		const ytInitialDataMatch = html.match(/var ytInitialData = ({.+?});/);
		if (!ytInitialDataMatch) {
			console.warn(`could not find ytInitialData for video ${videoId}`);
			return [];
		}

		const ytInitialData = JSON.parse(ytInitialDataMatch[1]);

		// navigate to chapters in the data structure
		const engagementPanels = ytInitialData?.engagementPanels || ytInitialData?.contents?.twoColumnWatchNextResults?.results?.results?.contents?.find((c: any) => c.itemSectionRenderer)?.itemSectionRenderer?.contents;

		if (!engagementPanels) {
			console.warn(`no engagement panels found for video ${videoId}`);
			return [];
		}

		// find macro markers (chapters)
		let chapters: YouTubeChapter[] = [];

		for (const panel of engagementPanels) {
			const macroMarkersListRenderer = panel?.engagementPanelSectionListRenderer?.content?.macroMarkersListRenderer || panel?.macroMarkersListRenderer;

			if (macroMarkersListRenderer?.contents) {
				chapters = macroMarkersListRenderer.contents
					.map((item: any) => {
						const marker = item?.macroMarkersListItemRenderer;
						if (!marker) return null;

						return {
							title: marker.title?.simpleText || "",
							timeRangeStartMillis: parseInt(marker.timeDescription?.simpleText || "0") * 1000,
						};
					})
					.filter((c: any) => c !== null);

				if (chapters.length > 0) break;
			}
		}

		// convert to our format
		const formattedChapters: Chapter[] = chapters.map((ch) => ({
			time: Math.floor(ch.timeRangeStartMillis / 1000),
			title: ch.title,
		}));

		return formattedChapters;
	} catch (error) {
		console.error(`error fetching chapters for video ${videoId}:`, error);
		return [];
	}
}

/**
 * parses timestamps from text description (fallback method)
 */
function parseTimestampsFromDescription(description: string): Chapter[] {
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

/**
 * formats chapters as description text
 */
function formatChaptersAsDescription(chapters: Chapter[]): string {
	return chapters
		.map((ch) => {
			const hours = Math.floor(ch.time / 3600);
			const minutes = Math.floor((ch.time % 3600) / 60);
			const seconds = ch.time % 60;

			const timestamp = hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}` : `${minutes}:${String(seconds).padStart(2, "0")}`;

			return `${timestamp} ${ch.title}`;
		})
		.join("\n");
}

/**
 * gets chapters for a video with redis caching (7 days ttl)
 */
export async function getVideoChapters(videoId: string): Promise<Chapter[]> {
	if (!videoId) return [];

	const cacheKey = `youtube:chapters:${videoId}`;

	try {
		// check redis cache first (chapters don't change often)
		if (redis) {
			const cached = await redis.get(cacheKey);
			if (cached) {
				return JSON.parse(cached);
			}
		}

		// fetch from youtube
		const chapters = await fetchChaptersFromYouTube(videoId);

		// cache for 7 days (chapters rarely change)
		if (chapters.length > 0 && redis) {
			await redis.setex(cacheKey, 60 * 60 * 24 * 7, JSON.stringify(chapters));
		}

		return chapters;
	} catch (error) {
		console.error(`error getting chapters for video ${videoId}:`, error);
		return [];
	}
}

/**
 * fetches and stores chapters for a course/lesson in database
 */
export async function updateCourseChapters(courseId: string): Promise<{ success: boolean; chaptersCount: number }> {
	try {
		const course = await prisma.course.findUnique({
			where: { id: courseId },
			include: { lessons: true },
		});

		if (!course) {
			return { success: false, chaptersCount: 0 };
		}

		// single video course - fetch chapters for the main video
		if (course.lessons.length === 1) {
			const lesson = course.lessons[0];
			const videoId = extractVideoId(lesson.providerVideoId || course.externalId || "");

			if (!videoId) {
				return { success: false, chaptersCount: 0 };
			}

			// try to get chapters from youtube
			let chapters = await getVideoChapters(videoId);

			// fallback to parsing existing description
			if (chapters.length === 0 && (lesson.description || course.description)) {
				chapters = parseTimestampsFromDescription(lesson.description || course.description || "");
			}

			if (chapters.length > 0) {
				// store in course description (not lesson, so it's always available)
				const descriptionText = formatChaptersAsDescription(chapters);
				await prisma.course.update({
					where: { id: courseId },
					data: { description: descriptionText },
				});

				return { success: true, chaptersCount: chapters.length };
			}
		}

		// playlist course - chapters already handled by lesson navigation
		return { success: true, chaptersCount: 0 };
	} catch (error) {
		console.error(`error updating chapters for course ${courseId}:`, error);
		return { success: false, chaptersCount: 0 };
	}
}

/**
 * batch update chapters for multiple courses
 */
export async function batchUpdateChapters(courseIds: string[]): Promise<{ updated: number; failed: number }> {
	let updated = 0;
	let failed = 0;

	for (const courseId of courseIds) {
		const result = await updateCourseChapters(courseId);
		if (result.success && result.chaptersCount > 0) {
			updated++;
		} else if (!result.success) {
			failed++;
		}
	}

	return { updated, failed };
}
