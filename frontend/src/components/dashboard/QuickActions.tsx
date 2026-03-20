"use client";

import Link from "next/link";
import { Target, TrendingUp, Award, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

interface QuickAction {
	icon: React.ReactNode;
	title: string;
	description: string;
	href: string;
	color: "primary" | "success" | "info";
}

export function QuickActions() {
	const t = useTranslations("dashboard.quickActions");

	const quickActions: QuickAction[] = [
		{
			icon: <Target className="w-6 h-6" />,
			title: t("skills.title"),
			description: t("skills.description"),
			href: "/skills",
			color: "primary",
		},
		{
			icon: <TrendingUp className="w-6 h-6" />,
			title: t("courses.title"),
			description: t("courses.description"),
			href: "/courses",
			color: "success",
		},
		{
			icon: <Award className="w-6 h-6" />,
			title: t("profile.title"),
			description: t("profile.description"),
			href: "/profile",
			color: "info",
		},
	];

	const colorClasses = {
		primary: {
			bg: "bg-linear-to-br from-primary/10 to-purple/10 dark:from-primary/20 dark:to-purple/20",
			icon: "bg-linear-to-br from-primary to-purple",
			hover: "hover:border-primary/40",
		},
		success: {
			bg: "bg-linear-to-br from-success/10 to-info/10 dark:from-success/20 dark:to-info/20",
			icon: "bg-linear-to-br from-success to-info",
			hover: "hover:border-success/40",
		},
		info: {
			bg: "bg-linear-to-br from-info/10 to-primary/10 dark:from-info/20 dark:to-primary/20",
			icon: "bg-linear-to-br from-info to-primary",
			hover: "hover:border-info/40",
		},
	};

	return (
		<div className="grid md:grid-cols-3 gap-4">
			{quickActions.map(action => {
				const colors = colorClasses[action.color];
				return (
					<Link key={action.href} href={action.href}>
						<div
							className={`group ${colors.bg} rounded-xl p-6 border-2 border-gray-200/50 dark:border-gray-700/50 ${colors.hover} transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]`}
						>
							<div className="flex items-start space-x-4">
								<div
									className={`shrink-0 w-12 h-12 ${colors.icon} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
								>
									{action.icon}
								</div>
								<div className="flex-1 min-w-0">
									<h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-primary transition-colors">
										{action.title}
									</h3>
									<p className="text-sm text-gray-600 dark:text-gray-300">{action.description}</p>
								</div>
								<ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-2 transition-all duration-300 shrink-0" />
							</div>
						</div>
					</Link>
				);
			})}
		</div>
	);
}
