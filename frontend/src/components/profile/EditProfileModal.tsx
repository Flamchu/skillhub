"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { api } from "@/lib/http";
import { useAuth } from "@/context/AuthProvider";
import type { UserProfile, UpdateUserData } from "@/types";
import { Input, Button } from "@/components/ui";
import { X, AlertTriangle, Users, Camera } from "lucide-react";

// region data structure from api
interface Region {
	id: string;
	name: string;
	code: string;
}

interface EditProfileModalProps {
	isOpen: boolean;
	onClose: () => void;
	user: UserProfile;
}

export function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
	const t = useTranslations("profile");
	const router = useRouter();
	const { refresh, logout } = useAuth();
	const fileInputRef = useRef<HTMLInputElement>(null);

	// form data state
	const [formData, setFormData] = useState<UpdateUserData>({
		name: user?.name || "",
		headline: user?.headline || "",
		bio: user?.bio || "",
		regionId: user?.regionId || "",
	});

	// profile picture state
	const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
	const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);

	// ui state management
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [regions, setRegions] = useState<Region[]>([]);
	const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

	// danger zone state
	const [showFreshStartConfirm, setShowFreshStartConfirm] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [confirmText, setConfirmText] = useState("");
	const [processingDanger, setProcessingDanger] = useState(false);

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

	// reset form when user changes or modal opens
	useEffect(() => {
		if (isOpen) {
			setFormData({
				name: user?.name || "",
				headline: user?.headline || "",
				bio: user?.bio || "",
				regionId: user?.regionId || "",
			});
			setError("");
			setSuccess("");
			setValidationErrors({});
		}
	}, [isOpen, user]);

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

	// handle profile picture upload
	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// validate file type
		if (!file.type.startsWith("image/")) {
			setError("Please select a valid image file");
			return;
		}

		// validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			setError("Image size must be less than 5MB");
			return;
		}

		// create preview
		const reader = new FileReader();
		reader.onloadend = () => {
			setProfilePicturePreview(reader.result as string);
			setProfilePictureFile(file);
			setError(""); // clear any previous errors
		};
		reader.readAsDataURL(file);
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

			// handle profile picture upload first if there's a new file
			if (profilePictureFile) {
				try {
					await api.uploadProfilePicture(profilePictureFile);
					// profile picture URL is now stored in database
				} catch (uploadErr) {
					console.error("profile picture upload error:", uploadErr);
					setError("Failed to upload profile picture. Please try again.");
					setSaving(false);
					return;
				}
			}

			const updateData: UpdateUserData = {};

			// only update changed fields
			if (formData.name !== user.name) updateData.name = formData.name;
			if (formData.headline !== user.headline) updateData.headline = formData.headline;
			if (formData.bio !== user.bio) updateData.bio = formData.bio;
			if (formData.regionId !== user.regionId) updateData.regionId = formData.regionId;

			// if no text fields changed but profile picture was uploaded
			if (Object.keys(updateData).length === 0 && !profilePictureFile) {
				setSuccess(t("messages.noChanges"));
				setTimeout(() => onClose(), 1500);
				return;
			}

			// update profile data if there are changes
			if (Object.keys(updateData).length > 0) {
				await api.updateProfile(updateData);
			}

			// refresh auth context to hydrate updated user data
			await refresh();

			setSuccess(t("messages.saveSuccess"));

			// close modal after success
			setTimeout(() => onClose(), 1500);
		} catch (err) {
			console.error("save profile error:", err);
			setError(err instanceof Error ? err.message : t("messages.saveError"));
		} finally {
			setSaving(false);
		}
	};

	// handle fresh start - clear all user data except profile
	const handleFreshStart = async () => {
		if (confirmText !== "FRESH START") {
			setError("Please type FRESH START to confirm");
			return;
		}

		setProcessingDanger(true);
		setError("");

		try {
			// call backend to clear user's skills, courses, progress, etc.
			await api.clearUserData(user.id);

			setSuccess("All learning data cleared. Starting fresh!");
			setShowFreshStartConfirm(false);
			setConfirmText("");

			// refresh and close after 2 seconds
			setTimeout(async () => {
				await refresh();
				onClose();
			}, 2000);
		} catch (err) {
			console.error("fresh start error:", err);
			setError(err instanceof Error ? err.message : "Failed to clear data. Please try again.");
		} finally {
			setProcessingDanger(false);
		}
	};

	// handle account deletion - soft delete (disable account)
	const handleDeleteAccount = async () => {
		if (confirmText !== "DELETE ACCOUNT") {
			setError("Please type DELETE ACCOUNT to confirm");
			return;
		}

		setProcessingDanger(true);
		setError("");

		try {
			// call backend to soft delete account
			await api.deleteAccount(user.id);

			setSuccess("Account deleted. Redirecting...");
			setShowDeleteConfirm(false);
			setConfirmText("");

			// logout and redirect after 2 seconds
			setTimeout(async () => {
				await logout();
				router.push("/");
			}, 2000);
		} catch (err) {
			console.error("delete account error:", err);
			setError(err instanceof Error ? err.message : "Failed to delete account. Please try again.");
		} finally {
			setProcessingDanger(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
			<div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
				{/* header */}
				<div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between z-10">
					<h2 className="text-2xl font-bold text-foreground">Edit Profile</h2>
					<button
						onClick={onClose}
						disabled={saving}
						className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
					>
						<X className="w-5 h-5 text-foreground-muted" />
					</button>
				</div>

				{/* content */}
				<div className="p-6">
					{error && (
						<div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
							<p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
						</div>
					)}
					{success && (
						<div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
							<p className="text-green-700 dark:text-green-300 font-medium flex items-center gap-2">
								<span className="text-lg">✓</span>
								{success}
							</p>
						</div>
					)}
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Profile Picture Upload Section */}
						<div className="space-y-2">
							<label className="block text-sm font-semibold text-foreground mb-3">Profile Picture</label>
							<div className="flex items-center gap-6">
								{/* Avatar Preview */}
								<div className="relative group">
									<div className="w-24 h-24 rounded-xl bg-gradient-to-br from-primary via-purple to-pink p-1 shadow-lg ring-2 ring-primary/20">
										<div className="w-full h-full rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden relative">
											{profilePicturePreview ? (
												<Image src={profilePicturePreview} alt="Profile preview" fill className="object-cover" />
											) : (
												<span className="text-3xl font-bold bg-gradient-to-br from-primary via-purple to-pink text-transparent bg-clip-text">
													{user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
												</span>
											)}
										</div>
									</div>
									{/* Hover overlay for change */}
									{profilePicturePreview && (
										<button
											type="button"
											onClick={() => {
												setProfilePicturePreview(null);
												setProfilePictureFile(null);
												if (fileInputRef.current) fileInputRef.current.value = "";
											}}
											className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
										>
											<div className="text-center text-white">
												<X className="w-5 h-5 mx-auto mb-1" />
												<span className="text-xs font-semibold">Remove</span>
											</div>
										</button>
									)}
								</div>

								{/* Upload Button */}
								<div className="flex-1">
									<input
										ref={fileInputRef}
										type="file"
										accept="image/*"
										onChange={handleImageChange}
										className="hidden"
										id="profile-picture-upload"
									/>
									<label
										htmlFor="profile-picture-upload"
										className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-purple text-white rounded-xl font-bold cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 active:scale-[0.98]"
									>
										<Camera className="w-5 h-5" />
										<span>{profilePictureFile ? "Change Photo" : "Upload Photo"}</span>
									</label>
									<p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
										Recommended: Square image, at least 256x256px
									</p>
									{profilePictureFile && (
										<p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
											<span>✓</span>
											{profilePictureFile.name}
										</p>
									)}
								</div>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Input
								label={t("form.name")}
								name="name"
								type="text"
								value={formData.name || ""}
								onChange={e => handleChange("name", e.target.value)}
								placeholder={t("form.namePlaceholder")}
								error={validationErrors.name}
								required
							/>

							<Input
								label={t("form.headline")}
								name="headline"
								type="text"
								value={formData.headline || ""}
								onChange={e => handleChange("headline", e.target.value)}
								placeholder={t("form.headlinePlaceholder")}
							/>
						</div>

						<div className="space-y-2">
							<label className="block text-sm font-semibold text-foreground">{t("form.region")}</label>
							<select
								value={formData.regionId || ""}
								onChange={e => handleChange("regionId", e.target.value)}
								className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
							>
								<option value="">{t("form.regionPlaceholder")}</option>
								{regions.map(region => (
									<option key={region.id} value={region.id}>
										{region.name}
									</option>
								))}
							</select>
						</div>

						<div className="space-y-2">
							<label className="block text-sm font-semibold text-foreground">{t("form.bio")}</label>
							<textarea
								value={formData.bio || ""}
								onChange={e => handleChange("bio", e.target.value)}
								placeholder={t("form.bioPlaceholder")}
								rows={5}
								className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-foreground placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
							/>
							{validationErrors.bio && (
								<p className="text-sm text-red-600 dark:text-red-400 font-medium">{validationErrors.bio}</p>
							)}
							<p className="text-xs text-foreground-subtle">{formData.bio?.length || 0} / 500 characters</p>
						</div>

						{/* actions */}
						<div className="flex gap-4 pt-4">
							<Button
								type="submit"
								loading={saving}
								disabled={saving}
								className="flex-1 bg-gradient-to-r from-primary to-purple text-white"
							>
								{saving ? t("form.saving") : t("form.save")}
							</Button>
							<Button type="button" variant="outline" onClick={onClose} disabled={saving} className="flex-1">
								{t("form.cancel")}
							</Button>
						</div>
					</form>
					{/* social environment toggle */}
					<div className="mt-8 pt-8 border-t border-border">
						<div className="flex items-center gap-2 mb-4">
							<Users className="w-5 h-5 text-primary" />
							<h3 className="text-xl font-bold text-foreground">Social Environment</h3>
						</div>
						<p className="text-sm text-foreground-muted mb-6">
							Enable the social environment to compete on leaderboards, complete daily quests, earn XP, track your
							learning streak, and level up! You can disable this at any time.
						</p>

						<div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
							<div>
								<h4 className="font-semibold text-foreground">
									{user?.socialEnabled ? "Social Environment Enabled" : "Enable Social Environment"}
								</h4>
								<p className="text-sm text-foreground-muted">
									{user?.socialEnabled
										? "You're participating in the social features. Disable to hide XP, quests, and leaderboards."
										: "Join the community! Track your progress and compete with other learners."}
								</p>
							</div>
							<label className="relative inline-flex items-center cursor-pointer">
								<input
									type="checkbox"
									checked={user?.socialEnabled || false}
									onChange={async e => {
										const enabled = e.target.checked;
										try {
											const res = await fetch(
												`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${user?.id}/social-toggle`,
												{
													method: "PATCH",
													headers: {
														"Content-Type": "application/json",
														Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
													},
													body: JSON.stringify({ enabled }),
												}
											);

											if (res.ok) {
												// update local user state
												const updatedUser = JSON.parse(localStorage.getItem("user") || "{}");
												updatedUser.socialEnabled = enabled;
												localStorage.setItem("user", JSON.stringify(updatedUser));
												window.location.reload(); // reload to show/hide XP bar
											}
										} catch (error) {
											console.error("Failed to toggle social environment:", error);
										}
									}}
									className="sr-only peer"
								/>
								<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
							</label>
						</div>
					</div>{" "}
					{/* danger zone */}
					<div className="mt-12 pt-8 border-t-2 border-red-200 dark:border-red-900">
						<div className="flex items-center gap-2 mb-4">
							<AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
							<h3 className="text-xl font-bold text-red-600 dark:text-red-400">Danger Zone</h3>
						</div>
						<p className="text-sm text-foreground-muted mb-6">
							These actions are irreversible. Please be certain before proceeding.
						</p>

						<div className="space-y-4">
							{/* fresh start */}
							{!showFreshStartConfirm ? (
								<div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 rounded-lg">
									<div>
										<h4 className="font-semibold text-foreground">Fresh Start</h4>
										<p className="text-sm text-foreground-muted">
											Clear all your skills, courses, progress, and enrollments
										</p>
									</div>
									<Button
										variant="outline"
										onClick={() => setShowFreshStartConfirm(true)}
										disabled={processingDanger}
										className="border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20"
									>
										Clear Data
									</Button>
								</div>
							) : (
								<div className="p-4 bg-red-50 dark:bg-red-900/10 border-2 border-red-300 dark:border-red-800 rounded-lg space-y-4">
									<div>
										<h4 className="font-semibold text-red-700 dark:text-red-300 mb-2">Confirm Fresh Start</h4>
										<p className="text-sm text-foreground-muted mb-4">
											This will permanently delete all your learning data. Your profile information will be kept.
										</p>
										<input
											type="text"
											value={confirmText}
											onChange={e => setConfirmText(e.target.value)}
											placeholder='Type "FRESH START" to confirm'
											className="w-full px-4 py-2 border border-red-300 dark:border-red-700 rounded-lg bg-white dark:bg-gray-800 text-foreground focus:ring-2 focus:ring-red-500 outline-none"
										/>
									</div>
									<div className="flex gap-2">
										<Button
											onClick={handleFreshStart}
											disabled={confirmText !== "FRESH START" || processingDanger}
											loading={processingDanger}
											className="flex-1 bg-red-600 hover:bg-red-700 text-white"
										>
											{processingDanger ? "Clearing..." : "Confirm Clear Data"}
										</Button>
										<Button
											variant="outline"
											onClick={() => {
												setShowFreshStartConfirm(false);
												setConfirmText("");
											}}
											disabled={processingDanger}
											className="flex-1"
										>
											Cancel
										</Button>
									</div>
								</div>
							)}

							{/* delete account */}
							{!showDeleteConfirm ? (
								<div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 rounded-lg">
									<div>
										<h4 className="font-semibold text-foreground">Delete Account</h4>
										<p className="text-sm text-foreground-muted">
											Permanently delete your account and all associated data
										</p>
									</div>
									<Button
										variant="outline"
										onClick={() => setShowDeleteConfirm(true)}
										disabled={processingDanger}
										className="border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20"
									>
										Delete Account
									</Button>
								</div>
							) : (
								<div className="p-4 bg-red-50 dark:bg-red-900/10 border-2 border-red-300 dark:border-red-800 rounded-lg space-y-4">
									<div>
										<h4 className="font-semibold text-red-700 dark:text-red-300 mb-2">Confirm Account Deletion</h4>
										<p className="text-sm text-foreground-muted mb-4">
											This will permanently delete your account. You will be logged out and won&apos;t be able to access
											your data anymore.
										</p>
										<input
											type="text"
											value={confirmText}
											onChange={e => setConfirmText(e.target.value)}
											placeholder='Type "DELETE ACCOUNT" to confirm'
											className="w-full px-4 py-2 border border-red-300 dark:border-red-700 rounded-lg bg-white dark:bg-gray-800 text-foreground focus:ring-2 focus:ring-red-500 outline-none"
										/>
									</div>
									<div className="flex gap-2">
										<Button
											onClick={handleDeleteAccount}
											disabled={confirmText !== "DELETE ACCOUNT" || processingDanger}
											loading={processingDanger}
											className="flex-1 bg-red-600 hover:bg-red-700 text-white"
										>
											{processingDanger ? "Deleting..." : "Confirm Delete Account"}
										</Button>
										<Button
											variant="outline"
											onClick={() => {
												setShowDeleteConfirm(false);
												setConfirmText("");
											}}
											disabled={processingDanger}
											className="flex-1"
										>
											Cancel
										</Button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
