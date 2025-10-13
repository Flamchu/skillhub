"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthProvider";
import { Footer } from "@/components/landing";
import { CoursesNavigation } from "@/components/courses";
import { Button } from "@/components/ui/Button";
import { getRecommendations, generateRecommendations } from "@/lib/recommendations";
import { enrollInCourse } from "@/lib/courses";
import { Star, Clock, BookOpen, RefreshCw, Sparkles, TrendingUp, Target } from "lucide-react";
import type { Recommendation } from "@/types";

export default function RecommendedCoursesPage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isGenerating, setIsGenerating] = useState(false);
	const [enrollingCourses, setEnrollingCourses] = useState<Set<string>>(new Set());
	const [error, setError] = useState<string | null>(null);

	const loadRecommendations = async () => {
		try {
			setIsLoading(true);
			setError(null);
			const data = await getRecommendations({ limit: 20, sortBy: "score", sortOrder: "desc" });
			setRecommendations(data.recommendations.filter(r => r.course));
		} catch (error) {
			console.error("Failed to load recommendations:", error);
			setError("Failed to load recommendations. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (loading) return; // wait for auth to load

		if (!user) {
			router.push("/login");
			return;
		}
		loadRecommendations();
	}, [user, loading, router]);

	const handleGenerateRecommendations = async (algorithm: "RULES" | "SEMANTIC" | "COLLAB_FILTER" = "SEMANTIC") => {
		try {
			setIsGenerating(true);
			setError(null);
			await generateRecommendations({ algorithm, maxRecommendations: 20 });
			loadRecommendations();
		} catch (error) {
			console.error("Failed to generate recommendations:", error);
			setError("Failed to generate recommendations. Please try again.");
		} finally {
			setIsGenerating(false);
		}
	};

	const handleGenerateClick = (algorithm: "RULES" | "SEMANTIC" | "COLLAB_FILTER" = "SEMANTIC") => {
		return () => handleGenerateRecommendations(algorithm);
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

	const getAlgorithmBadge = (algorithm: string) => {
		const badges = {
			RULES: { label: "Smart Match", color: "bg-primary/10 text-primary border-primary/20", icon: Target },
			CONTENT_BASED: { label: "Content Based", color: "bg-success/10 text-success border-success/20", icon: BookOpen },
			COLLAB_FILTER: { label: "Community", color: "bg-warning/10 text-warning border-warning/20", icon: Target },
			HYBRID: { label: "AI Powered", color: "bg-purple/10 text-purple border-purple/20", icon: Sparkles },
			SEMANTIC: { label: "AI Semantic", color: "bg-info/10 text-info border-info/20", icon: Sparkles },
		};
		return badges[algorithm as keyof typeof badges] || badges.RULES;
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mb-4" />
					<p className="text-gray-600 dark:text-gray-300">Loading...</p>
				</div>
			</div>
		);
	}

	if (!user) return null;

	return (
		<div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100">
			<CoursesNavigation />
			<main className="px-6 py-20">
				<div className="max-w-7xl mx-auto">
					{/* Hero Section */}
					<div className="text-center mb-20">
						<div className="mb-6">
							<span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 text-purple dark:text-purple-400 rounded-full text-sm font-semibold border border-purple/30 dark:border-purple-400/30">
								<Sparkles className="w-4 h-4 mr-2" />
								Personalized for You
							</span>
						</div>
						<h1 className="text-5xl md:text-6xl font-bold mb-6">
							<span className="bg-gradient-to-br from-primary via-purple to-pink text-transparent bg-clip-text">
								Recommended Courses
							</span>
							<br />
							<span className="text-gray-900 dark:text-gray-100 text-3xl md:text-4xl">Tailored to Your Skills</span>
						</h1>
						<p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
							Discover courses curated specifically for your skill level and learning goals using our intelligent
							recommendation system.
						</p>

						{/* Algorithm Selection */}
						<div className="flex flex-wrap justify-center gap-3 mb-6">
							<Button
								onClick={handleGenerateClick("SEMANTIC")}
								disabled={isGenerating}
								className="px-4 py-2 bg-gradient-to-r from-info to-info-600 text-white rounded-lg hover:from-info-600 hover:to-info-700 shadow-md hover:shadow-lg transition-all duration-300"
							>
								<Sparkles className="w-4 h-4 mr-2" />
								AI Semantic
							</Button>
							<Button
								onClick={handleGenerateClick("RULES")}
								disabled={isGenerating}
								className="px-4 py-2 bg-gradient-to-r from-primary to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg transition-all duration-300"
							>
								<Target className="w-4 h-4 mr-2" />
								Smart Match
							</Button>
							<Button
								onClick={handleGenerateClick("COLLAB_FILTER")}
								disabled={isGenerating}
								className="px-4 py-2 bg-gradient-to-r from-warning to-warning-600 text-white rounded-lg hover:from-warning-600 hover:to-warning-700 shadow-md hover:shadow-lg transition-all duration-300"
							>
								<Target className="w-4 h-4 mr-2" />
								Community
							</Button>
						</div>

						<div className="flex justify-center">
							<Button
								onClick={handleGenerateClick("SEMANTIC")}
								disabled={isGenerating}
								className="px-8 py-3 bg-gradient-to-r from-primary to-purple text-white rounded-lg hover:from-primary-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
							>
								{isGenerating ? (
									<>
										<RefreshCw className="w-4 h-4 mr-2 animate-spin" />
										Generating...
									</>
								) : (
									<>
										<TrendingUp className="w-4 h-4 mr-2" />
										Refresh Recommendations
									</>
								)}
							</Button>
						</div>
					</div>

					{/* Error State */}
					{error && (
						<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
							<p className="text-red-600 dark:text-red-400">{error}</p>
						</div>
					)}

					{/* Loading State */}
					{isLoading ? (
						<div className="flex items-center justify-center py-20">
							<div className="flex items-center space-x-3">
								<RefreshCw className="w-6 h-6 animate-spin text-primary" />
								<span className="text-lg text-gray-600 dark:text-gray-300">Loading recommendations...</span>
							</div>
						</div>
					) : recommendations.length === 0 ? (
						/* Empty State */
						<div className="text-center py-20">
							<div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/10 to-purple/10 rounded-full flex items-center justify-center">
								<BookOpen className="w-12 h-12 text-primary" />
							</div>
							<h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">No Recommendations Yet</h3>
							<p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
								We need to learn about your skills first. Add some skills to your profile and we&apos;ll recommend
								courses for you!
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<Button
									onClick={handleGenerateClick("SEMANTIC")}
									disabled={isGenerating}
									className="px-6 py-3 bg-gradient-to-r from-primary to-purple text-white rounded-lg"
								>
									<TrendingUp className="w-4 h-4 mr-2" />
									Generate Recommendations
								</Button>
								<Button onClick={() => router.push("/skills")} variant="outline" className="px-6 py-3">
									<Target className="w-4 h-4 mr-2" />
									Add Skills
								</Button>
							</div>
						</div>
					) : (
						/* Recommendations Grid */
						<div>
							<div className="flex items-center justify-between mb-8">
								<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
									{recommendations.length} Courses Recommended for You
								</h2>
							</div>

							<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
								{recommendations.map(recommendation => {
									if (!recommendation.course) return null;

									const course = recommendation.course;
									const badge = getAlgorithmBadge(recommendation.algorithm);
									const IconComponent = badge.icon;

									return (
										<div
											key={recommendation.id}
											className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden border border-gray-100 dark:border-gray-700"
										>
											{/* Course Image */}
											<div className="relative h-48 bg-gradient-to-br from-primary/10 to-purple/10 overflow-hidden">
												{course.thumbnail ? (
													<Image
														src={course.thumbnail}
														alt={course.title}
														width={400}
														height={192}
														className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
													/>
												) : (
													<div className="w-full h-full flex items-center justify-center">
														<BookOpen className="w-16 h-16 text-primary/30" />
													</div>
												)}
												{/* Recommendation Badge */}
												<div className="absolute top-3 left-3">
													<span
														className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${badge.color}`}
													>
														<IconComponent className="w-3 h-3 mr-1" />
														{badge.label}
													</span>
												</div>
												{/* Score Badge */}
												<div className="absolute top-3 right-3">
													<span className="inline-flex items-center px-2 py-1 bg-black/20 backdrop-blur-sm text-white rounded-full text-xs font-medium">
														<Star className="w-3 h-3 mr-1 fill-current" />
														{Math.round(recommendation.score)}%
													</span>
												</div>
											</div>

											{/* Course Content */}
											<div className="p-6">
												<div className="flex items-start justify-between mb-3">
													<div className="flex-1">
														<h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
															{course.title}
														</h3>
														<div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
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
													</div>
												</div>

												{course.description && (
													<p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
														{course.description}
													</p>
												)}

												{/* Recommendation Reasons */}
												{recommendation.meta?.reasons && recommendation.meta.reasons.length > 0 && (
													<div className="mb-4">
														<p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Why recommended:</p>
														<div className="flex flex-wrap gap-1">
															{recommendation.meta.reasons.slice(0, 2).map((reason, index) => (
																<span key={index} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
																	{reason}
																</span>
															))}
														</div>
													</div>
												)}

												{/* Skills Tags */}
												{course.skills && course.skills.length > 0 && (
													<div className="flex flex-wrap gap-1 mb-4">
														{course.skills.slice(0, 3).map((courseSkill, index) => (
															<span
																key={index}
																className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded"
															>
																{courseSkill.skill.name}
															</span>
														))}
														{course.skills.length > 3 && (
															<span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
																+{course.skills.length - 3} more
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
														className="px-4 py-2 bg-gradient-to-r from-primary to-purple text-white rounded-lg hover:from-primary-600 hover:to-purple-600 transition-all duration-300 text-sm"
													>
														{enrollingCourses.has(course.id) ? "Enrolling..." : "Enroll Now"}
													</Button>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}
				</div>
			</main>
			<Footer />
		</div>
	);
}
