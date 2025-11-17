"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
	size?: "sm" | "md" | "lg";
	loading?: boolean;
	children: React.ReactNode;
}

export function Button({
	variant = "primary",
	size = "md",
	loading = false,
	className,
	disabled,
	children,
	...props
}: ButtonProps) {
	// Modern base styles with smooth transitions and better focus states
	const baseStyles =
		"inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

	// Enhanced variant styles with modern shadows and hover effects
	const variants = {
		primary:
			"bg-linear-to-r from-primary to-purple text-white hover:from-primary-600 hover:to-purple-600 shadow-lg hover:shadow-xl",
		secondary:
			"bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm hover:shadow-md",
		outline:
			"border-2 border-primary/30 dark:border-primary/50 bg-transparent text-primary dark:text-primary-400 hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary dark:hover:border-primary shadow-sm hover:shadow-md",
		ghost:
			"text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
		danger:
			"bg-linear-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl",
	};

	// Size styles with better spacing
	const sizes = {
		sm: "px-4 py-2 text-sm",
		md: "px-6 py-2.5 text-base",
		lg: "px-8 py-3.5 text-lg",
	};

	return (
		<button
			className={cn(baseStyles, variants[variant], sizes[size], loading && "cursor-wait", className)}
			disabled={disabled || loading}
			{...props}
		>
			{loading && (
				<svg className="mr-2 h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
					<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
					<path
						className="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					/>
				</svg>
			)}
			{children}
		</button>
	);
}
