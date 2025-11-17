import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Play, Clock, List, CheckCircle, Circle } from "lucide-react";
import type { Course, Lesson } from "@/types";

interface CourseLessonsProps {
	course: Course;
	selectedLessonId?: string;
	selectedTimestamp?: number;
	currentVideoTime?: number;
	onLessonSelect: (lessonId: string) => void;
	onTimestampSelect: (time: number) => void;
}

// utility functions
function formatDuration(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;

	if (hours > 0) {
		return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
	}
	return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function parseYouTubeTimestamps(description: string): Array<{ time: number; title: string }> {
	if (!description) return [];

	// matches both formats: "0:00 Title" and "(0:00:00) Title"
	const timestampRegex = /\(?(\d{1,2}):(\d{2})(?::(\d{2}))?\)?\s+(.+?)(?=\n|$)/g;
	const timestamps: Array<{ time: number; title: string }> = [];
	let match;

	while ((match = timestampRegex.exec(description)) !== null) {
		const hours = match[3] ? parseInt(match[1]) : 0;
		const minutes = match[3] ? parseInt(match[2]) : parseInt(match[1]);
		const seconds = match[3] ? parseInt(match[3]) : parseInt(match[2]);
		const title = match[4].trim();

		// skip if title is empty or just whitespace
		if (!title || title.length === 0) continue;

		const timeInSeconds = hours * 3600 + minutes * 60 + seconds;
		timestamps.push({ time: timeInSeconds, title });
	}

	return timestamps.sort((a, b) => a.time - b.time);
}

// lesson item component
function LessonItem({
	lesson,
	isActive,
	onClick,
	isCompleted = false,
}: {
	lesson: Lesson;
	isActive: boolean;
	onClick: () => void;
	isCompleted?: boolean;
}) {
	return (
		<button
			onClick={onClick}
			className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
				isActive
					? "bg-primary/10 text-primary border border-primary/30"
					: "hover:bg-surface-hover border border-transparent"
			}`}
		>
			<div className="flex items-start gap-3">
				<div className="shrink-0 mt-1">
					{isCompleted ? (
						<CheckCircle className="h-5 w-5 text-success" />
					) : isActive ? (
						<Play className="h-5 w-5 text-primary" />
					) : (
						<Circle className="h-5 w-5 text-foreground-muted" />
					)}
				</div>

				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-1">
						<span className="text-xs font-medium text-foreground-muted">{lesson.position}</span>
						<span className="text-xs text-foreground-muted">{formatDuration(lesson.durationSeconds)}</span>
					</div>

					<h4 className="text-sm font-medium line-clamp-2 mb-1">{lesson.title}</h4>

					{lesson.description && <p className="text-xs text-foreground-subtle line-clamp-2">{lesson.description}</p>}
				</div>
			</div>
		</button>
	);
}

// timestamp item component
function TimestampItem({
	timestamp,
	isActive,
	onClick,
}: {
	timestamp: { time: number; title: string };
	isActive: boolean;
	onClick: () => void;
}) {
	return (
		<button
			onClick={onClick}
			className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
				isActive
					? "bg-primary/10 text-primary border border-primary/30"
					: "hover:bg-surface-hover border border-transparent"
			}`}
		>
			<div className="flex items-center gap-3">
				<div className="shrink-0">
					<Clock className="h-4 w-4 text-foreground-muted" />
				</div>

				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-1">
						<span className="text-xs font-mono text-foreground-muted">{formatDuration(timestamp.time)}</span>
					</div>

					<h4 className="text-sm line-clamp-2">{timestamp.title}</h4>
				</div>
			</div>
		</button>
	);
}

