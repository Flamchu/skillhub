interface NavigationProps {
	className?: string;
}

export function Navigation({ className = "" }: NavigationProps) {
	return (
		<nav className={`px-6 py-6 bg-surface/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-border dark:border-gray-700 ${className}`}>
			<div className="max-w-7xl mx-auto flex justify-between items-center">
				<h1 className="text-3xl font-bold bg-gradient-to-br from-primary via-purple to-pink text-transparent bg-clip-text">SkillHub ✨</h1>
				<div className="flex gap-4">
					<a href="/login" className="px-6 py-3 text-foreground-muted hover:text-foreground font-medium transition-colors rounded-sm hover:bg-surface-hover/70 dark:hover:bg-gray-800">
						Sign In
					</a>
					<a href="/login" className="px-8 py-3 bg-gradient-to-r from-primary to-purple text-primary-foreground rounded-sm hover:from-primary-600 hover:to-purple-600 dark:hover:from-primary-500 dark:hover:to-purple-500 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
						Get Started 🚀
					</a>
				</div>
			</div>
		</nav>
	);
}
