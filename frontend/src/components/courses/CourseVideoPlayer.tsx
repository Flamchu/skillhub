import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Play } from "lucide-react";
import type { Lesson } from "@/types";

interface VideoPlayerProps {
	videoId?: string;
	title: string;
	startTime?: number;
	selectedLesson?: Lesson;
	selectedTimestamp?: number | null;
	onTimeUpdate?: (time: number) => void;
}

export interface VideoPlayerRef {
	seekTo: (time: number) => void;
}

// YouTube player API types
declare global {
	interface Window {
		YT: any;
		onYouTubeIframeAPIReady: () => void;
	}
}

// utility function
function formatDuration(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;

	if (hours > 0) {
		return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
	}
	return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
	({ videoId, title: _title, startTime, selectedLesson, selectedTimestamp, onTimeUpdate }, ref) => {
		const playerRef = useRef<any>(null);
		const containerRef = useRef<HTMLDivElement>(null);
		const [isPlayerReady, setIsPlayerReady] = useState(false);
		const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

		// expose seekTo method to parent
		useImperativeHandle(
			ref,
			() => ({
				seekTo: (time: number) => {
					if (playerRef.current && isPlayerReady) {
						try {
							playerRef.current.seekTo(time, true);
						} catch (error) {
							console.warn("Failed to seek to time:", error);
						}
					}
				},
			}),
			[isPlayerReady]
		);

		// load YouTube iframe API and initialize player
		useEffect(() => {
			if (typeof window === "undefined" || !videoId) return;

			const startTimeTracking = () => {
				if (timeUpdateIntervalRef.current) {
					clearInterval(timeUpdateIntervalRef.current);
				}

				timeUpdateIntervalRef.current = setInterval(() => {
					if (playerRef.current && onTimeUpdate) {
						try {
							const currentTime = playerRef.current.getCurrentTime();
							if (typeof currentTime === "number") {
								onTimeUpdate(Math.floor(currentTime));
							}
						} catch {
							// ignore errors
						}
					}
				}, 1000);
			};

			const stopTimeTracking = () => {
				if (timeUpdateIntervalRef.current) {
					clearInterval(timeUpdateIntervalRef.current);
					timeUpdateIntervalRef.current = null;
				}
			};

			const initializePlayer = () => {
				if (!containerRef.current || !videoId || !window.YT) return;

				if (playerRef.current) {
					playerRef.current.destroy();
				}

				playerRef.current = new window.YT.Player(containerRef.current, {
					videoId,
					playerVars: {
						start: startTime || 0,
						autoplay: 0,
						controls: 1,
						modestbranding: 1,
						rel: 0,
						iv_load_policy: 3,
					},
					events: {
						onReady: () => {
							setIsPlayerReady(true);
							startTimeTracking();
						},
						onStateChange: (event: any) => {
							if (event.data === window.YT.PlayerState.PLAYING) {
								startTimeTracking();
							} else {
								stopTimeTracking();
							}
						},
					},
				});
			};

			// check if API is already loaded
			if (window.YT && window.YT.Player) {
				initializePlayer();
				return;
			}

			// load the API script if not already loaded
			if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
				const script = document.createElement("script");
				script.src = "https://www.youtube.com/iframe_api";
				script.async = true;
				document.head.appendChild(script);
			}

			// set up the callback for when API is ready
			window.onYouTubeIframeAPIReady = initializePlayer;

			return () => {
				if (timeUpdateIntervalRef.current) {
					clearInterval(timeUpdateIntervalRef.current);
				}
			};
		}, [videoId, onTimeUpdate]);
		if (!videoId) {
			return (
				<div className="bg-surface/60 dark:bg-gray-800/60 backdrop-blur-sm border border-border/20 rounded-2xl p-8 shadow-lg">
					<EmptyState
						icon={<Play className="h-12 w-12" />}
						title="No video available"
						description="This course doesn't have a video to display."
					/>
				</div>
			);
		}

		return (
			<div className="space-y-6">
				{/* Video Container */}
				<div className="bg-surface/60 dark:bg-gray-800/60 backdrop-blur-sm border border-border/20 rounded-2xl overflow-hidden shadow-lg">
					<div className="aspect-video w-full bg-gray-900 rounded-2xl overflow-hidden">
						<div ref={containerRef} className="w-full h-full" />
					</div>
				</div>

				{/* Current Lesson Info */}
				{selectedLesson && (
					<Card className="bg-surface/60 dark:bg-gray-800/60 backdrop-blur-sm border border-border/20 shadow-lg">
						<div className="p-6">
							<h3 className="text-xl font-bold text-foreground mb-3">
								{selectedLesson.position}. {selectedLesson.title}
							</h3>
							<div className="flex items-center gap-3 text-sm text-foreground-muted mb-4">
								<span className="font-medium">{formatDuration(selectedLesson.durationSeconds)}</span>
								{selectedTimestamp && (
									<>
										<span>•</span>
										<span>Starting at {formatDuration(selectedTimestamp)}</span>
									</>
								)}
							</div>
							{selectedLesson.description && (
								<p className="text-foreground-alt leading-relaxed">{selectedLesson.description}</p>
							)}
						</div>
					</Card>
				)}
			</div>
		);
	}
);

VideoPlayer.displayName = "VideoPlayer";
