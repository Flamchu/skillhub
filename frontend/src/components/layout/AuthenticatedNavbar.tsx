"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { LanguageSwitcher, ThemeToggle } from "@/components/ui";
import XPBar from "@/components/social/XPBar";
import { useState, useEffect } from "react";
import { Menu, X, LayoutDashboard, Target, BookOpen, Users, User, LogOut, Crown, ChevronDown } from "lucide-react";

export function AuthenticatedNavbar() {
	const { user, profile, logout } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [userDropdownOpen, setUserDropdownOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);

	// handle scroll effect
	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 10);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// close dropdowns when clicking outside
	useEffect(() => {
		const handleClickOutside = () => {
			setUserDropdownOpen(false);
		};
		if (userDropdownOpen) {
			document.addEventListener("click", handleClickOutside);
			return () => document.removeEventListener("click", handleClickOutside);
		}
	}, [userDropdownOpen]);

	if (!user) return null;

	const navLinks = [
		{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
		{ href: "/skills", label: "Skills", icon: Target },
		{ href: "/courses", label: "Courses", icon: BookOpen },
		...(user.socialEnabled ? [{ href: "/social", label: "Social", icon: Users }] : []),
	];

	const isActive = (href: string) => {
		// check if current path starts with the href
		return pathname?.startsWith(href) ?? false;
	};

	const handleLogout = () => {
		logout();
		router.push("/");
	};

	const UserAvatar = () => (
		<div className="w-9 h-9 rounded-full bg-linear-to-br from-primary via-purple to-pink flex items-center justify-center text-white font-semibold text-sm shadow-lg ring-2 ring-white/20 dark:ring-gray-700/50">
			{profile?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
		</div>
	);

	return (
		<>
			<nav
				className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
					scrolled
						? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-700/50"
						: "bg-transparent backdrop-blur-sm"
				}`}
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						{/* Logo */}
						<Link href="/dashboard" className="flex items-center gap-2 group">
							<div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary via-purple to-pink flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
								<span className="text-white font-bold text-lg">S</span>
							</div>
							<span className="text-xl font-bold bg-linear-to-br from-primary via-purple to-pink text-transparent bg-clip-text hidden sm:block">
								SkillHub
							</span>
						</Link>

						{/* Desktop Navigation */}
						<div className="hidden lg:flex items-center gap-1">
							{navLinks.map(link => {
								const Icon = link.icon;
								const active = isActive(link.href);
								return (
									<Link
										key={link.href}
										href={link.href}
										className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
											active
												? "bg-linear-to-br from-primary/10 to-purple/10 text-primary dark:text-primary-400 shadow-sm"
												: "text-gray-600 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-gray-800/70 hover:text-gray-900 dark:hover:text-white"
										}`}
									>
										<Icon className={`w-4 h-4 ${active ? "text-primary" : ""}`} />
										<span>{link.label}</span>
									</Link>
								);
							})}
						</div>

						{/* Right Section */}
						<div className="flex items-center gap-3">
							{/* XP Bar - Desktop */}
							<div className="hidden xl:block">
								<XPBar />
							</div>

							{/* Language Switcher */}
							<div className="hidden md:block">
								<LanguageSwitcher />
							</div>

							{/* User Menu - Desktop */}
							<div className="hidden lg:block relative">
								<button
									onClick={e => {
										e.stopPropagation();
										setUserDropdownOpen(!userDropdownOpen);
									}}
									className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100/70 dark:hover:bg-gray-800/70 transition-all duration-200 group"
								>
									<UserAvatar />
									<div className="hidden xl:flex flex-col items-start">
										<span className="text-sm font-semibold text-gray-900 dark:text-white">
											{profile?.name || "User"}
										</span>
										<span className="text-xs text-gray-500 dark:text-gray-400">
											{user.role === "ADMIN" && "Admin"}
											{user.role === "INSTRUCTOR" && "Instructor"}
											{user.role === "USER" && "Member"}
										</span>
									</div>
									<ChevronDown
										className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${userDropdownOpen ? "rotate-180" : ""}`}
									/>
								</button>

								{/* Dropdown Menu */}
								{userDropdownOpen && (
									<div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
										{/* User Info */}
										<div className="p-4 border-b border-gray-100 dark:border-gray-700/50 bg-linear-to-br from-primary/5 to-purple/5 dark:from-primary/10 dark:to-purple/10">
											<div className="flex items-center gap-3 mb-2">
												<UserAvatar />
												<div className="flex-1 min-w-0">
													<p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
														{profile?.name || "User"}
													</p>
													<p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
												</div>
											</div>
											{user.role === "ADMIN" && (
												<div className="flex items-center gap-1.5 px-2 py-1 bg-linear-to-br from-yellow-400/20 to-orange-400/20 dark:from-yellow-400/30 dark:to-orange-400/30 rounded-lg w-fit">
													<Crown className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
													<span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">
														Admin Access
													</span>
												</div>
											)}
										</div>

										{/* Menu Items */}
										<div className="p-2">
											<Link
												href="/profile"
												onClick={() => setUserDropdownOpen(false)}
												className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-150"
											>
												<User className="w-4 h-4" />
												<span className="text-sm font-medium">Profile Settings</span>
											</Link>

											{user.role === "ADMIN" && (
												<Link
													href="/admin"
													onClick={() => setUserDropdownOpen(false)}
													className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-150"
												>
													<Crown className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
													<span className="text-sm font-medium">Admin Panel</span>
												</Link>
											)}

											<button
												onClick={handleLogout}
												className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
											>
												<LogOut className="w-4 h-4" />
												<span className="text-sm font-medium">Sign Out</span>
											</button>
										</div>
									</div>
								)}
							</div>

							{/* Mobile Menu Button */}
							<button
								onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
								className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-gray-800/70 transition-colors"
							>
								{mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
							</button>
						</div>
					</div>
				</div>
			</nav>

			{/* Mobile Menu */}
			{mobileMenuOpen && (
				<div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
					<div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl animate-in slide-in-from-right duration-300">
						<div className="flex flex-col h-full">
							{/* Mobile Header */}
							<div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
								<div className="flex items-center gap-3">
									<UserAvatar />
									<div>
										<p className="text-sm font-semibold text-gray-900 dark:text-white">{profile?.name || "User"}</p>
										<p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
									</div>
								</div>
								<button
									onClick={() => setMobileMenuOpen(false)}
									className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
								>
									<X className="w-5 h-5" />
								</button>
							</div>

							{/* Mobile XP Bar */}
							{user.socialEnabled && (
								<div className="p-4 border-b border-gray-200 dark:border-gray-700">
									<XPBar />
								</div>
							)}

							{/* Mobile Navigation Links */}
							<div className="flex-1 overflow-y-auto p-4 space-y-2">
								{navLinks.map(link => {
									const Icon = link.icon;
									const active = isActive(link.href);
									return (
										<Link
											key={link.href}
											href={link.href}
											onClick={() => setMobileMenuOpen(false)}
											className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
												active
													? "bg-linear-to-br from-primary/10 to-purple/10 text-primary dark:text-primary-400 shadow-sm"
													: "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
											}`}
										>
											<Icon className={`w-5 h-5 ${active ? "text-primary" : ""}`} />
											<span>{link.label}</span>
										</Link>
									);
								})}

								<Link
									href="/profile"
									onClick={() => setMobileMenuOpen(false)}
									className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-all duration-200"
								>
									<User className="w-5 h-5" />
									<span>Profile Settings</span>
								</Link>

								{user.role === "ADMIN" && (
									<Link
										href="/admin"
										onClick={() => setMobileMenuOpen(false)}
										className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-all duration-200"
									>
										<Crown className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
										<span>Admin Panel</span>
									</Link>
								)}
							</div>

							{/* Mobile Footer */}
							<div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
								<div className="px-2">
									<LanguageSwitcher />
								</div>
								<button
									onClick={handleLogout}
									className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-linear-to-br from-red-500 to-red-600 text-white font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
								>
									<LogOut className="w-5 h-5" />
									<span>Sign Out</span>
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Fixed Theme Toggle - Far Right */}
			<div className="fixed top-4 right-4 z-50">
				<ThemeToggle />
			</div>
		</>
	);
}
