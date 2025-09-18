"use client";

import React, { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/http";
import { Button } from "@/components/ui/Button";

import { Input } from "@/components/ui/Input";
import { PageLayout, PageHeader, GlassCard, LoadingState, ErrorState } from "@/components/ui";
import { UserCard } from "@/components/admin";
import { Search, Users } from "lucide-react";
import type { UserProfile, UsersResponse } from "@/types";

export default function AdminUsersPage() {
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
			setError(err instanceof Error ? err.message : "Failed to load users");
		} finally {
			setLoading(false);
		}
	}, [searchQuery, selectedRole, currentPage]);

	useEffect(() => {
		loadUsers();
	}, [loadUsers]);

	const handleRoleChange = async (userId: string, newRole: "USER" | "INSTRUCTOR" | "ADMIN") => {
		try {
			await api.updateUser(userId, { role: newRole });
			loadUsers(); // Refresh the list
		} catch (err) {
			alert(`Failed to update user role: ${err instanceof Error ? err.message : "Unknown error"}`);
		}
	};

	const handleDeleteUser = async (userId: string, userName: string) => {
		if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
			return;
		}

		try {
			await api.deleteUser(userId);
			loadUsers(); // Refresh the list
		} catch (err) {
			alert(`Failed to delete user: ${err instanceof Error ? err.message : "Unknown error"}`);
		}
	};

	return (
		<PageLayout>
			<PageHeader title="User Management" description="Manage user accounts and permissions across the platform" />

			{/* Filters */}
			<GlassCard className="p-6 mb-8">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Users</label>
						<Input
							placeholder="Search by name or email..."
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
							leftIcon={<Search className="h-4 w-4" />}
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Role</label>
						<select
							value={selectedRole}
							onChange={e => setSelectedRole(e.target.value as "all" | "USER" | "INSTRUCTOR" | "ADMIN")}
							className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
						>
							<option value="all">All Roles</option>
							<option value="USER">Users</option>
							<option value="INSTRUCTOR">Instructors</option>
							<option value="ADMIN">Admins</option>
						</select>
					</div>
				</div>
			</GlassCard>

			{/* Loading State */}
			{loading && <LoadingState message="Loading users..." />}

			{/* Error State */}
			{error && <ErrorState title="Failed to load users" message={error} onRetry={loadUsers} />}

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
									Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
									{Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} users
								</div>
								<div className="flex space-x-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setCurrentPage(currentPage - 1)}
										disabled={!pagination.hasPrev}
									>
										Previous
									</Button>
									<span className="py-2 px-3 text-sm text-gray-700 dark:text-gray-300">
										Page {pagination.page} of {pagination.totalPages}
									</span>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setCurrentPage(currentPage + 1)}
										disabled={!pagination.hasNext}
									>
										Next
									</Button>
								</div>
							</div>
						</GlassCard>
					)}

					{/* Empty State */}
					{users.length === 0 && (
						<GlassCard className="p-12 text-center">
							<Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No users found</h3>
							<p className="text-gray-600 dark:text-gray-400">
								{searchQuery || selectedRole !== "all"
									? "Try adjusting your search criteria."
									: "No users have registered yet."}
							</p>
						</GlassCard>
					)}
				</div>
			)}
		</PageLayout>
	);
}
