import { StatsCounter } from "@/components/ui";

export default function Home() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 text-foreground">
			{/* Navigation */}
			<nav className="px-6 py-6 bg-surface/80 backdrop-blur-sm border-b border-border/50">
				<div className="max-w-7xl mx-auto flex justify-between items-center">
					<h1 className="text-3xl font-bold bg-gradient-to-br from-primary/90 via-purple to-pink text-transparent bg-clip-text">SkillHub ✨</h1>
					<div className="flex gap-4">
						<a href="/login" className="px-6 py-3 text-foreground-muted hover:text-foreground font-medium transition-colors rounded-sm hover:bg-surface-hover/70">
							Sign In
						</a>
						<a href="/login" className="px-8 py-3 bg-gradient-to-r from-primary to-purple text-primary-foreground rounded-sm hover:from-primary-600 hover:to-purple-600 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
							Get Started 🚀
						</a>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<main className="px-6 py-20">
				<div className="max-w-5xl mx-auto text-center">
					<div className="mb-8">
						<span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-success/20 to-info/20 text-success rounded-full text-sm font-semibold mb-6 border border-success/30">🎓 Join 50,000+ learners worldwide</span>
					</div>
					<h2 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
						<span className="bg-gradient-to-br from-primary/90 via-purple to-pink text-transparent bg-clip-text">Learn. Grow. Succeed.</span>
						<br />
						<span className="text-foreground text-4xl md:text-5xl">Your Journey Starts Here! 🌟</span>
					</h2>
					<p className="text-xl text-foreground-muted mb-12 max-w-3xl mx-auto leading-relaxed">Unlock your potential with interactive courses, expert mentorship, and hands-on projects. Transform your career with skills that matter in today&apos;s digital world.</p>
					<div className="flex flex-col sm:flex-row gap-6 justify-center">
						<a href="/login" className="group px-12 py-5 bg-gradient-to-r from-primary to-purple text-primary-foreground rounded-lg hover:from-primary-600 hover:to-purple-600 shadow-xl hover:shadow-2xl transition-all duration-300 text-xl font-bold text-center transform hover:scale-105 hover:-translate-y-1">
							<span className="flex items-center justify-center gap-2">
								Start Learning Today
								<span className="group-hover:translate-x-1 transition-transform">→</span>
							</span>
						</a>
						<a href="/login" className="px-12 py-5 bg-surface border-2 border-primary/30 text-foreground rounded-lg hover:bg-primary/10 hover:border-primary shadow-lg hover:shadow-xl transition-all duration-300 text-xl font-bold text-center transform hover:scale-105">
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

				{/* Features Section */}
				<div className="max-w-7xl mx-auto mt-32">
					<div className="text-center mb-20">
						<h3 className="text-4xl md:text-5xl font-bold mb-4">
							<span className="bg-gradient-to-br from-primary/90 via-purple to-pink text-transparent bg-clip-text">Why Choose SkillHub?</span>
						</h3>
						<p className="text-xl text-foreground-muted max-w-2xl mx-auto">Experience learning like never before with our innovative approach</p>
					</div>
					<div className="grid md:grid-cols-3 gap-10">
						<div className="group bg-gradient-to-br from-primary/5 to-purple/5 border border-primary/20 rounded-xl p-8 hover:from-primary/10 hover:to-purple/10 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
							<div className="w-16 h-16 bg-gradient-to-br from-primary to-purple rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
								<span className="text-2xl">⚡</span>
							</div>
							<h4 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">Lightning Fast Learning</h4>
							<p className="text-foreground-muted leading-relaxed text-lg">Master new skills in record time with our AI-powered adaptive learning paths and interactive challenges.</p>
							<div className="mt-6 inline-flex items-center text-primary font-semibold group-hover:translate-x-2 transition-transform">Learn more →</div>
						</div>

						<div className="group bg-gradient-to-br from-success/5 to-info/5 border border-success/20 rounded-xl p-8 hover:from-success/10 hover:to-info/10 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
							<div className="w-16 h-16 bg-gradient-to-br from-success to-info rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
								<span className="text-2xl">🏅</span>
							</div>
							<h4 className="text-2xl font-bold text-foreground mb-4 group-hover:text-success transition-colors">Industry Recognized</h4>
							<p className="text-foreground-muted leading-relaxed text-lg">Earn certificates and credentials that are valued by top employers across industries worldwide.</p>
							<div className="mt-6 inline-flex items-center text-success font-semibold group-hover:translate-x-2 transition-transform">View certificates →</div>
						</div>

						<div className="group bg-gradient-to-br from-warning/5 to-pink/5 border border-warning/20 rounded-xl p-8 hover:from-warning/10 hover:to-pink/10 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
							<div className="w-16 h-16 bg-gradient-to-br from-warning to-pink rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
								<span className="text-2xl">🌍</span>
							</div>
							<h4 className="text-2xl font-bold text-foreground mb-4 group-hover:text-warning transition-colors">Global Community</h4>
							<p className="text-foreground-muted leading-relaxed text-lg">Connect with learners and experts worldwide. Share knowledge, get help, and build lasting professional relationships.</p>
							<div className="mt-6 inline-flex items-center text-warning font-semibold group-hover:translate-x-2 transition-transform">Join community →</div>
						</div>
					</div>
				</div>

				{/* Stats Section */}
				<div className="max-w-6xl mx-auto mt-32">
					<div className="text-center mb-16">
						<h3 className="text-3xl md:text-4xl font-bold mb-4">
							<span className="bg-gradient-to-br from-primary/90 via-purple to-pink text-transparent bg-clip-text">Join the Learning Revolution</span>
						</h3>
						<p className="text-lg text-foreground-muted max-w-2xl mx-auto">Thousands of learners worldwide are already transforming their careers</p>
					</div>
					<div className="grid md:grid-cols-3 gap-8">
						<div className="group bg-gradient-to-br from-primary/10 to-purple/5 border border-primary/20 rounded-2xl p-8 hover:from-primary/15 hover:to-purple/10 transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-center">
							<div className="w-16 h-16 bg-gradient-to-br from-primary to-purple rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
								<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
								</svg>
							</div>
							<div className="text-5xl font-bold bg-gradient-to-br from-primary/90 via-purple to-pink text-transparent bg-clip-text mb-3">
								<StatsCounter targetValue={50000} suffix="+" fetchFromAPI={true} apiKey="users" />
							</div>
							<div className="text-foreground-muted font-semibold text-lg">Active Learners</div>
							<div className="text-foreground-subtle text-sm mt-2">Growing every day</div>
						</div>

						<div className="group bg-gradient-to-br from-success-50 to-info-50 border border-success/20 rounded-2xl p-8 hover:from-success-100 hover:to-info-100 transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-center">
							<div className="w-16 h-16 bg-gradient-to-br from-success-500 to-info-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
								<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
								</svg>
							</div>
							<div className="text-5xl font-bold bg-gradient-to-br from-success via-info-600 to-success-600 text-transparent bg-clip-text mb-3">
								<StatsCounter targetValue={500} suffix="+" fetchFromAPI={true} apiKey="courses" />
							</div>
							<div className="text-foreground-muted font-semibold text-lg">Expert Courses</div>
							<div className="text-foreground-subtle text-sm mt-2">From industry leaders</div>
						</div>

						<div className="group bg-gradient-to-br from-warning/10 to-pink/5 border border-warning/20 rounded-2xl p-8 hover:from-warning/15 hover:to-pink/10 transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-center">
							<div className="w-16 h-16 bg-gradient-to-br from-warning to-pink rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
								<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
								</svg>
							</div>
							<div className="text-5xl font-bold bg-gradient-to-br from-warning/90 via-pink to-warning text-transparent bg-clip-text mb-3">
								<StatsCounter targetValue={95} suffix="%" fetchFromAPI={true} apiKey="successRate" />
							</div>
							<div className="text-foreground-muted font-semibold text-lg">Success Rate</div>
							<div className="text-foreground-subtle text-sm mt-2">Proven results</div>
						</div>
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className="relative bg-gradient-to-br from-primary/5 via-purple/5 to-pink/5 border-t border-primary/20 py-20 px-6 mt-32 overflow-hidden">
				{/* Decorative Background */}
				<div className="absolute inset-0 opacity-20">
					<div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-primary to-purple rounded-full blur-xl"></div>
					<div className="absolute top-32 right-20 w-32 h-32 bg-gradient-to-br from-success to-info rounded-full blur-xl"></div>
					<div className="absolute bottom-20 left-1/3 w-24 h-24 bg-gradient-to-br from-warning to-pink rounded-full blur-xl"></div>
				</div>

				<div className="relative max-w-6xl mx-auto text-center">
					<div className="flex items-center justify-center space-x-3 mb-6">
						<div className="w-12 h-12 bg-gradient-to-br from-primary to-purple rounded-2xl flex items-center justify-center shadow-lg">
							<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m12 14 6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
							</svg>
						</div>
						<h3 className="text-3xl font-bold text-primary">SkillHub</h3>
					</div>
					<p className="text-foreground-muted mb-12 text-xl max-w-2xl mx-auto">Empowering professionals worldwide with cutting-edge skills and knowledge. Join thousands of learners on their journey to success.</p>

					<div className="flex justify-center gap-8 text-foreground-muted mb-12">
						<a href="#" className="group hover:text-primary transition-all duration-300 rounded-xl px-6 py-3 hover:bg-primary/10 hover:scale-105 transform font-medium">
							About
						</a>
						<a href="#" className="group hover:text-success transition-all duration-300 rounded-xl px-6 py-3 hover:bg-success/10 hover:scale-105 transform font-medium">
							Contact
						</a>
						<a href="#" className="group hover:text-info transition-all duration-300 rounded-xl px-6 py-3 hover:bg-info/10 hover:scale-105 transform font-medium">
							Privacy
						</a>
					</div>

					{/* Social Links */}
					<div className="flex justify-center space-x-6 mb-12">
						<a href="#" className="group w-14 h-14 bg-gradient-to-br from-primary to-purple rounded-xl flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl">
							<svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
								<path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.611 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
							</svg>
						</a>
						<a href="#" className="group w-14 h-14 bg-gradient-to-br from-success to-info rounded-xl flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl">
							<svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
								<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
							</svg>
						</a>
						<a href="#" className="group w-14 h-14 bg-gradient-to-br from-warning to-pink rounded-xl flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl">
							<svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
							</svg>
						</a>
					</div>

					<div className="border-t border-primary/20 pt-10">
						<div className="flex items-center justify-center space-x-2 mb-4">
							<p className="text-foreground-muted text-lg">Made with care for learners worldwide</p>
						</div>
						<p className="text-foreground-muted">&copy; 2025 SkillHub. All rights reserved. Keep learning, keep growing.</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
