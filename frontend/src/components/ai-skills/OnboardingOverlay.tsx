"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, Target, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface OnboardingOverlayProps {
	onComplete: () => void;
	className?: string;
}

export function OnboardingOverlay({ onComplete, className = "" }: OnboardingOverlayProps) {
	const [currentStep, setCurrentStep] = useState(0);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		// check if user has seen onboarding
		const hasSeenOnboarding = localStorage.getItem("ai-skills-onboarding-complete");
		if (!hasSeenOnboarding) {
			setTimeout(() => setIsVisible(true), 300); // small delay for smooth entrance
		} else {
			onComplete();
		}
	}, [onComplete]);

	const handleComplete = () => {
		localStorage.setItem("ai-skills-onboarding-complete", "true");
		setIsVisible(false);
		setTimeout(onComplete, 300); // wait for exit animation
	};

	const handleSkip = () => {
		handleComplete();
	};

	const handleNext = () => {
		if (currentStep < steps.length - 1) {
			setCurrentStep(currentStep + 1);
		} else {
			handleComplete();
		}
	};

	const steps = [
		{
			icon: Sparkles,
			title: "Welcome to AI Skill Generation! 🎉",
			description:
				"Let our AI analyze your experience and goals to create a personalized skill profile in seconds. No manual browsing needed!",
			color: "from-primary to-purple",
		},
		{
			icon: Target,
			title: "Describe Yourself",
			description:
				"Just tell us about your background, experience, and what you want to learn. The more specific you are, the better your results will be.",
			color: "from-purple to-pink",
		},
		{
			icon: TrendingUp,
			title: "Review & Customize",
			description:
				"We'll suggest skills with proficiency levels. You can adjust the levels or remove skills before adding them to your profile.",
			color: "from-pink to-success",
		},
	];

	if (!isVisible) return null;

	const currentStepData = steps[currentStep];
	const Icon = currentStepData.icon;

	return (
		<div
			className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in ${className}`}
		>
			<div className="relative max-w-2xl w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl animate-scale-in">
				{/* close button */}
				<button
					onClick={handleSkip}
					className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
					aria-label="Close onboarding"
				>
					<X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
				</button>

				{/* content */}
				<div className="p-8 md:p-12">
					{/* icon */}
					<div className="mb-6">
						<div
							className={`w-20 h-20 rounded-2xl bg-linear-to-br ${currentStepData.color} flex items-center justify-center mx-auto shadow-lg`}
						>
							<Icon className="w-10 h-10 text-white" />
						</div>
					</div>

					{/* title */}
					<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 text-center mb-4">
						{currentStepData.title}
					</h2>

					{/* description */}
					<p className="text-lg text-gray-600 dark:text-gray-300 text-center mb-8 leading-relaxed">
						{currentStepData.description}
					</p>

					{/* progress dots */}
					<div className="flex justify-center gap-2 mb-8">
						{steps.map((_, index) => (
							<button
								key={index}
								onClick={() => setCurrentStep(index)}
								className={`w-2 h-2 rounded-full transition-all ${
									index === currentStep
										? "w-8 bg-linear-to-r from-primary to-purple"
										: index < currentStep
											? "bg-success"
											: "bg-gray-300 dark:bg-gray-600"
								}`}
								aria-label={`Go to step ${index + 1}`}
							/>
						))}
					</div>

					{/* actions */}
					<div className="flex justify-between items-center">
						<Button variant="ghost" onClick={handleSkip} className="text-gray-600 dark:text-gray-300">
							Skip Tutorial
						</Button>
						<Button variant="primary" onClick={handleNext} size="lg" className="bg-linear-to-r from-primary to-purple">
							{currentStep < steps.length - 1 ? (
								<>
									Next
									<ArrowRight className="w-5 h-5 ml-2" />
								</>
							) : (
								<>
									Get Started
									<Sparkles className="w-5 h-5 ml-2" />
								</>
							)}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
