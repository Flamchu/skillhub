"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	children: React.ReactNode;
	variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
	size?: "sm" | "md" | "lg";
}

export function Badge({ children, variant = "default", size = "md", className, ...props }: BadgeProps) {
	// badge variant styles
	const variants = {
		default: "bg-surface-elevated text-fg-muted border border-border",
		primary: "bg-primary-50 text-primary-600 border border-primary-200 dark:bg-primary-900/20 dark:text-primary-300 dark:border-primary-700",
		success: "bg-success-50 text-success-600 border border-success-200 dark:bg-success-900/20 dark:text-success-300 dark:border-success-700",
		warning: "bg-warning-50 text-warning-600 border border-warning-200 dark:bg-warning-900/20 dark:text-warning-300 dark:border-warning-700",
		danger: "bg-danger-50 text-danger-600 border border-danger-200 dark:bg-danger-900/20 dark:text-danger-300 dark:border-danger-700",
		info: "bg-info-50 text-info-600 border border-info-200 dark:bg-info-900/20 dark:text-info-300 dark:border-info-700",
	};

	// badge size styles
	const sizes = {
		sm: "px-2 py-0.5 text-xs",
		md: "px-2.5 py-1 text-sm",
		lg: "px-3 py-1.5 text-base",
	};

	return (
		<span className={cn("inline-flex items-center font-medium rounded-badge backdrop-blur-sm transition-colors", variants[variant], sizes[size], className)} {...props}>
			{children}
		</span>
	);
}

interface ProficiencyBadgeProps {
	level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
	className?: string;
}

export function ProficiencyBadge({ level, className }: ProficiencyBadgeProps) {
	// proficiency level configuration
	const levelConfig = {
		BEGINNER: { variant: "info" as const, label: "beginner" },
		INTERMEDIATE: { variant: "warning" as const, label: "intermediate" },
		ADVANCED: { variant: "primary" as const, label: "advanced" },
		EXPERT: { variant: "success" as const, label: "expert" },
	};

	const config = levelConfig[level];

	return (
		<Badge variant={config.variant} className={className}>
			{config.label}
		</Badge>
	);
}
