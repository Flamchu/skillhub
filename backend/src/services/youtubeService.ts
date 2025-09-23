import { exec } from "child_process";
import { promisify } from "util";
import { prisma } from "../config/database";
import { CourseSource, CourseDifficulty } from "@prisma/client";

const execAsync = promisify(exec);

interface YouTubeVideoInfo {
	id: string;
	title: string;
	description?: string;
	duration?: number;
	thumbnail?: string;
	uploader?: string;
	upload_date?: string;
}

interface YouTubePlaylistInfo {
	id: string;
	title: string;
	description?: string;
	uploader?: string;
	thumbnail?: string;
	entries: YouTubeVideoInfo[];
}

interface YouTubeSingleVideoInfo extends YouTubeVideoInfo {
	playlist?: never;
	entries?: never;
}

type YouTubeInfo = YouTubePlaylistInfo | YouTubeSingleVideoInfo;

export class YouTubeService {
	/**
	 * Extract metadata from YouTube URL using yt-dlp
	 */
	private static async extractMetadata(url: string): Promise<YouTubeInfo> {
		try {
			// use yt-dlp with JSON output for structured data
			const command = `yt-dlp -J --flat-playlist "${url}"`;
			console.log(`📹 Running yt-dlp command: ${command}`);

			const { stdout, stderr } = await execAsync(command, {
				maxBuffer: 1024 * 1024 * 10, // 10MB buffer
				timeout: 60000, // 60 second timeout
			});

			if (stderr) {
				console.warn("yt-dlp warnings:", stderr);
			}

			const data = JSON.parse(stdout);
			console.log(`📹 yt-dlp extracted data for: ${data.title || data.id}`);

			return data;
		} catch (error) {
			console.error("Error extracting YouTube metadata:", error);
			throw new Error(`Failed to extract YouTube metadata: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Determine if URL is a playlist or single video
	 */
	private static isPlaylist(data: YouTubeInfo): data is YouTubePlaylistInfo {
		return Array.isArray(data.entries) && data.entries.length > 0;
	}

	/**
	 * Convert YouTube duration string to seconds
	 */
	private static parseDuration(duration?: number | string): number | null {
		if (typeof duration === "number") return duration;
		if (!duration || typeof duration !== "string") return null;

		// yt-dlp usually provides duration in seconds as a number
		// but handle string format just in case (e.g., "PT4M13S")
		const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
		if (!match) return null;

		const hours = parseInt(match[1] || "0");
		const minutes = parseInt(match[2] || "0");
		const seconds = parseInt(match[3] || "0");

		return hours * 3600 + minutes * 60 + seconds;
	}

	/**
	 * Ingest a YouTube playlist into the database
	 */
	static async ingestPlaylist(
		url: string,
		options: {
			skillIds?: string[];
			tags?: string[];
			difficulty?: CourseDifficulty;
			overrides?: {
				title?: string;
				description?: string;
			};
		} = {}
	): Promise<{ course: any; lessonsCount: number }> {
		const data = await this.extractMetadata(url);

		if (!this.isPlaylist(data)) {
			throw new Error("URL is not a playlist. Use ingestSingleVideo for individual videos.");
		}

		console.log(`📹 Processing playlist: ${data.title} with ${data.entries.length} videos`);

		// calculate total duration
		const totalDurationSeconds = data.entries.reduce((sum, entry) => {
			const duration = this.parseDuration(entry.duration);
			return sum + (duration || 0);
		}, 0);

		const totalDurationMinutes = Math.round(totalDurationSeconds / 60);

		// create course record
		const course = await prisma.course.create({
			data: {
				title: options.overrides?.title || data.title,
				description: options.overrides?.description || data.description || `YouTube playlist: ${data.title}`,
				provider: data.uploader || "YouTube",
				source: CourseSource.YOUTUBE,
				externalId: data.id, // playlist ID
				url: url,
				difficulty: options.difficulty || CourseDifficulty.BEGINNER,
				durationMinutes: totalDurationMinutes > 0 ? totalDurationMinutes : null,
				thumbnail: data.thumbnail,
				isPaid: false,
				// create associated skills
				skills: options.skillIds
					? {
							create: options.skillIds.map((skillId) => ({
								skillId,
								relevance: 80, // default high relevance for curated playlists
							})),
						}
					: undefined,
				// create associated tags
				tags: options.tags
					? {
							create: options.tags.map((tagName) => ({
								tag: {
									connectOrCreate: {
										where: { name: tagName },
										create: { name: tagName },
									},
								},
							})),
						}
					: undefined,
				// create lessons from playlist entries
				lessons: {
					create: data.entries.map((entry, index) => ({
						title: entry.title,
						position: index + 1,
						providerVideoId: entry.id,
						durationSeconds: this.parseDuration(entry.duration),
						thumbnail: entry.thumbnail,
						url: `https://www.youtube.com/watch?v=${entry.id}`,
					})),
				},
			},
			include: {
				lessons: {
					orderBy: { position: "asc" },
				},
				skills: {
					include: {
						skill: {
							select: {
								id: true,
								name: true,
								slug: true,
							},
						},
					},
				},
				tags: {
					include: {
						tag: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				},
			},
		});

		console.log(`✅ Successfully ingested playlist "${course.title}" with ${course.lessons.length} lessons`);

		return {
			course,
			lessonsCount: course.lessons.length,
		};
	}

	/**
	 * Ingest a single YouTube video as a course
	 */
	static async ingestSingleVideo(
		url: string,
		options: {
			skillIds?: string[];
			tags?: string[];
			difficulty?: CourseDifficulty;
			overrides?: {
				title?: string;
				description?: string;
			};
		} = {}
	): Promise<{ course: any; lessonsCount: number }> {
		const data = await this.extractMetadata(url);

		if (this.isPlaylist(data)) {
			throw new Error("URL is a playlist. Use ingestPlaylist for playlists.");
		}

		console.log(`📹 Processing single video: ${data.title}`);

		const durationSeconds = this.parseDuration(data.duration);
		const durationMinutes = durationSeconds ? Math.round(durationSeconds / 60) : null;

		// create course with single lesson
		const course = await prisma.course.create({
			data: {
				title: options.overrides?.title || data.title,
				description: options.overrides?.description || data.description || `YouTube video: ${data.title}`,
				provider: data.uploader || "YouTube",
				source: CourseSource.YOUTUBE,
				externalId: data.id, // video ID
				url: url,
				difficulty: options.difficulty || CourseDifficulty.BEGINNER,
				durationMinutes,
				thumbnail: data.thumbnail,
				isPaid: false,
				// create associated skills
				skills: options.skillIds
					? {
							create: options.skillIds.map((skillId) => ({
								skillId,
								relevance: 80,
							})),
						}
					: undefined,
				// create associated tags
				tags: options.tags
					? {
							create: options.tags.map((tagName) => ({
								tag: {
									connectOrCreate: {
										where: { name: tagName },
										create: { name: tagName },
									},
								},
							})),
						}
					: undefined,
				// create single lesson
				lessons: {
					create: {
						title: data.title,
						position: 1,
						providerVideoId: data.id,
						durationSeconds,
						thumbnail: data.thumbnail,
						url: url,
					},
				},
			},
			include: {
				lessons: {
					orderBy: { position: "asc" },
				},
				skills: {
					include: {
						skill: {
							select: {
								id: true,
								name: true,
								slug: true,
							},
						},
					},
				},
				tags: {
					include: {
						tag: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				},
			},
		});

		console.log(`✅ Successfully ingested video "${course.title}" as single lesson course`);

		return {
			course,
			lessonsCount: 1,
		};
	}

	/**
	 * Update user progress for a lesson
	 */
	static async updateUserProgress(
		userId: string,
		lessonId: string,
		data: {
			completed?: boolean;
			progressPercent?: number;
			watchTimeSeconds?: number;
		}
	): Promise<any> {
		const progress = await prisma.userProgress.upsert({
			where: {
				userId_lessonId: {
					userId,
					lessonId,
				},
			},
			update: {
				completed: data.completed ?? undefined,
				progressPercent: data.progressPercent ?? undefined,
				watchTimeSeconds: data.watchTimeSeconds ?? undefined,
				lastAccessedAt: new Date(),
				completedAt: data.completed ? new Date() : undefined,
				updatedAt: new Date(),
			},
			create: {
				userId,
				lessonId,
				completed: data.completed ?? false,
				progressPercent: data.progressPercent ?? 0,
				watchTimeSeconds: data.watchTimeSeconds ?? 0,
				lastAccessedAt: new Date(),
			},
			include: {
				lesson: {
					select: {
						id: true,
						title: true,
						courseId: true,
					},
				},
			},
		});

		return progress;
	}

	/**
	 * Get user's progress for a course
	 */
	static async getCourseProgress(
		userId: string,
		courseId: string
	): Promise<{
		courseId: string;
		totalLessons: number;
		completedLessons: number;
		progressPercent: number;
		totalWatchTime: number;
		lessons: any[];
	}> {
		const lessons = await prisma.lesson.findMany({
			where: { courseId },
			include: {
				userProgress: {
					where: { userId },
					select: {
						completed: true,
						progressPercent: true,
						watchTimeSeconds: true,
						lastAccessedAt: true,
						completedAt: true,
					},
				},
			},
			orderBy: { position: "asc" },
		});

		const totalLessons = lessons.length;
		const completedLessons = lessons.filter((lesson) => lesson.userProgress[0]?.completed === true).length;

		const totalWatchTime = lessons.reduce((sum, lesson) => sum + (lesson.userProgress[0]?.watchTimeSeconds || 0), 0);

		const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

		return {
			courseId,
			totalLessons,
			completedLessons,
			progressPercent,
			totalWatchTime,
			lessons: lessons.map((lesson) => ({
				...lesson,
				progress: lesson.userProgress[0] || null,
			})),
		};
	}
}
