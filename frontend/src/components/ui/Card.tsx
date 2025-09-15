"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
	variant?: "default" | "outlined" | "elevated";
}

export function Card({ children, variant = "default", className, ...props }: CardProps) {
	const variants = {
		default: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
		outlined: "border-2 border-gray-200 dark:border-gray-700 bg-transparent",
		elevated: "bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700",
	};

	return (
		<div className={cn("rounded-lg p-6", variants[variant], className)} {...props}>
			{children}
		</div>
	);
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

export function CardHeader({ children, className, ...props }: CardHeaderProps) {
	return (
		<div className={cn("mb-4 pb-4 border-b border-gray-200 dark:border-gray-700", className)} {...props}>
			{children}
		</div>
	);
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
	children: React.ReactNode;
	as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export function CardTitle({ children, as: Component = "h3", className, ...props }: CardTitleProps) {
	return (
		<Component className={cn("text-lg font-semibold text-gray-900 dark:text-white", className)} {...props}>
			{children}
		</Component>
	);
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

export function CardContent({ children, className, ...props }: CardContentProps) {
	return (
		<div className={cn("text-gray-700 dark:text-gray-300", className)} {...props}>
			{children}
		</div>
	);
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

export function CardFooter({ children, className, ...props }: CardFooterProps) {
	return (
		<div className={cn("mt-4 pt-4 border-t border-gray-200 dark:border-gray-700", className)} {...props}>
			{children}
		</div>
	);
}
