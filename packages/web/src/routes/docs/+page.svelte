<script>
	import { color } from '$lib/colors/mixer.js';
	import Seo from '$lib/components/generals/seo.svelte';
	import { ChevronRight, Download, Server } from 'lucide-svelte';
</script>

<svelte:head>
	<Seo title="Documentation - Littlestats" />
</svelte:head>

<section id="overview" class="scroll-mt-20 mb-20">
	<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-{$color}-50 dark:bg-{$color}-900/20 text-{$color}-600 dark:text-{$color}-400 text-xs font-semibold mb-6">
		<span class="relative flex h-2 w-2">
			<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-{$color}-400 opacity-75"></span>
			<span class="relative inline-flex rounded-full h-2 w-2 bg-{$color}-500"></span>
		</span>
		Getting Started
	</div>
	<h1 class="text-3xl font-extrabold mb-6 mt-0">Littlestats</h1>
	<p class="text-lg text-stone-600 dark:text-stone-400 leading-relaxed">
		Data to make good business decisions.
	</p>
</section>

<section class="mb-20">
	<h2 class="text-xl font-bold mb-6">Why Littlestats?</h2>
	<div class="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose">
		<div class="space-y-3">
			<h4 class="font-bold">Privacy First</h4>
			<p class="text-stone-600 dark:text-stone-400 text-sm">No cookies, no cross-site tracking. GDPR and CCPA compliant by design.</p>
		</div>
		<div class="space-y-3">
			<h4 class="font-bold">Real-Time Everything</h4>
			<p class="text-stone-600 dark:text-stone-400 text-sm">See active visitors and events the moment they happen via WebSockets.</p>
		</div>
		<div class="space-y-3">
			<h4 class="font-bold">Edge Powered</h4>
			<p class="text-stone-600 dark:text-stone-400 text-sm">Built on Cloudflare Workers and Durable Objects for global scale and zero latency.</p>
		</div>
		<div class="space-y-3">
			<h4 class="font-bold">Developer Friendly</h4>
			<p class="text-stone-600 dark:text-stone-400 text-sm">Simple API, easy to self-host, and fully open-source.</p>
		</div>
	</div>
</section>

<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose">
	<a href="/docs/installation" class="group p-6 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl hover:border-{$color}-500 transition-all">
		<Download class="h-6 w-6 text-{$color}-500 mb-4" />
		<h3 class="font-bold mb-1">Installation</h3>
		<p class="text-sm text-stone-500 mb-4">Add the tracker to your site in minutes.</p>
		<div class="flex items-center text-xs font-bold text-{$color}-500 uppercase tracking-widest">
			Get Started <ChevronRight class="ml-1 h-3 w-3" />
		</div>
	</a>

	<a href="/docs/self-hosting" class="group p-6 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl hover:border-{$color}-500 transition-all">
		<Server class="h-6 w-6 text-{$color}-500 mb-4" />
		<h3 class="font-bold mb-1">Self-Hosting</h3>
		<p class="text-sm text-stone-500 mb-4">Deploy your own private analytics instance.</p>
		<div class="flex items-center text-xs font-bold text-{$color}-500 uppercase tracking-widest">
			Learn How <ChevronRight class="ml-1 h-3 w-3" />
		</div>
	</a>
</div>
