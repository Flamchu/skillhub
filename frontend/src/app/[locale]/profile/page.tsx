"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthProvider";
import { PageLayout, PageHeader, LoadingState } from "@/components/ui";
import { ProfileForm } from "@/components/profile";

export default function ProfilePage() {
	const t = useTranslations("profile");
	const tCommon = useTranslations("common");
	const { user, profile, loading } = useAuth();
	const router = useRouter();
	const [initialized, setInitialized] = useState(false);

	useEffect(() => {
		// add a small delay to let authprovider settle
		const timer = setTimeout(() => {
			if (!loading && !user) {
				router.push("/auth");
			} else if (user) {
				setInitialized(true);
			}
		}, 200);

		return () => clearTimeout(timer);
	}, [user, loading, router]);

	if (loading || !initialized) {
		return <LoadingState message={tCommon("loading")} />;
	}

	if (!user) {
		return null; // will redirect
	}

	return (
		<PageLayout>
			<div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
					{/* back button */}
					<button
						onClick={() => router.back()}
						className="mb-6 inline-flex items-center gap-2 px-4 py-2 text-sm text-foreground-muted hover:text-foreground transition-colors rounded-sm hover:bg-surface-hover"
					>
						<span className="text-lg">←</span>
						Back
					</button>

					<PageHeader title={t("title")} description={t("subtitle")} className="mb-8" />

					<div className="bg-surface/95 dark:bg-gray-800/95 backdrop-blur-md border border-border dark:border-gray-700 rounded-lg shadow-xl overflow-hidden">
						<ProfileForm user={profile} />
					</div>
				</div>
			</div>
		</PageLayout>
	);
}
