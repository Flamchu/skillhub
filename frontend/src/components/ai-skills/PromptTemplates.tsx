"use client";

import { useState, useEffect } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

// prompt template suggestions
const PROMPT_TEMPLATES = [
	"I'm a frontend developer with 3 years of React experience, looking to transition into full-stack development",
	"Recent computer science graduate interested in machine learning and data science",
	"Marketing professional wanting to learn web development and digital analytics",
	"Business analyst with Excel skills, aiming to become a data analyst",
	"Self-taught programmer with Python basics, interested in backend development",
	"UX designer looking to add frontend development skills to my toolkit",
	"Product manager wanting to understand technical concepts and cloud computing",
	"Career changer from teaching, interested in software engineering",
	"Experienced Java developer exploring modern JavaScript frameworks",
	"DevOps engineer wanting to improve security and cloud architecture skills",
	"Mobile app developer looking to learn cross-platform development",
	"Data analyst wanting to transition into machine learning engineering",
];

interface PromptTemplatesProps {
	onSelectTemplate: (template: string) => void;
	className?: string;
}

export function PromptTemplates({ onSelectTemplate, className = "" }: PromptTemplatesProps) {
	const [templates, setTemplates] = useState<string[]>([]);

	// pick 3 random templates on mount
	useEffect(() => {
		selectRandomTemplates();
	}, []);

	const selectRandomTemplates = () => {
		const shuffled = [...PROMPT_TEMPLATES].sort(() => 0.5 - Math.random());
		setTemplates(shuffled.slice(0, 3));
	};

	return (
		<div className={`space-y-4 ${className}`}>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Sparkles className="w-5 h-5 text-primary" />
					<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Need inspiration?</h3>
				</div>
				<Button
					variant="ghost"
					size="sm"
					onClick={selectRandomTemplates}
					className="text-primary hover:text-primary-600"
				>
					<RefreshCw className="w-4 h-4 mr-1" />
					Refresh
				</Button>
			</div>

			<p className="text-sm text-gray-600 dark:text-gray-300">Try one of these examples to get started:</p>

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
