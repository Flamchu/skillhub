"use client";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { LanguageSwitcher, ThemeToggle } from "@/components/ui";
import { useState, useEffect } from "react";
import { Menu, X, Sparkles, LogIn } from "lucide-react";

interface NavigationProps {
	className?: string;
}

export function Navigation({ className = "" }: NavigationProps) {
	const t = useTranslations("navigation");
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);

	// handle scroll effect
	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 10);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<>
			<nav
				className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
					scrolled
						? "bg-white dark:bg-gray-900 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-700/50"
						: "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
				} ${className}`}
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						{/* Logo */}
						<Link href="/" className="flex items-center gap-2 group">
							<div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary via-purple to-pink flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
								<Sparkles className="w-5 h-5 text-white" />
							</div>
							<span className="text-xl font-bold bg-linear-to-br from-primary via-purple to-pink text-transparent bg-clip-text hidden sm:block">
								SkillHub
							</span>
						</Link>

						{/* Desktop Navigation */}
						<div className="hidden md:flex items-center gap-3">
							<LanguageSwitcher />
							<ThemeToggle />
							<Link
								href="/auth"
								className="group relative px-6 py-2.5 bg-linear-to-r from-primary via-purple to-pink text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
							>
								<span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
								<span className="relative flex items-center gap-2">
									<LogIn className="w-4 h-4" />
									{t("login")} / {t("register")}
								</span>
							</Link>
						</div>

						{/* Mobile Menu Button */}
						<button
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
						>
							{mobileMenuOpen ? (
								<X className="w-6 h-6 text-gray-900 dark:text-gray-100" />
							) : (
								<Menu className="w-6 h-6 text-gray-900 dark:text-gray-100" />
							)}
						</button>
					</div>
				</div>

				{/* Mobile Menu */}
				{mobileMenuOpen && (
					<div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-xl animate-in slide-in-from-top-2 duration-200">
						<div className="px-4 py-6 space-y-4">
							<div className="flex items-center justify-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
								<LanguageSwitcher />
								<ThemeToggle />
							</div>
							<Link
								href="/auth"
								onClick={() => setMobileMenuOpen(false)}
								className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-linear-to-r from-primary via-purple to-pink text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
							>
								<LogIn className="w-4 h-4" />
								{t("login")} / {t("register")}
							</Link>
						</div>
					</div>
				)}
			</nav>

			{/* Spacer to prevent content from going under fixed navbar */}
			<div className="h-16" />
		</>
	);
}
