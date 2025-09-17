"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
	variant?: "default" | "outlined" | "elevated";
}

export function Card({ children, variant = "default", className, ...props }: CardProps) {
	// card variant styles following styling guide - rounded-sm for consistency
	const variants = {
		default: "bg-surface border border-border rounded-sm shadow-sm p-6",
		outlined: "border border-border-strong bg-transparent hover:bg-surface-hover transition-colors rounded-sm p-6",
		elevated: "bg-surface-elevated border border-border rounded-md shadow-md p-6 hover:shadow-lg transition-shadow",
	};

	return (
		<div className={cn(variants[variant], className)} {...props}>
			{children}
		</div>
	);
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

export function CardHeader({ children, className, ...props }: CardHeaderProps) {
	return (
		<div className={cn("mb-4 pb-4 border-b border-border-divider", className)} {...props}>
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
		<Component className={cn("text-lg font-semibold text-foreground", className)} {...props}>
			{children}
		</Component>
	);
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

export function CardContent({ children, className, ...props }: CardContentProps) {
	return (
		<div className={cn("text-foreground-muted", className)} {...props}>
			{children}
		</div>
	);
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

export function CardFooter({ children, className, ...props }: CardFooterProps) {
	return (
		<div className={cn("mt-4 pt-4 border-t border-border-divider", className)} {...props}>
			{children}
		</div>
	);
}
