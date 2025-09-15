export default function Home() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
			{/* Navigation */}
			<nav className="px-6 py-6 border-b border-white/20">
				<div className="max-w-7xl mx-auto flex justify-between items-center">
					<h1 className="text-3xl font-bold text-gray-900">SkillHub</h1>
					<div className="flex gap-4">
						<a href="/login" className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium transition-colors">
							Sign In
						</a>
						<a href="/login" className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md hover:shadow-lg transition-all duration-200">
							Get Started
						</a>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<main className="px-6 py-20">
				<div className="max-w-4xl mx-auto text-center">
					<h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
						Develop Your Skills,
						<span className="text-blue-600"> Advance Your Career</span>
					</h2>
					<p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed">Join thousands of professionals who trust SkillHub to enhance their expertise and unlock new career opportunities in today&apos;s competitive market.</p>
					<div className="flex flex-col sm:flex-row gap-6 justify-center">
						<a href="/login" className="px-10 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 text-lg font-bold text-center">
							Start Learning Today
						</a>
						<a href="/login" className="px-10 py-4 bg-white border-2 border-gray-300 text-gray-800 rounded-lg hover:border-gray-400 hover:bg-gray-50 shadow-md hover:shadow-lg transition-all duration-200 text-lg font-bold text-center">
							Browse Courses
						</a>
					</div>
				</div>

				{/* Features Section */}
				<div className="max-w-6xl mx-auto mt-24">
					<h3 className="text-3xl font-bold text-center text-gray-900 mb-16">Why Choose SkillHub?</h3>
					<div className="grid md:grid-cols-3 gap-8">
						<div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
							<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
								<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
								</svg>
							</div>
							<h4 className="text-xl font-bold text-gray-900 mb-4">Lightning Fast Learning</h4>
							<p className="text-gray-700 leading-relaxed">Get up to speed quickly with our optimized learning paths and hands-on practice sessions.</p>
						</div>

						<div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
							<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
								<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<h4 className="text-xl font-bold text-gray-900 mb-4">Industry Recognized</h4>
							<p className="text-gray-700 leading-relaxed">Earn certificates and credentials that are valued by top employers across industries.</p>
						</div>

						<div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
							<div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
								<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
								</svg>
							</div>
							<h4 className="text-xl font-bold text-gray-900 mb-4">Expert Community</h4>
							<p className="text-gray-700 leading-relaxed">Learn from industry experts and connect with a global community of professionals.</p>
						</div>
					</div>
				</div>

				{/* Stats Section */}
				<div className="max-w-4xl mx-auto mt-24 bg-white rounded-2xl shadow-xl p-12">
					<div className="grid md:grid-cols-3 gap-8 text-center">
						<div>
							<div className="text-4xl font-bold text-blue-600 mb-2">50,000+</div>
							<div className="text-gray-700 font-medium">Active Learners</div>
						</div>
						<div>
							<div className="text-4xl font-bold text-green-600 mb-2">500+</div>
							<div className="text-gray-700 font-medium">Expert Courses</div>
						</div>
						<div>
							<div className="text-4xl font-bold text-purple-600 mb-2">95%</div>
							<div className="text-gray-700 font-medium">Success Rate</div>
						</div>
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className="bg-gray-900 text-white py-12 px-6 mt-24">
				<div className="max-w-4xl mx-auto text-center">
					<h3 className="text-2xl font-bold mb-4">SkillHub</h3>
					<p className="text-gray-400 mb-6">Empowering professionals worldwide with cutting-edge skills and knowledge.</p>
					<div className="flex justify-center gap-6 text-gray-400">
						<a href="#" className="hover:text-white transition-colors">
							About
						</a>
						<a href="#" className="hover:text-white transition-colors">
							Courses
						</a>
						<a href="#" className="hover:text-white transition-colors">
							Contact
						</a>
						<a href="#" className="hover:text-white transition-colors">
							Privacy
						</a>
					</div>
					<div className="mt-8 pt-8 border-t border-gray-800 text-gray-500">
						<p>&copy; 2025 SkillHub. All rights reserved.</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
