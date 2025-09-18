"use client";

import React from "react";
import { useAuth } from "@/context/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, BookOpen, Target, BarChart3, Settings, Home } from "lucide-react";
import { LanguageSwitcher } from "@/components/ui";

const navigation = [
	{
		name: "Dashboard",
		href: "/admin",
		icon: Home,
	},
	{
		name: "Users",
		href: "/admin/users",
		icon: Users,
	},
	{
		name: "Courses",
		href: "/admin/courses",
		icon: BookOpen,
		children: [
			{ name: "All Courses", href: "/admin/courses" },
			{ name: "Add Course", href: "/admin/courses/new" },
		],
	},
	{
		name: "Skills",
		href: "/admin/skills",
		icon: Target,
		children: [
			{ name: "All Skills", href: "/admin/skills" },
			{ name: "Add Skill", href: "/admin/skills" },
		],
	},
	{
		name: "Analytics",
		href: "/admin/analytics",
		icon: BarChart3,
	},
	{
		name: "Settings",
		href: "/admin/settings",
		icon: Settings,
	},
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	const { user, loading } = useAuth();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (!loading && (!user || user.role !== "ADMIN")) {
			router.push("/auth");
		}
	}, [user, loading, router]);

	// show loading while checking auth
	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
					<p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Loading Admin Panel...</p>
				</div>
			</div>
		);
	}

	// redirect if not admin
	if (!user || user.role !== "ADMIN") {
		return null;
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
			{/* Navigation */}
			<nav className="px-6 py-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-primary/20 dark:border-gray-700">
				<div className="max-w-7xl mx-auto flex justify-between items-center">
					<Link
						href="/"
						className="text-3xl font-bold bg-gradient-to-br from-primary via-purple to-pink text-transparent bg-clip-text hover:scale-105 transition-transform"
					>
						SkillHub ✨
					</Link>
					<div className="flex items-center gap-6">
						<span className="text-sm font-medium text-gray-600 dark:text-gray-300 bg-gradient-to-r from-warning/20 to-pink/20 px-3 py-1 rounded-full border border-warning/30">
							Admin Panel
						</span>
						<LanguageSwitcher />
						<Link
							href="/dashboard"
							className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-colors rounded-lg hover:bg-gray-100/70 dark:hover:bg-gray-800"
						>
							Back to Dashboard
						</Link>
					</div>
				</div>
			</nav>

			{/* Sidebar Navigation */}
			<div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
				<div className="w-64 flex-shrink-0">
					<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-primary/20 dark:border-gray-700 rounded-2xl p-6 shadow-xl sticky top-24">
						<div className="space-y-2">
							{navigation.map(item => {
								const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

								return (
									<div key={item.name}>
										<Link
											href={item.href}
											className={`group flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
												isActive
													? "bg-gradient-to-r from-primary to-purple text-white shadow-lg transform scale-105"
													: "text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 hover:scale-105"
											}`}
										>
											<item.icon className="mr-3 h-5 w-5" />
											{item.name}
										</Link>

										{/* Submenu */}
										{item.children && isActive && (
											<div className="ml-6 mt-2 space-y-1">
												{item.children.map(child => (
													<Link
														key={child.name}
														href={child.href}
														className={`block px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
															pathname === child.href
																? "bg-primary/20 text-primary font-semibold"
																: "text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20"
														}`}
													>
														{child.name}
													</Link>
												))}
											</div>
										)}
									</div>
								);
							})}
						</div>

						{/* User info */}
						<div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
							<div className="flex items-center space-x-3">
								<div className="w-10 h-10 bg-gradient-to-br from-primary to-purple rounded-xl flex items-center justify-center shadow-lg">
									<span className="text-white font-bold text-sm">
										{user.name?.charAt(0) || user.email?.charAt(0) || "A"}
									</span>
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
										{user.name || "Admin User"}
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Main content */}
				<div className="flex-1">
					<div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-primary/20 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden">
						{children}
					</div>
				</div>
			</div>
		</div>
	);
}
