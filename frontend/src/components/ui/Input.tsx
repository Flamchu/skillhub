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

export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ label, error, helperText, leftIcon, rightIcon, className, id, ...props }, ref) => {
		// generate a unique id for the input
		const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

		return (
			<div className="space-y-2">
				{label && (
					<label
						htmlFor={inputId}
						className="block text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors"
					>
						{label}
					</label>
				)}
				<div className="relative group">
					{leftIcon && (
						<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
							<span className="text-gray-400 dark:text-gray-500 group-focus-within:text-primary transition-colors">
								{leftIcon}
							</span>
						</div>
					)}
					<input
						ref={ref}
						id={inputId}
						className={cn(
							"w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500",
							"focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none",
							"transition-all duration-200",
							"hover:border-gray-300 dark:hover:border-gray-600",
							leftIcon && "pl-12",
							rightIcon && "pr-12",
							error && "border-red-500 focus:border-red-500 focus:ring-red-500/10 bg-red-50 dark:bg-red-900/10",
							className
						)}
						{...props}
					/>
					{rightIcon && (
						<div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
							<span className="text-gray-400 dark:text-gray-500 group-focus-within:text-primary transition-colors">
								{rightIcon}
							</span>
						</div>
					)}
				</div>
				{error && (
					<p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5 animate-in slide-in-from-top-1 duration-200">
						<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
							<path
								fillRule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
								clipRule="evenodd"
							/>
						</svg>
						{error}
					</p>
				)}
				{helperText && !error && <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>}
			</div>
		);
	}
);

Input.displayName = "Input";
