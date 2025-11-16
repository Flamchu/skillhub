"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { Button } from "@/components/ui/Button";
import { AISkillGenerator } from "@/components/skills/AISkillGenerator";
import { getRecommendations } from "@/lib/recommendations";
import {
	User,
	Settings,
	BookOpen,
	Target,
	Award,
	ArrowRight,
	Star,
	TrendingUp,
	Edit3,
	Eye,
	Mail,
	Briefcase,
	CheckCircle,
	Play,
} from "lucide-react";
import type { Recommendation, AISkillSuggestion, UserActivity, UserActivityResponse } from "@/types";
import { fetchUserActivity } from "@/lib/auth";
import { SuccessAnimation } from "@/components/ui/SuccessAnimation";
import Image from "next/image";
import Link from "next/link";

export default function ProfilePage() {
	const { user, profile, loading } = useAuth();
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("overview");
	const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
	const [loadingRecommendations, setLoadingRecommendations] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);
	const [successMessage, setSuccessMessage] = useState("");
	const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
	const [loadingActivity, setLoadingActivity] = useState(false);

	useEffect(() => {
		if (!loading && !user) {
			router.push("/auth");
			return;
		}

		// check tab parameter
		const urlParams = new URLSearchParams(window.location.search);
		const tabParam = urlParams.get("tab");
		if (tabParam && ["overview", "recommendations", "ai-skills", "settings"].includes(tabParam)) {
			setActiveTab(tabParam);
		}

		if (user) {
			loadRecommendations();

			// load user activity
			const loadActivity = async () => {
				try {
					setLoadingActivity(true);
					const data: UserActivityResponse = await fetchUserActivity(user.id, 8);
					setUserActivity(data.activity);
				} catch (error) {
					console.error("Failed to load user activity:", error);
				} finally {
					setLoadingActivity(false);
				}
			};

			loadActivity();
		}
	}, [user, loading, router]);

	const loadRecommendations = async () => {
		try {
			setLoadingRecommendations(true);
			const data = await getRecommendations({ limit: 6, sortBy: "score", sortOrder: "desc" });
			setRecommendations(data.recommendations.filter(r => r.course));
		} catch (error) {
			console.error("Failed to load recommendations:", error);
		} finally {
			setLoadingRecommendations(false);
		}
	};

	const handleSkillsGenerated = async (skills: AISkillSuggestion[]) => {
		if (!user?.id) return;

		try {
			const { api } = await import("@/lib/http");

			// add skills to profile
			for (const skillSuggestion of skills) {
				try {
					await api.addUserSkill(user.id, {
						skillId: skillSuggestion.skill.id,
						proficiency:
							skillSuggestion.suggestedProficiency === "NONE" ? "BASIC" : skillSuggestion.suggestedProficiency,
						progress:
							skillSuggestion.suggestedProficiency === "NONE"
								? 0
								: skillSuggestion.suggestedProficiency === "BASIC"
									? 25
									: skillSuggestion.suggestedProficiency === "INTERMEDIATE"
										? 50
										: skillSuggestion.suggestedProficiency === "ADVANCED"
											? 75
											: 90,
					});
				} catch (error) {
					// log error but continue with other skills
					console.warn(`Failed to add skill ${skillSuggestion.skill.name}:`, error);
				}
			}

			// show success and switch to overview tab
			setSuccessMessage(`Successfully added ${skills.length} skills to your profile!`);
			setShowSuccess(true);
			setActiveTab("overview");

			// refresh recommendations after adding skills
			loadRecommendations();
		} catch (error) {
			console.error("Failed to add skills:", error);
			setSuccessMessage("Failed to add some skills. Please try again.");
			setShowSuccess(true);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-linear-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
					<p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
				</div>
			</div>
		);
	}

	if (!user) return null;

	const tabs = [
		{ id: "overview", label: "Overview", icon: User },
		{ id: "recommendations", label: "Recommendations", icon: Target },
		{ id: "ai-skills", label: "AI Skills", icon: Star },
		{ id: "settings", label: "Settings", icon: Settings },
	];

	return (
		<div className="min-h-screen bg-linear-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
			{/* Navigation */}
			<nav className="px-6 py-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-primary/20 dark:border-gray-700">
				<div className="max-w-7xl mx-auto flex justify-between items-center">
					<Link
						href="/dashboard"
						className="text-3xl font-bold bg-linear-to-br from-primary via-purple to-pink text-transparent bg-clip-text hover:scale-105 transition-transform"
					>
						SkillHub ✨
					</Link>
					<div className="flex items-center space-x-4">
						<Button onClick={() => router.push("/courses")} variant="outline" className="flex items-center space-x-2">
							<BookOpen className="w-4 h-4" />
							<span>Browse Courses</span>
						</Button>
						<Button
							onClick={() => router.push("/courses/recommended")}
							className="flex items-center space-x-2 bg-linear-to-r from-primary to-purple text-white"
						>
							<Target className="w-4 h-4" />
							<span>My Recommendations</span>
						</Button>
					</div>
				</div>
			</nav>

			<main className="max-w-7xl mx-auto px-6 py-8">
				{/* Profile Header */}
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
					<div className="relative h-48 bg-linear-to-r from-primary via-purple to-pink">
						<div className="absolute inset-0 bg-black/20" />
						<div className="absolute bottom-6 left-6 right-6">
							<div className="flex items-end justify-between">
								<div className="flex items-end space-x-6">
									<div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-800">
										{user.name ? (
											<span className="text-2xl font-bold text-primary">{user.name.charAt(0).toUpperCase()}</span>
										) : (
											<User className="w-8 h-8 text-gray-400" />
										)}
									</div>
									<div className="pb-2">
										<h1 className="text-3xl font-bold text-white mb-1">{user.name || "Anonymous User"}</h1>
										{profile?.headline && <p className="text-white/90 text-lg">{profile.headline}</p>}
									</div>
								</div>
								<Button
									onClick={() => setIsEditing(!isEditing)}
									variant="outline"
									className="mb-2 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
								>
									{isEditing ? <Eye className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
									{isEditing ? "View Mode" : "Edit Profile"}
								</Button>
							</div>
						</div>
					</div>

					{/* Profile Info */}
					<div className="p-6">
						<div className="grid md:grid-cols-3 gap-6">
							<div className="md:col-span-2">
								{profile?.bio ? (
									<div className="mb-6">
										<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">About</h3>
										<p className="text-gray-600 dark:text-gray-300 leading-relaxed">{profile.bio}</p>
									</div>
								) : (
									<div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600">
										<p className="text-gray-500 dark:text-gray-400 text-center">
											Add a bio to tell others about yourself
										</p>
									</div>
								)}

								<div className="grid grid-cols-2 gap-4">
									<div className="flex items-center space-x-3">
										<Mail className="w-5 h-5 text-gray-400" />
										<span className="text-gray-600 dark:text-gray-300">{user.email || "No email"}</span>
									</div>
									<div className="flex items-center space-x-3">
										<Briefcase className="w-5 h-5 text-gray-400" />
										<span className="text-gray-600 dark:text-gray-300 capitalize">
											{user.role?.toLowerCase() || "User"}
										</span>
									</div>
								</div>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Stats</h3>
								<div className="space-y-3">
									<div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
										<span className="text-gray-600 dark:text-gray-300">Skills</span>
										<span className="font-bold text-primary">12</span>
									</div>
									<div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
										<span className="text-gray-600 dark:text-gray-300">Courses</span>
										<span className="font-bold text-success">8</span>
									</div>
									<div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
										<span className="text-gray-600 dark:text-gray-300">Certificates</span>
										<span className="font-bold text-warning">3</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Tabs */}
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
					{/* Tab Navigation */}
					<div className="border-b border-gray-200 dark:border-gray-700">
						<nav className="flex space-x-8 px-6">
							{tabs.map(tab => {
								const IconComponent = tab.icon;
								return (
									<button
										key={tab.id}
										onClick={() => setActiveTab(tab.id)}
										className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
											activeTab === tab.id
												? "border-primary text-primary"
												: "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
										}`}
									>
										<IconComponent className="w-4 h-4" />
										<span>{tab.label}</span>
									</button>
								);
							})}
						</nav>
					</div>

					{/* Tab Content */}
					<div className="p-6">
						{activeTab === "overview" && (
							<div className="space-y-8">
								{/* Recent Activity */}
								<div>
									<h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h3>
									{loadingActivity ? (
										<div className="space-y-3">
											{[1, 2, 3].map(i => (
												<div
													key={i}
													className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg animate-pulse"
												>
													<div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full" />
													<div className="flex-1 space-y-2">
														<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
														<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
													</div>
												</div>
											))}
										</div>
									) : userActivity.length > 0 ? (
										<div className="space-y-3">
											{userActivity.map(activity => {
												const getActivityIcon = () => {
													switch (activity.icon) {
														case "Award":
															return <Award className="w-5 h-5 text-white" />;
														case "CheckCircle":
															return <CheckCircle className="w-5 h-5 text-white" />;
														case "Play":
															return <Play className="w-5 h-5 text-white" />;
														case "BookOpen":
														default:
															return <BookOpen className="w-5 h-5 text-white" />;
													}
												};

												const getActivityColor = () => {
													switch (activity.type) {
														case "completion":
															return "bg-success";
														case "progress":
															return activity.completed ? "bg-success" : "bg-primary";
														case "enrollment":
														default:
															return "bg-primary";
													}
												};

												return (
													<div
														key={activity.id}
														className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
													>
														<div
															className={`w-10 h-10 ${getActivityColor()} rounded-full flex items-center justify-center`}
														>
															{getActivityIcon()}
														</div>
														<div className="flex-1">
															<p className="font-medium text-gray-900 dark:text-gray-100">{activity.title}</p>
															<p className="text-sm text-gray-600 dark:text-gray-300">{activity.description}</p>
															<p className="text-sm text-gray-500 dark:text-gray-400">{activity.timeAgo}</p>
														</div>
													</div>
												);
											})}
										</div>
									) : (
										<div className="p-8 text-center bg-gray-50 dark:bg-gray-700 rounded-lg">
											<BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
											<p className="text-gray-500 dark:text-gray-400">No recent activity</p>
											<p className="text-sm text-gray-400 dark:text-gray-500">
												Start learning to see your progress here
											</p>
										</div>
									)}
								</div>

								{/* Current Learning Path */}
								<div>
									<h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Current Learning Path</h3>
									<div className="bg-linear-to-r from-primary/10 to-purple/10 rounded-xl p-6">
										<div className="flex items-center justify-between mb-4">
											<h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Web Development Track</h4>
											<span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
												60% Complete
											</span>
										</div>
										<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
											<div
												className="bg-linear-to-r from-primary to-purple h-2 rounded-full"
												style={{ width: "60%" }}
											/>
										</div>
										<p className="text-gray-600 dark:text-gray-300 mb-4">
											Master modern web development with HTML, CSS, JavaScript, and React.
										</p>
										<Button className="bg-linear-to-r from-primary to-purple text-white">
											Continue Learning <ArrowRight className="w-4 h-4 ml-2" />
										</Button>
									</div>
								</div>
							</div>
						)}

						{activeTab === "recommendations" && (
							<div className="space-y-6">
								<div className="flex items-center justify-between">
									<h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
										Personalized Course Recommendations
									</h3>
									<Button
										onClick={() => router.push("/courses/recommended")}
										variant="outline"
										className="flex items-center space-x-2"
									>
										<TrendingUp className="w-4 h-4" />
										<span>View All</span>
									</Button>
								</div>

								{loadingRecommendations ? (
									<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
										{[1, 2, 3, 4, 5, 6].map(i => (
											<div key={i} className="animate-pulse">
												<div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg mb-4" />
												<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
												<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
											</div>
										))}
									</div>
								) : recommendations.length > 0 ? (
									<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
										{recommendations.map(recommendation => {
											if (!recommendation.course) return null;
											const course = recommendation.course;

											return (
												<div
													key={recommendation.id}
													className="bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
												>
													<div className="relative h-40 bg-linear-to-br from-primary/10 to-purple/10">
														{course.thumbnail ? (
															<Image
																src={course.thumbnail}
																alt={course.title}
																width={300}
																height={160}
																className="w-full h-full object-cover"
															/>
														) : (
															<div className="w-full h-full flex items-center justify-center">
																<BookOpen className="w-12 h-12 text-primary/30" />
															</div>
														)}
														<div className="absolute top-3 right-3">
															<span className="bg-black/20 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs">
																{Math.round(recommendation.score)}% Match
															</span>
														</div>
													</div>
													<div className="p-4">
														<h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
															{course.title}
														</h4>
														<p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
															{course.description}
														</p>
														<div className="flex items-center justify-between">
															<span className="text-sm font-medium text-primary">
																{course.isPaid ? `$${((course.priceCents || 0) / 100).toFixed(2)}` : "Free"}
															</span>
															<Button size="sm" className="bg-linear-to-r from-primary to-purple text-white">
																Enroll Now
															</Button>
														</div>
													</div>
												</div>
											);
										})}
									</div>
								) : (
									<div className="text-center py-12">
										<BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
										<h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
											No Recommendations Yet
										</h4>
										<p className="text-gray-600 dark:text-gray-300 mb-6">
											Add some skills to your profile to get personalized course recommendations.
										</p>
										<Button
											onClick={() => setActiveTab("ai-skills")}
											className="bg-linear-to-r from-primary to-purple text-white"
										>
											Generate Skills with AI
										</Button>
									</div>
								)}
							</div>
						)}

						{activeTab === "ai-skills" && (
							<div className="space-y-6">
								<div>
									<h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">AI Skill Generator</h3>
									<p className="text-gray-600 dark:text-gray-300">
										Tell our AI about your background, goals, or interests, and get personalized skill recommendations
										to add to your profile.
									</p>
								</div>

								<AISkillGenerator onSkillsGenerated={handleSkillsGenerated} />
							</div>
						)}

						{activeTab === "settings" && (
							<div className="space-y-8">
								<div>
									<h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Profile Settings</h3>
									<div className="space-y-6">
										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
												Display Name
											</label>
											<input
												type="text"
												value={user.name || ""}
												readOnly={!isEditing}
												className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
												Headline
											</label>
											<input
												type="text"
												value={profile?.headline || ""}
												readOnly={!isEditing}
												className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
												placeholder="e.g., Full Stack Developer, Data Scientist, etc."
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
											<textarea
												value={profile?.bio || ""}
												readOnly={!isEditing}
												rows={4}
												className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
												placeholder="Tell others about yourself, your experience, and what you're learning..."
											/>
										</div>

										{isEditing && (
											<div className="flex space-x-4">
												<Button className="bg-linear-to-r from-primary to-purple text-white">Save Changes</Button>
												<Button variant="outline" onClick={() => setIsEditing(false)}>
													Cancel
												</Button>
											</div>
										)}
									</div>
								</div>

								<div>
									<h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Notification Preferences</h3>
									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<div>
												<h4 className="font-medium text-gray-900 dark:text-gray-100">Course Recommendations</h4>
												<p className="text-sm text-gray-600 dark:text-gray-300">
													Get notified when new courses match your skills
												</p>
											</div>
											<input type="checkbox" defaultChecked className="h-5 w-5 text-primary" />
										</div>
										<div className="flex items-center justify-between">
											<div>
												<h4 className="font-medium text-gray-900 dark:text-gray-100">Learning Reminders</h4>
												<p className="text-sm text-gray-600 dark:text-gray-300">
													Reminders to continue your learning progress
												</p>
											</div>
											<input type="checkbox" defaultChecked className="h-5 w-5 text-primary" />
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</main>
			<SuccessAnimation message={successMessage} isVisible={showSuccess} onComplete={() => setShowSuccess(false)} />
		</div>
	);
}
