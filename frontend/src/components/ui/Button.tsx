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
	// base styles for the button
	const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

	// variant styles
	const variants = {
		primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
		secondary: "bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800",
		outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700",
		ghost: "text-gray-700 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-800 dark:active:bg-gray-700",
		danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
	};

	// size styles
	const sizes = {
		sm: "h-8 px-3 text-sm",
		md: "h-10 px-4 text-sm",
		lg: "h-12 px-6 text-base",
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
