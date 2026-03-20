"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { extractYouTubeVideoId, extractYouTubePlaylistId } from "@/lib/youtubeUtils";
import { CourseNavigation, CourseHeader, VideoPlayer, CourseLessons } from "@/components/courses";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Play } from "lucide-react";
import { useTranslations } from "next-intl";

// types
import type { Course } from "@/types";

interface CourseResponse {
	course: Course;
}

// main course page component
export default function CoursePage({ courseId }: { courseId: string }) {
	const t = useTranslations("courses.coursePage");
	const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
	const [selectedTimestamp, setSelectedTimestamp] = useState<number | null>(null);
	const [currentVideoTime, setCurrentVideoTime] = useState<number>(0);
	const videoPlayerRef = useRef<{ seekTo: (time: number) => void }>(null);

	// fetch course with lessons
	const {
		data: courseData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["course", courseId],
		queryFn: async (): Promise<CourseResponse> => {
			const response = await http.get(`/courses/${courseId}/lessons`);
			return response.data;
		},
	});

	const course = courseData?.course;
	const selectedLesson = course?.lessons?.find(l => l.id === selectedLessonId);

	// extract video id from lesson or use playlist from course
	const lessonVideoId = selectedLesson?.providerVideoId ? extractYouTubeVideoId(selectedLesson.providerVideoId) : null;
	const coursePlaylistId = course?.externalId ? extractYouTubePlaylistId(course.externalId) : null;

	// prioritize: if lesson has video id, use it alone; otherwise use playlist
	const currentVideoId = lessonVideoId;
	const playlistId = lessonVideoId ? null : coursePlaylistId; // only use playlist if no specific video

	// auto-select first lesson when course loads
	useEffect(() => {
		if (course?.lessons && course.lessons.length > 0 && !selectedLessonId) {
			const firstLesson = course.lessons.sort((a, b) => a.position - b.position)[0];
			setSelectedLessonId(firstLesson.id);
		}
	}, [course, selectedLessonId]);

	// simulate video time progression for automatic timestamp advancement
	useEffect(() => {
		if (selectedTimestamp === null || selectedTimestamp === undefined) return;

		const interval = setInterval(() => {
			setCurrentVideoTime(prevTime => {
				// increment time by 1 second, but cap it at reasonable bounds
				const newTime = prevTime + 1;
				const maxTime = selectedLesson?.durationSeconds || 60 * 60; // max 1 hour if no duration
				return newTime > maxTime ? prevTime : newTime;
			});
		}, 1000); // update every second

		return () => clearInterval(interval);
	}, [selectedTimestamp, selectedLesson?.durationSeconds]);

	const handleLessonSelect = (lessonId: string) => {
		setSelectedLessonId(lessonId);
		setSelectedTimestamp(null); // reset timestamp when changing lessons
	};

	const handleTimestampSelect = (time: number) => {
		setSelectedTimestamp(time);
		setCurrentVideoTime(time); // immediately update current time when timestamp is selected

		// seek video to timestamp without reloading
		if (videoPlayerRef.current?.seekTo) {
			videoPlayerRef.current.seekTo(time);
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-surface">
				<div className="container mx-auto px-4 py-8">
					<div className="animate-pulse space-y-6">
						<div className="h-8 bg-surface-secondary rounded w-1/3" />
						<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
							<div className="lg:col-span-3">
								<div className="aspect-video bg-surface-secondary rounded-xl" />
							</div>
							<div className="bg-surface-secondary rounded-xl h-96" />
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error || !course) {
		return (
			<div className="min-h-screen bg-surface">
				<div className="container mx-auto px-4 py-8">
					<ErrorState
						title={t("errors.notFoundTitle")}
						message={error instanceof Error ? error.message : t("errors.notFoundDescription")}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-surface">
			<CourseNavigation />

			<div className="container mx-auto px-4 py-6">
				<CourseHeader course={course} />

				{/* main content grid */}
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
					{/* video player */}
					<div className="lg:col-span-3">
						{currentVideoId || playlistId ? (
							<VideoPlayer
								ref={videoPlayerRef}
								videoId={currentVideoId ?? undefined}
								playlistId={playlistId ?? undefined}
								title={selectedLesson?.title || course.title}
								selectedLesson={selectedLesson}
								selectedTimestamp={selectedTimestamp}
								onTimeUpdate={setCurrentVideoTime}
							/>
						) : (
							<div className="bg-surface/60 dark:bg-gray-800/60 backdrop-blur-sm border border-border/20 rounded-2xl p-8 shadow-lg">
								<EmptyState
									icon={<Play className="h-12 w-12" />}
									title={t("emptyVideo.title")}
									description={t("emptyVideo.description")}
								/>
							</div>
						)}
					</div>

					{/* sidebar */}
					<div className="lg:col-span-1">
						<CourseLessons
							course={course}
							selectedLessonId={selectedLessonId || undefined}
							selectedTimestamp={selectedTimestamp || undefined}
							currentVideoTime={currentVideoTime}
							onLessonSelect={handleLessonSelect}
							onTimestampSelect={handleTimestampSelect}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
