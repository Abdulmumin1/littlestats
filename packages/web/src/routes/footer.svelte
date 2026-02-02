<script>
	import { Twitter, Mail, Github } from 'lucide-svelte';
	import { color } from '$lib/colors/mixer.js';
	import Logo from '../lib/components/generals/logo.svelte';

	const currentYear = new Date().getFullYear();
</script>

<footer class="mt-12 border-t border-black/10 bg-white font-inter md:mt-0 dark:border-white/10 dark:bg-stone-900 overflow-hidden relative">
	<div class="absolute inset-0 bg-grid-slate-100 mask-[linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:mask-[linear-gradient(0deg,rgba(0,0,0,0.1),rgba(0,0,0,0.5))] pointer-events-none"></div>
	<div class="h-1 bg-linear-to-r from-transparent via-{$color}-600/40 to-transparent"></div>
	<div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10">
		<div class="grid grid-cols-1 gap-12 md:grid-cols-4 lg:grid-cols-5">
			<!-- Company Info -->
			<div class="space-y-6 col-span-1 lg:col-span-2">
				<div class="flex items-center space-x-2">
					<div class="w-8 h-8 rounded-lg bg-{$color}-600 flex items-center justify-center text-white font-bold transform -rotate-6 hover:rotate-0 transition-transform duration-300">
L					</div>
					<h3 class="text-xl font-bold text-black dark:text-white tracking-tight">Littlestats</h3>
				</div>
				<p class="text-sm text-stone-600 dark:text-stone-400 max-w-xs leading-relaxed">
					Your analytics needs without the premium price tag. Privacy-focused, lightweight, and surprisingly powerful.
				</p>
				<div class="flex space-x-4">
					<a
						href="https://twitter.com/abdulmuminyqn"
						target="_blank"
						class="p-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-{$color}-600 hover:text-white dark:hover:bg-{$color}-600 dark:hover:text-white transition-all duration-300"
					>
						<Twitter size={18} />
					</a>

					<a
						href="mailto:abdulmuminyqn@gmail.com"
						title="abdulmuminyqn@gmail.com"
						class="p-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-{$color}-600 hover:text-white dark:hover:bg-{$color}-600 dark:hover:text-white transition-all duration-300"
					>
						<Mail size={18} />
					</a>

					<a
						href="http://github.com/abdulmumin1/littlestats"
						target="_blank"
						title="GitHub"
						class="p-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-{$color}-600 hover:text-white dark:hover:bg-{$color}-600 dark:hover:text-white transition-all duration-300"
					>
						<Github size={18} />
					</a>
				</div>
			</div>

			<!-- Product -->
			<div>
				<h3 class="text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-500 mb-6">Product</h3>
				<ul class="space-y-4">
					<li>
						<a href="/#features" class="text-sm text-stone-600 dark:text-stone-400 hover:text-{$color}-600 dark:hover:text-{$color}-500 transition-colors flex items-center group"
							>
							<span class="w-0 group-hover:w-2 h-0.5 bg-{$color}-600 mr-0 group-hover:mr-2 transition-all duration-300"></span>
							Features
						</a>
					</li>
					<li>
						<a href="/#pricing" class="text-sm text-stone-600 dark:text-stone-400 hover:text-{$color}-600 dark:hover:text-{$color}-500 transition-colors flex items-center group"
							>
							<span class="w-0 group-hover:w-2 h-0.5 bg-{$color}-600 mr-0 group-hover:mr-2 transition-all duration-300"></span>
							Pricing
						</a>
					</li>
				</ul>
			</div>

			<!-- Resources -->
			<div>
				<h3 class="text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-500 mb-6">Resources</h3>
				<ul class="space-y-4">
					<li>
						<a href="http://github.com/abdulmumin1/littlestats" target="_blank" class="text-sm text-stone-600 dark:text-stone-400 hover:text-{$color}-600 dark:hover:text-{$color}-500 transition-colors flex items-center group"
							>
							<span class="w-0 group-hover:w-2 h-0.5 bg-{$color}-600 mr-0 group-hover:mr-2 transition-all duration-300"></span>
							Open Source
						</a>
					</li>
					<li>
						<a href="/docs" class="text-sm text-stone-600 dark:text-stone-400 hover:text-{$color}-600 dark:hover:text-{$color}-500 transition-colors flex items-center group"
							>
							<span class="w-0 group-hover:w-2 h-0.5 bg-{$color}-600 mr-0 group-hover:mr-2 transition-all duration-300"></span>
							Documentation
						</a>
					</li>
					<li>
						<a href="/changelog" class="text-sm text-stone-600 dark:text-stone-400 hover:text-{$color}-600 dark:hover:text-{$color}-500 transition-colors flex items-center group"
							>
							<span class="w-0 group-hover:w-2 h-0.5 bg-{$color}-600 mr-0 group-hover:mr-2 transition-all duration-300"></span>
							Changelog
						</a>
					</li>
				</ul>
			</div>

			<!-- Legal -->
			<div>
				<h3 class="text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-500 mb-6">Legal</h3>
				<ul class="space-y-4">
					<li>
						<a href="/privacy-policy" class="text-sm text-stone-600 dark:text-stone-400 hover:text-{$color}-600 dark:hover:text-{$color}-500 transition-colors"
							>Privacy</a
						>
					</li>
					<li>
						<a href="/terms" class="text-sm text-stone-600 dark:text-stone-400 hover:text-{$color}-600 dark:hover:text-{$color}-500 transition-colors">Terms</a>
					</li>
					<li>
						<a href="/acceptable-use" class="text-sm text-stone-600 dark:text-stone-400 hover:text-{$color}-600 dark:hover:text-{$color}-500 transition-colors"
							>Acceptable Use</a
						>
					</li>
				</ul>
			</div>
		</div>

		<div class="mt-16 pt-8 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
			<div class="flex flex-col space-y-1 items-center md:items-start">
			
				<p class="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-600 font-medium">
					A product of <a href="https://thirdpen.app" target="_blank" class="hover:text-{$color}-600 text-{$color}-600 transition-colors">The Thirdpen Company</a>
				</p>
			</div>
			<div class="flex items-center space-x-6">
				<!-- <a href="/status" class="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-600 hover:text-stone-600 dark:hover:text-stone-400 transition-colors">System Status</a>
				<div class="w-1 h-1 rounded-full bg-stone-300 dark:bg-stone-700"></div>
				<a href="/roadmap" class="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-600 hover:text-stone-600 dark:hover:text-stone-400 transition-colors">Roadmap</a> -->
			</div>
		</div>
	</div>
</footer>

<style>
	.bg-grid-slate-100 {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(241 245 249 / 0.1)'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E");
	}
	.dark .bg-grid-slate-700\/25 {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(51 65 85 / 0.2)'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E");
	}
</style>
