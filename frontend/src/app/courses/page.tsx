"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Search, Star, Clock, Users, Bookmark, ExternalLink } from "lucide-react";

export default function CoursesPage() {
	const {} = useAuth(); // Authentication context available if needed
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");

	// Mock data - replace with actual API calls
	const courses = [
		{
			id: "1",
			title: "Advanced React Patterns",
			description: "Learn advanced React patterns including render props, higher-order components, and hooks.",
			category: "Frontend Development",
			rating: 4.8,
			duration: "6 hours",
			students: 1234,
			price: 89,
			isBookmarked: true,
			skills: ["React", "JavaScript", "TypeScript"],
			source: "INTERNAL" as const,
		},
		{
			id: "2",
			title: "Node.js Microservices Architecture",
			description: "Build scalable microservices with Node.js, Docker, and Kubernetes.",
			category: "Backend Development",
			rating: 4.6,
			duration: "8 hours",
			students: 892,
			price: 129,
			isBookmarked: false,
			skills: ["Node.js", "Docker", "Kubernetes"],
			source: "EXTERNAL" as const,
		},
		{
			id: "3",
			title: "Machine Learning Fundamentals",
			description: "Introduction to machine learning concepts and practical implementations with Python.",
			category: "Data Science",
			rating: 4.9,
			duration: "12 hours",
			students: 2156,
			price: 199,
			isBookmarked: true,
			skills: ["Python", "Machine Learning", "Data Analysis"],
			source: "INTERNAL" as const,
		},
	];

	const categories = ["all", "Frontend Development", "Backend Development", "Data Science", "DevOps"];

	const filteredCourses = courses.filter((course) => {
		const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || course.description.toLowerCase().includes(searchQuery.toLowerCase()) || course.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()));

		const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;

		return matchesSearch && matchesCategory;
	});

	const toggleBookmark = (courseId: string) => {
		// Implementation would make API call to toggle bookmark
		console.log("Toggle bookmark for course:", courseId);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Navigation */}
			<nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
				<div className="max-w-7xl mx-auto">
					<h1 className="text-2xl font-bold text-gray-900">Courses</h1>
				</div>
			</nav>

			{/* Content */}
			<main className="max-w-7xl mx-auto px-6 py-8">
				{/* Header */}
				<div className="mb-8">
					<h2 className="text-3xl font-bold text-gray-900 mb-4">Expand Your Skillset</h2>
					<p className="text-lg text-gray-600">Discover high-quality courses from industry experts and level up your professional skills.</p>
				</div>

				{/* Filters */}
				<div className="mb-8 space-y-4">
					<Input placeholder="Search courses, skills, or topics..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} leftIcon={<Search className="w-4 h-4" />} className="max-w-md" />

					<div className="flex flex-wrap gap-2">
						{categories.map((category) => (
							<Button key={category} variant={selectedCategory === category ? "primary" : "outline"} size="sm" onClick={() => setSelectedCategory(category)}>
								{category === "all" ? "All Categories" : category}
							</Button>
						))}
					</div>
				</div>

				{/* Courses Grid */}
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredCourses.map((course) => (
						<Card key={course.id} variant="default" className="hover:shadow-lg transition-shadow">
							<CardHeader>
								<div className="flex justify-between items-start mb-2">
									<Badge variant={course.source === "INTERNAL" ? "primary" : "info"} size="sm">
										{course.source === "INTERNAL" ? "SkillHub" : "External"}
									</Badge>
									<Button variant="ghost" size="sm" onClick={() => toggleBookmark(course.id)} className="p-1 h-8 w-8">
										<Bookmark className={`w-4 h-4 ${course.isBookmarked ? "fill-current text-blue-600" : ""}`} />
									</Button>
								</div>
								<CardTitle as="h3" className="text-lg">
									{course.title}
								</CardTitle>
								<Badge variant="default" size="sm">
									{course.category}
								</Badge>
							</CardHeader>

							<CardContent>
								<p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

								<div className="space-y-3">
									<div className="flex items-center gap-4 text-sm text-gray-600">
										<div className="flex items-center gap-1">
											<Star className="w-4 h-4 fill-current text-yellow-400" />
											<span>{course.rating}</span>
										</div>
										<div className="flex items-center gap-1">
											<Clock className="w-4 h-4" />
											<span>{course.duration}</span>
										</div>
										<div className="flex items-center gap-1">
											<Users className="w-4 h-4" />
											<span>{course.students.toLocaleString()}</span>
										</div>
									</div>

									<div className="flex flex-wrap gap-1">
										{course.skills.slice(0, 3).map((skill, index) => (
											<Badge key={index} variant="default" size="sm" className="text-xs">
												{skill}
											</Badge>
										))}
										{course.skills.length > 3 && (
											<Badge variant="default" size="sm" className="text-xs">
												+{course.skills.length - 3}
											</Badge>
										)}
									</div>
								</div>
							</CardContent>

							<CardFooter>
								<div className="flex justify-between items-center w-full">
									<span className="text-lg font-bold text-gray-900">${course.price}</span>
									<Button size="sm">
										{course.source === "EXTERNAL" && <ExternalLink className="w-4 h-4 mr-2" />}
										Enroll Now
									</Button>
								</div>
							</CardFooter>
						</Card>
					))}
				</div>

				{filteredCourses.length === 0 && (
					<div className="text-center py-12">
						<div className="text-gray-400 mb-4">
							<Search className="w-12 h-12 mx-auto" />
						</div>
						<h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
						<p className="text-gray-600">{searchQuery || selectedCategory !== "all" ? "Try adjusting your search or filter criteria." : "Check back later for new courses!"}</p>
						<Button
							className="mt-4"
							variant="outline"
							onClick={() => {
								setSearchQuery("");
								setSelectedCategory("all");
							}}
						>
							Clear Filters
						</Button>
					</div>
				)}
			</main>
		</div>
	);
}
