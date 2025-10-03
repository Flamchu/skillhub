"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { Button } from "@/components/ui/Button";
import { generateAISkills } from "@/lib/recommendations";
import { Sparkles, RefreshCw, User, Target, CheckCircle } from "lucide-react";
import type { AISkillSuggestion } from "@/types";

interface AISkillGeneratorProps {
	onSkillsGenerated?: (skills: AISkillSuggestion[]) => void;
	className?: string;
}

export function AISkillGenerator({ onSkillsGenerated, className = "" }: AISkillGeneratorProps) {
	const { user } = useAuth();
	const [prompt, setPrompt] = useState("");
	const [suggestions, setSuggestions] = useState<AISkillSuggestion[]>([]);
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());

	const handleGenerate = async () => {
		if (!user) return;
		if (prompt.trim().length < 10) {
			setError("Please provide a more detailed description (at least 10 characters)");
			return;
		}

		try {
			setIsGenerating(true);
			setError(null);
			const response = await generateAISkills({ prompt: prompt.trim() });
			setSuggestions(response.skills);
			setSelectedSkills(new Set()); // Reset selection
		} catch (error) {
			console.error("Failed to generate AI skills:", error);
			setError("Failed to generate skill suggestions. Please try again.");
		} finally {
			setIsGenerating(false);
		}
	};

	const toggleSkillSelection = (skillId: string) => {
		setSelectedSkills(prev => {
			const newSet = new Set(prev);
			if (newSet.has(skillId)) {
				newSet.delete(skillId);
			} else {
				newSet.add(skillId);
			}
			return newSet;
		});
	};

	const handleApplySkills = () => {
		if (onSkillsGenerated && selectedSkills.size > 0) {
			const selectedSuggestions = suggestions.filter(s => selectedSkills.has(s.skill.id));
			onSkillsGenerated(selectedSuggestions);
			setSuggestions([]); // Clear suggestions
			setPrompt(""); // Clear prompt
			setSelectedSkills(new Set()); // Clear selection
		}
	};

	const getProficiencyColor = (level: string) => {
		const colors = {
			NONE: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
			BASIC: "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
			INTERMEDIATE: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400",
			ADVANCED: "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
			EXPERT: "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400",
		};
		return colors[level as keyof typeof colors] || colors.BASIC;
	};

	const examplePrompts = [
		"I'm a complete beginner wanting to learn web development from scratch",
		"I'm a Python developer looking to transition into data science and machine learning",
		"I want to become a full-stack developer with modern technologies",
		"I'm interested in mobile app development and UI/UX design",
		"I'm a backend developer wanting to learn DevOps and cloud technologies",
	];

	return (
		<div
			className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 ${className}`}
		>
			{/* Header */}
			<div className="flex items-center space-x-3 mb-6">
				<div className="w-12 h-12 bg-gradient-to-br from-purple to-pink rounded-xl flex items-center justify-center">
					<Sparkles className="w-6 h-6 text-white" />
				</div>
				<div>
					<h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">AI Skill Generator</h3>
					<p className="text-gray-600 dark:text-gray-300">
						Describe your background or goals to get personalized skill recommendations
					</p>
				</div>
			</div>

			{/* Prompt Input */}
			<div className="mb-6">
				<label htmlFor="ai-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Tell us about your background or learning goals:
				</label>
				<textarea
					id="ai-prompt"
					value={prompt}
					onChange={e => setPrompt(e.target.value)}
					placeholder="e.g., I'm a marketing professional who wants to learn web development to build better landing pages..."
					className="w-full h-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
					disabled={isGenerating}
				/>
				{error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
			</div>

			{/* Example Prompts */}
			{prompt.length === 0 && (
				<div className="mb-6">
					<p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Try these examples:</p>
					<div className="grid gap-2">
						{examplePrompts.slice(0, 3).map((example, index) => (
							<button
								key={index}
								onClick={() => setPrompt(example)}
								className="text-left p-3 text-sm bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
							>
								<User className="w-4 h-4 inline mr-2 text-primary" />
								{example}
							</button>
						))}
					</div>
				</div>
			)}

			{/* Generate Button */}
			<div className="flex justify-center mb-6">
				<Button
					onClick={handleGenerate}
					disabled={isGenerating || prompt.trim().length < 10}
					className="px-6 py-3 bg-gradient-to-r from-purple to-pink text-white rounded-lg hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
				>
					{isGenerating ? (
						<>
							<RefreshCw className="w-4 h-4 mr-2 animate-spin" />
							Generating Skills...
						</>
					) : (
						<>
							<Sparkles className="w-4 h-4 mr-2" />
							Generate Skill Recommendations
						</>
					)}
				</Button>
			</div>

			{/* Generated Suggestions */}
			{suggestions.length > 0 && (
				<div>
					<div className="flex items-center justify-between mb-4">
						<h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recommended Skills</h4>
						<span className="text-sm text-gray-500 dark:text-gray-400">Select skills to add to your profile</span>
					</div>

					<div className="grid gap-3 mb-6">
						{suggestions.map(suggestion => (
							<div
								key={suggestion.skill.id}
								className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
									selectedSkills.has(suggestion.skill.id)
										? "border-primary bg-primary/5 dark:bg-primary/10"
										: "border-gray-200 dark:border-gray-600 hover:border-primary/50 bg-gray-50 dark:bg-gray-700"
								}`}
								onClick={() => toggleSkillSelection(suggestion.skill.id)}
							>
								<div className="flex items-start space-x-3">
									<div
										className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 ${
											selectedSkills.has(suggestion.skill.id)
												? "border-primary bg-primary text-white"
												: "border-gray-300 dark:border-gray-600"
										}`}
									>
										{selectedSkills.has(suggestion.skill.id) && <CheckCircle className="w-4 h-4" />}
									</div>
									<div className="flex-1">
										<div className="flex items-center space-x-3 mb-2">
											<h5 className="font-semibold text-gray-900 dark:text-gray-100">{suggestion.skill.name}</h5>
											<span
												className={`px-2 py-1 rounded-full text-xs font-medium ${getProficiencyColor(suggestion.suggestedProficiency)}`}
											>
												{suggestion.suggestedProficiency.toLowerCase()}
											</span>
										</div>
										<p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{suggestion.reason}</p>
										{suggestion.skill.description && (
											<p className="text-xs text-gray-500 dark:text-gray-400">{suggestion.skill.description}</p>
										)}
									</div>
									<Target
										className={`w-5 h-5 ${selectedSkills.has(suggestion.skill.id) ? "text-primary" : "text-gray-400"}`}
									/>
								</div>
							</div>
						))}
					</div>

					{/* Apply Skills Button */}
					{selectedSkills.size > 0 && (
						<div className="flex justify-center">
							<Button
								onClick={handleApplySkills}
								className="px-6 py-3 bg-gradient-to-r from-primary to-purple text-white rounded-lg hover:from-primary-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300"
							>
								<CheckCircle className="w-4 h-4 mr-2" />
								Add {selectedSkills.size} Selected Skills
							</Button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
