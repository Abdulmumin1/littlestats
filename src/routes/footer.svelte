<script lang="ts">
	import { Calendar, Github, Twitter, Mail } from 'lucide-svelte';
	import { color } from '$lib/colors/mixer.js';

	const currentYear = new Date().getFullYear();
</script>

<footer class="bg-{$color}-100 dark:bg-{$color}-100">
	<!-- <div class="wavy-line bg-{$color}-600"></div> -->

	<div
		id="box"
		class="bg-{$color}-50 dark:bg-stone-900"
		style="--mask: radial-gradient(14.14px at 50% calc(100% - 20px),#000 99%,#0000 101%) calc(50% - 20px) 0/40px 100%,
radial-gradient(14.14px at 50% calc(100% + 10px),#0000 99%,#000 101%) 50% calc(100% - 10px)/40px 100% repeat-x;"
	></div>
	<div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 gap-8 md:grid-cols-4">
			<!-- Company Info -->
			<div class="space-y-4">
				<h3 class="text-lg font-bold text-black dark:text-black">Littlestats</h3>
				<p class="text-sm text-black dark:text-black">
					Your analytics needs without the premium price tag
				</p>
				<div class="flex space-x-4">
					<a
						href="https://twitter.com/abdulmuminyqn"
						target="_blank"
						class="text-black hover:text-black dark:text-black"
					>
						<Twitter size={20} />
					</a>

					<a
						href="mailto:abdulmuminyqn@gmail.com"
						title="abdulmuminyqn@gmail.com"
						class="text-black hover:text-black dark:text-black"
					>
						<Mail size={20} />
					</a>
				</div>
			</div>

			<!-- Product -->
			<div>
				<h3 class="text-sm font-semibold text-black dark:text-black">Product</h3>
				<ul class="mt-4 space-y-3">
					<li>
						<a href="/#features" class="text-sm text-black hover:text-black dark:text-black"
							>Features</a
						>
					</li>
					<li>
						<a href="/#pricing" class="text-sm text-black hover:text-black dark:text-black"
							>Pricing</a
						>
					</li>

					<!-- <li><a href="#" class="text-sm text-black hover:text-black dark:text-black">API</a></li> -->
				</ul>
			</div>

			<!-- Company -->
			<!-- <div>
				<h3 class="text-sm font-semibold text-black dark:text-black">Company</h3>
				<ul class="mt-4 space-y-3">
					<li><a href="#" class="text-sm text-black hover:text-black dark:text-black">About</a></li>
					<li><a href="#" class="text-sm text-black hover:text-black dark:text-black">Blog</a></li>
					<li><a href="#" class="text-sm text-black hover:text-black dark:text-black">Careers</a></li>
					<li><a href="#" class="text-sm text-black hover:text-black dark:text-black">Contact</a></li>
				</ul>
			</div> -->

			<!-- Legal -->
			<div>
				<h3 class="text-sm font-semibold text-black dark:text-black">Legal</h3>
				<ul class="mt-4 space-y-3">
					<li>
						<a href="/privacy-policy" class="text-sm text-black hover:text-black dark:text-black"
							>Privacy</a
						>
					</li>
					<li>
						<a href="/terms" class="text-sm text-black hover:text-black dark:text-black">Terms</a>
					</li>
					<li>
						<a href="/acceptable-use" class="text-sm text-black hover:text-black dark:text-black"
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
	#box {
		height: 40px;
		mask: var(--mask);
	}
</style>
