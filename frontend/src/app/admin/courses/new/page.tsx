"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/http";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import type { CreateCourseData } from "@/types";

export default function NewCoursePage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState<CreateCourseData>({
		title: "",
		description: "",
		provider: "",
		source: "INTERNAL",
		externalId: "",
		url: "",
		language: "en",
		difficulty: "BEGINNER",
		durationMinutes: undefined,
		rating: undefined,
		isPaid: false,
		priceCents: undefined,
		tags: [],
		skills: [],
	});

	const [tagInput, setTagInput] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.title.trim()) {
			alert("Title is required");
			return;
		}

		setLoading(true);
		try {
			await api.createCourse(formData);
			router.push("/admin/courses");
		} catch (error) {
			alert(`Failed to create course: ${error instanceof Error ? error.message : "Unknown error"}`);
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (field: keyof CreateCourseData, value: unknown) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const addTag = () => {
		if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
			handleInputChange("tags", [...(formData.tags || []), tagInput.trim()]);
			setTagInput("");
		}
	};

	const removeTag = (tagToRemove: string) => {
		handleInputChange("tags", formData.tags?.filter((tag) => tag !== tagToRemove) || []);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center space-x-4">
				<Link href="/admin/courses">
					<Button variant="ghost" size="sm">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Courses
					</Button>
				</Link>
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
					<p className="mt-2 text-gray-600">Add a new course to your platform</p>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Basic Information */}
				<Card>
					<CardHeader>
						<CardTitle>Basic Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
								<Input required value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} placeholder="Enter course title" />
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
								<Input value={formData.provider || ""} onChange={(e) => handleInputChange("provider", e.target.value)} placeholder="Course provider" />
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
							<textarea value={formData.description || ""} onChange={(e) => handleInputChange("description", e.target.value)} placeholder="Course description" rows={4} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
						</div>
					</CardContent>
				</Card>

				{/* Course Details */}
				<Card>
					<CardHeader>
						<CardTitle>Course Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
								<select value={formData.source} onChange={(e) => handleInputChange("source", e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
									<option value="INTERNAL">Internal</option>
									<option value="YOUTUBE">YouTube</option>
									<option value="UDEMY">Udemy</option>
									<option value="OTHER">Other</option>
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
								<select value={formData.difficulty} onChange={(e) => handleInputChange("difficulty", e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
									<option value="BEGINNER">Beginner</option>
									<option value="INTERMEDIATE">Intermediate</option>
									<option value="ADVANCED">Advanced</option>
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
								<Input value={formData.language || "en"} onChange={(e) => handleInputChange("language", e.target.value)} placeholder="Language code (e.g., en, es, fr)" />
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">External ID</label>
								<Input value={formData.externalId || ""} onChange={(e) => handleInputChange("externalId", e.target.value)} placeholder="External course ID" />
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Course URL</label>
								<Input type="url" value={formData.url || ""} onChange={(e) => handleInputChange("url", e.target.value)} placeholder="https://example.com/course" />
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
								<Input type="number" min="0" value={formData.durationMinutes || ""} onChange={(e) => handleInputChange("durationMinutes", e.target.value ? parseInt(e.target.value) : undefined)} placeholder="Course duration" />
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Rating (0-5)</label>
								<Input type="number" min="0" max="5" step="0.1" value={formData.rating || ""} onChange={(e) => handleInputChange("rating", e.target.value ? parseFloat(e.target.value) : undefined)} placeholder="Course rating" />
							</div>

							<div className="flex items-center pt-6">
								<label className="flex items-center">
									<input type="checkbox" checked={formData.isPaid} onChange={(e) => handleInputChange("isPaid", e.target.checked)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
									<span className="ml-2 text-sm text-gray-700">Paid Course</span>
								</label>
							</div>
						</div>

						{formData.isPaid && (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Price (cents)</label>
									<Input type="number" min="0" value={formData.priceCents || ""} onChange={(e) => handleInputChange("priceCents", e.target.value ? parseInt(e.target.value) : undefined)} placeholder="Price in cents (e.g., 2999 for $29.99)" />
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Tags */}
				<Card>
					<CardHeader>
						<CardTitle>Tags</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex space-x-2">
							<Input
								value={tagInput}
								onChange={(e) => setTagInput(e.target.value)}
								placeholder="Add a tag"
								onKeyPress={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										addTag();
									}
								}}
							/>
							<Button type="button" onClick={addTag} variant="outline">
								Add Tag
							</Button>
						</div>

						{formData.tags && formData.tags.length > 0 && (
							<div className="flex flex-wrap gap-2">
								{formData.tags.map((tag) => (
									<span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
										{tag}
										<button type="button" onClick={() => removeTag(tag)} className="ml-2 text-blue-600 hover:text-blue-800">
											×
										</button>
									</span>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Submit */}
				<div className="flex justify-end space-x-4">
					<Link href="/admin/courses">
						<Button variant="outline" type="button">
							Cancel
						</Button>
					</Link>
					<Button type="submit" disabled={loading}>
						{loading ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Creating...
							</>
						) : (
							<>
								<Save className="h-4 w-4 mr-2" />
								Create Course
							</>
						)}
					</Button>
				</div>
			</form>
		</div>
	);
}
