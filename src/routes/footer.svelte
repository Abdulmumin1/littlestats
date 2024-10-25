<script lang="ts">
	import { Calendar, Github, Twitter, Mail } from 'lucide-svelte';
	import { color } from '$lib/colors/mixer.js';

	const currentYear = new Date().getFullYear();
</script>

<footer class=" bg-{$color}-50">
	<div
		id="box"
		class="bg-{$color}-100"
		style="--mask: radial-gradient(14.14px at 50% calc(100% - 20px),#000 99%,#0000 101%) calc(50% - 20px) 0/40px 100%,
radial-gradient(14.14px at 50% calc(100% + 10px),#0000 99%,#000 101%) 50% calc(100% - 10px)/40px 100% repeat-x;"
	></div>
	<div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 gap-8 md:grid-cols-4">
			<!-- Company Info -->
			<div class="space-y-4">
				<h3 class="text-lg font-bold text-{$color}-900">Littlestats</h3>
				<p class="text-sm text-{$color}-800">Your analytics needs without the premium price tag</p>
				<div class="flex space-x-4">
					<a
						href="https://twitter.com/abdulmuminyqn"
						target="_blank"
						class="text-{$color}-800 hover:text-{$color}-800"
					>
						<Twitter size={20} />
					</a>

					<button title="abdulmuminyqn@gmail.com" class="text-{$color}-800 hover:text-{$color}-800">
						<Mail size={20} />
					</button>
				</div>
			</div>

			<!-- Product -->
			<div>
				<h3 class="text-sm font-semibold text-{$color}-900">Product</h3>
				<ul class="mt-4 space-y-3">
					<li>
						<a href="#features" class="text-sm text-{$color}-800 hover:text-{$color}-900"
							>Features</a
						>
					</li>
					<li>
						<a href="#pricing" class="text-sm text-{$color}-800 hover:text-{$color}-900">Pricing</a>
					</li>

					<!-- <li><a href="#" class="text-sm text-{$color}-800 hover:text-{$color}-900">API</a></li> -->
				</ul>
			</div>

			<!-- Company -->
			<!-- <div>
				<h3 class="text-sm font-semibold text-{$color}-900">Company</h3>
				<ul class="mt-4 space-y-3">
					<li><a href="#" class="text-sm text-{$color}-800 hover:text-{$color}-900">About</a></li>
					<li><a href="#" class="text-sm text-{$color}-800 hover:text-{$color}-900">Blog</a></li>
					<li><a href="#" class="text-sm text-{$color}-800 hover:text-{$color}-900">Careers</a></li>
					<li><a href="#" class="text-sm text-{$color}-800 hover:text-{$color}-900">Contact</a></li>
				</ul>
			</div> -->

			<!-- Legal -->
			<div>
				<h3 class="text-sm font-semibold text-{$color}-900">Legal</h3>
				<ul class="mt-4 space-y-3">
					<li>
						<a href="/privacy-policy" class="text-sm text-{$color}-800 hover:text-{$color}-900"
							>Privacy</a
						>
					</li>
					<li>
						<a href="/terms" class="text-sm text-{$color}-800 hover:text-{$color}-900">Terms</a>
					</li>
					<li>
						<a href="/acceptable-use" class="text-sm text-{$color}-800 hover:text-{$color}-900"
							>Acceptable use</a
						>
					</li>
				</ul>
			</div>
		</div>

		<div class="mt-12 border-t border-{$color}-200 pt-8">
			<p class="text-center text-sm text-{$color}-800">
				© {currentYear} Littlestats. All rights reserved.
			</p>
		</div>
	</div>
</footer>

<style>
	#box {
		height: 40px;
		mask: var(--mask);
	}
</style>
