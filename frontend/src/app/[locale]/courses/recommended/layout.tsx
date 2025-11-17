import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "AI Recommendations - Personalized Course Suggestions",
	description:
		"Get AI-powered course recommendations tailored to your skills and learning goals. Our intelligent algorithm matches you with the perfect courses.",
	robots: {
		index: false, // recommendations are personalized per user
		follow: false,
	},
};

export default function RecommendedLayout({ children }: { children: React.ReactNode }) {
	return children;
}
