"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthProvider";
import { Button } from "@/components/ui/Button";
import { getTopRecommendedCourses } from "@/lib/recommendations";
import { enrollInCourse } from "@/lib/courses";
import { Star, Clock, BookOpen, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import type { Recommendation } from "@/types";

export function RecommendationsStrip() {
	const { user } = useAuth();
	const router = useRouter();
	const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [enrollingCourses, setEnrollingCourses] = useState<Set<string>>(new Set());

	useEffect(() => {
		if (user) {
			loadRecommendations();
		} else {
			setIsLoading(false);
		}
	}, [user]);

	const loadRecommendations = async () => {
		try {
			setIsLoading(true);
			const data = await getTopRecommendedCourses(5);
			setRecommendations(data);
		} catch (error) {
			console.error("Failed to load recommendations:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleEnrollClick = async (courseId: string) => {
		if (!user) {
			router.push("/login");
			return;
		}

		setEnrollingCourses(prev => new Set(prev).add(courseId));
		try {
			await enrollInCourse(courseId);
			router.push(`/courses/${courseId}`);
		} catch (error) {
			console.error("Enrollment failed:", error);
		} finally {
			setEnrollingCourses(prev => {
				const newSet = new Set(prev);
				newSet.delete(courseId);
				return newSet;
			});
		}
	};

	// Don't render if user is not logged in or no recommendations
	if (!user || isLoading || recommendations.length === 0) {
		return null;
	}

	return (
		<div className="mb-12">
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center space-x-3">
					<div className="w-10 h-10 bg-gradient-to-br from-primary to-purple rounded-lg flex items-center justify-center">
						<Sparkles className="w-5 h-5 text-white" />
					</div>
					<div>
						<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Recommended for You</h2>
						<p className="text-gray-600 dark:text-gray-300">Courses tailored to your skills and interests</p>
					</div>
				</div>
				<Button
					onClick={() => router.push("/courses/recommended")}
					variant="outline"
					className="flex items-center space-x-2 px-4 py-2"
				>
					<span>View All</span>
					<ChevronRight className="w-4 h-4" />
				</Button>
			</div>

			{/* Recommendations Horizontal Scroll */}
			<div className="relative">
				<div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
					{recommendations.map(recommendation => {
						if (!recommendation.course) return null;

						const course = recommendation.course;

						return (
							<div
								key={recommendation.id}
								className="flex-none w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 group"
							>
								{/* Course Image */}
								<div className="relative h-40 bg-gradient-to-br from-primary/10 to-purple/10 overflow-hidden">
									{course.thumbnail ? (
										<Image
											src={course.thumbnail}
											alt={course.title}
											width={320}
											height={160}
											className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center">
											<BookOpen className="w-12 h-12 text-primary/30" />
										</div>
									)}
									{/* Score Badge */}
									<div className="absolute top-3 right-3">
										<span className="inline-flex items-center px-2 py-1 bg-black/20 backdrop-blur-sm text-white rounded-full text-xs font-medium">
											<Star className="w-3 h-3 mr-1 fill-current" />
											{Math.round(recommendation.score)}% Match
										</span>
									</div>
								</div>

								{/* Course Content */}
								<div className="p-5">
									<h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
										{course.title}
									</h3>

									<div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
										{course.durationMinutes && (
											<span className="flex items-center">
												<Clock className="w-4 h-4 mr-1" />
												{Math.round(course.durationMinutes / 60)}h
											</span>
										)}
										{course.rating && (
											<span className="flex items-center">
												<Star className="w-4 h-4 mr-1 fill-current text-yellow-400" />
												{course.rating}
											</span>
										)}
										<span className="capitalize px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
											{course.difficulty.toLowerCase()}
										</span>
									</div>

									{/* Recommendation Reason */}
									{recommendation.meta?.reasons && recommendation.meta.reasons.length > 0 && (
										<p className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full mb-3 line-clamp-1">
											{recommendation.meta.reasons[0]}
										</p>
									)}

									{/* Skills */}
									{course.skills && course.skills.length > 0 && (
										<div className="flex flex-wrap gap-1 mb-4">
											{course.skills.slice(0, 2).map((courseSkill, index) => (
												<span
													key={index}
													className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded"
												>
													{courseSkill.skill.name}
												</span>
											))}
											{course.skills.length > 2 && (
												<span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
													+{course.skills.length - 2}
												</span>
											)}
										</div>
									)}

									{/* Price & Action */}
									<div className="flex items-center justify-between">
										<div className="flex items-center space-x-2">
											{course.isPaid ? (
												<span className="text-lg font-bold text-gray-900 dark:text-gray-100">
													${((course.priceCents || 0) / 100).toFixed(2)}
												</span>
											) : (
												<span className="text-lg font-bold text-success">Free</span>
											)}
										</div>
										<Button
											onClick={() => handleEnrollClick(course.id)}
											disabled={enrollingCourses.has(course.id)}
											className="px-3 py-2 bg-gradient-to-r from-primary to-purple text-white rounded-lg hover:from-primary-600 hover:to-purple-600 transition-all duration-300 text-sm flex items-center space-x-1"
										>
											<span>{enrollingCourses.has(course.id) ? "Enrolling..." : "Enroll"}</span>
											{!enrollingCourses.has(course.id) && <ArrowRight className="w-3 h-3" />}
										</Button>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
