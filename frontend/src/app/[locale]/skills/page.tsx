"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";
import { LanguageSwitcher } from "@/components/ui";
import { SkillsContent } from "@/components/skills";

export default function SkillsPage() {
	const { user, profile, loading, logout } = useAuth();
	const router = useRouter();

	useEffect(() => {
		// add a small delay to let authprovider settle after login redirect
		const timer = setTimeout(() => {
			if (!loading && !user) {
				router.push("/auth");
			}
		}, 200);

		// if we have a user, clear the timer
		if (user) {
			clearTimeout(timer);
		}

		return () => clearTimeout(timer);
	}, [user, loading, router]);

	if (!user) {
		return null; // will redirect
	}

	return (
		<div className="min-h-screen bg-linear-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100">
			{/* Navigation */}
			<nav className="fixed top-0 left-0 right-0 z-10 px-6 py-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-primary/20 dark:border-gray-700">
				<div className="max-w-7xl mx-auto flex justify-between items-center">
					<Link
						href="/"
						className="text-3xl font-bold bg-linear-to-br from-primary via-purple to-pink text-transparent bg-clip-text hover:scale-105 transition-transform"
					>
						SkillHub ✨
					</Link>
					<div className="flex items-center gap-6">
						<LanguageSwitcher />
						<span className="text-gray-600 dark:text-gray-300 font-medium">
							Welcome, <span className="text-primary font-semibold">{profile?.name || user?.email}</span>
						</span>
						<button
							onClick={() => {
								logout();
								router.push("/");
							}}
							className="px-6 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-colors rounded-lg hover:bg-gray-100/70 dark:hover:bg-gray-800"
						>
							Sign Out
						</button>
					</div>
				</div>
			</nav>
			<SkillsContent />
		</div>
	);
}
