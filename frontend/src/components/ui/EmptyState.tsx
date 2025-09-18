"use client";

import type { ReactNode } from "react";
import { GlassCard } from "./GlassCard";

interface EmptyStateProps {
	icon: ReactNode;
	title: string;
	description: string;
	action?: ReactNode;
	className?: string;
}

/**
 * Standardized empty state component
 */
export function EmptyState({ icon, title, description, action, className = "" }: EmptyStateProps) {
	return (
		<GlassCard padding="lg" hover={false} className={`text-center ${className}`}>
			<div className="w-12 h-12 text-gray-400 mx-auto mb-4">{icon}</div>
			<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
			<p className="text-gray-600 dark:text-gray-400 mb-6">{description}</p>
			{action && action}
		</GlassCard>
	);
}