export function CourseLessons({
	course,
	selectedLessonId,
	selectedTimestamp,
	currentVideoTime = 0,
	onLessonSelect,
	onTimestampSelect,
}: CourseLessonsProps) {
	const [activeTab, setActiveTab] = useState<"lessons" | "timestamps">("lessons");
	const [showAllLessons, setShowAllLessons] = useState(false);

	// sort lessons once
	const sortedLessons = course.lessons ? [...course.lessons].sort((a, b) => a.position - b.position) : [];

	const currentLesson = selectedLessonId && sortedLessons ? sortedLessons.find(l => l.id === selectedLessonId) : null;
	const timestamps = currentLesson ? parseYouTubeTimestamps(currentLesson.description || course.description || "") : [];
	// check if course is a playlist (multiple lessons with different videos) or single video
	const isPlaylistCourse = course.lessons && course.lessons.length > 1;
	const hasHiddenLessons = sortedLessons.length > 7;

	function getVisibleLessons() {
		if (showAllLessons || sortedLessons.length <= 7) return sortedLessons;

		const selectedIndex = sortedLessons.findIndex(l => l.id === selectedLessonId);
		if (selectedIndex === -1) return sortedLessons.slice(0, 7);

		const middle = 3; // 3 before, current, 3 after
		let start = selectedIndex - middle;
		if (start < 0) start = 0;
		if (start + 7 > sortedLessons.length) start = Math.max(0, sortedLessons.length - 7);

		return sortedLessons.slice(start, start + 7);
	}

	const visibleLessons = getVisibleLessons();

	// function to get visible timestamps (7 total: 3 before, current, 3 after)
	function getVisibleTimestamps() {
		if (timestamps.length === 0) return [];

		// find current timestamp based on video time or selected timestamp
		let currentIndex = 0;
		if (currentVideoTime > 0) {
			// find the timestamp that matches the current video time (the last timestamp that's <= current time)
			for (let i = timestamps.length - 1; i >= 0; i--) {
				if (timestamps[i].time <= currentVideoTime) {
					currentIndex = i;
					break;
				}
			}
		} else if (selectedTimestamp !== undefined) {
			// use manually selected timestamp
			currentIndex = timestamps.findIndex(t => t.time === selectedTimestamp);
			if (currentIndex === -1) currentIndex = 0;
		}

		// calculate the visible range (3 before, current, 3 after)
		const start = Math.max(0, currentIndex - 3);
		const end = Math.min(timestamps.length, start + 7);
		const adjustedStart = Math.max(0, end - 7);

		return timestamps.slice(adjustedStart, end);
	}

	const visibleTimestamps = getVisibleTimestamps();

	// auto-select appropriate tab
	useEffect(() => {
		if (isPlaylistCourse) {
			setActiveTab("lessons");
		} else if (timestamps.length > 0) {
			setActiveTab("timestamps");
		}
	}, [isPlaylistCourse, timestamps.length]);

	return (
		<Card className="h-full flex flex-col bg-surface/60 dark:bg-gray-800/60 backdrop-blur-sm border border-border/20 shadow-lg">
			<div className="p-6 border-b border-border">
				<h2 className="font-bold text-lg mb-4 text-foreground">Course Content</h2>

				{/* tab switcher */}
				{isPlaylistCourse || timestamps.length > 0 ? (
					<div className="flex rounded-lg bg-surface-muted p-1">
						{isPlaylistCourse && (
							<button
								onClick={() => setActiveTab("lessons")}
								className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
									activeTab === "lessons"
										? "bg-surface text-foreground shadow-sm"
										: "text-foreground-muted hover:text-foreground"
								}`}
							>
								<div className="flex items-center justify-center gap-2">
									<List className="h-4 w-4" />
									Lessons ({course.lessons?.length || 0})
								</div>
							</button>
						)}

						{timestamps.length > 0 && (
							<button
								onClick={() => setActiveTab("timestamps")}
								className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
									activeTab === "timestamps"
										? "bg-surface text-foreground shadow-sm"
										: "text-foreground-muted hover:text-foreground"
								}`}
							>
								<div className="flex items-center justify-center gap-2">
									<Clock className="h-4 w-4" />
									Chapters ({timestamps.length})
								</div>
							</button>
						)}
					</div>
				) : null}
			</div>

			<div className="flex-1 overflow-auto p-6">
				{activeTab === "lessons" && isPlaylistCourse && (
					<div className="space-y-2">
						{/* show a small indicator when we're not showing all lessons */}
						{hasHiddenLessons && !showAllLessons && (
							<div className="text-xs text-foreground-muted text-center py-2 border-b border-border">
								Showing {visibleLessons.length} of {sortedLessons.length} lessons
							</div>
						)}

						{visibleLessons.map(lesson => (
							<LessonItem
								key={lesson.id}
								lesson={lesson}
								isActive={selectedLessonId === lesson.id}
								onClick={() => onLessonSelect(lesson.id)}
							/>
						))}

						{hasHiddenLessons && (
							<div className="pt-3 text-center">
								<button
									onClick={() => setShowAllLessons(prev => !prev)}
									className="text-sm text-foreground-muted hover:text-foreground"
								>
									{showAllLessons ? `Show less` : `Show all (${sortedLessons.length})`}
								</button>
							</div>
						)}
					</div>
				)}

				{activeTab === "timestamps" && timestamps.length > 0 && (
					<div className="space-y-2">
						{visibleTimestamps.length > 0 ? (
							<>
								{/* Show navigation info if there are more timestamps */}
								{timestamps.length > 7 && (
									<div className="text-xs text-foreground-muted text-center py-2 border-b border-border">
										Showing {visibleTimestamps.length} of {timestamps.length} chapters
									</div>
								)}
								{visibleTimestamps.map((timestamp, index) => {
									// determine if this timestamp is active based on current video time or selection
									const isActive =
										currentVideoTime > 0
											? currentVideoTime >= timestamp.time &&
												(index === visibleTimestamps.length - 1 ||
													currentVideoTime < visibleTimestamps[index + 1]?.time)
											: selectedTimestamp === timestamp.time;

									return (
										<TimestampItem
											key={`${timestamp.time}-${index}`}
											timestamp={timestamp}
											isActive={isActive}
											onClick={() => onTimestampSelect(timestamp.time)}
										/>
									);
								})}
							</>
						) : (
							timestamps.map((timestamp, index) => (
								<TimestampItem
									key={index}
									timestamp={timestamp}
									isActive={selectedTimestamp === timestamp.time}
									onClick={() => onTimestampSelect(timestamp.time)}
								/>
							))
						)}
					</div>
				)}

				{activeTab === "lessons" && !isPlaylistCourse && (
					<div className="text-center py-8 text-foreground-muted">
						<List className="h-8 w-8 mx-auto mb-2 opacity-50" />
						<p className="text-sm">This is a single video course</p>
					</div>
				)}

				{activeTab === "timestamps" && timestamps.length === 0 && (
					<div className="text-center py-8 text-foreground-muted">
						<Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
						<p className="text-sm">No timestamps available</p>
					</div>
				)}
			</div>
		</Card>
	);
}
