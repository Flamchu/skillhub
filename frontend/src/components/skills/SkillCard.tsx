"use client";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { BookOpen, TrendingUp, Award } from "lucide-react";

interface SkillCardProps {
	skill: {
		id: string;
		name: string;
		category: string;
		proficiency: "NONE" | "BASIC" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
	};
	onUpdate?: (skillId: string) => void;
	onLearnMore?: (skillId: string) => void;
}

/**
 * individual skill card component with proficiency tracking
 */
export function SkillCard({ skill, onUpdate, onLearnMore }: SkillCardProps) {
	const getProficiencyData = (level: string) => {
		switch (level) {
			case "NONE":
				return {
					percentage: 0,
					color: "bg-gray-400",
					variant: "default" as const,
					icon: <BookOpen className="h-4 w-4" />,
				};
			case "BASIC":
				return {
					percentage: 25,
					color: "bg-gradient-to-r from-blue-400 to-cyan-400",
					variant: "info" as const,
					icon: <BookOpen className="h-4 w-4" />,
				};
			case "INTERMEDIATE":
				return {
					percentage: 50,
					color: "bg-gradient-to-r from-yellow-400 to-orange-400",
					variant: "warning" as const,
					icon: <TrendingUp className="h-4 w-4" />,
				};
			case "ADVANCED":
				return {
					percentage: 75,
					color: "bg-gradient-to-r from-primary to-purple",
					variant: "primary" as const,
					icon: <TrendingUp className="h-4 w-4" />,
				};
			case "EXPERT":
				return {
					percentage: 90,
					color: "bg-gradient-to-r from-green-400 to-emerald-400",
					variant: "success" as const,
					icon: <Award className="h-4 w-4" />,
				};
			default:
				return {
					percentage: 0,
					color: "bg-gray-400",
					variant: "default" as const,
					icon: <BookOpen className="h-4 w-4" />,
				};
		}
	};

	const proficiencyData = getProficiencyData(skill.proficiency);

	return (
		<GlassCard className="group hover:shadow-xl transition-all duration-300">
			<div className="space-y-4">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 min-w-10 min-h-10 bg-gradient-to-br from-primary-100 to-purple-100 dark:from-primary-900/50 dark:to-purple-900/50 rounded-full flex items-center justify-center border border-primary-200 dark:border-primary-700 flex-shrink-0">
							{proficiencyData.icon}
						</div>
						<div>
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
								{skill.name}
							</h3>
							<p className="text-sm text-gray-600 dark:text-gray-400">{skill.category}</p>
						</div>
					</div>
					<Badge variant={proficiencyData.variant} size="sm" className="flex items-center space-x-1">
						<span>{skill.proficiency}</span>
					</Badge>
				</div>

				{/* Progress Section */}
				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span className="text-gray-600 dark:text-gray-400">Progress</span>
						<span className="font-medium text-gray-900 dark:text-white">{proficiencyData.percentage}%</span>
					</div>
					<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
						<div
							className={`${proficiencyData.color} h-2 rounded-full transition-all duration-500`}
							style={{ width: `${proficiencyData.percentage}%` }}
						/>
					</div>
				</div>

				{/* Actions */}
				<div className="flex items-center space-x-3 pt-2">
					<Button variant="outline" size="sm" onClick={() => onUpdate?.(skill.id)} className="flex-1">
						Update Level
					</Button>
					<Button
						size="sm"
						onClick={() => onLearnMore?.(skill.id)}
						className="flex-1 bg-gradient-to-r from-primary to-purple hover:from-primary-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
					>
						Learn More
					</Button>
				</div>
			</div>
		</GlassCard>
	);
}
