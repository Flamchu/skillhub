"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
	size?: "sm" | "md" | "lg";
	loading?: boolean;
	children: React.ReactNode;
}

export function Button({ variant = "primary", size = "md", loading = false, className, disabled, children, ...props }: ButtonProps) {
	// base styles following styling guide - rounded-sm for professional appearance
	const baseStyles = "inline-flex items-center justify-center rounded-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

	// variant styles using exact styling guide patterns
	const variants = {
		primary: "bg-primary text-primary-foreground hover:bg-primary-600 shadow-sm",
		secondary: "bg-surface border border-border text-foreground hover:bg-surface-hover",
		outline: "border border-border bg-transparent text-foreground hover:bg-surface-hover",
		ghost: "text-foreground-muted hover:bg-surface-hover hover:text-foreground",
		danger: "bg-danger text-danger-foreground hover:bg-danger-600 shadow-sm",
	};

	// size styles - following styling guide spacing
	const sizes = {
		sm: "px-3 py-1.5 text-sm",
		md: "px-4 py-2 text-sm",
		lg: "px-6 py-3 text-base",
	};

	return (
		<button className={cn(baseStyles, variants[variant], sizes[size], loading && "cursor-wait", className)} disabled={disabled || loading} {...props}>
			{loading && (
				<svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
					<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
					<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
				</svg>
			)}
			{children}
		</button>
	);
}
