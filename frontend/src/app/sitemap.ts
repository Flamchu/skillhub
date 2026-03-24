import type { MetadataRoute } from "next";
import { locales } from "@/i18n";
import { getServerBackendUrl } from "@/lib/backend-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

	// static routes
	const routes: MetadataRoute.Sitemap = [
		{
			url: `${baseUrl}`,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 1.0,
		},
		...locales.flatMap(locale => [
			{
				url: `${baseUrl}/${locale}`,
				lastModified: new Date(),
				changeFrequency: "daily" as const,
				priority: 1.0,
			},
			{
				url: `${baseUrl}/${locale}/courses`,
				lastModified: new Date(),
				changeFrequency: "hourly" as const,
				priority: 0.9,
			},
			{
				url: `${baseUrl}/${locale}/skills`,
				lastModified: new Date(),
				changeFrequency: "hourly" as const,
				priority: 0.8,
			},
		]),
	];

	// optionally fetch dynamic routes from api
	// example: courses and skills
	const backendUrl = getServerBackendUrl();

	try {
		// fetch courses
		const coursesResponse = await fetch(`${backendUrl}/courses?limit=100`, {
			next: { revalidate: 3600 }, // revalidate every hour
		});

		if (coursesResponse.ok) {
			const coursesData = await coursesResponse.json();
			const courses = coursesData.courses || [];

			courses.forEach((course: { id: string; updatedAt?: string }) => {
				locales.forEach(locale => {
					routes.push({
						url: `${baseUrl}/${locale}/courses/${course.id}`,
						lastModified: course.updatedAt ? new Date(course.updatedAt) : new Date(),
						changeFrequency: "daily",
						priority: 0.7,
					});
				});
			});
		}
	} catch {
		// skip dynamic routes when the backend is unavailable during build
	}

	return routes;
}
