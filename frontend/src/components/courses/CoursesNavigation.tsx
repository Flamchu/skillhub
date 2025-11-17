"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/ui";

interface CoursesNavigationProps {
	className?: string;
}

export function CoursesNavigation({ className = "" }: CoursesNavigationProps) {
	return (
		<nav className={`px-6 py-6 bg-surface/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-border ${className}`}>
			<div className="max-w-7xl mx-auto flex justify-between items-center">
				<Link
					href="/"
					className="text-3xl font-bold bg-linear-to-br from-primary via-purple to-pink text-transparent bg-clip-text hover:scale-105 transition-transform"
				>
					SkillHub ✨
				</Link>
				<div className="flex items-center gap-4">
					<LanguageSwitcher />
					<Link
						href="/dashboard"
						className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-colors rounded-lg hover:bg-gray-100/70 dark:hover:bg-gray-800"
					>
						Dashboard
					</Link>
					<Link
						href="/courses/recommended"
						className="px-4 py-2 bg-linear-to-r from-primary/10 to-purple/10 text-primary hover:from-primary/20 hover:to-purple/20 font-medium transition-colors rounded-lg border border-primary/20 flex items-center space-x-2"
					>
						<span>🎯</span>
						<span>My Recommendations</span>
					</Link>
					<Link
						href="/auth"
						className="px-6 py-3 bg-linear-to-r from-primary to-purple text-primary-foreground rounded-lg hover:from-primary-600 hover:to-purple-600 dark:hover:from-primary-500 dark:hover:to-purple-500 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
					>
						Get Started 🚀
					</Link>
				</div>
			</div>
		</nav>
	);
}
