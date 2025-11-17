"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { AuthenticatedLayout } from "@/components/layout";
import { SkillsContent } from "@/components/skills";

export default function SkillsPage() {
	const { user, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		// add a small delay to let authprovider settle after login redirect
		const timer = setTimeout(() => {
			if (!loading && !user) {
				router.push("/auth");
			}
		}, 200);

		// if we have a user, clear the timer
		if (user) {
			clearTimeout(timer);
		}

		return () => clearTimeout(timer);
	}, [user, loading, router]);

	if (!user) {
		return null; // will redirect
	}

	return (
		<AuthenticatedLayout>
			<div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100">
				<SkillsContent />
			</div>
		</AuthenticatedLayout>
	);
}
