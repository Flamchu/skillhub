"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Zap, Plus, Minus, Search, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface XPAwardResult {
	message: string;
	transaction: {
		id: string;
		amount: number;
		source: string;
	};
	newXP: number;
	newLevel: number;
}

export function XPManager() {
	const [userId, setUserId] = useState("");
	const [amount, setAmount] = useState("");
	const [description, setDescription] = useState("");
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<XPAwardResult | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleAwardXP = async (isNegative: boolean) => {
		// validate inputs
		if (!userId.trim()) {
			setError("Please enter a user ID");
			return;
		}

		if (!amount || parseInt(amount) <= 0) {
			setError("Please enter a valid positive amount");
			return;
		}

		try {
			setLoading(true);
			setError(null);
			setResult(null);

			const xpAmount = isNegative ? -parseInt(amount) : parseInt(amount);

			// call the admin xp award endpoint using http directly
			const { http } = await import("@/lib/http");
			const response = await http.post<XPAwardResult>("/social/xp/award", {
				userId: userId.trim(),
				amount: xpAmount, // send negative or positive value
				description: description.trim() || undefined, // let backend generate default
			});

			setResult(response.data);

			// clear form after success
			setUserId("");
			setAmount("");
			setDescription("");
		} catch (err: unknown) {
			const error = err as { response?: { data?: { error?: string } }; message?: string };
			setError(error?.response?.data?.error || error?.message || "Failed to award XP");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-primary/20 dark:border-gray-700 rounded-2xl p-8">
			<div className="flex items-center gap-3 mb-6">
				<div className="w-12 h-12 bg-gradient-to-br from-primary to-purple rounded-2xl flex items-center justify-center">
					<Zap className="h-6 w-6 text-white" />
				</div>
				<div>
					<h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">XP Manager</h3>
					<p className="text-sm text-gray-600 dark:text-gray-300">Add or remove XP from users for testing</p>
				</div>
			</div>

			<div className="space-y-4">
				{/* user id input */}
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						User ID <span className="text-red-500">*</span>
					</label>
					<div className="relative">
						<input
							type="text"
							value={userId}
							onChange={e => setUserId(e.target.value)}
							placeholder="Enter user UUID"
							className="w-full px-4 py-3 pl-10 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
						/>
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
					</div>
				</div>

				{/* amount input */}
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						XP Amount <span className="text-red-500">*</span>
					</label>
					<input
						type="number"
						value={amount}
						onChange={e => setAmount(e.target.value)}
						placeholder="Enter XP amount (e.g., 100)"
						min="1"
						className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
					/>
				</div>

				{/* description input */}
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Description <span className="text-gray-500 text-xs">(optional)</span>
					</label>
					<input
						type="text"
						value={description}
						onChange={e => setDescription(e.target.value)}
						placeholder="Reason for XP adjustment"
						className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
					/>
				</div>

				{/* action buttons */}
				<div className="flex gap-3 pt-2">
					<Button
						onClick={() => handleAwardXP(false)}
						disabled={loading}
						className="flex-1 bg-gradient-to-r from-success to-success-600 hover:from-success-600 hover:to-success-700 text-white"
					>
						{loading ? (
							<Loader2 className="h-5 w-5 animate-spin" />
						) : (
							<>
								<Plus className="h-5 w-5 mr-2" />
								Add XP
							</>
						)}
					</Button>
					<Button
						onClick={() => handleAwardXP(true)}
						disabled={loading}
						variant="outline"
						className="flex-1 border-2 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
					>
						{loading ? (
							<Loader2 className="h-5 w-5 animate-spin" />
						) : (
							<>
								<Minus className="h-5 w-5 mr-2" />
								Remove XP
							</>
						)}
					</Button>
				</div>

				{/* result message */}
				{result && (
					<div className="mt-4 p-4 bg-success/10 border border-success/30 rounded-lg">
						<div className="flex items-start gap-3">
							<CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
							<div className="flex-1">
								<p className="text-sm font-semibold text-success mb-1">{result.message}</p>
								<p className="text-xs text-gray-600 dark:text-gray-400">
									New XP: <span className="font-bold">{result.newXP}</span> | Level:{" "}
									<span className="font-bold">{result.newLevel}</span>
								</p>
							</div>
						</div>
					</div>
				)}

				{/* error message */}
				{error && (
					<div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
						<div className="flex items-start gap-3">
							<AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
							<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
						</div>
					</div>
				)}

				{/* help text */}
				<div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
					<p className="text-xs text-blue-600 dark:text-blue-400">
						💡 <span className="font-semibold">Tip:</span> You can find user IDs in the Users section or from the
						database. Use this to test XP calculations, level progression, and the XP bar display.
					</p>
				</div>
			</div>
		</div>
	);
}
