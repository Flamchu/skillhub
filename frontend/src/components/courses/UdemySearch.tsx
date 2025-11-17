import { useState, useEffect } from "react";
import { http } from "@/lib/http";
import { Button } from "@/components/ui/Button";
import { Search, Star, Clock, ExternalLink, Loader, AlertCircle } from "lucide-react";
import { CourseCardSkeleton } from "@/components/ui";

interface UdemyCourse {
	id: number;
	title: string;
	url: string;
	headline: string;
	image_480x270: string;
	price: string;
	rating: number;
	content_length_video: number;
	is_paid: boolean;
	instructional_level: string;
	visible_instructors: Array<{
		title: string;
		name: string;
	}>;
}

interface UdemySearchResponse {
	count: number;
	results: UdemyCourse[];
}

interface UdemySearchProps {
	initialQuery?: string;
	maxResults?: number;
	showTitle?: boolean;
}

export function UdemySearch({ initialQuery = "", maxResults = 12, showTitle = true }: UdemySearchProps) {
	const [query, setQuery] = useState(initialQuery);
	const [searchQuery, setSearchQuery] = useState(initialQuery);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [results, setResults] = useState<UdemyCourse[]>([]);

	const handleSearch = async () => {
		if (!searchQuery.trim()) return;

		setIsLoading(true);
		setError(null);

		try {
			const response = await http.get<UdemySearchResponse>("/udemy/search", {
				params: {
					query: searchQuery,
					pageSize: maxResults,
					orderBy: "-rating",
				},
			});

			setResults(response.data.results);
		} catch (err) {
			console.error("Udemy search error:", err);
			setError("Failed to search Udemy courses. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (initialQuery) {
			handleSearch();
		}
	}, []);

	const formatDuration = (seconds: number) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		return `${hours}h ${minutes}m`;
	};

	const formatLevel = (level: string) => {
		const levelMap: Record<string, string> = {
			"All Levels": "Beginner",
			Beginner: "Beginner",
			Intermediate: "Intermediate",
			Expert: "Advanced",
		};
		return levelMap[level] || level;
	};

	return (
		<div className="space-y-6">
			{showTitle && (
				<div className="text-center">
					<h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Explore Udemy Courses</h2>
					<p className="text-gray-600 dark:text-gray-300">Discover thousands of courses from Udemy's platform</p>
				</div>
			)}

			{/* search bar */}
			<div className="flex gap-3 max-w-2xl mx-auto">
				<div className="flex-1 relative">
					<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
					<input
						type="text"
						value={query}
						onChange={e => setQuery(e.target.value)}
						onKeyDown={e => e.key === "Enter" && (setSearchQuery(query), handleSearch())}
						placeholder="Search Udemy courses..."
						className="w-full pl-12 pr-4 py-3 bg-surface/80 dark:bg-gray-800/80 backdrop-blur-sm border border-border/20 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
					/>
				</div>
				<Button
					onClick={() => {
						setSearchQuery(query);
						handleSearch();
					}}
					disabled={isLoading || !query.trim()}
					className="bg-linear-to-r from-info to-success hover:from-info-600 hover:to-success-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
				>
					{isLoading ? <Loader className="w-5 h-5 animate-spin" /> : "Search"}
				</Button>
			</div>

			{/* error state */}
			{error && (
				<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
					<AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
					<p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
				</div>
			)}

			{/* loading state */}
			{isLoading && (
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{Array.from({ length: 6 }).map((_, i) => (
						<CourseCardSkeleton key={i} />
					))}
				</div>
			)}

			{/* results */}
			{!isLoading && results.length > 0 && (
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{results.map(course => (
						<div
							key={course.id}
							className="bg-surface/80 dark:bg-gray-800/80 backdrop-blur-sm border border-border/10 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
						>
							{/* thumbnail */}
							<div className="relative aspect-video overflow-hidden">
								<img
									src={course.image_480x270}
									alt={course.title}
									className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
								/>
								<div className="absolute top-3 left-3 px-3 py-1 bg-linear-to-r from-info to-success text-white text-xs font-semibold rounded-full">
									Udemy
								</div>
							</div>

							<div className="p-6">
								<h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-info transition-colors">
									{course.title}
								</h3>

								<div
									className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold mb-3 ${
										formatLevel(course.instructional_level) === "Beginner"
											? "bg-success/20 text-success"
											: formatLevel(course.instructional_level) === "Intermediate"
												? "bg-warning/20 text-warning"
												: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
									}`}
								>
									{formatLevel(course.instructional_level)}
								</div>

								<p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{course.headline}</p>

								<div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
									<div className="flex items-center gap-1">
										<Star className="w-4 h-4 fill-current text-warning" />
										<span>{course.rating.toFixed(1)}</span>
									</div>
									<div className="flex items-center gap-1">
										<Clock className="w-4 h-4" />
										<span>{formatDuration(course.content_length_video)}</span>
									</div>
								</div>

								{course.visible_instructors.length > 0 && (
									<p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
										By {course.visible_instructors[0].name}
									</p>
								)}

								<div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
									<span className="text-xl font-bold text-info">{course.is_paid ? course.price : "Free"}</span>
									<a
										href={course.url}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-info to-success hover:from-info-600 hover:to-success-600 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
									>
										View Course
										<ExternalLink className="w-4 h-4" />
									</a>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* empty state */}
			{!isLoading && searchQuery && results.length === 0 && (
				<div className="text-center py-12">
					<div className="bg-surface/60 dark:bg-gray-800/60 backdrop-blur-sm border border-border/20 rounded-2xl p-8 max-w-md mx-auto">
						<Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
						<h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No courses found</h3>
						<p className="text-gray-600 dark:text-gray-300">Try a different search term</p>
					</div>
				</div>
			)}
		</div>
	);
}
