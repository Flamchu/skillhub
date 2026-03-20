import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Play } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Lesson } from "@/types";

interface VideoPlayerProps {
	videoId?: string;
	playlistId?: string;
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
interface YTPlayer {
	seekTo: (seconds: number, allowSeekAhead: boolean) => void;
	getCurrentTime: () => number;
	destroy: () => void;
}

interface YTPlayerState {
	PLAYING: number;
}

interface YT {
	Player: new (element: HTMLElement, config: YTPlayerConfig) => YTPlayer;
	PlayerState: YTPlayerState;
}

interface YTPlayerConfig {
	videoId?: string;
	height?: string | number;
	width?: string | number;
	playerVars: {
		start?: number;
		autoplay?: number;
		controls?: number;
		modestbranding?: number;
		rel?: number;
		iv_load_policy?: number;
		listType?: string;
		list?: string;
	};
	events: {
		onReady: () => void;
		onStateChange: (event: { data: number }) => void;
		onError?: (event: { data?: number; target?: unknown } | number) => void;
	};
}

declare global {
	interface Window {
		YT: YT;
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

function getYouTubeErrorDescription(errorCode: number, t: (key: string) => string): string {
	switch (errorCode) {
		case 2:
			return t("codes.invalidVideoId");
		case 4:
			return t("codes.unplayable");
		case 5:
			return t("codes.html5");
		case 100:
			return t("codes.notFound");
		case 101:
		case 150:
			return t("codes.embeddingDisabled");
		case 153:
			return t("codes.missingReferrer");
		default:
			return t("codes.unknown");
	}
}

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
	({ videoId, playlistId, title: _title, startTime, selectedLesson, selectedTimestamp, onTimeUpdate }, ref) => {
		const t = useTranslations("courses.videoPlayer");
		const tErrors = useTranslations("courses.videoPlayer.errors");
		const playerRef = useRef<YTPlayer | null>(null);
		const containerRef = useRef<HTMLDivElement>(null);
		const [isPlayerReady, setIsPlayerReady] = useState(false);
		const [playerError, setPlayerError] = useState<number | null>(null);
		const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

		// reset error when video/playlist changes
		useEffect(() => {
			setPlayerError(null);
		}, [videoId, playlistId]);

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
			if (typeof window === "undefined" || (!videoId && !playlistId)) return;

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
				if (!containerRef.current) return;
				if (!window.YT) return;

				if (playerRef.current) {
					try {
						playerRef.current.destroy();
					} catch (error) {
						console.warn("Failed to destroy previous player:", error);
					}
				}

				try {
					const config: YTPlayerConfig = {
						height: "100%",
						width: "100%",
						playerVars: {
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
							onStateChange: (event: { data: number }) => {
								if (event.data === window.YT.PlayerState.PLAYING) {
									startTimeTracking();
								} else {
									stopTimeTracking();
								}
							},
							onError: (event: { data?: number; target?: unknown } | number) => {
								const errorCode = typeof event === "number" ? event : (event as { data?: number }).data || 0;
								console.error("YouTube player error:", errorCode);
								setPlayerError(errorCode);
							},
						},
					};

					// configure video/playlist
					if (videoId) {
						config.videoId = videoId;
						if (startTime) {
							config.playerVars.start = startTime;
						}
					} else if (playlistId) {
						config.playerVars.listType = "playlist";
						config.playerVars.list = playlistId;
					}

					playerRef.current = new window.YT.Player(containerRef.current, config);
				} catch (error) {
					console.error("failed to initialize youtube player:", error);
				}
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
		}, [videoId, playlistId, onTimeUpdate, startTime]);

		if (!videoId && !playlistId) {
			return (
				<div className="bg-surface/60 dark:bg-gray-800/60 backdrop-blur-sm border border-border/20 rounded-2xl p-8 shadow-lg">
					<EmptyState
						icon={<Play className="h-12 w-12" />}
						title={t("empty.title")}
						description={t("empty.description")}
					/>
				</div>
			);
		}

		if (playerError) {
			return (
				<div className="bg-surface/60 dark:bg-gray-800/60 backdrop-blur-sm border border-border/20 rounded-2xl p-8 shadow-lg">
					<EmptyState
						icon={<Play className="h-12 w-12" />}
						title={t("errors.title")}
						description={`${getYouTubeErrorDescription(playerError, tErrors)} (Error ${playerError})`}
					/>
					<p className="text-sm text-muted-foreground text-center mt-4">{t("errors.tip")}</p>
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
										<span>{t("currentLesson.startingAt", { time: formatDuration(selectedTimestamp) })}</span>
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
