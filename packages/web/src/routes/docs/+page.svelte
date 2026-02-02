<script>
	import { color } from '$lib/colors/mixer.js';
	import Nav from '$lib/components/generals/insideNav.svelte';
	import Seo from '../../lib/components/generals/seo.svelte';
	import { 
		BookOpen, 
		Download, 
		BarChart3, 
		Megaphone, 
		Target, 
		Code2, 
		Database, 
		ChevronRight,
		Copy,
		Check
	} from 'lucide-svelte';


	let copied = false;
	const installationCode = `<script 
  defer 
  data-site="SITE_ID" 
  src="https://stats.littlestats.click/tracker.js"
> ` + "</" + "script> ";

	async function copyToClipboard(text) {
		await navigator.clipboard.writeText(text);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	const sections = [
		{ name: 'Overview', id: 'overview', icon: BookOpen },
		{ name: 'Installation', id: 'installation', icon: Download },
		{ name: 'Metrics & Charts', id: 'metrics', icon: BarChart3 },
		{ name: 'Campaigns', id: 'campaigns', icon: Megaphone },
		{ name: 'Goals & Events', id: 'goals', icon: Target },
		{ name: 'Tracker API', id: 'api', icon: Code2 },
		{ name: 'Captured Data', id: 'data', icon: Database }
	];
</script>

<svelte:head>
	<Seo title="Documentation - Littlestats" />
</svelte:head>

<div class="min-h-screen bg-white dark:bg-stone-950 text-black dark:text-white">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<header class="py-6 border-b border-stone-100 dark:border-stone-900 mb-8">
			<Nav />
		</header>

		<div class="flex flex-col lg:flex-row gap-12 pb-20">
			<!-- Sidebar -->
			<aside class="lg:w-64 flex-shrink-0">
				<nav class="sticky top-8 space-y-1">
					<p class="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-4 px-3">Documentation</p>
					{#each sections as section}
						<a
							href="#{section.id}"
							class="group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-stone-50 dark:hover:bg-stone-900 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
						>
							<svelte:component this={section.icon} class="mr-3 h-4 w-4" />
							{section.name}
						</a>
					{/each}
				</nav>
			</aside>

			<!-- Main Content -->
			<main class="flex-1 max-w-3xl">
				<div class="prose prose-stone dark:prose-invert prose-headings:tracking-tight prose-a:text-{$color}-600 dark:prose-a:text-{$color}-400 max-w-none">
					<section id="overview" class="scroll-mt-20 mb-20">
						<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-{$color}-50 dark:bg-{$color}-900/20 text-{$color}-600 dark:text-{$color}-400 text-xs font-semibold mb-6">
							<span class="relative flex h-2 w-2">
								<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-{$color}-400 opacity-75"></span>
								<span class="relative inline-flex rounded-full h-2 w-2 bg-{$color}-500"></span>
							</span>
							Getting Started
						</div>
						<h1 class="text-4xl font-extrabold mb-6">Analytics for SaaS</h1>
						<p class="text-xl text-stone-600 dark:text-stone-400 leading-relaxed">
							Littlestats provides privacy-focused, real-time analytics. Our lightweight tracker is designed to be easy to install and powerful enough to track complex user journeys without compromising performance.
						</p>
						
						<!-- <div class="my-10 overflow-hidden rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900">
							<video controls class="w-full grayscale hover:grayscale-0 transition-all duration-700 aspect-video object-cover">
								<source src="/docs.webm" />
								<track kind="captions" />
							</video>
						</div> -->
					</section>

					<section id="installation" class="scroll-mt-20 mb-20">
						<h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
							<Download class="h-8 w-8 text-{$color}-500" />
							Installation
						</h2>
						<p>
							Copy and paste the following snippet into the <code class="text-{$color}-600 dark:text-{$color}-400">{'<head>'}</code> of your website. Replace <code class="italic">SITE_ID</code> with your actual site identifier found in settings.
						</p>
						
						<div class="relative group mt-6">
							<div class="absolute right-4 top-4 flex items-center gap-2">
								<span class="text-[10px] font-bold uppercase tracking-widest text-stone-500">HTML</span>
								<button 
									on:click={() => copyToClipboard(installationCode)}
									class="p-1.5 rounded-md hover:bg-stone-800 text-stone-400 transition-colors"
									title="Copy code"
								>
									{#if copied}
										<Check class="h-4 w-4 text-green-500" />
									{:else}
										<Copy class="h-4 w-4" />
									{/if}
								</button>
							</div>
							<pre class="bg-stone-950 p-6 rounded-xl border border-stone-800 overflow-x-auto"><code class="text-{$color}-400 text-sm font-mono leading-6">{installationCode}</code></pre>
						</div>
						
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 not-prose">
							<div class="p-6 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-100 dark:border-stone-800">
								<div class="w-8 h-8 rounded-lg bg-{$color}-100 dark:bg-{$color}-900/30 text-{$color}-600 dark:text-{$color}-400 flex items-center justify-center mb-4">
									<Check class="h-5 w-5" />
								</div>
								<h4 class="text-sm font-bold text-stone-900 dark:text-white mb-2">Auto-Tracking</h4>
								<p class="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">Automatically captures page views, referrers, and session duration without any extra code.</p>
							</div>
							<div class="p-6 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-100 dark:border-stone-800">
								<div class="w-8 h-8 rounded-lg bg-{$color}-100 dark:bg-{$color}-900/30 text-{$color}-600 dark:text-{$color}-400 flex items-center justify-center mb-4">
									<Check class="h-5 w-5" />
								</div>
								<h4 class="text-sm font-bold text-stone-900 dark:text-white mb-2">SPA Support</h4>
								<p class="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">Fully compatible with SvelteKit, Next.js, and other SPAs using the History API.</p>
							</div>
						</div>
					</section>

					<section id="metrics" class="scroll-mt-20 mb-20">
						<h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
							<BarChart3 class="h-8 w-8 text-{$color}-500" />
							Metrics & Charts
						</h2>
						<p>
							Littlestats focuses on a small set of metrics that are easy to interpret. 
							Charts always reflect your selected date range and are designed to stay readable even when there are gaps in data.
						</p>
						<div class="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-8 mt-8">
							<ul class="space-y-6 list-none pl-0">
								<li class="flex gap-4">
									<div class="mt-1 flex-shrink-0 h-2 w-2 rounded-full bg-{$color}-500"></div>
									<div>
										<h4 class="text-base font-bold text-stone-900 dark:text-white m-0">Date range behavior</h4>
										<p class="text-stone-600 dark:text-stone-400 text-sm mt-1">
											When you change the date range selector, charts and tables refetch data for that window.
											Missing days/hours are filled with <code class="text-xs">0</code> so the x-axis stays continuous.
										</p>
									</div>
								</li>
								<li class="flex gap-4">
									<div class="mt-1 flex-shrink-0 h-2 w-2 rounded-full bg-{$color}-500"></div>
									<div>
										<h4 class="text-base font-bold text-stone-900 dark:text-white m-0">Bar / Line toggle</h4>
										<p class="text-stone-600 dark:text-stone-400 text-sm mt-1">
											Some charts can be viewed as a stacked bar chart or a line chart.
											Use this to see either totals per day (bar) or trends over time (line).
										</p>
									</div>
								</li>
								<li class="flex gap-4">
									<div class="mt-1 flex-shrink-0 h-2 w-2 rounded-full bg-{$color}-500"></div>
									<div>
										<h4 class="text-base font-bold text-stone-900 dark:text-white m-0">Segment colors</h4>
										<p class="text-stone-600 dark:text-stone-400 text-sm mt-1">
											Segmented charts use a high-contrast palette so you can clearly distinguish sources and groups.
										</p>
									</div>
								</li>
							</ul>
						</div>
					</section>

					<section id="campaigns" class="scroll-mt-20 mb-20">
						<h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
							<Megaphone class="h-8 w-8 text-{$color}-500" />
							Campaigns
						</h2>
						<p>
							Track the effectiveness of your marketing efforts. Littlestats automatically detects UTM parameters and groups them into campaigns.
						</p>
						
						<div class="grid grid-cols-1 gap-6 mt-8">
							<div class="p-6 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
								<h4 class="text-base font-bold mb-2">How campaigns are built</h4>
								<p class="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
									When a visitor lands on your site, we read <code class="text-xs">utm_source</code>, <code class="text-xs">utm_medium</code>, and <code class="text-xs">utm_campaign</code> from the URL.
									Stored as: <span class="font-mono text-{$color}-600 dark:text-{$color}-400">source|medium|campaign</span>.
								</p>
							</div>
							
							<div class="p-6 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
								<h4 class="text-base font-bold mb-2">Handling "unknown"</h4>
								<p class="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
									If a link is missing a parameter, it becomes <code class="text-xs">unknown</code>.
									This helps highlight broken or partially-tagged links. Example: <span class="font-mono text-{$color}-600 dark:text-{$color}-400">twitter|unknown|unknown</span>.
								</p>
							</div>
						</div>

						<div class="mt-10 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden not-prose">
							<div class="px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50">
								<h4 class="text-sm font-bold">Exclusion Rules</h4>
							</div>
							<div class="p-6 space-y-3">
								<div class="flex items-center gap-3 text-sm text-stone-600 dark:text-stone-400">
									<div class="h-1.5 w-1.5 rounded-full bg-stone-400"></div>
									<span><strong class="text-stone-900 dark:text-white">Direct</strong> traffic (no campaign bucket)</span>
								</div>
								<div class="flex items-center gap-3 text-sm text-stone-600 dark:text-stone-400">
									<div class="h-1.5 w-1.5 rounded-full bg-stone-400"></div>
									<span><strong class="text-stone-900 dark:text-white">Localhost</strong> / 127.0.0.1 buckets</span>
								</div>
							</div>
						</div>
					</section>

					<section id="goals" class="scroll-mt-20 mb-20">
						<h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
							<Target class="h-8 w-8 text-{$color}-500" />
							Goals & Custom Events
						</h2>
						<p>
							Go beyond page views. Track conversions like signups, button clicks, or revenue events with a single line of code.
						</p>

						<div class="relative group my-8">
							<div class="absolute right-4 top-4 flex items-center gap-2">
								<span class="text-[10px] font-bold uppercase tracking-widest text-stone-500">JavaScript</span>
							</div>
							<pre class="bg-stone-950 p-6 rounded-xl border border-stone-800 overflow-x-auto"><code class="text-green-400 text-sm font-mono leading-6">{`// Simple event
track('form_submitted');

// Event with data (revenue, metadata)
track('purchase', {
  value: 49.00,
  currency: 'USD',
  plan: 'pro_monthly'
});`}</code></pre>
						</div>

						<div class="bg-{$color}-50 dark:bg-{$color}-900/10 border border-{$color}-100 dark:border-{$color}-900/30 rounded-xl p-6">
							<p class="text-sm text-{$color}-700 dark:text-{$color}-300 m-0">
								<strong>Pro Tip:</strong> Events appear in real-time in your dashboard under the "Events" tab. No need to wait for batch processing.
							</p>
						</div>
					</section>

					<section id="api" class="scroll-mt-20 mb-20">
						<h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
							<Code2 class="h-8 w-8 text-{$color}-500" />
							Tracker API
						</h2>
						
						<div class="not-prose space-y-4">
							<div class="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl">
								<div class="flex flex-wrap items-center gap-2 mb-3">
									<code class="text-xs font-bold text-{$color}-600 dark:text-{$color}-400 bg-{$color}-50 dark:bg-{$color}-900/30 px-2 py-1 rounded">track(name, props?)</code>
								</div>
								<p class="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">The primary method for tracking actions. Props can be any flat JSON object.</p>
							</div>

							<div class="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl">
								<div class="flex flex-wrap items-center gap-2 mb-3">
									<code class="text-xs font-bold text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-stone-800 px-2 py-1 rounded">identify(userId)</code>
								</div>
								<p class="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">Associate subsequent events with a specific user ID. Essential for churn and retention analysis.</p>
							</div>

							
						</div>
					</section>

					<section id="data" class="scroll-mt-20">
						<h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
							<Database class="h-8 w-8 text-{$color}-500" />
							Captured Data
						</h2>
						<p>We only collect data that matters for your business while respecting visitor privacy.</p>
						
						<div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8 not-prose">
							{#each ['URL Path', 'Referrer Host', 'Browser/OS', 'Country/City', 'Device Type', 'Campaign UTMs', 'Session Duration', 'Custom Props', 'Timestamp'] as dataPoint}
								<div class="px-4 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2">
									<div class="w-1 h-1 rounded-full bg-{$color}-500"></div>
									{dataPoint}
								</div>
							{/each}
						</div>
					</section>
				</div>
			</main>
		</div>
	</div>
</div>

<style>
	:global(html) {
		scroll-behavior: smooth;
	}
</style>
