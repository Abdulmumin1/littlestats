<script>
	import {  Twitter, Mail } from 'lucide-svelte';
	import { color } from '$lib/colors/mixer.js';

	const currentYear = new Date().getFullYear();
</script>

<footer class="mt-12 border-t border-black/10 bg-white font-inter md:mt-0 dark:border-white/10 dark:bg-stone-900">
	<div class="h-1 bg-{$color}-600/20"></div>
	<div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 gap-8 md:grid-cols-4">
			<!-- Company Info -->
			<div class="space-y-4">
				<h3 class="text-lg font-bold text-black dark:text-white">Littlestats</h3>
				<p class="text-sm text-black dark:text-white">
					Your analytics needs without the premium price tag
				</p>
				<div class="flex space-x-4">
					<a
						href="https://twitter.com/abdulmuminyqn"
						target="_blank"
						class="text-black  dark:text-white"
					>
						<Twitter size={20} />
					</a>

					<a
						href="mailto:abdulmuminyqn@gmail.com"
						title="abdulmuminyqn@gmail.com"
						class="text-black  dark:text-white"
					>
						<Mail size={20} />
					</a>
				</div>
			</div>

			<!-- Product -->
			<div>
				<h3 class="text-sm font-semibold text-black dark:text-white">Product</h3>
				<ul class="mt-4 space-y-3">
					<li>
						<a href="/#features" class="text-sm text-black  dark:text-white"
							>Features</a
						>
					</li>
					<li>
						<a href="/#pricing" class="text-sm text-black  dark:text-white"
							>Pricing</a
						>
					</li>

					<!-- <li><a href="#" class="text-sm text-black  dark:text-white">API</a></li> -->
				</ul>
			</div>

			<!-- Company -->
			<!-- <div>
				<h3 class="text-sm font-semibold text-black dark:text-white">Company</h3>
				<ul class="mt-4 space-y-3">
					<li><a href="#" class="text-sm text-black  dark:text-white">About</a></li>
					<li><a href="#" class="text-sm text-black  dark:text-white">Blog</a></li>
					<li><a href="#" class="text-sm text-black  dark:text-white">Careers</a></li>
					<li><a href="#" class="text-sm text-black  dark:text-white">Contact</a></li>
				</ul>
			</div> -->

			<!-- Legal -->
			<div>
				<h3 class="text-sm font-semibold text-black dark:text-white">Legal</h3>
				<ul class="mt-4 space-y-3">
					<li>
						<a href="/privacy-policy" class="text-sm text-black  dark:text-white"
							>Privacy</a
						>
					</li>
					<li>
						<a href="/terms" class="text-sm text-black  dark:text-white">Terms</a>
					</li>
					<li>
						<a href="/acceptable-use" class="text-sm text-black  dark:text-white"
							>Acceptable use</a
						>
					</li>
				</ul>
			</div>
		</div>

		<!-- <div class="mt-12 border-t border-{$color}-200 pt-8">
			<p class="text-center text-sm text-black">
				© {currentYear} Littlestats. All rights reserved.
			</p>
		</div> -->
	</div>
</footer>

<style>
</style>
