"use client";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { LanguageSwitcher, ThemeToggle } from "@/components/ui";

interface NavigationProps {
	className?: string;
}

export function Navigation({ className = "" }: NavigationProps) {
	const t = useTranslations("navigation");

	return (
		<>
			<nav
				className={`px-6 py-6 bg-surface/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-border dark:border-gray-700 ${className}`}
			>
				<div className="max-w-7xl mx-auto flex justify-between items-center">
					<h1 className="text-3xl font-bold bg-gradient-to-br from-primary via-purple to-pink text-transparent bg-clip-text">
						SkillHub ✨
					</h1>
					<div className="flex items-center gap-4">
						<LanguageSwitcher />
						<Link
							href="/auth"
							className="px-8 py-3 bg-gradient-to-r from-primary to-purple text-primary-foreground rounded-sm hover:from-primary-600 hover:to-purple-600 dark:hover:from-primary-500 dark:hover:to-purple-500 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
						>
							{t("login")} / {t("register")} 🚀
						</Link>
					</div>
				</div>
			</nav>

			{/* Fixed Theme Toggle - Far Right, Centered in Navbar Height */}
			<div className="fixed top-0 right-4 h-[72px] flex items-center z-50">
				<ThemeToggle />
			</div>
		</>
	);
}
