import axios from "axios";
import { prisma } from "../config/database";

interface UdemyConfig {
	clientId: string;
	clientSecret: string;
	affiliateId?: string;
}

interface UdemyCourse {
	id: number;
	title: string;
	url: string;
	headline: string;
	description: string;
	image_480x270: string;
	price: string;
	price_detail: {
		amount: number;
		currency: string;
		price_string: string;
	};
	rating: number;
	num_reviews: number;
	num_subscribers: number;
	content_info: string;
	visible_instructors: Array<{
		title: string;
		name: string;
		url: string;
		image_100x100: string;
	}>;
	locale: {
		simple_english_title: string;
	};
	instructional_level: string;
	content_length_video: number;
	is_paid: boolean;
}

interface UdemySearchResponse {
	count: number;
	next: string | null;
	previous: string | null;
	results: UdemyCourse[];
}

export class UdemyService {
	private config: UdemyConfig;
	private baseUrl = "https://www.udemy.com/api-2.0";
	private affiliateBaseUrl: string;

	constructor() {
		this.config = {
			clientId: process.env.UDEMY_CLIENT_ID || "",
			clientSecret: process.env.UDEMY_CLIENT_SECRET || "",
			affiliateId: process.env.UDEMY_AFFILIATE_ID || "",
		};

		// construct affiliate url if affiliate id is provided
		this.affiliateBaseUrl = this.config.affiliateId ? `https://www.udemy.com/course/{courseSlug}/?referralCode=${this.config.affiliateId}` : "https://www.udemy.com/course/{courseSlug}/";
	}

	// validate configuration
	private validateConfig(): boolean {
		if (!this.config.clientId || !this.config.clientSecret) {
			console.warn("Udemy API credentials not configured. Please set UDEMY_CLIENT_ID and UDEMY_CLIENT_SECRET.");
			return false;
		}
		return true;
	}

	// get basic auth header
	private getAuthHeader(): string {
		const auth = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString("base64");
		return `Basic ${auth}`;
	}

	// search courses on udemy
	async searchCourses(query: string, options: { page?: number; pageSize?: number; category?: string; level?: string; language?: string; price?: "paid" | "free"; orderBy?: string } = {}): Promise<UdemySearchResponse> {
		if (!this.validateConfig()) {
			throw new Error("Udemy API not configured");
		}

		try {
			const params: Record<string, string | number> = {
				search: query,
				page: options.page || 1,
				page_size: options.pageSize || 20,
			};

			if (options.category) params.category = options.category;
			if (options.level) params.instructional_level = options.level;
			if (options.language) params.language = options.language;
			if (options.price) params.price = options.price;
			if (options.orderBy) params.ordering = options.orderBy;

			const response = await axios.get<UdemySearchResponse>(`${this.baseUrl}/courses/`, {
				params,
				headers: {
					Authorization: this.getAuthHeader(),
					Accept: "application/json, text/plain, */*",
				},
			});

			return response.data;
		} catch (error) {
			console.error("Udemy search error:", error);
			throw error;
		}
	}

	// get course details by id
	async getCourseDetails(courseId: number): Promise<UdemyCourse> {
		if (!this.validateConfig()) {
			throw new Error("Udemy API not configured");
		}

		try {
			const response = await axios.get<UdemyCourse>(`${this.baseUrl}/courses/${courseId}/`, {
				headers: {
					Authorization: this.getAuthHeader(),
					Accept: "application/json, text/plain, */*",
				},
			});

			return response.data;
		} catch (error) {
			console.error("Udemy course details error:", error);
			throw error;
		}
	}

