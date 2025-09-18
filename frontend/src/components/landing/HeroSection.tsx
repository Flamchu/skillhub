export function HeroSection() {
	return (
		<main className="px-6 py-20">
			<div className="max-w-5xl mx-auto text-center">
				<div className="mb-8">
					<span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-success-50 to-info-50 dark:from-success-900/20 dark:to-info-900/20 text-success dark:text-success-400 rounded-full text-sm font-semibold mb-6 border border-success/30 dark:border-success-400/30">🎓 Join 50,000+ learners worldwide</span>
				</div>

				<h2 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
					<span className="bg-gradient-to-br from-primary via-purple to-pink text-transparent bg-clip-text">Learn. Grow. Succeed.</span>
					<br />
					<span className="text-foreground text-4xl md:text-5xl">Your Journey Starts Here! 🌟</span>
				</h2>

				<p className="text-xl text-foreground-muted mb-12 max-w-3xl mx-auto leading-relaxed">Unlock your potential with interactive courses, expert mentorship, and hands-on projects. Transform your career with skills that matter in today&apos;s digital world.</p>

				<div className="flex flex-col sm:flex-row gap-6 justify-center">
					<a href="/login" className="group px-12 py-5 bg-gradient-to-r from-primary to-purple text-primary-foreground rounded-lg hover:from-primary-600 hover:to-purple-600 dark:hover:from-primary-500 dark:hover:to-purple-500 shadow-xl hover:shadow-2xl transition-all duration-300 text-xl font-bold text-center transform hover:scale-105 hover:-translate-y-1">
						<span className="flex items-center justify-center gap-2">
							Start Learning Today
							<span className="group-hover:translate-x-1 transition-transform">→</span>
						</span>
					</a>
					<a href="/login" className="px-12 py-5 bg-surface dark:bg-gray-800 border-2 border-primary/30 dark:border-primary/50 text-foreground rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary dark:hover:border-primary shadow-lg hover:shadow-xl transition-all duration-300 text-xl font-bold text-center transform hover:scale-105">
						<span className="flex items-center justify-center gap-2">📚 Browse Courses</span>
					</a>
				</div>

				{/* Decorative elements */}
				<div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-70">
					<div className="text-center">
						<div className="text-3xl mb-2">💡</div>
						<p className="text-sm text-foreground-muted font-medium">Interactive Learning</p>
					</div>
					<div className="text-center">
						<div className="text-3xl mb-2">🎯</div>
						<p className="text-sm text-foreground-muted font-medium">Goal-Oriented</p>
					</div>
					<div className="text-center">
						<div className="text-3xl mb-2">👥</div>
						<p className="text-sm text-foreground-muted font-medium">Community Support</p>
					</div>
					<div className="text-center">
						<div className="text-3xl mb-2">🏆</div>
						<p className="text-sm text-foreground-muted font-medium">Certified Results</p>
					</div>
				</div>
			</div>
		</main>
	);
}
