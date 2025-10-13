"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/http";

interface StatsCounterProps {
	targetValue: number;
	suffix?: string;
	duration?: number;
	fetchFromAPI?: boolean;
	apiKey?: string;
}

function roundToNiceNumber(value: number): number {
	if (value >= 10000) {
		// round to nearest thousand for values 10k+
		return Math.round(value / 1000) * 1000;
	} else if (value >= 1000) {
		// round to nearest hundred for values 1k-10k
		return Math.round(value / 100) * 100;
	} else if (value >= 100) {
		// round to nearest ten for values 100-1k
		return Math.round(value / 10) * 10;
	} else {
		// keep as-is for smaller values
		return Math.round(value);
	}
}

function formatNumber(value: number): string {
	if (value >= 1000000) {
		return (value / 1000000).toFixed(1).replace(".0", "") + "M";
	} else if (value >= 1000) {
		return (value / 1000).toFixed(1).replace(".0", "") + "K";
	} else {
		return value.toString();
	}
}

export default function StatsCounter({
	targetValue,
	suffix = "",
	duration = 2000,
	fetchFromAPI = true,
	apiKey,
}: StatsCounterProps) {
	const [currentValue, setCurrentValue] = useState(0);
	const [finalValue, setFinalValue] = useState(targetValue);
	const [isLoading, setIsLoading] = useState(fetchFromAPI);

	// Fetch data from API if needed
	useEffect(() => {
		if (fetchFromAPI) {
			const fetchStats = async () => {
				try {
					setIsLoading(true);
					const data = await api.getPublicStats();
					// extract the value based on the apiKey
					const apiValue = apiKey ? data[apiKey] : data;
					const roundedValue = roundToNiceNumber(apiValue);
					setFinalValue(roundedValue);
				} catch (error) {
					console.error("Failed to fetch stats:", error);
					// fallback to provided targetValue
					setFinalValue(roundToNiceNumber(targetValue));
				} finally {
					setIsLoading(false);
				}
			};

			fetchStats();
		} else {
			setFinalValue(roundToNiceNumber(targetValue));
		}
	}, [fetchFromAPI, apiKey, targetValue]);

	// Animate counter
	useEffect(() => {
		if (isLoading) return;

		let startTime: number;
		let animationFrame: number;

		const animate = (timestamp: number) => {
			if (!startTime) startTime = timestamp;
			const progress = Math.min((timestamp - startTime) / duration, 1);

			// easing function for smooth animation
			const easeOutQuart = 1 - Math.pow(1 - progress, 4);
			const value = Math.floor(finalValue * easeOutQuart);

			setCurrentValue(value);

			if (progress < 1) {
				animationFrame = requestAnimationFrame(animate);
			}
		};

		animationFrame = requestAnimationFrame(animate);

		return () => {
			if (animationFrame) {
				cancelAnimationFrame(animationFrame);
			}
		};
	}, [finalValue, duration, isLoading]);

	if (isLoading) {
		return (
			<div className="animate-pulse">
				<div className="h-12 bg-gradient-to-br from-primary/20 to-purple/20 rounded" />
			</div>
		);
	}

	return (
		<span>
			{formatNumber(currentValue)}
			{suffix}
		</span>
	);
}
