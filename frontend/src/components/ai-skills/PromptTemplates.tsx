"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PromptTemplatesProps {
	onSelectTemplate: (template: string) => void;
	className?: string;
}

export function PromptTemplates({ onSelectTemplate, className = "" }: PromptTemplatesProps) {
	const t = useTranslations("aiSkills.templates");
	const [templates, setTemplates] = useState<string[]>([]);

	// pick 3 random templates on mount
	useEffect(() => {
		const shuffled = [
			t("items.frontend"),
			t("items.csGraduate"),
			t("items.marketing"),
			t("items.businessAnalyst"),
			t("items.selfTaught"),
			t("items.uxDesigner"),
			t("items.productManager"),
			t("items.careerChange"),
			t("items.javaDeveloper"),
			t("items.devops"),
			t("items.mobile"),
			t("items.dataAnalyst"),
		].sort(() => 0.5 - Math.random());
		setTemplates(shuffled.slice(0, 3));
	}, [t]);

	const selectRandomTemplates = () => {
		const shuffled = [
			t("items.frontend"),
			t("items.csGraduate"),
			t("items.marketing"),
			t("items.businessAnalyst"),
			t("items.selfTaught"),
			t("items.uxDesigner"),
			t("items.productManager"),
			t("items.careerChange"),
			t("items.javaDeveloper"),
			t("items.devops"),
			t("items.mobile"),
			t("items.dataAnalyst"),
		].sort(() => 0.5 - Math.random());
		setTemplates(shuffled.slice(0, 3));
	};

	return (
		<div className={`space-y-4 ${className}`}>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Sparkles className="w-5 h-5 text-primary" />
					<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t("title")}</h3>
				</div>
				<Button
					variant="ghost"
					size="sm"
					onClick={selectRandomTemplates}
					className="text-primary hover:text-primary-600"
				>
					<RefreshCw className="w-4 h-4 mr-1" />
					{t("refresh")}
				</Button>
			</div>

			<p className="text-sm text-gray-600 dark:text-gray-300">{t("description")}</p>

			<div className="space-y-3">
				{templates.map((template, index) => (
					<button
						key={index}
						onClick={() => onSelectTemplate(template)}
						className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary bg-white/50 dark:bg-gray-800/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all group"
					>
						<div className="flex items-start justify-between gap-3">
							<p className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 flex-1">
								&quot;{template}&quot;
							</p>
							<Sparkles className="w-4 h-4 text-gray-400 group-hover:text-primary shrink-0 mt-0.5" />
						</div>
					</button>
				))}
			</div>
		</div>
	);
}
