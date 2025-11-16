import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Profile - Manage Your Account",
	description:
		"View and edit your profile, manage your skills, track your learning activity, and access personalized recommendations.",
	robots: {
		index: false, // profile is private, shouldn't be indexed
		follow: false,
	},
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
	return children;
}
