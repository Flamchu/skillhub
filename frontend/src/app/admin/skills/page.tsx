"use client";

import React, { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/http";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Search, Plus, BookOpen, Loader2, AlertCircle, Edit2, Trash2, ChevronRight, ChevronDown, Folder, FileText } from "lucide-react";
import type { Skill, CreateSkillData, UpdateSkillData } from "@/types";

interface SkillTreeNode extends Skill {
	children: SkillTreeNode[];
	expanded?: boolean;
}

export default function AdminSkillsPage() {
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
			setError(err instanceof Error ? err.message : "Failed to load skills");
		} finally {
			setLoading(false);
		}
	}, [searchQuery]);

	useEffect(() => {
		loadSkills();
	}, [loadSkills]);

	const buildSkillTree = (skills: Skill[]) => {
		const skillMap = new Map<string, SkillTreeNode>();
		const roots: SkillTreeNode[] = [];

		// Create all nodes
		skills.forEach((skill) => {
			skillMap.set(skill.id, {
				...skill,
				children: [],
				expanded: false,
			});
		});

		// Build tree structure
		skills.forEach((skill) => {
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
			return nodes.map((node) => {
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
			// Generate slug from name if not provided
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
			alert(`Failed to ${editingSkill ? "update" : "create"} skill: ${err instanceof Error ? err.message : "Unknown error"}`);
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
		if (!confirm(`Are you sure you want to delete skill "${skill.name}"? This will also delete all child skills.`)) {
			return;
		}

		try {
			await api.deleteSkill(skill.id);
			loadSkills();
		} catch (err) {
			alert(`Failed to delete skill: ${err instanceof Error ? err.message : "Unknown error"}`);
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
				<div className={`flex items-center space-x-2 p-2 rounded hover:bg-surface-hover ${depth === 0 ? "font-medium" : ""}`} style={{ marginLeft: `${depth * 24}px` }}>
					{node.children.length > 0 ? (
						<button onClick={() => toggleNode(node.id)} className="w-4 h-4 flex items-center justify-center hover:bg-surface-pressed rounded">
							{node.expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
						</button>
					) : (
						<div className="w-4 h-4" />
					)}

					{node.children.length > 0 ? <Folder className="w-4 h-4 text-primary" /> : <FileText className="w-4 h-4 text-foreground-muted" />}

					<span className="flex-1">{node.name}</span>

					{node.description && (
						<Badge variant="info" size="sm">
							Has description
						</Badge>
					)}

					<div className="flex items-center space-x-1">
						<Button variant="ghost" size="sm" onClick={() => handleEdit(node)} className="text-primary hover:text-primary-600 hover:bg-primary-50">
							<Edit2 className="h-3 w-3" />
						</Button>
						<Button variant="ghost" size="sm" onClick={() => handleDelete(node)} className="text-danger hover:text-danger-600 hover:bg-danger-50">
							<Trash2 className="h-3 w-3" />
						</Button>
					</div>
				</div>

				{node.expanded && node.children.map((child) => renderSkillNode(child, depth + 1))}
			</div>
		);
	};

	const getSkillOptions = (currentSkillId?: string): Skill[] => {
		return skills.filter((skill) => skill.id !== currentSkillId);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-foreground">Skills Management</h1>
					<p className="mt-2 text-foreground-muted">Manage the skills hierarchy and taxonomy</p>
				</div>
				<Button onClick={() => setShowCreateForm(true)}>
					<Plus className="h-4 w-4 mr-2" />
					Add Skill
				</Button>
			</div>

			{/* Create/Edit Form */}
			{showCreateForm && (
				<Card>
					<CardContent className="p-6">
						<h3 className="text-lg font-semibold mb-4 text-foreground">{editingSkill ? "Edit Skill" : "Create New Skill"}</h3>

						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-foreground-alt mb-2">Skill Name *</label>
									<Input
										placeholder="e.g., JavaScript, React, Machine Learning"
										value={formData.name}
										onChange={(e) => {
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
									<label className="block text-sm font-medium text-foreground-alt mb-2">Slug *</label>
									<Input placeholder="auto-generated-from-name" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required />
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-foreground-alt mb-2">Parent Skill</label>
								<select value={formData.parentId} onChange={(e) => setFormData({ ...formData, parentId: e.target.value })} className="block w-full px-3 py-2 border border-border rounded-input shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 bg-surface text-foreground">
									<option value="">No parent (root skill)</option>
									{getSkillOptions(editingSkill?.id).map((skill) => (
										<option key={skill.id} value={skill.id}>
											{skill.name}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-foreground-alt mb-2">Description</label>
								<textarea placeholder="Optional description of this skill..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
							</div>

							<div className="flex space-x-3">
								<Button type="submit">{editingSkill ? "Update Skill" : "Create Skill"}</Button>
								<Button type="button" variant="outline" onClick={cancelForm}>
									Cancel
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			)}

			{/* Search */}
			<Card>
				<CardContent className="p-6">
					<div className="max-w-md">
						<label className="block text-sm font-medium text-gray-700 mb-2">Search Skills</label>
						<Input placeholder="Search by skill name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} leftIcon={<Search className="h-4 w-4" />} />
					</div>
				</CardContent>
			</Card>

			{/* Loading State */}
			{loading && (
				<div className="flex items-center justify-center py-12">
					<Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
					<span className="ml-2 text-gray-600 dark:text-gray-400">Loading skills...</span>
				</div>
			)}

			{/* Error State */}
			{error && (
				<Card>
					<CardContent className="p-8 text-center">
						<AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Failed to load skills</h3>
						<p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
						<Button variant="outline" onClick={loadSkills}>
							Try Again
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Skills Tree */}
			{!loading && !error && (
				<Card>
					<CardContent className="p-6">
						<h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Skills Hierarchy</h3>

						{skillTree.length > 0 ? (
							<div className="space-y-1">{skillTree.map((node) => renderSkillNode(node))}</div>
						) : (
							<div className="text-center py-8">
								<BookOpen className="w-12 h-12 text-gray-500 dark:text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No skills found</h3>
								<p className="text-gray-600 dark:text-gray-400 mb-4">{searchQuery ? "Try adjusting your search criteria." : "Create your first skill to get started."}</p>
								{!searchQuery && (
									<Button onClick={() => setShowCreateForm(true)}>
										<Plus className="h-4 w-4 mr-2" />
										Add First Skill
									</Button>
								)}
							</div>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	);
}
