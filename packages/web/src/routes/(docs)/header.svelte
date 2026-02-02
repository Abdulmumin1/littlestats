<script>
	import { color } from '$lib/colors/mixer.js';
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { children } = $props();
</script>

<div class="py-12 border-b border-black/5 dark:border-white/5 mb-12">
	<div class="flex items-center space-x-2 mb-4">
		<div class="h-1 w-8 bg-{$color}-600 rounded-full"></div>
		<span class="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Legal</span>
	</div>
	<h1 class="text-4xl md:text-5xl font-black text-black dark:text-white tracking-tight mb-4">
		{@render children()}
	</h1>
	<p class="text-sm text-stone-500 dark:text-stone-400 font-medium">
		Last updated: February 2, 2026
	</p>
</div>

<style>
</style>
