import { StatsCounter } from "@/components/ui";

interface StatCardProps {
	icon: React.ReactNode;
	value: number;
	suffix: string;
	label: string;
	description: string;
	apiKey: "users" | "courses" | "successRate";
	colorScheme: "primary" | "success" | "warning";
}

function StatCard({ icon, value, suffix, label, description, apiKey, colorScheme }: StatCardProps) {
	const colorClasses = {
		primary: {
			bg: "bg-gradient-to-br from-primary/10 to-purple/5 dark:from-primary/15 dark:to-purple/10",
			border: "border-primary/20 dark:border-primary/30",
			hover: "hover:from-primary/15 hover:to-purple/10 dark:hover:from-primary/20 dark:hover:to-purple/15",
			iconBg: "bg-gradient-to-br from-primary to-purple",
			textGradient: "bg-gradient-to-br from-primary via-purple to-pink text-transparent bg-clip-text",
		},
		success: {
			bg: "bg-gradient-to-br from-success-50 to-info-50 dark:from-success-900/20 dark:to-info-900/20",
			border: "border-success/20 dark:border-success/30",
			hover: "hover:from-success-100 hover:to-info-100 dark:hover:from-success-800/30 dark:hover:to-info-800/30",
			iconBg: "bg-gradient-to-br from-success-500 to-info-500",
			textGradient: "bg-gradient-to-br from-success via-info-600 to-success-600 text-transparent bg-clip-text",
		},
		warning: {
			bg: "bg-gradient-to-br from-warning/10 to-pink/5 dark:from-warning/15 dark:to-pink/10",
			border: "border-warning/20 dark:border-warning/30",
			hover: "hover:from-warning/15 hover:to-pink/10 dark:hover:from-warning/20 dark:hover:to-pink/15",
			iconBg: "bg-gradient-to-br from-warning to-pink",
			textGradient: "bg-gradient-to-br from-warning via-pink to-warning text-transparent bg-clip-text",
		},
	};

	const colors = colorClasses[colorScheme];

	return (
		<div className={`group ${colors.bg} border ${colors.border} rounded-2xl p-8 ${colors.hover} transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-center`}>
			<div className={`w-16 h-16 ${colors.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>{icon}</div>
			<div className={`text-5xl font-bold ${colors.textGradient} mb-3`}>
				<StatsCounter targetValue={value} suffix={suffix} fetchFromAPI={true} apiKey={apiKey} />
			</div>
			<div className="text-foreground-muted font-semibold text-lg">{label}</div>
			<div className="text-foreground-subtle text-sm mt-2">{description}</div>
		</div>
	);
}

export function StatsSection() {
	return (
		<div className="max-w-6xl mx-auto mt-32">
			<div className="text-center mb-16">
				<h3 className="text-3xl md:text-4xl font-bold mb-4">
					<span className="bg-gradient-to-br from-primary via-purple to-pink text-transparent bg-clip-text">Join the Learning Revolution</span>
				</h3>
				<p className="text-lg text-foreground-muted max-w-2xl mx-auto">Thousands of learners worldwide are already transforming their careers</p>
			</div>

			<div className="grid md:grid-cols-3 gap-8">
				<StatCard
					icon={
						<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
						</svg>
					}
					value={50000}
					suffix="+"
					label="Active Learners"
					description="Growing every day"
					apiKey="users"
					colorScheme="primary"
				/>

				<StatCard
					icon={
						<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
						</svg>
					}
					value={500}
					suffix="+"
					label="Expert Courses"
					description="From industry leaders"
					apiKey="courses"
					colorScheme="success"
				/>

				<StatCard
					icon={
						<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
						</svg>
					}
					value={95}
					suffix="%"
					label="Success Rate"
					description="Proven results"
					apiKey="successRate"
					colorScheme="warning"
				/>
			</div>
		</div>
	);
}
