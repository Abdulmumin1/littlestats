<script>
	import { color } from '$lib/colors/mixer.js';
	import { ArrowDown, ArrowUp } from 'lucide-svelte';
	import { formatNumber } from '$lib/slug/helpers.js';
	import { slide } from 'svelte/transition';
	/**
	 * @typedef {Object} Props
	 * @property {string} [name]
	 * @property {string} [number]
	 * @property {string} [type]
	 * @property {any} [icon]
	 * @property {string} [hint]
	 */

	/** @type {Props} */
	let {
		name = 'view',
		number = '4.5k',
		percentage = 0,
		type = 'normal',
		icon: Icon = undefined,
		hint = ''
	} = $props();

	function formatDuration(value) {
		const seconds = Math.max(0, Number(value) || 0);
		if (seconds >= 3600) return `${Math.floor(seconds / 3600)}h`;
		if (seconds >= 60) return `${Math.floor(seconds / 60)}m`;
		return `${Math.floor(seconds)}s`;
	}

	let change = $derived(Number(percentage) || 0);
	let increase = $derived(change >= 0 ? 'up' : 'down');
	let favorable = $derived(type === 'percent' ? change <= 0 : change >= 0);
</script>

<div
	title={hint}
	class="views bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-4 transition-all duration-300 hover:border-stone-200 dark:hover:border-stone-700 rounded-none shadow-none"
>
	<div class="mb-1 flex items-center justify-between gap-2 text-stone-400">
		<p class="text-[10px] font-black uppercase tracking-[0.2em]">{name}</p>
		{#if Icon}<Icon size={14} stroke-width={1.8} aria-hidden="true" />{/if}
	</div>
	<p class="text-xl font-bold dark:text-white tabular-nums leading-tight mb-2">
		{type == 'time'
			? formatDuration(number)
			: type == 'percent'
				? `${isNaN(number) ? 0 : number}%`
				: formatNumber(number)}
	</p>
	<p
		transition:slide={{ duration: 100 }}
		title="{change}% compared with the previous period"
		class="flex items-center gap-1 text-[10px] font-bold {favorable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}"
	>
		{#if increase === 'up'}<ArrowUp size={10} stroke-width={3} />{:else}<ArrowDown size={10} stroke-width={3} />{/if}
		{Math.abs(Math.trunc(change))}%
	</p>
</div>
