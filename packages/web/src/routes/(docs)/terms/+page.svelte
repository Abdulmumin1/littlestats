<script>
	import Seo from '../../../lib/components/generals/seo.svelte';
	import Header from '../header.svelte';
	import { color } from '$lib/colors/mixer.js';
</script>

<svelte:head>
	<Seo
		title="Terms of Service"
		description="littlestats is built on the principle of minimal data collection. We only collect the bare
					minimum analytics data required to provide meaningful insights. We do not track individual
					users, collect personal information, or store any data that could identify specific users."
	/>
</svelte:head>
<section class="mb-24">
	<Header>Terms of Service</Header>
	<div class="prose prose-stone dark:prose-invert max-w-none">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-12">
			<div class="md:col-span-1">
				<h2 class="text-sm font-bold uppercase tracking-widest text-{$color}-600 dark:text-{$color}-500 mt-0">Overview</h2>
				<p class="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
					These terms govern your use of Littlestats. By using our service, you agree to these terms. We keep things simple and privacy-first.
				</p>
			</div>
			
			<div class="md:col-span-2 space-y-16">
				<section>
					<h2 class="text-2xl font-bold text-black dark:text-white mt-0 mb-6 flex items-center">
						<span class="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 text-sm font-bold text-stone-500">1</span>
						Our Commitment
					</h2>
					<p class="text-stone-600 dark:text-stone-400 leading-relaxed">
						Littlestats is built on the principle of minimal data collection. We only collect the bare minimum analytics data required to provide meaningful insights. We do not track individual users, collect personal information, or store any data that could identify specific users.
					</p>
				</section>

				<section>
					<h2 class="text-2xl font-bold text-black dark:text-white mt-0 mb-6 flex items-center">
						<span class="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 text-sm font-bold text-stone-500">2</span>
						Service Description
					</h2>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
						<div class="p-6 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-700/50">
							<h3 class="text-sm font-bold text-black dark:text-white mb-2">API access</h3>
							<p class="text-sm text-stone-600 dark:text-stone-400 m-0">Simple, fast endpoints for your custom tracking needs.</p>
						</div>
						<div class="p-6 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-700/50">
							<h3 class="text-sm font-bold text-black dark:text-white mb-2">Minimal Snippet</h3>
							<p class="text-sm text-stone-600 dark:text-stone-400 m-0">A lightweight script that won't slow down your site.</p>
						</div>
					</div>
				</section>

				<section>
					<h2 class="text-2xl font-bold text-black dark:text-white mt-0 mb-6 flex items-center">
						<span class="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 text-sm font-bold text-stone-500">3</span>
						Data Usage & Limits
					</h2>
					<ul class="space-y-4 list-none p-0">
						<li class="flex items-start">
							<div class="mt-1.5 mr-3 h-1.5 w-1.5 rounded-full bg-{$color}-600 shrink-0"></div>
							<span class="text-stone-600 dark:text-stone-400">Data is only used for generating anonymous, aggregated analytics.</span>
						</li>
						<li class="flex items-start">
							<div class="mt-1.5 mr-3 h-1.5 w-1.5 rounded-full bg-{$color}-600 shrink-0"></div>
							<span class="text-stone-600 dark:text-stone-400">Aggregated data is automatically deleted after 6 months.</span>
						</li>
						<li class="flex items-start">
							<div class="mt-1.5 mr-3 h-1.5 w-1.5 rounded-full bg-{$color}-600 shrink-0"></div>
							<span class="text-stone-600 dark:text-stone-400">We aim for 99.9% uptime but provide data "as is" without warranty.</span>
						</li>
					</ul>
				</section>

				<section>
					<h2 class="text-2xl font-bold text-black dark:text-white mt-0 mb-6 flex items-center">
						<span class="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 text-sm font-bold text-stone-500">4</span>
						Developer Responsibilities
					</h2>
					<div class="space-y-4 text-stone-600 dark:text-stone-400 text-sm">
						<p>You are responsible for keeping your API keys secure and informing your users about the use of analytics in your own privacy policy.</p>
						<p>You agree not to modify our script to collect additional personal data or attempt to combine our data with other tracking systems.</p>
					</div>
				</section>
			</div>
		</div>
	</div>
</section>
