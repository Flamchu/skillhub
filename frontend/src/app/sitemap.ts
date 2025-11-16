import type { MetadataRoute } from "next";

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
		{
			url: `${baseUrl}/en`,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 1.0,
		},
		{
			url: `${baseUrl}/ar`,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 1.0,
		},
		{
			url: `${baseUrl}/en/courses`,
			lastModified: new Date(),
			changeFrequency: "hourly",
			priority: 0.9,
		},
		{
			url: `${baseUrl}/ar/courses`,
			lastModified: new Date(),
			changeFrequency: "hourly",
			priority: 0.9,
		},
		{
			url: `${baseUrl}/en/skills`,
			lastModified: new Date(),
			changeFrequency: "hourly",
			priority: 0.8,
		},
		{
			url: `${baseUrl}/ar/skills`,
			lastModified: new Date(),
			changeFrequency: "hourly",
			priority: 0.8,
		},
	];

	// optionally fetch dynamic routes from api
	// example: courses and skills
	try {
		const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api";

		// fetch courses
		const coursesResponse = await fetch(`${backendUrl}/courses?limit=100`, {
			next: { revalidate: 3600 }, // revalidate every hour
		});

		if (coursesResponse.ok) {
			const coursesData = await coursesResponse.json();
			const courses = coursesData.courses || [];

			courses.forEach((course: { id: string; updatedAt?: string }) => {
				routes.push({
					url: `${baseUrl}/en/courses/${course.id}`,
					lastModified: course.updatedAt ? new Date(course.updatedAt) : new Date(),
					changeFrequency: "daily",
					priority: 0.7,
				});
				routes.push({
					url: `${baseUrl}/ar/courses/${course.id}`,
					lastModified: course.updatedAt ? new Date(course.updatedAt) : new Date(),
					changeFrequency: "daily",
					priority: 0.7,
				});
			});
		}
	} catch (error) {
		console.error("Failed to fetch dynamic routes for sitemap:", error);
	}

	return routes;
}
