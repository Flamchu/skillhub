"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
	children: ReactNode;
	className?: string;
	hover?: boolean;
	padding?: "sm" | "md" | "lg" | "none";
	gradient?: boolean;
}

/**
 * Modern glass morphism card with enhanced backdrop blur and optional gradient borders
 */
export function GlassCard({
	children,
	className = "",
	hover = true,
	padding = "md",
	gradient = false,
}: GlassCardProps) {
	const paddingClasses = {
		none: "",
		sm: "p-4",
		md: "p-6",
		lg: "p-8",
	};

	const hoverClass = hover ? "hover:scale-[1.02] hover:shadow-xl transition-all duration-300" : "";
	const gradientClass = gradient
		? "bg-gradient-to-br from-white/80 via-white/70 to-white/60 dark:from-gray-800/80 dark:via-gray-800/70 dark:to-gray-800/60 border-primary/20"
		: "";

	return (
		<div
			className={cn(
				"bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg",
				paddingClasses[padding],
				hoverClass,
				gradientClass,
				className
			)}
		>
			{children}
		</div>
	);
}
