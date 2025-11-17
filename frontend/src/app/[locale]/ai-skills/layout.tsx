import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "AI Skill Generator | SkillHub",
	description:
		"Let AI analyze your experience and goals to generate a personalized skill profile. Get instant course recommendations tailored to your skills.",
	openGraph: {
		title: "AI Skill Generator | SkillHub",
		description: "Generate personalized skills with AI and get instant course recommendations.",
	},
};

export default function AISkillsLayout({ children }: { children: React.ReactNode }) {
	return children;
}
