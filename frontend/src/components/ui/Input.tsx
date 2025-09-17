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
	// generate a unique id for the input
	const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

	return (
		<div className="space-y-2">
			{label && (
				<label htmlFor={inputId} className="block text-sm font-medium text-foreground">
					{label}
				</label>
			)}
			<div className="relative">
				{leftIcon && (
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<span className="text-foreground-subtle sm:text-sm">{leftIcon}</span>
					</div>
				)}
				<input ref={ref} id={inputId} className={cn("w-full px-3 py-2 bg-surface-muted border border-border rounded-sm text-foreground placeholder:text-foreground-subtle focus:border-border-focus focus:ring-2 focus:ring-primary-100 outline-none transition-all", leftIcon && "pl-10", rightIcon && "pr-10", error && "border-danger focus:border-danger focus:ring-2 focus:ring-danger-100", className)} {...props} />
				{rightIcon && (
					<div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
						<span className="text-foreground-subtle sm:text-sm">{rightIcon}</span>
					</div>
				)}
			</div>
			{error && <p className="text-sm text-danger">{error}</p>}
			{helperText && !error && <p className="text-sm text-foreground-muted">{helperText}</p>}
		</div>
	);
});

Input.displayName = "Input";
