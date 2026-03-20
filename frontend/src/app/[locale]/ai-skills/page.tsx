"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthProvider";
import { AuthenticatedLayout } from "@/components/layout";
import { LoadingState } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Sparkles, ArrowRight, Target, TrendingUp, Zap } from "lucide-react";
import type { AISkillSuggestion } from "@/types";
import Link from "next/link";
import { OnboardingOverlay, PromptTemplates, GenerationProgress, SkillProficiencyEditor } from "@/components/ai-skills";
import { generateAISkills } from "@/lib/recommendations";

type GenerationStage = "input" | "analyzing" | "generating" | "complete" | "editing";

export default function AISkillsPage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const t = useTranslations("aiSkills.page");
	const tCommon = useTranslations("common");

	// onboarding state
	const [showOnboarding, setShowOnboarding] = useState(true);
	const [onboardingComplete, setOnboardingComplete] = useState(false);

	// generation state
	const [prompt, setPrompt] = useState("");
	const [stage, setStage] = useState<GenerationStage>("input");
	const [suggestions, setSuggestions] = useState<AISkillSuggestion[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [hasAddedSkills, setHasAddedSkills] = useState(false);

	useEffect(() => {
		// auth check
		const timer = setTimeout(() => {
			if (!loading && !user) {
				router.push("/auth");
			}
		}, 200);

		if (user) {
			clearTimeout(timer);
		}

		return () => clearTimeout(timer);
	}, [user, loading, router]);

	const handleOnboardingComplete = () => {
		setOnboardingComplete(true);
		setShowOnboarding(false);
	};

	const handleTemplateSelect = (template: string) => {
		setPrompt(template);
	};

	const handleGenerate = async () => {
		if (!user) return;
		if (prompt.trim().length < 10) {
			setError(t("errors.promptTooShort"));
			return;
		}

		try {
			setError(null);
			setStage("analyzing");

			console.warn("[AI Skills] Starting generation with prompt:", prompt.trim());

			// show analyzing stage for a moment before calling API
			await new Promise(resolve => setTimeout(resolve, 1000));
			setStage("generating");

			const response = await generateAISkills({ prompt: prompt.trim() });

			console.warn("[AI Skills] Received response:", response);

			// show generating stage for a moment before transitioning to editing
			await new Promise(resolve => setTimeout(resolve, 800));

			setSuggestions(response.skills);
			setStage("editing");
		} catch (error: unknown) {
			console.error("[AI Skills] Generation failed:", error);
			console.error("[AI Skills] Error type:", typeof error);
			console.error(
				"[AI Skills] Error keys:",
				error && typeof error === "object" ? Object.keys(error) : "not an object"
			);

			// extract error message from various error formats
			const errorMessage =
				(error && typeof error === "object" && "message" in error ? error.message : null) ||
				(error && typeof error === "object" && "error" in error ? (error as { error: string }).error : null) ||
				(error && typeof error === "object" && "details" in error
					? String((error as { details: unknown }).details)
					: null) ||
				(typeof error === "string" ? error : t("errors.generate"));

			console.error("[AI Skills] Extracted error message:", errorMessage);

			setError(String(errorMessage));
			setStage("input");
		}
	};

	const handleSaveSkills = async (skills: AISkillSuggestion[]) => {
		if (!user?.id) return;

		// check if any skills are selected
		if (skills.length === 0) {
			setError(t("errors.selectSkills"));
			return;
		}

		try {
			const { api } = await import("@/lib/http");

			const errors: string[] = [];
			const skipped: string[] = [];
			let successCount = 0;

			// add skills to profile
			for (const skillSuggestion of skills) {
				try {
					await api.addUserSkill(user.id, {
						skillId: skillSuggestion.skill.id,
						proficiency:
							skillSuggestion.suggestedProficiency === "NONE" ? "BASIC" : skillSuggestion.suggestedProficiency,
					});
					successCount++;
				} catch (error: unknown) {
					// extract error message from axios interceptor format or standard error
					let errorMessage = "Unknown error";

					if (error && typeof error === "object") {
						// axios interceptor throws: { status, message, details, path, data }
						if ("message" in error && error.message) {
							errorMessage = String(error.message);
						} else if ("error" in error && (error as { error: unknown }).error) {
							errorMessage = String((error as { error: unknown }).error);
						} else if ("details" in error && (error as { details: unknown }).details) {
							errorMessage = String((error as { details: unknown }).details);
						}
					} else if (typeof error === "string") {
						errorMessage = error;
					}

					// skip "already has skill" errors silently - this is expected behavior
					if (errorMessage.toLowerCase().includes("already has this skill")) {
						console.warn(`[AI Skills] Skipping ${skillSuggestion.skill.name} - already in profile`);
						skipped.push(skillSuggestion.skill.name);
						continue;
					}

					console.error(`[AI Skills] Failed to add skill ${skillSuggestion.skill.name}:`, {
						error,
						extractedMessage: errorMessage,
						errorType: typeof error,
						errorKeys: error && typeof error === "object" ? Object.keys(error) : [],
					});

					errors.push(`${skillSuggestion.skill.name}: ${errorMessage}`);
				}
			}

			// show appropriate message based on results
			if (errors.length === 0 && skipped.length === 0) {
				// all succeeded
				console.warn(`[AI Skills] Successfully added all ${successCount} skills`);
			} else if (errors.length === 0 && skipped.length > 0) {
				// some skipped but no errors
				console.warn(
					`[AI Skills] Added ${successCount} new skills, skipped ${skipped.length} existing: ${skipped.join(", ")}`
				);
			} else if (errors.length > 0 && successCount > 0) {
				// partial success
				console.warn("[AI Skills] Some skills failed to add:", errors);
				setError(t("errors.partialAdd", { count: successCount, errors: errors.join(", ") }));
			} else if (errors.length > 0 && successCount === 0) {
				// all failed
				throw new Error(`All skills failed to add: ${errors.join(", ")}`);
			}

			setHasAddedSkills(successCount > 0);
			setStage("complete");
		} catch (error: unknown) {
			console.error("[AI Skills] Error processing generated skills:", error);
			const errorMessage =
				(error && typeof error === "object" && "message" in error ? String(error.message) : null) ||
				t("errors.addSkills");
			setError(errorMessage);
		}
	};

	const handleCancelEdit = () => {
		setStage("input");
		setSuggestions([]);
	};

	const handleStartOver = () => {
		setPrompt("");
		setStage("input");
		setSuggestions([]);
		setHasAddedSkills(false);
		setError(null);
	};

	if (loading) {
		return <LoadingState message={tCommon("loading")} />;
	}

	if (!user) {
		return null;
	}

	return (
		<AuthenticatedLayout>
			<div className="min-h-screen bg-linear-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
				<div className="max-w-7xl mx-auto p-6">
					{/* onboarding overlay */}
					{showOnboarding && !onboardingComplete && <OnboardingOverlay onComplete={handleOnboardingComplete} />}

					{/* hero section */}
					<div className="relative overflow-hidden">
						{/* decorative background */}
						<div className="absolute inset-0 -z-10">
							<div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
							<div
								className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple/10 rounded-full blur-3xl animate-pulse"
								style={{ animationDelay: "1s" }}
							/>
						</div>

						{/* header */}
						<div className="text-center mb-12 pt-8">
							<div className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-primary/10 to-purple/10 rounded-full border border-primary/20 mb-6">
								<Sparkles className="w-5 h-5 text-primary" />
								<span className="text-sm font-semibold text-primary">{t("badge")}</span>
							</div>

							<h1 className="text-5xl md:text-6xl font-bold mb-6">
								<span className="bg-linear-to-br from-primary via-purple to-pink text-transparent bg-clip-text">
									{t("title")}
								</span>
							</h1>

							<p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
								{t("description")}
							</p>

							{/* how it works - only show on input stage */}
							{stage === "input" && (
								<div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
									<div className="relative group">
										<div className="absolute inset-0 bg-linear-to-br from-primary/20 to-purple/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
										<div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
											<div className="w-12 h-12 bg-linear-to-br from-primary to-purple rounded-xl flex items-center justify-center mb-4 mx-auto">
												<Target className="w-6 h-6 text-white" />
											</div>
											<h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{t("steps.describe.title")}</h3>
											<p className="text-sm text-gray-600 dark:text-gray-300">
												{t("steps.describe.description")}
											</p>
										</div>
									</div>

									<div className="relative group">
										<div className="absolute inset-0 bg-linear-to-br from-purple/20 to-pink/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
										<div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
											<div className="w-12 h-12 bg-linear-to-br from-purple to-pink rounded-xl flex items-center justify-center mb-4 mx-auto">
												<Sparkles className="w-6 h-6 text-white" />
											</div>
											<h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{t("steps.analyze.title")}</h3>
											<p className="text-sm text-gray-600 dark:text-gray-300">
												{t("steps.analyze.description")}
											</p>
										</div>
									</div>

									<div className="relative group">
										<div className="absolute inset-0 bg-linear-to-br from-pink/20 to-success/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
										<div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
											<div className="w-12 h-12 bg-linear-to-br from-pink to-success rounded-xl flex items-center justify-center mb-4 mx-auto">
												<TrendingUp className="w-6 h-6 text-white" />
											</div>
											<h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{t("steps.recommend.title")}</h3>
											<p className="text-sm text-gray-600 dark:text-gray-300">
												{t("steps.recommend.description")}
											</p>
										</div>
									</div>
								</div>
							)}
						</div>

						{/* main content area */}
						<div className="max-w-4xl mx-auto mb-12">
							<div className="relative">
								<div className="absolute inset-0 bg-linear-to-br from-primary/5 to-purple/5 rounded-3xl blur-2xl" />
								<div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
									{/* input stage */}
									{stage === "input" && (
										<div className="space-y-6">
											<div>
												<label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
													{t("form.label")}
												</label>
												<textarea
													value={prompt}
													onChange={e => setPrompt(e.target.value)}
													placeholder={t("form.placeholder")}
													className="w-full h-32 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-primary resize-none"
												/>
												{error && <p className="text-sm text-red-500 mt-2">{error}</p>}
											</div>

											<PromptTemplates onSelectTemplate={handleTemplateSelect} />

											<Button
												onClick={handleGenerate}
												disabled={prompt.trim().length < 10}
												size="lg"
												className="w-full bg-linear-to-r from-primary to-purple text-white text-lg font-semibold py-6"
											>
												<Sparkles className="w-5 h-5 mr-2" />
												{t("actions.generate")}
												<ArrowRight className="w-5 h-5 ml-2" />
											</Button>
										</div>
									)}

									{/* generating stages */}
									{(stage === "analyzing" || stage === "generating") && <GenerationProgress stage={stage} />}

									{/* editing stage */}
									{stage === "editing" && suggestions.length > 0 && (
										<SkillProficiencyEditor
											suggestions={suggestions}
											onSave={handleSaveSkills}
											onCancel={handleCancelEdit}
										/>
									)}

									{/* success stage */}
									{stage === "complete" && hasAddedSkills && (
										<div className="text-center space-y-6">
											<div className="w-20 h-20 bg-linear-to-br from-success to-info rounded-full flex items-center justify-center mx-auto">
												<Zap className="w-10 h-10 text-white" />
											</div>
											<h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
												{t("success.title")}
											</h3>
											<p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
												{t("success.description")}
											</p>
											<div className="flex flex-wrap justify-center gap-4 pt-4">
												<Link href="/courses/recommended">
													<Button variant="primary" size="lg" className="bg-linear-to-r from-primary to-purple">
														{t("success.actions.recommendations")}
														<ArrowRight className="w-5 h-5 ml-2" />
													</Button>
												</Link>
												<Link href="/skills">
													<Button variant="outline" size="lg">
														<Target className="w-5 h-5 mr-2" />
														{t("success.actions.skills")}
													</Button>
												</Link>
												<Button variant="outline" size="lg" onClick={handleStartOver}>
													<Sparkles className="w-5 h-5 mr-2" />
													{t("success.actions.generateMore")}
												</Button>
											</div>
										</div>
									)}
								</div>
							</div>
						</div>

						{/* benefits section - only show on input stage */}
						{stage === "input" && (
							<div className="max-w-4xl mx-auto mb-12">
								<div className="bg-linear-to-r from-primary/10 via-purple/10 to-pink/10 rounded-2xl p-8 border border-primary/20">
									<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
										{t("benefits.title")}
									</h2>
									<div className="grid md:grid-cols-2 gap-6">
										<div className="flex items-start gap-3">
											<div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
												<Sparkles className="w-5 h-5 text-primary" />
											</div>
											<div>
												<h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{t("benefits.saveTime.title")}</h3>
												<p className="text-sm text-gray-600 dark:text-gray-300">
													{t("benefits.saveTime.description")}
												</p>
											</div>
										</div>
										<div className="flex items-start gap-3">
											<div className="w-8 h-8 bg-purple/20 rounded-lg flex items-center justify-center shrink-0">
												<Target className="w-5 h-5 text-purple" />
											</div>
											<div>
												<h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
													{t("benefits.accurateProficiency.title")}
												</h3>
												<p className="text-sm text-gray-600 dark:text-gray-300">
													{t("benefits.accurateProficiency.description")}
												</p>
											</div>
										</div>
										<div className="flex items-start gap-3">
											<div className="w-8 h-8 bg-pink/20 rounded-lg flex items-center justify-center shrink-0">
												<TrendingUp className="w-5 h-5 text-pink" />
											</div>
											<div>
												<h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
													{t("benefits.betterRecommendations.title")}
												</h3>
												<p className="text-sm text-gray-600 dark:text-gray-300">
													{t("benefits.betterRecommendations.description")}
												</p>
											</div>
										</div>
										<div className="flex items-start gap-3">
											<div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center shrink-0">
												<Zap className="w-5 h-5 text-success" />
											</div>
											<div>
												<h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
													{t("benefits.hiddenSkills.title")}
												</h3>
												<p className="text-sm text-gray-600 dark:text-gray-300">
													{t("benefits.hiddenSkills.description")}
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</AuthenticatedLayout>
	);
}
