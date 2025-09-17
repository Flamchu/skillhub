"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge, ProficiencyBadge } from "@/components/ui/Badge";
import { Search, Plus } from "lucide-react";

export default function SkillsPage() {
	const { user } = useAuth();
	const [searchQuery, setSearchQuery] = useState("");

	// mock data - replace with actual api calls
	const skills = [
		{ id: "1", name: "JavaScript", category: "Programming Languages", proficiency: "ADVANCED" as const },
		{ id: "2", name: "React", category: "Frontend Frameworks", proficiency: "EXPERT" as const },
		{ id: "3", name: "TypeScript", category: "Programming Languages", proficiency: "INTERMEDIATE" as const },
		{ id: "4", name: "Node.js", category: "Backend Technologies", proficiency: "ADVANCED" as const },
		{ id: "5", name: "Python", category: "Programming Languages", proficiency: "BEGINNER" as const },
	];

	const filteredSkills = skills.filter((skill) => skill.name.toLowerCase().includes(searchQuery.toLowerCase()) || skill.category.toLowerCase().includes(searchQuery.toLowerCase()));

	if (!user) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center">
					<p className="text-foreground-muted">please sign in to view your skills.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background-alt">
			{/* navigation */}
			<nav className="bg-surface shadow-sm border-b border-border px-6 py-4">
				<div className="max-w-7xl mx-auto flex justify-between items-center">
					<h1 className="text-2xl font-bold text-foreground">my skills</h1>
					<Button>
						<Plus className="w-4 h-4 mr-2" />
						add skill
					</Button>
				</div>
			</nav>

			{/* content */}
			<main className="max-w-7xl mx-auto px-6 py-8">
				{/* header */}
				<div className="mb-8">
					<h2 className="text-3xl font-bold text-foreground mb-4">track your professional skills</h2>
					<p className="text-lg text-foreground-muted">Monitor your progress and identify areas for improvement across different skill categories.</p>
				</div>

				{/* search */}
				<div className="mb-8">
					<Input placeholder="Search skills or categories..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} leftIcon={<Search className="w-4 h-4" />} className="max-w-md" />
				</div>

				{/* skills grid */}
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredSkills.map((skill) => (
						<Card key={skill.id} variant="default" className="hover:shadow-lg transition-shadow">
							<CardHeader>
								<div className="flex justify-between items-start">
									<CardTitle as="h3">{skill.name}</CardTitle>
									<ProficiencyBadge level={skill.proficiency} />
								</div>
								<Badge variant="default" size="sm">
									{skill.category}
								</Badge>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div>
										<div className="flex justify-between text-sm text-foreground-muted mb-1">
											<span>Progress</span>
											<span>{skill.proficiency === "BEGINNER" ? "25%" : skill.proficiency === "INTERMEDIATE" ? "50%" : skill.proficiency === "ADVANCED" ? "75%" : "90%"}</span>
										</div>
										<div className="w-full bg-surface-muted rounded-full h-2">
											<div
												className="bg-primary h-2 rounded-full transition-all duration-300"
												style={{
													width: skill.proficiency === "BEGINNER" ? "25%" : skill.proficiency === "INTERMEDIATE" ? "50%" : skill.proficiency === "ADVANCED" ? "75%" : "90%",
												}}
											/>
										</div>
									</div>
									<div className="flex gap-2">
										<Button variant="outline" size="sm" className="flex-1">
											Update
										</Button>
										<Button variant="primary" size="sm" className="flex-1">
											Learn More
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{filteredSkills.length === 0 && (
					<div className="text-center py-12">
						<div className="text-foreground-subtle mb-4">
							<Search className="w-12 h-12 mx-auto" />
						</div>
						<h3 className="text-lg font-medium text-foreground mb-2">No skills found</h3>
						<p className="text-foreground-muted">{searchQuery ? "Try adjusting your search terms." : "Start by adding your first skill!"}</p>
						<Button className="mt-4">
							<Plus className="w-4 h-4 mr-2" />
							Add Your First Skill
						</Button>
					</div>
				)}
			</main>
		</div>
	);
}
