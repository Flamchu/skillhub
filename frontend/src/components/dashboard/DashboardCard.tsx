"use client";

import Link from "next/link";

interface DashboardCardProps {
	icon: string;
	title: string;
	description: string;
	linkText: string;
	href?: string;
	onClick?: () => void;
	colorScheme: "primary" | "success" | "info";
}

/**
 * Dashboard navigation card component with gradient styling
 */
export function DashboardCard({ icon, title, description, linkText, href, onClick, colorScheme }: DashboardCardProps) {
	const colorClasses = {
		primary: {
			bg: "bg-gradient-to-br from-primary/5 to-purple/5 dark:from-primary/10 dark:to-purple/10",
			border: "border-primary/20 dark:border-primary/30",
			hover: "hover:from-primary/10 hover:to-purple/10 dark:hover:from-primary/15 dark:hover:to-purple/15",
			iconBg: "bg-gradient-to-br from-primary to-purple",
			titleHover: "group-hover:text-primary",
			linkColor: "text-primary",
		},
		success: {
			bg: "bg-gradient-to-br from-success/5 to-info/5 dark:from-success/10 dark:to-info/10",
			border: "border-success/20 dark:border-success/30",
			hover: "hover:from-success/10 hover:to-info/10 dark:hover:from-success/15 dark:hover:to-info/15",
			iconBg: "bg-gradient-to-br from-success to-info",
			titleHover: "group-hover:text-success",
			linkColor: "text-success",
		},
		info: {
			bg: "bg-gradient-to-br from-info/5 to-primary/5 dark:from-info/10 dark:to-primary/10",
			border: "border-info/20 dark:border-info/30",
			hover: "hover:from-info/10 hover:to-primary/10 dark:hover:from-info/15 dark:hover:to-primary/15",
			iconBg: "bg-gradient-to-br from-info to-primary",
			titleHover: "group-hover:text-info",
			linkColor: "text-info",
		},
	};

	const colors = colorClasses[colorScheme];

	const content = (
		<div
			className={`group ${colors.bg} ${colors.border} ${colors.hover} backdrop-blur-sm rounded-2xl border p-6 hover:scale-105 transition-all duration-300 cursor-pointer`}
		>
			<div className="flex items-start space-x-4">
				<div className={`${colors.iconBg} p-3 rounded-xl text-white shadow-lg`}>
					<span className="text-2xl">{icon}</span>
				</div>
				<div className="flex-1 min-w-0">
					<h3
						className={`text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 ${colors.titleHover} transition-colors`}
					>
						{title}
					</h3>
					<p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">{description}</p>
					<span className={`${colors.linkColor} text-sm font-medium group-hover:underline`}>{linkText} →</span>
				</div>
			</div>
		</div>
	);

	if (href) {
		return <Link href={href}>{content}</Link>;
	}

	return (
		<button onClick={onClick} className="w-full text-left">
			{content}
		</button>
	);
}
