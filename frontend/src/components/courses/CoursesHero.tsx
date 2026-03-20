"use client";

import { useTranslations } from "next-intl";

export function CoursesHero() {
	const t = useTranslations("courses.hero");

	return (
		<div className="text-center mb-20">
			<div className="mb-6">
				<span className="inline-flex items-center px-4 py-2 bg-linear-to-r from-success-50 to-info-50 dark:from-success-900/20 dark:to-info-900/20 text-success dark:text-success-400 rounded-full text-sm font-semibold border border-success/30 dark:border-success-400/30">
					{t("badge")}
				</span>
			</div>
			<h1 className="text-5xl md:text-6xl font-bold mb-6">
				<span className="bg-linear-to-br from-primary via-purple to-pink text-transparent bg-clip-text">
					{t("title")}
				</span>
				<br />
				<span className="text-gray-900 dark:text-gray-100 text-3xl md:text-4xl">{t("subtitle")}</span>
			</h1>
			<p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
				{t("description")}
			</p>
		</div>
	);
}
