"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/ui";
import { ChevronLeft } from "lucide-react";

interface CourseNavigationProps {
	className?: string;
}

export function CourseNavigation({ className = "" }: CourseNavigationProps) {
	return (
		<nav className={`px-6 py-6 bg-surface/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-border ${className}`}>
			<div className="max-w-7xl mx-auto flex justify-between items-center">
				<div className="flex items-center gap-6">
					<Link
						href="/"
						className="text-3xl font-bold bg-linear-to-br from-primary via-purple to-pink text-transparent bg-clip-text hover:scale-105 transition-transform"
					>
						SkillHub ✨
					</Link>
					<Link
						href="/courses"
						className="inline-flex items-center text-sm text-foreground-muted hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-surface-hover"
					>
						<ChevronLeft className="h-4 w-4 mr-1" />
						Back to Courses
					</Link>
				</div>
				<div className="flex items-center gap-6">
					<LanguageSwitcher />
					<Link
						href="/dashboard"
						className="px-6 py-3 text-foreground-muted hover:text-foreground font-medium transition-colors rounded-lg hover:bg-surface-hover"
					>
						Dashboard
					</Link>
					<Link
						href="/auth"
						className="px-8 py-3 bg-linear-to-r from-primary to-purple text-primary-foreground rounded-sm hover:from-primary-600 hover:to-purple-600 dark:hover:from-primary-500 dark:hover:to-purple-500 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
					>
						Get Started 🚀
					</Link>
				</div>
			</div>
		</nav>
	);
}
