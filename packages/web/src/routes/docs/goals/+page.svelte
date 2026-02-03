<script>
	import { color } from '$lib/colors/mixer.js';
	import { Target } from 'lucide-svelte';
	import Seo from '$lib/components/generals/seo.svelte';
	import CodeBlock from '$lib/components/docs/CodeBlock.svelte';

	const simpleEventCode = `// Simple event
track('button click');`;

	const eventWithDataCode = `// Event with data (revenue, metadata)
track('subscription started', {
  value: 49.00,
  currency: 'USD',
  plan: 'Pro Monthly'
});`;
</script>

<svelte:head>
	<Seo title="Goals & Events - Documentation - Littlestats" />
</svelte:head>

<h1 class="text-3xl font-extrabold mb-6 mt-0 flex items-center gap-3">
	<Target class="h-8 w-8 text-{$color}-500" />
	Goals & Custom Events
</h1>

<p>
	Go beyond page views. Track conversions like signups, button clicks, or revenue events with a single line of code.
</p>

<h3 class="text-base font-bold mt-8 mb-2">Simple Events</h3>
<CodeBlock code={simpleEventCode} lang="javascript" />

<h3 class="text-base font-bold mt-8 mb-2">Events with Properties</h3>
<CodeBlock code={eventWithDataCode} lang="javascript" />

<div class="bg-{$color}-50 dark:bg-{$color}-900/10 border border-{$color}-100 dark:border-{$color}-900/30 rounded-xl p-6 mt-12 not-prose">
	<p class="text-sm text-{$color}-700 dark:text-{$color}-300 m-0 font-medium leading-relaxed">
		<strong>Pro Tip:</strong> Events appear in real-time in your dashboard under the "Events" tab. No need to wait for batch processing or hourly flushes.
	</p>
</div>
