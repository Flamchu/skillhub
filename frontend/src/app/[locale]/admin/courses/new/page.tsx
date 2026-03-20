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
import { useTranslations } from "next-intl";
import { getCourseSourceLabel, getDifficultyLabel } from "@/lib/i18n-utils";

export default function NewCoursePage() {
	const router = useRouter();
	const t = useTranslations("admin.newCoursePage");
	const tCommon = useTranslations("common");
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
		skills: [],
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.title.trim()) {
			alert(t("alerts.titleRequired"));
			return;
		}

		setLoading(true);
		try {
			await api.createCourse(formData);
			router.push("/admin/courses");
		} catch (error) {
			alert(t("alerts.createFailed", { message: error instanceof Error ? error.message : t("alerts.unknownError") }));
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (field: keyof CreateCourseData, value: unknown) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center space-x-4">
				<Link href="/admin/courses">
					<Button variant="ghost" size="sm">
						<ArrowLeft className="h-4 w-4 mr-2" />
						{t("back")}
					</Button>
				</Link>
				<div>
					<h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
					<p className="mt-2 text-gray-600">{t("description")}</p>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Basic Information */}
				<Card>
					<CardHeader>
						<CardTitle>{t("sections.basicInformation")}</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">{t("fields.title.label")}</label>
								<Input
									required
									value={formData.title}
									onChange={e => handleInputChange("title", e.target.value)}
									placeholder={t("fields.title.placeholder")}
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">{t("fields.provider.label")}</label>
								<Input
									value={formData.provider || ""}
									onChange={e => handleInputChange("provider", e.target.value)}
									placeholder={t("fields.provider.placeholder")}
								/>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">{t("fields.description.label")}</label>
							<textarea
								value={formData.description || ""}
								onChange={e => handleInputChange("description", e.target.value)}
								placeholder={t("fields.description.placeholder")}
								rows={4}
								className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>
					</CardContent>
				</Card>

				{/* Course Details */}
				<Card>
					<CardHeader>
						<CardTitle>{t("sections.courseDetails")}</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">{t("fields.source.label")}</label>
								<select
									value={formData.source}
									onChange={e => handleInputChange("source", e.target.value)}
									className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
								>
									<option value="INTERNAL">{getCourseSourceLabel("INTERNAL", tCommon)}</option>
									<option value="YOUTUBE">{getCourseSourceLabel("YOUTUBE", tCommon)}</option>
									<option value="UDEMY">{getCourseSourceLabel("UDEMY", tCommon)}</option>
									<option value="OTHER">{getCourseSourceLabel("OTHER", tCommon)}</option>
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">{t("fields.difficulty.label")}</label>
								<select
									value={formData.difficulty}
									onChange={e => handleInputChange("difficulty", e.target.value)}
									className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
								>
									<option value="BEGINNER">{getDifficultyLabel("BEGINNER", tCommon)}</option>
									<option value="INTERMEDIATE">{getDifficultyLabel("INTERMEDIATE", tCommon)}</option>
									<option value="ADVANCED">{getDifficultyLabel("ADVANCED", tCommon)}</option>
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">{t("fields.language.label")}</label>
								<Input
									value={formData.language || "en"}
									onChange={e => handleInputChange("language", e.target.value)}
									placeholder={t("fields.language.placeholder")}
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">{t("fields.externalId.label")}</label>
								<Input
									value={formData.externalId || ""}
									onChange={e => handleInputChange("externalId", e.target.value)}
									placeholder={t("fields.externalId.placeholder")}
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">{t("fields.url.label")}</label>
								<Input
									type="url"
									value={formData.url || ""}
									onChange={e => handleInputChange("url", e.target.value)}
									placeholder={t("fields.url.placeholder")}
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">{t("fields.duration.label")}</label>
								<Input
									type="number"
									min="0"
									value={formData.durationMinutes || ""}
									onChange={e =>
										handleInputChange("durationMinutes", e.target.value ? parseInt(e.target.value) : undefined)
									}
									placeholder={t("fields.duration.placeholder")}
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">{t("fields.rating.label")}</label>
								<Input
									type="number"
									min="0"
									max="5"
									step="0.1"
									value={formData.rating || ""}
									onChange={e => handleInputChange("rating", e.target.value ? parseFloat(e.target.value) : undefined)}
									placeholder={t("fields.rating.placeholder")}
								/>
							</div>

							<div className="flex items-center pt-6">
								<label className="flex items-center">
									<input
										type="checkbox"
										checked={formData.isPaid}
										onChange={e => handleInputChange("isPaid", e.target.checked)}
										className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
									/>
									<span className="ml-2 text-sm text-gray-700">{t("fields.isPaid.label")}</span>
								</label>
							</div>
						</div>

						{formData.isPaid && (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">{t("fields.price.label")}</label>
									<Input
										type="number"
										min="0"
										value={formData.priceCents || ""}
										onChange={e =>
											handleInputChange("priceCents", e.target.value ? parseInt(e.target.value) : undefined)
										}
										placeholder={t("fields.price.placeholder")}
									/>
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Submit */}
				<div className="flex justify-end space-x-4">
					<Link href="/admin/courses">
						<Button variant="outline" type="button">
							{tCommon("cancel")}
						</Button>
					</Link>
					<Button type="submit" disabled={loading}>
						{loading ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								{t("actions.creating")}
							</>
						) : (
							<>
								<Save className="h-4 w-4 mr-2" />
								{t("actions.create")}
							</>
						)}
					</Button>
				</div>
			</form>
		</div>
	);
}
