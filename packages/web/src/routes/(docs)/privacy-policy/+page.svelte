<script>
	import Seo from '../../../lib/components/generals/seo.svelte';
	import Header from '../header.svelte';
	import { color } from '$lib/colors/mixer.js';
</script>

<svelte:head>
	<Seo
		title="Privacy Policy"
		description="Core Privacy Principles: No personal data collection, No user tracking, No data sharing, 6 months data retention only"
	/>
</svelte:head>

<section class="mb-24">
	<Header>Privacy Policy</Header>
	<div class="prose prose-stone dark:prose-invert max-w-none">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-12">
			<div class="md:col-span-1">
				<h2 class="text-sm font-bold uppercase tracking-widest text-{$color}-600 dark:text-{$color}-500 mt-0">Introduction</h2>
				<p class="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
					At Littlestats, we believe privacy is a fundamental right. Our service is designed to give you insights without compromising your users' anonymity.
				</p>
			</div>
			
			<div class="md:col-span-2 space-y-16">
				<section>
					<h2 class="text-2xl font-bold text-black dark:text-white mt-0 mb-6 flex items-center">
						<span class="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 text-sm font-bold text-stone-500">1</span>
						Core Privacy Principles
					</h2>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
						<div class="p-6 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-700/50">
							<h3 class="text-sm font-bold text-black dark:text-white mb-2">No Personal Data</h3>
							<p class="text-sm text-stone-600 dark:text-stone-400 m-0">We never collect names, emails, or IP addresses of your visitors.</p>
						</div>
						<div class="p-6 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-700/50">
							<h3 class="text-sm font-bold text-black dark:text-white mb-2">No Tracking</h3>
							<p class="text-sm text-stone-600 dark:text-stone-400 m-0">No unique identifiers, cookies, or cross-site fingerprinting.</p>
						</div>
						<div class="p-6 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-700/50">
							<h3 class="text-sm font-bold text-black dark:text-white mb-2">No Data Sharing</h3>
							<p class="text-sm text-stone-600 dark:text-stone-400 m-0">Your data belongs to you. We never sell or share it with third parties.</p>
						</div>
						<div class="p-6 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-700/50">
							<h3 class="text-sm font-bold text-black dark:text-white mb-2">Minimal Retention</h3>
							<p class="text-sm text-stone-600 dark:text-stone-400 m-0">Aggregated data is only kept for 6 months by default.</p>
						</div>
					</div>
				</section>

				<section>
					<h2 class="text-2xl font-bold text-black dark:text-white mt-0 mb-6 flex items-center">
						<span class="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 text-sm font-bold text-stone-500">2</span>
						Data Collection
					</h2>
					<p class="text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
						We only collect the absolute minimum required to provide meaningful analytics:
					</p>
					<ul class="space-y-4 list-none p-0">
						<li class="flex items-start">
							<div class="mt-1.5 mr-3 h-1.5 w-1.5 rounded-full bg-{$color}-600 shrink-0"></div>
							<div>
								<strong class="text-black dark:text-white block">Page URLs</strong>
								<span class="text-sm text-stone-500 dark:text-stone-400">We store paths only (e.g., /blog/hello-world). Query parameters are stripped.</span>
							</div>
						</li>
						<li class="flex items-start">
							<div class="mt-1.5 mr-3 h-1.5 w-1.5 rounded-full bg-{$color}-600 shrink-0"></div>
							<div>
								<strong class="text-black dark:text-white block">Referrer Domains</strong>
								<span class="text-sm text-stone-500 dark:text-stone-400">We only record the domain you came from, not the full URL.</span>
							</div>
						</li>
						<li class="flex items-start">
							<div class="mt-1.5 mr-3 h-1.5 w-1.5 rounded-full bg-{$color}-600 shrink-0"></div>
							<div>
								<strong class="text-black dark:text-white block">Technical Metadata</strong>
								<span class="text-sm text-stone-500 dark:text-stone-400">Browser type and approximate location (country) derived from timezone or IP fallback.</span>
							</div>
						</li>
					</ul>
				</section>

				<section>
					<h2 class="text-2xl font-bold text-black dark:text-white mt-0 mb-6 flex items-center">
						<span class="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 text-sm font-bold text-stone-500">3</span>
						Data Processing & Security
					</h2>
					<div class="space-y-6 text-stone-600 dark:text-stone-400 leading-relaxed">
						<p>
							All data is <strong>aggregated immediately</strong> upon arrival. We do not store raw logs or individual hit records that could be used to reconstruct a visitor's journey.
						</p>
						<p>
							Your data is protected with <strong>TLS encryption</strong> in transit and <strong>AES-256 encryption</strong> at rest. We perform regular security audits and maintain automated deletion cycles to ensure no data is kept longer than necessary.
						</p>
					</div>
				</section>
			</div>
		</div>
	</div>
</section>
