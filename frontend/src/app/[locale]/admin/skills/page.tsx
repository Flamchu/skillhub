"use client";

import React, { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/http";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import {
	Search,
	Plus,
	BookOpen,
	Loader2,
	AlertCircle,
	Edit2,
	Trash2,
	ChevronRight,
	ChevronDown,
	Folder,
	FileText,
} from "lucide-react";
import type { Skill, CreateSkillData, UpdateSkillData } from "@/types";
import { useTranslations } from "next-intl";

interface SkillTreeNode extends Skill {
	children: SkillTreeNode[];
	expanded?: boolean;
}

export default function AdminSkillsPage() {
	const t = useTranslations("admin.skillsPage");
	const tCommon = useTranslations("common");
	const [skills, setSkills] = useState<Skill[]>([]);
	const [skillTree, setSkillTree] = useState<SkillTreeNode[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

	// Form state
	const [formData, setFormData] = useState({
		name: "",
		slug: "",
		description: "",
		parentId: "",
	});

	const loadSkills = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const params: Record<string, string> = {};
			if (searchQuery.trim()) {
				params.search = searchQuery.trim();
			}

			const response = (await api.listSkills(params)) as { skills: Skill[] };
			setSkills(response.skills);
			buildSkillTree(response.skills);
		} catch (err) {
			setError(err instanceof Error ? err.message : t("errors.load"));
		} finally {
			setLoading(false);
		}
	}, [searchQuery, t]);

	useEffect(() => {
		loadSkills();
	}, [loadSkills]);

	const buildSkillTree = (skills: Skill[]) => {
		const skillMap = new Map<string, SkillTreeNode>();
		const roots: SkillTreeNode[] = [];

		// create all nodes
		skills.forEach(skill => {
			skillMap.set(skill.id, {
				...skill,
				children: [],
				expanded: false,
			});
		});

		// build tree structure
		skills.forEach(skill => {
			const node = skillMap.get(skill.id)!;
			if (skill.parentId) {
				const parent = skillMap.get(skill.parentId);
				if (parent) {
					parent.children.push(node);
				} else {
					roots.push(node);
				}
			} else {
				roots.push(node);
			}
		});

		setSkillTree(roots);
	};

	const toggleNode = (skillId: string) => {
		const updateNode = (nodes: SkillTreeNode[]): SkillTreeNode[] => {
			return nodes.map(node => {
				if (node.id === skillId) {
					return { ...node, expanded: !node.expanded };
				}
				return { ...node, children: updateNode(node.children) };
			});
		};
		setSkillTree(updateNode(skillTree));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			// generate slug from name if not provided
			const slug =
				formData.slug ||
				formData.name
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "-")
					.replace(/^-|-$/g, "");

			if (editingSkill) {
				const updateData: UpdateSkillData = {
					name: formData.name,
					slug,
					description: formData.description || undefined,
					parentId: formData.parentId || undefined,
				};
				await api.updateSkill(editingSkill.id, updateData);
			} else {
				const createData: CreateSkillData = {
					name: formData.name,
					slug,
					description: formData.description || undefined,
					parentId: formData.parentId || undefined,
				};
				await api.createSkill(createData);
			}

			// Reset form and reload skills
			setFormData({ name: "", slug: "", description: "", parentId: "" });
			setShowCreateForm(false);
			setEditingSkill(null);
			loadSkills();
		} catch (err) {
			alert(
				editingSkill
					? t("alerts.updateFailed", { message: err instanceof Error ? err.message : t("alerts.unknownError") })
					: t("alerts.createFailed", { message: err instanceof Error ? err.message : t("alerts.unknownError") })
			);
		}
	};

	const handleEdit = (skill: Skill) => {
		setEditingSkill(skill);
		setFormData({
			name: skill.name,
			slug: skill.slug,
			description: skill.description || "",
			parentId: skill.parentId || "",
		});
		setShowCreateForm(true);
	};

	const handleDelete = async (skill: Skill) => {
		if (!confirm(t("alerts.confirmDelete", { name: skill.name }))) {
			return;
		}

		try {
			await api.deleteSkill(skill.id);
			loadSkills();
		} catch (err) {
			alert(t("alerts.deleteFailed", { message: err instanceof Error ? err.message : t("alerts.unknownError") }));
		}
	};

	const cancelForm = () => {
		setFormData({ name: "", slug: "", description: "", parentId: "" });
		setShowCreateForm(false);
		setEditingSkill(null);
	};

	const renderSkillNode = (node: SkillTreeNode, depth: number = 0) => {
		return (
			<div key={node.id} className="select-none">
				<div
					className={`flex items-center space-x-3 p-3 rounded-xl hover:bg-linear-to-r hover:from-primary-50 hover:to-purple-50 dark:hover:from-primary-900/20 dark:hover:to-purple-900/20 transition-all duration-200 ${
						depth === 0
							? "font-medium border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50"
							: ""
					}`}
					style={{ marginLeft: `${depth * 24}px` }}
				>
					{node.children.length > 0 ? (
						<button
							onClick={() => toggleNode(node.id)}
							className="w-6 h-6 flex items-center justify-center hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-lg transition-all duration-200"
						>
							{node.expanded ? (
								<ChevronDown className="w-4 h-4 text-primary" />
							) : (
								<ChevronRight className="w-4 h-4 text-primary" />
							)}
						</button>
					) : (
						<div className="w-6 h-6" />
					)}

					{node.children.length > 0 ? (
						<Folder className="w-5 h-5 text-primary-600 dark:text-primary-400" />
					) : (
						<FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />
					)}

					<span className="flex-1 text-gray-900 dark:text-gray-100">{node.name}</span>

					{node.description && (
						<Badge variant="info" size="sm">
							{t("tree.hasDescription")}
						</Badge>
					)}

					<div className="flex items-center space-x-1">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => handleEdit(node)}
							className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200"
							aria-label={tCommon("edit")}
							title={tCommon("edit")}
						>
							<Edit2 className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => handleDelete(node)}
							className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
							aria-label={tCommon("delete")}
							title={tCommon("delete")}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				</div>

				{node.expanded && node.children.map(child => renderSkillNode(child, depth + 1))}
			</div>
		);
	};

	const getSkillOptions = (currentSkillId?: string): Skill[] => {
		return skills.filter(skill => skill.id !== currentSkillId);
	};

	return (
		<div className="min-h-screen bg-linear-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
			<div className="max-w-7xl mx-auto p-6 space-y-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
					<div className="text-center sm:text-left">
						<h1 className="text-4xl md:text-5xl font-bold mb-4">
							<span className="bg-linear-to-br from-primary via-purple to-pink text-transparent bg-clip-text">
								{t("title")}
							</span>
						</h1>
						<p className="text-lg text-gray-600 dark:text-gray-300">{t("description")}</p>
					</div>
					<Button
						onClick={() => setShowCreateForm(true)}
						className="bg-linear-to-r from-primary to-purple hover:from-primary-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
					>
						<Plus className="h-4 w-4 mr-2" />
						{t("actions.addSkill")}
					</Button>
				</div>

				{/* Create/Edit Form */}
				{showCreateForm && (
					<div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200">
						<h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
							{editingSkill ? t("form.editTitle") : t("form.createTitle")}
						</h3>

						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										{t("form.fields.name.label")}
									</label>
									<Input
										placeholder={t("form.fields.name.placeholder")}
										value={formData.name}
										onChange={e => {
											const name = e.target.value;
											const slug = name
												.toLowerCase()
												.replace(/[^a-z0-9]+/g, "-")
												.replace(/^-|-$/g, "");
											setFormData({ ...formData, name, slug });
										}}
										required
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("form.fields.slug.label")}</label>
									<Input
										placeholder={t("form.fields.slug.placeholder")}
										value={formData.slug}
										onChange={e => setFormData({ ...formData, slug: e.target.value })}
										required
									/>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("form.fields.parent.label")}</label>
								<select
									value={formData.parentId}
									onChange={e => setFormData({ ...formData, parentId: e.target.value })}
									className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white backdrop-blur-sm transition-all duration-200"
								>
									<option value="">{t("form.fields.parent.none")}</option>
									{getSkillOptions(editingSkill?.id).map(skill => (
										<option key={skill.id} value={skill.id}>
											{skill.name}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("form.fields.description.label")}</label>
								<textarea
									placeholder={t("form.fields.description.placeholder")}
									value={formData.description}
									onChange={e => setFormData({ ...formData, description: e.target.value })}
									rows={4}
									className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white backdrop-blur-sm transition-all duration-200 resize-none"
								/>
							</div>

							<div className="flex space-x-3">
								<Button
									type="submit"
									className="bg-linear-to-r from-primary to-purple hover:from-primary-600 hover:to-purple-600 text-white border-0"
								>
									{editingSkill ? t("actions.updateSkill") : t("actions.createSkill")}
								</Button>
								<Button type="button" variant="outline" onClick={cancelForm}>
									{tCommon("cancel")}
								</Button>
							</div>
						</form>
					</div>
				)}

				{/* Search */}
				<div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200">
					<div className="max-w-md">
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("search.label")}</label>
						<Input
							placeholder={t("search.placeholder")}
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
							leftIcon={<Search className="h-4 w-4" />}
						/>
					</div>
				</div>

				{/* Loading State */}
				{loading && (
					<div className="flex items-center justify-center py-16">
						<div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8">
							<Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
							<span className="text-gray-600 dark:text-gray-400">{t("loading")}</span>
						</div>
					</div>
				)}

				{/* Error State */}
				{error && (
					<div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-red-200/50 dark:border-red-700/50 p-8 text-center">
						<AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t("errors.loadTitle")}</h3>
						<p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
						<Button variant="outline" onClick={loadSkills}>
							{tCommon("tryAgain")}
						</Button>
					</div>
				)}

				{/* Skills Tree */}
				{!loading && !error && (
					<div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200">
						<h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">{t("tree.title")}</h3>

						{skillTree.length > 0 ? (
							<div className="space-y-1">{skillTree.map(node => renderSkillNode(node))}</div>
						) : (
							<div className="text-center py-12">
								<BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t("empty.title")}</h3>
								<p className="text-gray-600 dark:text-gray-400 mb-6">
									{searchQuery ? t("empty.filteredDescription") : t("empty.description")}
								</p>
								{!searchQuery && (
									<Button
										onClick={() => setShowCreateForm(true)}
										className="bg-linear-to-r from-primary to-purple hover:from-primary-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
									>
										<Plus className="h-4 w-4 mr-2" />
										{t("empty.addFirstSkill")}
									</Button>
								)}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
