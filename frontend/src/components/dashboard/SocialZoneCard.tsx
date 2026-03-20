"use client";

import { useAuth } from "@/context/AuthProvider";
import { useRouter } from "next/navigation";
import { Trophy, Zap, Target, User, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

export default function SocialZoneCard() {
	const { user } = useAuth();
	const router = useRouter();
	const t = useTranslations("dashboard.socialZone");

	// only show if user has social enabled
	if (!user?.socialEnabled) {
		return null;
	}

	return (
		<div className="bg-linear-to-br from-primary/5 via-purple/5 to-pink/5 border border-primary/20 rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
			<div className="flex items-center gap-2 mb-2">
				<Sparkles className="w-6 h-6 text-primary" />
				<h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t("title")}</h3>
			</div>
			<p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{t("description")}</p>
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
				<button
					onClick={() => router.push("/social?tab=dashboard")}
					className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-lg border border-primary/10 hover:border-primary/30 hover:shadow-md transition-all group"
				>
					<div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
						<Zap className="w-5 h-5 text-primary" />
					</div>
					<span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("tabs.dashboard")}</span>
				</button>

				<button
					onClick={() => router.push("/social?tab=leaderboard")}
					className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-lg border border-orange-500/10 hover:border-orange-500/30 hover:shadow-md transition-all group"
				>
					<div className="p-2 bg-orange-500/10 rounded-lg group-hover:scale-110 transition-transform">
						<Trophy className="w-5 h-5 text-orange-500" />
					</div>
					<span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("tabs.leaderboard")}</span>
				</button>

				<button
					onClick={() => router.push("/social?tab=quests")}
					className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple/10 hover:border-purple/30 hover:shadow-md transition-all group"
				>
					<div className="p-2 bg-purple/10 rounded-lg group-hover:scale-110 transition-transform">
						<Target className="w-5 h-5 text-purple" />
					</div>
					<span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("tabs.quests")}</span>
				</button>

				<button
					onClick={() => router.push("/social?tab=profile")}
					className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-lg border border-pink/10 hover:border-pink/30 hover:shadow-md transition-all group"
				>
					<div className="p-2 bg-pink/10 rounded-lg group-hover:scale-110 transition-transform">
						<User className="w-5 h-5 text-pink" />
					</div>
					<span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("tabs.profile")}</span>
				</button>
			</div>

			<div className="mt-4 pt-4 border-t border-primary/10">
				<button
					onClick={() => router.push("/social")}
					className="w-full px-4 py-2 bg-linear-to-r from-primary to-purple text-white font-medium rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all"
				>
					{t("cta")} →
				</button>
			</div>
		</div>
	);
}
