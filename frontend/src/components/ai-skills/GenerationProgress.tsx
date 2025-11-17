"use client";

import { Sparkles, Zap, CheckCircle } from "lucide-react";

interface GenerationProgressProps {
	stage: "analyzing" | "generating" | "complete";
	className?: string;
}

export function GenerationProgress({ stage, className = "" }: GenerationProgressProps) {
	const stages = [
		{
			id: "analyzing",
			label: "Analyzing your input",
			icon: Sparkles,
			description: "Understanding your goals and experience",
		},
		{
			id: "generating",
			label: "Generating skills",
			icon: Zap,
			description: "Matching you with relevant skills",
		},
		{
			id: "complete",
			label: "Ready to review",
			icon: CheckCircle,
			description: "Your personalized skill profile is ready",
		},
	];

	const currentStageIndex = stages.findIndex(s => s.id === stage);

	return (
		<div className={`space-y-6 ${className}`}>
			<div className="flex items-center justify-center gap-2">
				<div className="w-8 h-8 bg-gradient-to-br from-primary to-purple rounded-full flex items-center justify-center animate-pulse">
					<Sparkles className="w-5 h-5 text-white" />
				</div>
				<h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Generating Your Skills...</h3>
			</div>

			<div className="space-y-4">
				{stages.map((stageItem, index) => {
					const isActive = index === currentStageIndex;
					const isComplete = index < currentStageIndex;
					const Icon = stageItem.icon;

					return (
						<div key={stageItem.id} className="flex items-start gap-4">
							{/* icon */}
							<div
								className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
									isComplete
										? "bg-gradient-to-br from-success to-info"
										: isActive
											? "bg-gradient-to-br from-primary to-purple animate-pulse"
											: "bg-gray-200 dark:bg-gray-700"
								}`}
							>
								<Icon className={`w-5 h-5 ${isComplete || isActive ? "text-white" : "text-gray-400"}`} />
							</div>

							{/* content */}
							<div className="flex-1 pt-1">
								<div className="flex items-center gap-2">
									<h4
										className={`font-semibold transition-colors ${
											isComplete || isActive ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"
										}`}
									>
										{stageItem.label}
									</h4>
									{isComplete && <CheckCircle className="w-4 h-4 text-success" />}
								</div>
								<p
									className={`text-sm transition-colors ${
										isComplete || isActive ? "text-gray-600 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"
									}`}
								>
									{stageItem.description}
								</p>

								{/* progress bar */}
								{isActive && (
									<div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
										<div className="h-full bg-gradient-to-r from-primary to-purple rounded-full animate-progress-bar" />
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
