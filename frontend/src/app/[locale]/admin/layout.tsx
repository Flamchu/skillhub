"use client";

import React from "react";
import { useAuth } from "@/context/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, BookOpen, Target, BarChart3, Settings, Home } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

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
			router.push("/login");
		}
	}, [user, loading, router]);

	// show loading while checking auth
	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
				<div className="text-center">
					<div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-gray-600 dark:text-gray-400">Loading...</p>
				</div>
			</div>
		);
	}

	// redirect if not admin
	if (!user || user.role !== "ADMIN") {
		return null;
	}

	return (
		<div className="min-h-screen bg-bg text-fg transition-colors">
			{/* Sidebar */}
			<div className="fixed inset-y-0 left-0 z-50 w-64 bg-surface dark:bg-surface shadow-lg border-r border-border dark:border-border">
				<div className="flex h-16 items-center justify-between px-4 border-b border-border dark:border-border">
					<Link href="/" className="flex items-center space-x-3 flex-1 min-w-0">
						<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
							<span className="text-white font-bold text-sm">SH</span>
						</div>
						<div className="min-w-0">
							<div className="text-lg font-semibold text-fg truncate">SkillHub</div>
							<div className="text-xs text-fg-muted">Admin Panel</div>
						</div>
					</Link>
					<div className="flex-shrink-0 ml-2">
						<ThemeToggle />
					</div>
				</div>

				<nav className="mt-6 px-3">
					<div className="space-y-1">
						{navigation.map((item) => {
							const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

							return (
								<div key={item.name}>
									<Link href={item.href} className={`group flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-fg-muted hover:text-fg hover:bg-bg-muted"}`}>
										<item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-primary" : "text-fg-subtle group-hover:text-fg-muted"}`} />
										{item.name}
									</Link>

									{/* Submenu */}
									{item.children && isActive && (
										<div className="ml-8 mt-1 space-y-1">
											{item.children.map((child) => (
												<Link key={child.name} href={child.href} className={`block px-3 py-1 rounded-md text-sm transition-colors ${pathname === child.href ? "bg-primary/15 text-primary" : "text-fg-muted hover:text-fg hover:bg-bg-muted"}`}>
													{child.name}
												</Link>
											))}
										</div>
									)}
								</div>
							);
						})}
					</div>
				</nav>

				{/* User info */}
				<div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
					<div className="flex items-center space-x-3">
						<div className="w-8 h-8 bg-surface-alt rounded-full flex items-center justify-center">
							<span className="text-xs font-medium text-fg-muted">{user.name?.charAt(0) || user.email?.charAt(0) || "A"}</span>
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-fg truncate">{user.name || "Admin User"}</p>
							<p className="text-xs text-fg-muted truncate">{user.email}</p>
						</div>
					</div>
				</div>
			</div>

			{/* Main content */}
			<div className="pl-64">
				<main className="py-6">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 min-h-screen">
						<div className="rounded-xl border border-border bg-surface backdrop-blur-sm p-6 transition-colors">{children}</div>
					</div>
				</main>
			</div>
		</div>
	);
}
