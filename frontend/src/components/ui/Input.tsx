"use client";
import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
	helperText?: string;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, helperText, leftIcon, rightIcon, className, id, ...props }, ref) => {
	const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

	return (
		<div className="space-y-2">
			{label && (
				<label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
					{label}
				</label>
			)}
			<div className="relative">
				{leftIcon && (
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<span className="text-gray-500 sm:text-sm">{leftIcon}</span>
					</div>
				)}
				<input ref={ref} id={inputId} className={cn("block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm", "dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400", leftIcon && "pl-10", rightIcon && "pr-10", error && "border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-600", className)} {...props} />
				{rightIcon && (
					<div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
						<span className="text-gray-500 sm:text-sm">{rightIcon}</span>
					</div>
				)}
			</div>
			{error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
			{helperText && !error && <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>}
		</div>
	);
});

Input.displayName = "Input";
