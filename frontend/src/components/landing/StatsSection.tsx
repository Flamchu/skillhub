"use client";
import { StatsCounter } from "@/components/ui";
import { useTranslations } from "next-intl";
import { Users, BookOpen, TrendingUp } from "lucide-react";

interface StatCardProps {
	icon: React.ReactNode;
	value: number;
	suffix: string;
	label: string;
	description: string;
	apiKey: "users" | "courses" | "successRate";
	colorScheme: "primary" | "success" | "warning";
}

function StatCard({ icon, value, suffix, label, description, apiKey, colorScheme }: StatCardProps) {
	const colorClasses = {
		primary: {
			bg: "bg-linear-to-br from-primary/10 to-purple/5 dark:from-primary/15 dark:to-purple/10",
			border: "border-primary/20 dark:border-primary/30",
			hover:
				"hover:from-primary/15 hover:to-purple/10 dark:hover:from-primary/20 dark:hover:to-purple/15 hover:border-primary/40",
			iconBg: "bg-linear-to-br from-primary to-purple",
			textGradient: "bg-linear-to-br from-primary via-purple to-pink text-transparent bg-clip-text",
		},
		success: {
			bg: "bg-linear-to-br from-success/10 to-info/5 dark:from-success/15 dark:to-info/10",
			border: "border-success/20 dark:border-success/30",
			hover:
				"hover:from-success/15 hover:to-info/10 dark:hover:from-success/20 dark:hover:to-info/15 hover:border-success/40",
			iconBg: "bg-linear-to-br from-success to-info",
			textGradient: "bg-linear-to-br from-success via-info to-success-600 text-transparent bg-clip-text",
		},
		warning: {
			bg: "bg-linear-to-br from-warning/10 to-pink/5 dark:from-warning/15 dark:to-pink/10",
			border: "border-warning/20 dark:border-warning/30",
			hover:
				"hover:from-warning/15 hover:to-pink/10 dark:hover:from-warning/20 dark:hover:to-pink/15 hover:border-warning/40",
			iconBg: "bg-linear-to-br from-warning to-pink",
			textGradient: "bg-linear-to-br from-warning via-pink to-warning text-transparent bg-clip-text",
		},
	};

	const colors = colorClasses[colorScheme];

	return (
		<div
			className={`group ${colors.bg} border-2 ${colors.border} rounded-2xl p-10 ${colors.hover} transition-all duration-300 hover:scale-[1.05] hover:shadow-2xl text-center backdrop-blur-sm`}
		>
			<div
				className={`w-20 h-20 ${colors.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl`}
			>
				<div className="text-white w-10 h-10">{icon}</div>
			</div>
			<div className={`text-6xl font-extrabold ${colors.textGradient} mb-4`}>
				<StatsCounter targetValue={value} suffix={suffix} fetchFromAPI apiKey={apiKey} />
			</div>
			<div className="text-gray-900 dark:text-gray-100 font-bold text-xl mb-3">{label}</div>
			<div className="text-gray-600 dark:text-gray-400 text-base">{description}</div>
		</div>
	);
}

export function StatsSection() {
	const t = useTranslations("stats");

	return (
		<div className="max-w-7xl mx-auto mt-32 px-6">
			<div className="text-center mb-24">
				<h3 className="text-4xl md:text-5xl font-extrabold mb-6">
					<span className="bg-linear-to-br from-primary via-purple to-pink text-transparent bg-clip-text">
						{t("title")}
					</span>
				</h3>
				<p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">{t("subtitle")}</p>
			</div>

			<div className="grid md:grid-cols-3 gap-8">
				<StatCard
					icon={<Users className="w-full h-full" />}
					value={50000}
					suffix="+"
					label={t("activeLearners.label")}
					description={t("activeLearners.description")}
					apiKey="users"
					colorScheme="primary"
				/>

				<StatCard
					icon={<BookOpen className="w-full h-full" />}
					value={1000}
					suffix="+"
					label={t("expertCourses.label")}
					description={t("expertCourses.description")}
					apiKey="courses"
					colorScheme="success"
				/>

				<StatCard
					icon={<TrendingUp className="w-full h-full" />}
					value={95}
					suffix="%"
					label={t("successRate.label")}
					description={t("successRate.description")}
					apiKey="successRate"
					colorScheme="warning"
				/>
			</div>
		</div>
	);
}
