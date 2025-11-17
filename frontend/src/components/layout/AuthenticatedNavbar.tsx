"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { LanguageSwitcher } from "@/components/ui";
import XPBar from "@/components/social/XPBar";

export function AuthenticatedNavbar() {
	const { user, profile, logout } = useAuth();
	const router = useRouter();

	if (!user) return null;

	return (
		<nav className="fixed top-0 left-0 right-0 z-10 px-6 py-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-primary/20 dark:border-gray-700">
			<div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
				<Link
					href="/dashboard"
					className="text-2xl md:text-3xl font-bold bg-linear-to-br from-primary via-purple to-pink text-transparent bg-clip-text hover:scale-105 transition-transform shrink-0"
				>
					SkillHub ✨
				</Link>

				<div className="flex items-center gap-3 md:gap-6 flex-wrap justify-end">
					<LanguageSwitcher />

					{/* xp bar - only shows if social enabled */}
					<XPBar />

					<span className="text-gray-600 dark:text-gray-300 font-medium hidden lg:block">
						Welcome, <span className="text-primary font-semibold">{profile?.name || user?.email}</span>
					</span>

					<Link
						href="/profile"
						className="px-3 md:px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-colors rounded-lg hover:bg-gray-100/70 dark:hover:bg-gray-800"
					>
						Profile
					</Link>

					<button
						onClick={() => {
							logout();
							router.push("/");
						}}
						className="px-3 md:px-6 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-colors rounded-lg hover:bg-gray-100/70 dark:hover:bg-gray-800"
					>
						Sign Out
					</button>
				</div>
			</div>
		</nav>
	);
}
