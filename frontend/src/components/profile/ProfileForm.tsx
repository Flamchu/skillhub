"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { api } from "@/lib/http";
import { useAuth } from "@/context/AuthProvider";
import { ProfileHeader } from "./ProfileHeader";
import type { UserProfile, UpdateUserData } from "@/types";
import { Input, Button, ErrorState } from "@/components/ui";

// region data structure from api
interface Region {
	id: string;
	name: string;
	code: string;
}

// profile form component props
interface ProfileFormProps {
	user: UserProfile | null;
	className?: string;
}

export function ProfileForm({ user, className = "" }: ProfileFormProps) {
	const t = useTranslations("profile");
	const router = useRouter();
	const { refresh } = useAuth();

	// form data state
	const [formData, setFormData] = useState<UpdateUserData>({
		name: user?.name || "",
		headline: user?.headline || "",
		bio: user?.bio || "",
		regionId: user?.regionId || "",
	});

	// ui state management
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [regions, setRegions] = useState<Region[]>([]);
	const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

	// load regions list
	useEffect(() => {
		const loadRegions = async () => {
			try {
				const response = await api.getRegions();
				setRegions(response.regions);
			} catch (err) {
				console.error("failed to load regions:", err);
			}
		};
		loadRegions();
	}, []);

	// validate form fields
	const validateForm = () => {
		const errors: Record<string, string> = {};

		if (!formData.name || formData.name.trim().length < 2) {
			errors.name = t("validation.nameRequired");
		}

		if (formData.bio && formData.bio.length > 500) {
			errors.bio = t("validation.bioTooLong");
		}

		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	// handle field changes
	const handleChange = (field: keyof UpdateUserData, value: string) => {
		setFormData(prev => ({
			...prev,
			[field]: value,
		}));
		// clear field error when typing
		if (validationErrors[field]) {
			setValidationErrors(prev => ({
				...prev,
				[field]: "",
			}));
		}
	};

	// handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setSaving(true);
		setError("");
		setSuccess("");

		try {
			if (!user?.id) {
				throw new Error("no user id available");
			}

			const updateData: UpdateUserData = {};

			// only update changed fields
			if (formData.name !== user.name) updateData.name = formData.name;
			if (formData.headline !== user.headline) updateData.headline = formData.headline;
			if (formData.bio !== user.bio) updateData.bio = formData.bio;
			if (formData.regionId !== user.regionId) updateData.regionId = formData.regionId;

			if (Object.keys(updateData).length === 0) {
				setSuccess(t("messages.noChanges"));
				setTimeout(() => router.back(), 1500);
				return;
			}

			await api.updateProfile(updateData);

			// refresh auth context to hydrate updated user data
			await refresh();

			setSuccess(t("messages.saveSuccess"));

			// redirect after success
			setTimeout(() => router.back(), 1500);
		} catch (err) {
			console.error("save profile error:", err);
			setError(err instanceof Error ? err.message : t("messages.saveError"));
		} finally {
			setSaving(false);
		}
	};

	if (!user) {
		return <ErrorState message={t("errors.userNotFound")} />;
	}

	return (
		<div className={`overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-xl ${className}`}>
			<ProfileHeader user={user} className="border-b border-gray-200 dark:border-gray-700" />

			<div className="p-8 lg:p-12">
				{error && (
					<div className="mb-8 p-6 bg-linear-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200/50 dark:border-red-800/50 rounded-xl shadow-lg">
						<p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
					</div>
				)}

				{success && (
					<div className="mb-8 p-6 bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-800/50 rounded-xl shadow-lg">
						<p className="text-green-700 dark:text-green-300 font-medium flex items-center gap-2">
							<span className="text-lg">✓</span>
							{success}
						</p>
					</div>
				)}

				<form onSubmit={handleSubmit} className="max-w-3xl space-y-10">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						<Input
							label={t("form.name")}
							name="name"
							type="text"
							value={formData.name || ""}
							onChange={e => handleChange("name", e.target.value)}
							placeholder={t("form.namePlaceholder")}
							error={validationErrors.name}
							required
							className="text-lg"
						/>

						<Input
							label={t("form.headline")}
							name="headline"
							type="text"
							value={formData.headline || ""}
							onChange={e => handleChange("headline", e.target.value)}
							placeholder={t("form.headlinePlaceholder")}
							className="text-lg"
						/>

						<div className="space-y-3">
							<label className="block text-base font-semibold text-gray-900 dark:text-gray-100">
								{t("form.region")}
							</label>
							<select
								value={formData.regionId || ""}
								onChange={e => handleChange("regionId", e.target.value)}
								className="w-full px-4 py-3.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all duration-300 shadow-sm hover:shadow-md text-lg"
							>
								<option value="">{t("form.regionPlaceholder")}</option>
								{regions.map(region => (
									<option key={region.id} value={region.id}>
										{region.name}
									</option>
								))}
							</select>
						</div>
					</div>

					<div className="space-y-3">
						<label className="block text-base font-semibold text-gray-900 dark:text-gray-100">{t("form.bio")}</label>
						<textarea
							value={formData.bio || ""}
							onChange={e => handleChange("bio", e.target.value)}
							placeholder={t("form.bioPlaceholder")}
							rows={6}
							className="w-full px-5 py-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all duration-300 resize-none leading-relaxed shadow-sm hover:shadow-md text-lg"
						/>
						{validationErrors.bio && (
							<p className="text-sm text-red-600 dark:text-red-400 font-medium mt-2">{validationErrors.bio}</p>
						)}
					</div>

					<div className="flex flex-col sm:flex-row gap-6 pt-8">
						<Button
							type="submit"
							loading={saving}
							disabled={saving}
							size="lg"
							className="group flex-1 sm:flex-none sm:px-12 py-4 bg-linear-to-r from-primary to-purple text-white rounded-xl hover:from-primary-600 hover:to-purple-600 dark:hover:from-primary-500 dark:hover:to-purple-500 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 text-lg font-bold"
						>
							<span className="flex items-center justify-center gap-2">
								{saving ? t("form.saving") : t("form.save")}
								{!saving && <span className="group-hover:translate-x-1 transition-transform">→</span>}
							</span>
						</Button>

						<Button
							type="button"
							variant="outline"
							onClick={() => router.back()}
							disabled={saving}
							size="lg"
							className="flex-1 sm:flex-none sm:px-12 py-4 bg-white dark:bg-gray-700 border-2 border-primary/30 dark:border-primary/50 text-gray-900 dark:text-gray-100 rounded-xl hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary dark:hover:border-primary shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg font-bold"
						>
							{t("form.cancel")}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
