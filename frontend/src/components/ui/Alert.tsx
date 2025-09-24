import React from "react";
import { cn } from "@/lib/utils";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
	variant?: "default" | "success" | "warning" | "danger" | "info";
}

export function Alert({ children, variant = "default", className, ...props }: AlertProps) {
	const variants = {
		default: "bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200",
		success:
			"bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-200",
		warning:
			"bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-200",
		danger: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-200",
		info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-200",
	};

	return (
		<div className={cn("border rounded-xl p-4 flex items-start gap-3", variants[variant], className)} {...props}>
			{children}
		</div>
	);
}