	// import course into database
	async importCourse(courseId: number, skillIds: string[] = []): Promise<any> {
		try {
			// fetch course details from udemy
			const udemyCourse = await this.getCourseDetails(courseId);

			// extract course slug from url
			const courseSlug = udemyCourse.url.split("/course/")[1]?.split("/")[0] || `${courseId}`;

			// generate affiliate url
			const affiliateUrl = this.affiliateBaseUrl.replace("{courseSlug}", courseSlug);

			// map difficulty level
			const difficultyMap: Record<string, "BEGINNER" | "INTERMEDIATE" | "ADVANCED"> = {
				"All Levels": "BEGINNER",
				"Beginner": "BEGINNER",
				"Intermediate": "INTERMEDIATE",
				"Expert": "ADVANCED",
			};
			const difficulty = difficultyMap[udemyCourse.instructional_level] || "BEGINNER";

			// calculate duration in minutes
			const durationMinutes = Math.round(udemyCourse.content_length_video / 60);

			// check if course already exists
			const existingCourse = await prisma.course.findFirst({
				where: { externalId: courseId.toString() },
			});

			if (existingCourse) {
				console.log(`Course already exists: ${udemyCourse.title}`);
				return existingCourse;
			}

			// create course in database
			const course = await prisma.course.create({
				data: {
					title: udemyCourse.title,
					description: udemyCourse.headline || udemyCourse.description,
					url: affiliateUrl,
					thumbnail: udemyCourse.image_480x270,
					source: "UDEMY",
					externalId: courseId.toString(),
					provider: "Udemy",
					difficulty,
					durationMinutes,
					rating: udemyCourse.rating,
					isPaid: udemyCourse.is_paid,
					priceCents: udemyCourse.is_paid ? Math.round(udemyCourse.price_detail.amount * 100) : 0,
					language: udemyCourse.locale.simple_english_title || "en",
					// link skills if provided
					skills: {
						create: skillIds.map((skillId) => ({
							skill: { connect: { id: skillId } },
						})),
					},
				},
			});

			console.log(`Imported Udemy course: ${udemyCourse.title}`);
			return course;
		} catch (error) {
			console.error("Import course error:", error);
			throw error;
		}
	}

	// bulk import courses by search query
	async bulkImportBySearch(query: string, maxCourses: number = 20, skillIds: string[] = []): Promise<any[]> {
		try {
			// search for courses
			const searchResults = await this.searchCourses(query, {
				pageSize: Math.min(maxCourses, 100),
				orderBy: "-rating",
			});

			const imported = [];

			for (const course of searchResults.results.slice(0, maxCourses)) {
				try {
					const importedCourse = await this.importCourse(course.id, skillIds);
					imported.push(importedCourse);
					// rate limiting: wait 500ms between imports
					await new Promise((resolve) => setTimeout(resolve, 500));
				} catch (err) {
					console.error(`Failed to import course ${course.id}:`, err);
				}
			}

			return imported;
		} catch (error) {
			console.error("Bulk import error:", error);
			throw error;
		}
	}

	// sync existing udemy courses (update ratings, prices, etc.)
	async syncExistingCourses(): Promise<{ updated: number; failed: number }> {
		try {
			const udemyCourses = await prisma.course.findMany({
				where: { source: "UDEMY" },
				select: { id: true, externalId: true },
			});

			let updated = 0;
			let failed = 0;

			for (const course of udemyCourses) {
				if (!course.externalId) continue;

				try {
					const udemyCourse = await this.getCourseDetails(parseInt(course.externalId));

					await prisma.course.update({
						where: { id: course.id },
						data: {
							rating: udemyCourse.rating,
							priceCents: udemyCourse.is_paid ? Math.round(udemyCourse.price_detail.amount * 100) : 0,
							thumbnail: udemyCourse.image_480x270,
						},
					});

					updated++;
					// rate limiting
					await new Promise((resolve) => setTimeout(resolve, 500));
				} catch (err) {
					console.error(`Failed to sync course ${course.id}:`, err);
					failed++;
				}
			}

			console.log(`Synced ${updated} Udemy courses, ${failed} failed`);
			return { updated, failed };
		} catch (error) {
			console.error("Sync courses error:", error);
			throw error;
		}
	}

	// get recommendations based on skill
	async getRecommendationsBySkill(skillName: string, limit: number = 10): Promise<UdemyCourse[]> {
		try {
			const searchResults = await this.searchCourses(skillName, {
				pageSize: limit,
				orderBy: "-rating",
			});

			return searchResults.results;
		} catch (error) {
			console.error("Get recommendations error:", error);
			return [];
		}
	}
}

export const udemyService = new UdemyService();
