"use client";

import React, { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/http";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Search, Users, Shield, GraduationCap, Loader2, AlertCircle, Trash2 } from "lucide-react";
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

	const getRoleIcon = (role: string) => {
		switch (role) {
			case "ADMIN":
				return <Shield className="h-4 w-4" />;
			case "INSTRUCTOR":
				return <GraduationCap className="h-4 w-4" />;
			default:
				return <Users className="h-4 w-4" />;
		}
	};

	const getRoleBadgeVariant = (role: string) => {
		switch (role) {
			case "ADMIN":
				return "danger" as const;
			case "INSTRUCTOR":
				return "info" as const;
			default:
				return "default" as const;
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
				<p className="mt-2 text-gray-600 dark:text-gray-400">Manage user accounts and permissions</p>
			</div>

			{/* Filters */}
			<Card>
				<CardContent className="p-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Users</label>
							<Input placeholder="Search by name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} leftIcon={<Search className="h-4 w-4" />} />
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Role</label>
							<select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as "all" | "USER" | "INSTRUCTOR" | "ADMIN")} className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
								<option value="all">All Roles</option>
								<option value="USER">Users</option>
								<option value="INSTRUCTOR">Instructors</option>
								<option value="ADMIN">Admins</option>
							</select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Loading State */}
			{loading && (
				<div className="flex items-center justify-center py-12">
					<Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
					<span className="ml-2 text-gray-600 dark:text-gray-400">Loading users...</span>
				</div>
			)}

			{/* Error State */}
			{error && (
				<Card>
					<CardContent className="p-8 text-center">
						<AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Failed to load users</h3>
						<p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
						<Button variant="outline" onClick={loadUsers}>
							Try Again
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Users List */}
			{!loading && !error && (
				<div className="space-y-4">
					{users.map((user) => (
						<Card key={user.id}>
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-4">
										<div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
											<span className="text-lg font-medium text-gray-700 dark:text-gray-300">{user.name?.charAt(0) || user.email?.charAt(0) || "U"}</span>
										</div>

										<div className="flex-1">
											<div className="flex items-center space-x-3">
												<h3 className="text-lg font-semibold text-gray-900 dark:text-white">{user.name || "Unnamed User"}</h3>
												<Badge variant={getRoleBadgeVariant(user.role)} size="sm" className="flex items-center space-x-1">
													{getRoleIcon(user.role)}
													<span>{user.role}</span>
												</Badge>
											</div>

											<p className="text-gray-600 dark:text-gray-400">{user.email}</p>
											{user.headline && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user.headline}</p>}

											{user.regionId && (
												<div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
													<span>Region: {user.regionId}</span>
												</div>
											)}
										</div>
									</div>

									{/* Actions */}
									<div className="flex items-center space-x-2">
										{/* Role Change Dropdown */}
										<select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value as "USER" | "INSTRUCTOR" | "ADMIN")} className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
											<option value="USER">User</option>
											<option value="INSTRUCTOR">Instructor</option>
											<option value="ADMIN">Admin</option>
										</select>

										<Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id, user.name || user.email || "Unknown")} className="text-red-600 hover:text-red-700 hover:bg-red-50">
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					))}

					{/* Pagination */}
					{pagination && pagination.totalPages > 1 && (
						<div className="flex items-center justify-between">
							<div className="text-sm text-gray-600 dark:text-gray-400">
								Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} users
							</div>
							<div className="flex space-x-2">
								<Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage - 1)} disabled={!pagination.hasPrev}>
									Previous
								</Button>
								<span className="py-2 px-3 text-sm text-gray-700 dark:text-gray-300">
									Page {pagination.page} of {pagination.totalPages}
								</span>
								<Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage + 1)} disabled={!pagination.hasNext}>
									Next
								</Button>
							</div>
						</div>
					)}

					{/* Empty State */}
					{users.length === 0 && (
						<Card>
							<CardContent className="p-12 text-center">
								<Users className="w-12 h-12 text-gray-500 dark:text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No users found</h3>
								<p className="text-gray-600 dark:text-gray-400">{searchQuery || selectedRole !== "all" ? "Try adjusting your search criteria." : "No users have registered yet."}</p>
							</CardContent>
						</Card>
					)}
				</div>
			)}
		</div>
	);
}
