<script>
	import Seo from '../../../lib/components/generals/seo.svelte';
	import Header from '../header.svelte';
	import { color } from '$lib/colors/mixer.js';
</script>

<svelte:head>
	<Seo
		title="Acceptable Use Policy"
		description="You may use littlestats for: Page view analytics, Traffic source analysis, Browser statistics, Country-level location data"
	/>
</svelte:head>

<section class="mb-24">
	<Header>Acceptable Use</Header>
	<div class="prose prose-stone dark:prose-invert max-w-none">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-12">
			<div class="md:col-span-1">
				<h2 class="text-sm font-bold uppercase tracking-widest text-{$color}-600 dark:text-{$color}-500 mt-0">Introduction</h2>
				<p class="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
					To maintain the integrity of our service and ensure a positive experience for all users, we've established these usage guidelines.
				</p>
			</div>
			
			<div class="md:col-span-2 space-y-16">
				<section>
					<h2 class="text-2xl font-bold text-black dark:text-white mt-0 mb-6 flex items-center">
						<span class="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 text-sm font-bold text-stone-500">1</span>
						Permitted Use
					</h2>
					<p class="text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
						You are encouraged to use Littlestats for:
					</p>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div class="flex items-center p-4 rounded-xl bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
							<div class="mr-3 h-2 w-2 rounded-full bg-green-500"></div>
							<span class="text-sm font-medium text-stone-700 dark:text-stone-300">Page view analytics</span>
						</div>
						<div class="flex items-center p-4 rounded-xl bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
							<div class="mr-3 h-2 w-2 rounded-full bg-green-500"></div>
							<span class="text-sm font-medium text-stone-700 dark:text-stone-300">Traffic source analysis</span>
						</div>
						<div class="flex items-center p-4 rounded-xl bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
							<div class="mr-3 h-2 w-2 rounded-full bg-green-500"></div>
							<span class="text-sm font-medium text-stone-700 dark:text-stone-300">Browser statistics</span>
						</div>
						<div class="flex items-center p-4 rounded-xl bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
							<div class="mr-3 h-2 w-2 rounded-full bg-green-500"></div>
							<span class="text-sm font-medium text-stone-700 dark:text-stone-300">Geographic distribution</span>
						</div>
					</div>
				</section>

				<section>
					<h2 class="text-2xl font-bold text-black dark:text-white mt-0 mb-6 flex items-center">
						<span class="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 text-sm font-bold text-red-600">2</span>
						Prohibited Use
					</h2>
					<p class="text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
						To protect our users and the community, we strictly prohibit:
					</p>
					<ul class="space-y-4 list-none p-0">
						<li class="flex items-start p-4 rounded-xl bg-red-50/30 dark:bg-red-900/5 border border-red-100/50 dark:border-red-900/10">
							<div class="mt-1.5 mr-3 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0"></div>
							<span class="text-sm text-stone-600 dark:text-stone-400">Websites featuring <strong>Gambling, Pornographic</strong>, or illegal content.</span>
						</li>
						<li class="flex items-start p-4 rounded-xl bg-red-50/30 dark:bg-red-900/5 border border-red-100/50 dark:border-red-900/10">
							<div class="mt-1.5 mr-3 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0"></div>
							<span class="text-sm text-stone-600 dark:text-stone-400">Attempting to <strong>de-anonymize</strong> or identify individual users.</span>
						</li>
						<li class="flex items-start p-4 rounded-xl bg-red-50/30 dark:bg-red-900/5 border border-red-100/50 dark:border-red-900/10">
							<div class="mt-1.5 mr-3 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0"></div>
							<span class="text-sm text-stone-600 dark:text-stone-400">Modifying our script to collect <strong>Personally Identifiable Information (PII)</strong>.</span>
						</li>
					</ul>
				</section>

				<section>
					<h2 class="text-2xl font-bold text-black dark:text-white mt-0 mb-6 flex items-center">
						<span class="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 text-sm font-bold text-stone-500">3</span>
						Implementation
					</h2>
					<div class="space-y-4 text-stone-600 dark:text-stone-400 text-sm">
						<p>All implementations must be served over <strong>HTTPS</strong>. You agree to respect our rate limits and use the script as provided without unauthorized modifications.</p>
					</div>
				</section>

				<section class="p-8 rounded-3xl bg-stone-900 dark:bg-white text-white dark:text-black">
					<h2 class="text-xl font-bold mt-0 mb-4">Questions?</h2>
					<p class="text-stone-400 dark:text-stone-500 mb-6 text-sm">
						If you're unsure about your use case, we're here to help.
					</p>
					<a href="mailto:abdulmuminyqn@gmail.com" class="inline-flex items-center font-bold text-{$color}-400 dark:text-{$color}-600 hover:opacity-80 transition-opacity">
						Contact Support
						<svg class="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
					</a>
				</section>
			</div>
		</div>
	</div>
</section>
