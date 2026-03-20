"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Shield, GraduationCap, Users, Trash2, Copy, Check } from "lucide-react";
import type { UserProfile } from "@/types";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { getRoleLabel } from "@/lib/i18n-utils";

interface UserCardProps {
	user: UserProfile;
	onRoleChange: (userId: string, newRole: "USER" | "INSTRUCTOR" | "ADMIN") => void;
	onDelete: (userId: string, userName: string) => void;
}

/**
 * Admin user management card component
 */
export function UserCard({ user, onRoleChange, onDelete }: UserCardProps) {
	const t = useTranslations("admin.userCard");
	const tCommon = useTranslations("common");
	const [copied, setCopied] = useState(false);

	const copyUUID = () => {
		navigator.clipboard.writeText(user.id);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
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
		<GlassCard>
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<div className="w-12 h-12 bg-linear-to-br from-primary-100 to-purple-100 dark:from-primary-900/50 dark:to-purple-900/50 rounded-full flex items-center justify-center border border-primary-200 dark:border-primary-700">
						<span className="text-lg font-medium text-primary-700 dark:text-primary-300">
							{user.name?.charAt(0) || user.email?.charAt(0) || "U"}
						</span>
					</div>

					<div className="flex-1">
						<div className="flex items-center space-x-3 mb-2">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white">{user.name || t("unnamedUser")}</h3>
							<Badge variant={getRoleBadgeVariant(user.role)} size="sm" className="flex items-center space-x-1">
								{getRoleIcon(user.role)}
								<span>{getRoleLabel(user.role, tCommon)}</span>
							</Badge>
						</div>

						<p className="text-gray-600 dark:text-gray-400">{user.email}</p>
						{user.headline && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user.headline}</p>}

						{/* UUID Display with Copy */}
						<div className="flex items-center mt-2 space-x-2">
							<span className="text-xs text-gray-500 dark:text-gray-400 font-mono">UUID: {user.id}</span>
							<button
								onClick={copyUUID}
								className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
								title={copied ? t("copiedUuid") : t("copyUuid")}
								aria-label={copied ? t("copiedUuid") : t("copyUuid")}
							>
								{copied ? (
									<Check className="h-3 w-3 text-green-500" />
								) : (
									<Copy className="h-3 w-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
								)}
							</button>
						</div>

						{user.regionId && (
							<div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
								<span>{t("region", { region: user.regionId })}</span>
							</div>
						)}
					</div>
				</div>

				{/* Actions */}
				<div className="flex items-center space-x-3">
					{/* Role Change Dropdown */}
					<select
						value={user.role}
						onChange={e => onRoleChange(user.id, e.target.value as "USER" | "INSTRUCTOR" | "ADMIN")}
						className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700"
					>
						<option value="USER">{getRoleLabel("USER", tCommon)}</option>
						<option value="INSTRUCTOR">{getRoleLabel("INSTRUCTOR", tCommon)}</option>
						<option value="ADMIN">{getRoleLabel("ADMIN", tCommon)}</option>
					</select>

					<Button
						variant="ghost"
						size="sm"
						onClick={() => onDelete(user.id, user.name || user.email || t("unknownUser"))}
						className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
						aria-label={tCommon("delete")}
						title={tCommon("delete")}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</GlassCard>
	);
}
