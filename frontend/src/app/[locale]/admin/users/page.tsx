"use client";

import React, { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/http";
import { Button } from "@/components/ui/Button";

import { Input } from "@/components/ui/Input";
import { PageLayout, PageHeader, GlassCard, LoadingState, ErrorState } from "@/components/ui";
import { UserCard } from "@/components/admin";
import { Search, Users } from "lucide-react";
import type { UserProfile, UsersResponse } from "@/types";
import { useTranslations } from "next-intl";

export default function AdminUsersPage() {
	const t = useTranslations("admin.usersPage");
	const tCommon = useTranslations("common");
	const [users, setUsers] = useState<UserProfile[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedRole, setSelectedRole] = useState<"all" | "USER" | "INSTRUCTOR" | "ADMIN">("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [pagination, setPagination] = useState<UsersResponse["pagination"] | null>(null);

	const loadUsers = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const params: Record<string, string> = {
				page: currentPage.toString(),
				limit: "20",
				sortBy: "createdAt",
				sortOrder: "desc",
			};

			if (searchQuery.trim()) {
				params.search = searchQuery.trim();
			}

			if (selectedRole !== "all") {
				params.role = selectedRole;
			}

			const response = (await api.getUsers(params)) as UsersResponse;
			setUsers(response.users);
			setPagination(response.pagination);
		} catch (err) {
			setError(err instanceof Error ? err.message : t("errors.load"));
		} finally {
			setLoading(false);
		}
	}, [currentPage, searchQuery, selectedRole, t]);

	useEffect(() => {
		loadUsers();
	}, [loadUsers]);

	const handleRoleChange = async (userId: string, newRole: "USER" | "INSTRUCTOR" | "ADMIN") => {
		try {
			await api.updateUser(userId, { role: newRole });
			loadUsers(); // refresh the list
		} catch (err) {
			alert(t("alerts.updateRoleFailed", { message: err instanceof Error ? err.message : t("alerts.unknownError") }));
		}
	};

	const handleDeleteUser = async (userId: string, userName: string) => {
		if (!confirm(t("alerts.confirmDelete", { userName }))) {
			return;
		}

		try {
			await api.deleteUser(userId);
			loadUsers(); // refresh the list
		} catch (err) {
			alert(t("alerts.deleteFailed", { message: err instanceof Error ? err.message : t("alerts.unknownError") }));
		}
	};

	return (
		<PageLayout>
			<PageHeader title={t("title")} description={t("description")} />

			{/* Filters */}
			<GlassCard className="p-6 mb-8">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("filters.searchLabel")}</label>
						<Input
							placeholder={t("filters.searchPlaceholder")}
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
							leftIcon={<Search className="h-4 w-4" />}
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("filters.roleLabel")}</label>
						<select
							value={selectedRole}
							onChange={e => setSelectedRole(e.target.value as "all" | "USER" | "INSTRUCTOR" | "ADMIN")}
							className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
						>
							<option value="all">{t("filters.roleOptions.all")}</option>
							<option value="USER">{t("filters.roleOptions.user")}</option>
							<option value="INSTRUCTOR">{t("filters.roleOptions.instructor")}</option>
							<option value="ADMIN">{t("filters.roleOptions.admin")}</option>
						</select>
					</div>
				</div>
			</GlassCard>

			{/* Loading State */}
			{loading && <LoadingState message={t("loading")} />}

			{/* Error State */}
			{error && <ErrorState title={t("errors.loadTitle")} message={error} onRetry={loadUsers} />}

			{/* Users List */}
			{!loading && !error && (
				<div className="space-y-4">
					{users.map(user => (
						<UserCard key={user.id} user={user} onRoleChange={handleRoleChange} onDelete={handleDeleteUser} />
					))}

					{/* Pagination */}
					{pagination && pagination.totalPages > 1 && (
						<GlassCard className="p-6">
							<div className="flex items-center justify-between">
								<div className="text-sm text-gray-600 dark:text-gray-400">
									{t("pagination.summary", {
										from: (pagination.page - 1) * pagination.limit + 1,
										to: Math.min(pagination.page * pagination.limit, pagination.totalCount),
										total: pagination.totalCount,
									})}
								</div>
								<div className="flex space-x-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setCurrentPage(currentPage - 1)}
										disabled={!pagination.hasPrev}
									>
										{tCommon("previous")}
									</Button>
									<span className="py-2 px-3 text-sm text-gray-700 dark:text-gray-300">
										{t("pagination.page", { page: pagination.page, totalPages: pagination.totalPages })}
									</span>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setCurrentPage(currentPage + 1)}
										disabled={!pagination.hasNext}
									>
										{tCommon("next")}
									</Button>
								</div>
							</div>
						</GlassCard>
					)}

					{/* Empty State */}
					{users.length === 0 && (
						<GlassCard className="p-12 text-center">
							<Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t("empty.title")}</h3>
							<p className="text-gray-600 dark:text-gray-400">
								{searchQuery || selectedRole !== "all"
									? t("empty.filteredDescription")
									: t("empty.description")}
							</p>
						</GlassCard>
					)}
				</div>
			)}
		</PageLayout>
	);
}
