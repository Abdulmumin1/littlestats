<script>
	import { color } from '$lib/colors/mixer.js';
	import { Database } from 'lucide-svelte';
	import Seo from '$lib/components/generals/seo.svelte';
</script>

<svelte:head>
	<Seo title="Captured Data - Documentation - Littlestats" />
</svelte:head>

<h1 class="text-3xl font-extrabold mb-6 mt-0 flex items-center gap-3">
	<Database class="h-8 w-8 text-{$color}-500" />
	Captured Data
</h1>

<p>We only collect data that matters for your business while respecting visitor privacy.</p>

<div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8 not-prose">
	{#each ['URL Path', 'Referrer Host', 'Browser/OS', 'Country/City', 'Device Type', 'Campaign UTMs', 'Session Duration', 'Custom Props', 'Timestamp'] as dataPoint}
		<div class="px-4 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2">
			<div class="w-1 h-1 rounded-full bg-{$color}-500"></div>
			{dataPoint}
		</div>
	{/each}
</div>
