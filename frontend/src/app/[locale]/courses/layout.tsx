import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Courses - Explore Learning Paths",
	description:
		"Browse our comprehensive catalog of courses. Filter by difficulty, source, and price. Get AI-powered recommendations tailored to your skills and interests.",
	keywords: [
		"online courses",
		"learning paths",
		"skill courses",
		"professional development",
		"course catalog",
		"youtube courses",
		"free courses",
	],
	openGraph: {
		title: "SkillHub Courses - Your Learning Journey",
		description:
			"Explore thousands of courses with personalized AI recommendations. Find the perfect course to advance your career.",
		url: "/courses",
		images: [
			{
				url: "/og-courses.png",
				width: 1200,
				height: 630,
				alt: "SkillHub Courses",
			},
		],
	},
};

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
	return children;
}
