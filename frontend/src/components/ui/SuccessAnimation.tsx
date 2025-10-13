"use client";

import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";

interface SuccessAnimationProps {
	message: string;
	isVisible: boolean;
	onComplete?: () => void;
}

export function SuccessAnimation({ message, isVisible, onComplete }: SuccessAnimationProps) {
	const [shouldRender, setShouldRender] = useState(false);

	useEffect(() => {
		if (isVisible) {
			setShouldRender(true);
			const timer = setTimeout(() => {
				setShouldRender(false);
				onComplete?.();
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [isVisible, onComplete]);

	if (!shouldRender) return null;

	return (
		<div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
			<div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 max-w-sm">
				<CheckCircle className="w-6 h-6 animate-in zoom-in duration-300" />
				<span className="font-medium">{message}</span>
			</div>
		</div>
	);
}
