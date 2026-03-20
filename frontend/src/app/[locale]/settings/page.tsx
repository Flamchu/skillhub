"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthProvider";
import { ProfileForm } from "@/components/profile";
import { AuthenticatedLayout } from "@/components/layout";
import { LanguageSwitcher, ThemeToggle } from "@/components/ui";
import { ArrowLeft, User, Bell, Lock, Globe } from "lucide-react";

export default function SettingsPage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const t = useTranslations("settings.page");
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
					<p className="text-foreground-muted">{t("loading")}</p>
				</div>
			</div>
		);
	}

	if (!user) return null;

	const sections = [
		{ id: "profile", label: t("sections.profile"), icon: User },
		{ id: "notifications", label: t("sections.notifications"), icon: Bell },
		{ id: "security", label: t("sections.security"), icon: Lock },
		{ id: "preferences", label: t("sections.preferences"), icon: Globe },
	];

	return (
		<AuthenticatedLayout>
			<div className="min-h-screen bg-linear-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
				<main className="max-w-7xl mx-auto px-6 py-8">
					<div className="mb-8 flex items-center gap-4">
						<Link
							href="/profile"
							className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50"
						>
							<ArrowLeft className="w-4 h-4" />
							<span>{t("backToProfile")}</span>
						</Link>
						<div className="flex-1">
							<h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t("title")}</h1>
							<p className="text-gray-600 dark:text-gray-400">{t("description")}</p>
						</div>
					</div>

					<div className="grid lg:grid-cols-4 gap-6">
						<div className="lg:col-span-1">
							<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sticky top-24">
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
														: "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
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

						<div className="lg:col-span-3">
							<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
								{activeSection === "profile" && (
									<div>
										<h2 className="text-2xl font-bold text-foreground mb-6">{t("profile.title")}</h2>
										<ProfileForm user={user} />
									</div>
								)}

								{activeSection === "notifications" && (
									<div>
										<h2 className="text-2xl font-bold text-foreground mb-6">{t("notifications.title")}</h2>
										<div className="space-y-4">
											<div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
												<div>
													<h4 className="font-semibold text-foreground">{t("notifications.items.recommendations.title")}</h4>
													<p className="text-sm text-foreground-muted">
														{t("notifications.items.recommendations.description")}
													</p>
												</div>
												<input
													type="checkbox"
													defaultChecked
													className="h-5 w-5 text-primary rounded focus:ring-2 focus:ring-primary"
												/>
											</div>
											<div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
												<div>
													<h4 className="font-semibold text-foreground">{t("notifications.items.reminders.title")}</h4>
													<p className="text-sm text-foreground-muted">
														{t("notifications.items.reminders.description")}
													</p>
												</div>
												<input
													type="checkbox"
													defaultChecked
													className="h-5 w-5 text-primary rounded focus:ring-2 focus:ring-primary"
												/>
											</div>
											<div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
												<div>
													<h4 className="font-semibold text-foreground">{t("notifications.items.summary.title")}</h4>
													<p className="text-sm text-foreground-muted">
														{t("notifications.items.summary.description")}
													</p>
												</div>
												<input
													type="checkbox"
													className="h-5 w-5 text-primary rounded focus:ring-2 focus:ring-primary"
												/>
											</div>
										</div>
									</div>
								)}

								{activeSection === "security" && (
									<div>
										<h2 className="text-2xl font-bold text-foreground mb-6">{t("security.title")}</h2>
										<div className="space-y-6">
											<div>
												<h4 className="font-semibold text-foreground mb-2">{t("security.password.title")}</h4>
												<p className="text-sm text-foreground-muted mb-4">{t("security.password.description")}</p>
												<button className="px-4 py-2 bg-primary text-white rounded-lg hover:shadow-lg transition-all">
													{t("security.password.action")}
												</button>
											</div>
											<div className="pt-6 border-t border-gray-200 dark:border-gray-700">
												<h4 className="font-semibold text-foreground mb-2">{t("security.twoFactor.title")}</h4>
												<p className="text-sm text-foreground-muted mb-4">{t("security.twoFactor.description")}</p>
												<button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-foreground rounded-lg hover:shadow-lg transition-all">
													{t("security.twoFactor.action")}
												</button>
											</div>
										</div>
									</div>
								)}

								{activeSection === "preferences" && (
									<div>
										<h2 className="text-2xl font-bold text-foreground mb-6">{t("preferences.title")}</h2>
										<div className="space-y-6">
											<div>
												<h4 className="font-semibold text-foreground mb-2">{t("preferences.language.title")}</h4>
												<div className="w-full max-w-xs">
													<LanguageSwitcher />
												</div>
											</div>
											<div>
												<h4 className="font-semibold text-foreground mb-2">{t("preferences.timezone.title")}</h4>
												<select className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 text-foreground border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary">
													<option>{t("preferences.timezone.options.utc")}</option>
													<option>{t("preferences.timezone.options.est")}</option>
													<option>{t("preferences.timezone.options.pst")}</option>
													<option>{t("preferences.timezone.options.gmt")}</option>
												</select>
											</div>
											<div>
												<h4 className="font-semibold text-foreground mb-2">{t("preferences.theme.title")}</h4>
												<div className="w-full max-w-xs">
													<ThemeToggle />
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
		</AuthenticatedLayout>
	);
}
