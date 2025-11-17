import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Dashboard - Your Learning Hub",
	description:
		"Access your personalized learning dashboard. View enrolled courses, track progress, manage skills, and get AI-powered recommendations.",
	robots: {
		index: false, // dashboard is private, shouldn't be indexed
		follow: false,
	},
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return children;
}
