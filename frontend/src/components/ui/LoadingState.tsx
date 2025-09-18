"use client";

import { Loader2 } from "lucide-react";
import { GlassCard } from "./GlassCard";

interface LoadingStateProps {
	message?: string;
	className?: string;
}

/**
 * Standardized loading state component
 */
export function LoadingState({ message = "Loading...", className = "" }: LoadingStateProps) {
	return (
		<div className={`flex items-center justify-center py-16 ${className}`}>
			<GlassCard padding="lg" hover={false} className="text-center">
				<Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
				<span className="text-gray-600 dark:text-gray-400">{message}</span>
			</GlassCard>
		</div>
	);
}
