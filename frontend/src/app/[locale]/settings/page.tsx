"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { ProfileForm } from "@/components/profile";
import { ArrowLeft, User, Bell, Lock, Globe } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [activeSection, setActiveSection] = useState("profile");

	useEffect(() => {
		if (!loading && !user) {
			router.push("/auth");
		}
	}, [user, loading, router]);

	if (loading) {
		return (
			<div className="min-h-screen bg-linear-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
					<p className="text-foreground-muted">Loading settings...</p>
				</div>
			</div>
		);
	}

	if (!user) return null;

	const sections = [
		{ id: "profile", label: "Profile", icon: User },
		{ id: "notifications", label: "Notifications", icon: Bell },
		{ id: "security", label: "Security", icon: Lock },
		{ id: "preferences", label: "Preferences", icon: Globe },
	];

	return (
		<div className="min-h-screen bg-linear-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
			{/* navigation */}
			<nav className="px-6 py-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-primary/20 dark:border-gray-700">
				<div className="max-w-7xl mx-auto flex items-center gap-4">
					<Link
						href="/profile"
						className="flex items-center gap-2 px-4 py-2 text-foreground-muted hover:text-foreground transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
						<span>Back to Profile</span>
					</Link>
					<div className="flex-1" />
					<Link
						href="/dashboard"
						className="text-3xl font-bold bg-linear-to-br from-primary via-purple to-pink text-transparent bg-clip-text hover:scale-105 transition-transform"
					>
						SkillHub ✨
					</Link>
				</div>
			</nav>

			<main className="max-w-7xl mx-auto px-6 py-8">
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-foreground mb-2">Account Settings</h1>
					<p className="text-foreground-muted">Manage your profile, preferences, and security</p>
				</div>

				<div className="grid lg:grid-cols-4 gap-6">
					{/* sidebar navigation */}
					<div className="lg:col-span-1">
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sticky top-6">
							<nav className="space-y-2">
								{sections.map(section => {
									const Icon = section.icon;
									return (
										<button
											key={section.id}
											onClick={() => setActiveSection(section.id)}
											className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
												activeSection === section.id
													? "bg-primary text-white"
													: "text-foreground-muted hover:bg-gray-100 dark:hover:bg-gray-700"
											}`}
										>
											<Icon className="w-5 h-5" />
											<span className="font-medium">{section.label}</span>
										</button>
									);
								})}
							</nav>
						</div>
					</div>

					{/* content area */}
					<div className="lg:col-span-3">
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
							{activeSection === "profile" && (
								<div>
									<h2 className="text-2xl font-bold text-foreground mb-6">Profile Information</h2>
									<ProfileForm user={user} />
								</div>
							)}

							{activeSection === "notifications" && (
								<div>
									<h2 className="text-2xl font-bold text-foreground mb-6">Notification Preferences</h2>
									<div className="space-y-4">
										<div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
											<div>
												<h4 className="font-semibold text-foreground">Course Recommendations</h4>
												<p className="text-sm text-foreground-muted">Get notified when new courses match your skills</p>
											</div>
											<input
												type="checkbox"
												defaultChecked
												className="h-5 w-5 text-primary rounded focus:ring-2 focus:ring-primary"
											/>
										</div>
										<div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
											<div>
												<h4 className="font-semibold text-foreground">Learning Reminders</h4>
												<p className="text-sm text-foreground-muted">Reminders to continue your learning progress</p>
											</div>
											<input
												type="checkbox"
												defaultChecked
												className="h-5 w-5 text-primary rounded focus:ring-2 focus:ring-primary"
											/>
										</div>
										<div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
											<div>
												<h4 className="font-semibold text-foreground">Weekly Summary</h4>
												<p className="text-sm text-foreground-muted">Weekly email with your learning progress</p>
											</div>
											<input type="checkbox" className="h-5 w-5 text-primary rounded focus:ring-2 focus:ring-primary" />
										</div>
									</div>
								</div>
							)}

							{activeSection === "security" && (
								<div>
									<h2 className="text-2xl font-bold text-foreground mb-6">Security Settings</h2>
									<div className="space-y-6">
										<div>
											<h4 className="font-semibold text-foreground mb-2">Password</h4>
											<p className="text-sm text-foreground-muted mb-4">
												Change your password to keep your account secure
											</p>
											<button className="px-4 py-2 bg-primary text-white rounded-lg hover:shadow-lg transition-all">
												Change Password
											</button>
										</div>
										<div className="pt-6 border-t border-gray-200 dark:border-gray-700">
											<h4 className="font-semibold text-foreground mb-2">Two-Factor Authentication</h4>
											<p className="text-sm text-foreground-muted mb-4">
												Add an extra layer of security to your account
											</p>
											<button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-foreground rounded-lg hover:shadow-lg transition-all">
												Enable 2FA
											</button>
										</div>
									</div>
								</div>
							)}

							{activeSection === "preferences" && (
								<div>
									<h2 className="text-2xl font-bold text-foreground mb-6">Preferences</h2>
									<div className="space-y-6">
										<div>
											<h4 className="font-semibold text-foreground mb-2">Language</h4>
											<select className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 text-foreground border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary">
												<option>English</option>
												<option>Spanish</option>
												<option>French</option>
												<option>German</option>
											</select>
										</div>
										<div>
											<h4 className="font-semibold text-foreground mb-2">Time Zone</h4>
											<select className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 text-foreground border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary">
												<option>UTC (Coordinated Universal Time)</option>
												<option>EST (Eastern Standard Time)</option>
												<option>PST (Pacific Standard Time)</option>
												<option>GMT (Greenwich Mean Time)</option>
											</select>
										</div>
										<div>
											<h4 className="font-semibold text-foreground mb-2">Theme</h4>
											<div className="flex gap-4">
												<button className="flex-1 p-4 bg-gray-50 dark:bg-gray-700 border-2 border-primary text-foreground rounded-lg hover:shadow-lg transition-all">
													System
												</button>
												<button className="flex-1 p-4 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-foreground rounded-lg hover:shadow-lg transition-all">
													Light
												</button>
												<button className="flex-1 p-4 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-foreground rounded-lg hover:shadow-lg transition-all">
													Dark
												</button>
											</div>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
