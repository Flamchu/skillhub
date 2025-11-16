import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { api } from "@/lib/http";
import { Youtube, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import type { YouTubeImportData, YouTubeImportResponse, Skill } from "@/types";

interface YouTubeImportModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: (result: YouTubeImportResponse) => void;
}

export function YouTubeImportModal({ isOpen, onClose, onSuccess }: YouTubeImportModalProps) {
	const [formData, setFormData] = useState<YouTubeImportData>({
		url: "",
		skillIds: [],
		difficulty: "BEGINNER",
		overrides: {},
	});
	const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
	const [skillsLoading, setSkillsLoading] = useState(false);
	const [skillSearch, setSkillSearch] = useState("");
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<YouTubeImportResponse | null>(null);
	const [error, setError] = useState<string | null>(null);

	// fetch skills when modal opens
	useEffect(() => {
		if (isOpen) {
			fetchSkills();
		}
	}, [isOpen]);

	const fetchSkills = async () => {
		setSkillsLoading(true);
		try {
			const response = await api.listSkills<{ skills: Skill[] }>();
			setAvailableSkills(response.skills || []);
		} catch (error) {
			console.error("Failed to fetch skills:", error);
		} finally {
			setSkillsLoading(false);
		}
	};

	const resetForm = () => {
		setFormData({
			url: "",
			skillIds: [],
			difficulty: "BEGINNER",
			overrides: {},
		});
		setSkillSearch("");
		setResult(null);
		setError(null);
	};

	const handleClose = () => {
		resetForm();
		onClose();
	};

	const toggleSkill = (skillId: string) => {
		setFormData(prev => ({
			...prev,
			skillIds: prev.skillIds?.includes(skillId)
				? prev.skillIds.filter(id => id !== skillId)
				: [...(prev.skillIds || []), skillId],
		}));
	};

	const filteredSkills = availableSkills.filter(skill => skill.name.toLowerCase().includes(skillSearch.toLowerCase()));

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.url.trim()) {
			setError("YouTube URL is required");
			return;
		}

		// validate YouTube URL
		const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|playlist\?list=)|youtu\.be\/)/;
		if (!youtubeRegex.test(formData.url)) {
			setError("Please enter a valid YouTube URL (video or playlist)");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const response = await api.importYouTubeCourse(formData);
			setResult(response);
			onSuccess(response);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to import YouTube course");
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
			<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
				<div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
							<Youtube className="h-5 w-5 text-red-600 dark:text-red-400" />
						</div>
						<div>
							<h2 className="text-xl font-bold text-gray-900 dark:text-white">Import YouTube Course</h2>
							<p className="text-sm text-gray-600 dark:text-gray-400">Import a YouTube video or playlist as a course</p>
						</div>
					</div>
					<Button variant="ghost" size="sm" onClick={handleClose}>
						<X className="h-5 w-5" />
					</Button>
				</div>

				<div className="p-6">
					{result ? (
						<div className="space-y-4">
							<Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
								<CheckCircle className="h-4 w-4 text-green-600" />
								<div>
									<h4 className="font-medium text-green-800 dark:text-green-200">Successfully Imported!</h4>
									<p className="text-green-700 dark:text-green-300 mt-1">{result.message}</p>
								</div>
							</Alert>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<CheckCircle className="h-5 w-5 text-green-600" />
										{result.course.title}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-2 text-sm">
										<p>
											<span className="font-medium">Lessons:</span> {result.lessonsCount}
										</p>
										<p>
											<span className="font-medium">Duration:</span> {result.course.durationMinutes} minutes
										</p>
										<p>
											<span className="font-medium">Difficulty:</span> {result.course.difficulty}
										</p>
										{result.course.aiSummary && (
											<div>
												<span className="font-medium">AI Summary:</span>
												<p className="text-gray-600 dark:text-gray-400 mt-1">{result.course.aiSummary}</p>
											</div>
										)}
									</div>
								</CardContent>
							</Card>

							<div className="flex gap-3">
								<Button onClick={handleClose} className="flex-1">
									Close
								</Button>
								<Button
									variant="ghost"
									onClick={() => {
										setResult(null);
										setFormData(prev => ({ ...prev, url: "" }));
									}}
								>
									Import Another
								</Button>
							</div>
						</div>
					) : (
						<form onSubmit={handleSubmit} className="space-y-6">
							{error && (
								<Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
									<AlertCircle className="h-4 w-4 text-red-600" />
									<div>
										<h4 className="font-medium text-red-800 dark:text-red-200">Error</h4>
										<p className="text-red-700 dark:text-red-300 mt-1">{error}</p>
									</div>
								</Alert>
							)}

							{/* URL Input */}
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">YouTube URL *</label>
								<Input
									placeholder="https://www.youtube.com/watch?v=... or https://www.youtube.com/playlist?list=..."
									value={formData.url}
									onChange={e => setFormData(prev => ({ ...prev, url: e.target.value }))}
									leftIcon={<Youtube className="h-4 w-4 text-red-500" />}
									required
								/>
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
									Supports both individual videos and playlists
								</p>
							</div>

							{/* Difficulty */}
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Difficulty Level
								</label>
								<select
									value={formData.difficulty}
									onChange={e =>
										setFormData(prev => ({
											...prev,
											difficulty: e.target.value as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
										}))
									}
									className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white backdrop-blur-sm transition-all duration-200"
								>
									<option value="BEGINNER">Beginner</option>
									<option value="INTERMEDIATE">Intermediate</option>
									<option value="ADVANCED">Advanced</option>
								</select>
							</div>

							{/* Skills */}
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Skills (Optional)
								</label>
								<div className="mb-2">
									<Input
										placeholder="Search skills..."
										value={skillSearch}
										onChange={e => setSkillSearch(e.target.value)}
									/>
								</div>

								{/* Selected Skills */}
								{formData.skillIds && formData.skillIds.length > 0 && (
									<div className="flex flex-wrap gap-2 mb-3">
										{formData.skillIds.map(skillId => {
											const skill = availableSkills.find(s => s.id === skillId);
											return skill ? (
												<Badge key={skillId} variant="default" className="flex items-center gap-1">
													{skill.name}
													<button type="button" onClick={() => toggleSkill(skillId)} className="hover:text-red-500">
														<X className="h-3 w-3" />
													</button>
												</Badge>
											) : null;
										})}
									</div>
								)}

								{/* Available Skills */}
								<div className="border border-gray-200 dark:border-gray-600 rounded-lg max-h-40 overflow-y-auto">
									{skillsLoading ? (
										<div className="p-4 text-center text-gray-500">Loading skills...</div>
									) : filteredSkills.length > 0 ? (
										<div className="p-2 space-y-1">
											{filteredSkills.slice(0, 20).map(skill => (
												<button
													key={skill.id}
													type="button"
													onClick={() => toggleSkill(skill.id)}
													className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
														formData.skillIds?.includes(skill.id)
															? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
															: "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
													}`}
												>
													{skill.name}
												</button>
											))}
											{filteredSkills.length > 20 && (
												<div className="text-xs text-gray-500 p-2 text-center">
													Showing 20 of {filteredSkills.length} skills. Keep typing to narrow down results.
												</div>
											)}
										</div>
									) : (
										<div className="p-4 text-center text-gray-500">
											{skillSearch ? `No skills found matching "${skillSearch}"` : "No skills available"}
										</div>
									)}
								</div>
							</div>

							{/* Overrides */}
							<div className="space-y-4">
								<h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Manual Overrides (Optional)</h3>
								<div className="grid grid-cols-1 gap-4">
									<div>
										<label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Custom Title</label>
										<Input
											placeholder="Leave empty to use YouTube title"
											value={formData.overrides?.title || ""}
											onChange={e =>
												setFormData(prev => ({
													...prev,
													overrides: { ...prev.overrides, title: e.target.value },
												}))
											}
										/>
									</div>
									<div>
										<label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Custom Description</label>
										<textarea
											placeholder="Leave empty to use YouTube description"
											value={formData.overrides?.description || ""}
											onChange={e =>
												setFormData(prev => ({
													...prev,
													overrides: { ...prev.overrides, description: e.target.value },
												}))
											}
											rows={3}
											className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white backdrop-blur-sm transition-all duration-200 resize-none"
										/>
									</div>
								</div>
							</div>

							{/* Actions */}
							<div className="flex gap-3 pt-4">
								<Button type="button" variant="ghost" onClick={handleClose} className="flex-1">
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={loading || !formData.url.trim()}
									className="flex-1 bg-linear-to-r from-primary to-purple hover:from-primary-600 hover:to-purple-600 text-white border-0"
								>
									{loading ? (
										<>
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
											Importing...
										</>
									) : (
										<>
											<Youtube className="h-4 w-4 mr-2" />
											Import Course
										</>
									)}
								</Button>
							</div>
						</form>
					)}
				</div>
			</div>
		</div>
	);
}
