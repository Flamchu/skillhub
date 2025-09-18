"use client";

import type { ReactNode } from "react";

interface GlassCardProps {
	children: ReactNode;
	className?: string;
	hover?: boolean;
	padding?: "sm" | "md" | "lg";
}

/**
 * Reusable glass morphism card component with backdrop blur effect
 */
export function GlassCard({ children, className = "", hover = true, padding = "md" }: GlassCardProps) {
	const paddingClasses = {
		sm: "p-4",
		md: "p-6",
		lg: "p-8",
	};

	const hoverClass = hover ? "hover:scale-[1.01] transition-all duration-200" : "";

	return (
		<div
			className={`bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm ${paddingClasses[padding]} ${hoverClass} ${className}`}
		>
			{children}
		</div>
	);
}
