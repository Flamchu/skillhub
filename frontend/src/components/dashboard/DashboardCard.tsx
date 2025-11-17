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
	size?: "default" | "compact";
}

/**
 * Dashboard navigation card component with gradient styling
 */
export function DashboardCard({
	icon,
	title,
	description,
	linkText,
	href,
	onClick,
	colorScheme,
	size = "default",
}: DashboardCardProps) {
	const colorClasses = {
		primary: {
			bg: "bg-linear-to-br from-primary/5 to-purple/5 dark:from-primary/10 dark:to-purple/10",
			border: "border-primary/20 dark:border-primary/30",
			hover: "hover:from-primary/10 hover:to-purple/10 dark:hover:from-primary/15 dark:hover:to-purple/15",
			iconBg: "bg-linear-to-br from-primary to-purple",
			titleHover: "group-hover:text-primary",
			linkColor: "text-primary",
		},
		success: {
			bg: "bg-linear-to-br from-success/5 to-info/5 dark:from-success/10 dark:to-info/10",
			border: "border-success/20 dark:border-success/30",
			hover: "hover:from-success/10 hover:to-info/10 dark:hover:from-success/15 dark:hover:to-info/15",
			iconBg: "bg-linear-to-br from-success to-info",
			titleHover: "group-hover:text-success",
			linkColor: "text-success",
		},
		info: {
			bg: "bg-linear-to-br from-info/5 to-primary/5 dark:from-info/10 dark:to-primary/10",
			border: "border-info/20 dark:border-info/30",
			hover: "hover:from-info/10 hover:to-primary/10 dark:hover:from-info/15 dark:hover:to-primary/15",
			iconBg: "bg-linear-to-br from-info to-primary",
			titleHover: "group-hover:text-info",
			linkColor: "text-info",
		},
	};

	const colors = colorClasses[colorScheme];

	// size-specific styling
	const sizeClasses = {
		default: {
			container: "p-6 min-h-[160px] rounded-2xl",
			iconSize: "p-3 text-2xl",
			titleSize: "text-lg",
		},
		compact: {
			container: "p-4 min-h-[120px] rounded-xl",
			iconSize: "p-2 text-xl",
			titleSize: "text-base",
		},
	};

	const sizing = sizeClasses[size];

	const content = (
		<div
			className={`group ${colors.bg} ${colors.border} ${colors.hover} backdrop-blur-sm border-2 ${sizing.container} hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] transition-all duration-300 cursor-pointer h-full flex flex-col`}
		>
			<div className="flex items-start space-x-4 flex-1">
				<div
					className={`${colors.iconBg} ${sizing.iconSize} rounded-xl text-white shadow-lg shrink-0 group-hover:scale-110 transition-transform duration-300`}
				>
					<span>{icon}</span>
				</div>
				<div className="flex-1 min-w-0 flex flex-col h-full">
					<h3
						className={`${sizing.titleSize} font-bold text-gray-900 dark:text-gray-100 mb-2 ${colors.titleHover} transition-colors`}
					>
						{title}
					</h3>
					<p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed flex-1">{description}</p>
					<span className={`${colors.linkColor} text-sm font-bold group-hover:underline mt-4 flex items-center gap-1`}>
						{linkText} <span className="group-hover:translate-x-1 transition-transform">→</span>
					</span>
				</div>
			</div>
		</div>
	);

	if (href) {
		return <Link href={href}>{content}</Link>;
	}

	return (
		<button onClick={onClick} className="w-full text-left h-full">
			{content}
		</button>
	);
}
