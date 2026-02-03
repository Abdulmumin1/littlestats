<script>
	import { color } from '$lib/colors/mixer.js';
	import { Megaphone } from 'lucide-svelte';
	import Seo from '$lib/components/generals/seo.svelte';
</script>

<svelte:head>
	<Seo title="Campaigns - Documentation - Littlestats" />
</svelte:head>

<h1 class="text-3xl font-extrabold mb-6 mt-0 flex items-center gap-3">
	<Megaphone class="h-8 w-8 text-{$color}-500" />
	Campaigns
</h1>

<p>
	Track the effectiveness of your marketing efforts. Littlestats automatically detects UTM parameters and groups them into campaigns.
</p>

<div class="grid grid-cols-1 gap-6 mt-8 not-prose">
	<div class="p-6 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
		<h4 class="text-sm font-bold mb-2">How campaigns are built</h4>
		<p class="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
			When a visitor lands on your site, we read <code class="text-xs">utm_source</code>, <code class="text-xs">utm_medium</code>, and <code class="text-xs">utm_campaign</code> from the URL.
			Stored as: <span class="font-mono text-{$color}-600 dark:text-{$color}-400">source|medium|campaign</span>.
		</p>
	</div>
	
	<div class="p-6 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
		<h4 class="text-sm font-bold mb-2">Handling "unknown"</h4>
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
