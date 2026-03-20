"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

export function AIWorkflowPrompt() {
	const [isExpanded, setIsExpanded] = useState(false);
	const t = useTranslations("dashboard.aiWorkflow");

	return (
		<div className="relative overflow-hidden rounded-2xl border-2 border-primary/30 dark:border-primary/40 bg-linear-to-br from-primary/5 via-purple/5 to-pink/5 dark:from-primary/10 dark:via-purple/10 dark:to-pink/10 hover:shadow-xl transition-all duration-300">
			{/* Decorative background elements */}
			<div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-primary/10 to-purple/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
			<div
				className="absolute bottom-0 left-0 w-48 h-48 bg-linear-to-br from-purple/10 to-pink/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse"
				style={{ animationDelay: "1s" }}
			/>

			<div className="relative p-8">
				{/* Header */}
				<div className="flex items-start justify-between mb-6">
					<div className="flex items-center space-x-3">
						<div className="w-14 h-14 bg-linear-to-br from-primary to-purple rounded-xl flex items-center justify-center shadow-xl">
							<Sparkles className="w-7 h-7 text-white" />
						</div>
						<div>
							<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t("title")}</h2>
							<p className="text-sm text-gray-600 dark:text-gray-300">{t("subtitle")}</p>
						</div>
					</div>
					<button
						onClick={() => setIsExpanded(!isExpanded)}
						className="text-sm text-primary hover:text-primary-600 font-bold hover:scale-105 active:scale-95 transition-all duration-300 px-4 py-2 rounded-lg hover:bg-primary/10"
					>
						{isExpanded ? t("showLess") : t("learnMore")}
					</button>
				</div>

				{/* Main content */}
				<div className="space-y-4">
					<p className="text-gray-700 dark:text-gray-200 text-lg font-medium">{t("description")}</p>

					{/* Workflow steps - always visible */}
					<div className="grid md:grid-cols-3 gap-4 mt-6">
						<div className="group relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-5 border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-primary/40 dark:hover:border-primary/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
							<div className="absolute -top-3 -left-3 w-8 h-8 bg-linear-to-br from-primary to-purple rounded-full flex items-center justify-center text-white font-bold shadow-xl group-hover:scale-110 transition-transform">
								1
							</div>
							<div className="flex items-center space-x-2 mb-2">
								<Sparkles className="w-5 h-5 text-primary group-hover:rotate-12 transition-transform" />
								<h3 className="font-bold text-gray-900 dark:text-gray-100">{t("steps.generate.title")}</h3>
							</div>
							<p className="text-sm text-gray-600 dark:text-gray-300">{t("steps.generate.description")}</p>
						</div>

						<div className="group relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-5 border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-purple/40 dark:hover:border-purple/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
							<div className="absolute -top-3 -left-3 w-8 h-8 bg-linear-to-br from-purple to-pink rounded-full flex items-center justify-center text-white font-bold shadow-xl group-hover:scale-110 transition-transform">
								2
							</div>
							<div className="flex items-center space-x-2 mb-2">
								<Zap className="w-5 h-5 text-purple group-hover:scale-110 transition-transform" />
								<h3 className="font-bold text-gray-900 dark:text-gray-100">{t("steps.recommend.title")}</h3>
							</div>
							<p className="text-sm text-gray-600 dark:text-gray-300">{t("steps.recommend.description")}</p>
						</div>

						<div className="group relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-5 border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-success/40 dark:hover:border-success/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
							<div className="absolute -top-3 -left-3 w-8 h-8 bg-linear-to-br from-success to-info rounded-full flex items-center justify-center text-white font-bold shadow-xl group-hover:scale-110 transition-transform">
								3
							</div>
							<div className="flex items-center space-x-2 mb-2">
								<ArrowRight className="w-5 h-5 text-success group-hover:translate-x-1 transition-transform" />
								<h3 className="font-bold text-gray-900 dark:text-gray-100">{t("steps.learn.title")}</h3>
							</div>
							<p className="text-sm text-gray-600 dark:text-gray-300">{t("steps.learn.description")}</p>
						</div>
					</div>

					{/* Expanded content */}
					{isExpanded && (
						<div className="mt-6 p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border-2 border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-4 duration-300">
							<h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3">{t("howItWorks.title")}</h4>
							<ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
								<li className="flex items-start">
									<span className="text-primary mr-2 font-bold">•</span>
									<span>
										<strong>{t("howItWorks.items.detection.label")}</strong> {t("howItWorks.items.detection.description")}
									</span>
								</li>
								<li className="flex items-start">
									<span className="text-primary mr-2 font-bold">•</span>
									<span>
										<strong>{t("howItWorks.items.matching.label")}</strong> {t("howItWorks.items.matching.description")}
									</span>
								</li>
								<li className="flex items-start">
									<span className="text-primary mr-2">•</span>
									<span>
										<strong>{t("howItWorks.items.learning.label")}</strong> {t("howItWorks.items.learning.description")}
									</span>
								</li>
							</ul>
						</div>
					)}

					{/* CTA Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 mt-8">
						<Link href="/ai-skills" className="flex-1">
							<Button
								className="w-full bg-linear-to-r from-primary to-purple hover:from-primary-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 py-6 text-lg font-semibold"
								size="lg"
							>
								<Sparkles className="w-5 h-5 mr-2" />
								{t("cta.generate")}
								<ArrowRight className="w-5 h-5 ml-2" />
							</Button>
						</Link>
						<Link href="/courses" className="sm:w-auto">
							<Button
								variant="outline"
								className="w-full sm:w-auto border-2 border-primary text-primary hover:bg-primary/10 py-6 px-8 text-lg font-semibold"
								size="lg"
							>
								{t("cta.browse")}
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
