import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Skills - Track Your Professional Growth",
	description:
		"Manage your skills profile, add new skills with AI assistance, and track your learning progress. Showcase your expertise and discover skill verification opportunities.",
	keywords: [
		"skill management",
		"professional skills",
		"skill tracking",
		"skill verification",
		"career development",
		"skill profile",
		"AI skill suggestions",
	],
	openGraph: {
		title: "SkillHub Skills - Build Your Professional Profile",
		description:
			"Track and showcase your professional skills. Get AI-powered skill suggestions and verification opportunities.",
		url: "/skills",
		images: [
			{
				url: "/og-skills.png",
				width: 1200,
				height: 630,
				alt: "SkillHub Skills Management",
			},
		],
	},
};

export default function SkillsLayout({ children }: { children: React.ReactNode }) {
	return children;
}
