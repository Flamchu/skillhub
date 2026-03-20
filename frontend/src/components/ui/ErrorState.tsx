"use client";

import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "./Button";
import { GlassCard } from "./GlassCard";

interface ErrorStateProps {
	title?: string;
	message: string;
	onRetry?: () => void;
	retryText?: string;
	className?: string;
}

/**
 * Standardized error state component
 */
export function ErrorState({
	title,
	message,
	onRetry,
	retryText,
	className = "",
}: ErrorStateProps) {
	const t = useTranslations("common.errorState");
	const resolvedTitle = title || t("title");
	const resolvedRetryText = retryText || t("retry");

	return (
		<GlassCard
			padding="lg"
			hover={false}
			className={`text-center border-red-200/50 dark:border-red-700/50 ${className}`}
		>
			<AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
			<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{resolvedTitle}</h3>
			<p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
			{onRetry && (
				<Button variant="outline" onClick={onRetry}>
					{resolvedRetryText}
				</Button>
			)}
		</GlassCard>
	);
}
