<script>
	import { color } from '$lib/colors/mixer.js';
	import { ArrowDown, ArrowUp } from 'lucide-svelte';
	import { formatNumber } from '$lib/slug/helpers.js';
	import { slide } from 'svelte/transition';
	import { defaultRange as globalRange } from '$lib/globalstate.svelte.js';

	let increase = $state('up');
	/**
	 * @typedef {Object} Props
	 * @property {string} [name]
	 * @property {string} [number]
	 * @property {any} [backdateData]
	 * @property {string} [percentange]
	 * @property {boolean} [filter_on]
	 * @property {string} [type]
	 * @property {any} [icon]
	 * @property {string} [hint]
	 */

	/** @type {Props} */
	let {
		name = 'view',
		number = '4.5k',
		backdateData = number,
		percentange = $bindable('504%'),
		percentage = undefined,
		filter_on = false,
		type = 'normal',
		icon: Icon = undefined,
		hint = ''
	} = $props();

	function formatDuration(seconds) {
		// Calculate hours, minutes, and remaining seconds
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;

		// Build the formatted string
		let formattedDuration = '';

		// Append hours if greater than 0
		if (hours > 0) {
			formattedDuration += `${hours}h `;
		}

		// If there are no hours, append minutes if greater than 0
		if (formattedDuration === '' && minutes > 0) {
			formattedDuration += `${minutes}m `;
		}

		// Append seconds if minutes are not present or if they are zero
		if (formattedDuration === '' || minutes === 0) {
			formattedDuration += `${secs}s`;
		}

		return formattedDuration.trim(); // Remove any trailing whitespace
	}

	// Percentage increase = [ (Final value - Starting value) / |Starting value| ] * 100.
	// $: console.log(backdateData == Nan)
	$effect(() => {
		if (percentage != null && !isNaN(Number(percentage))) {
			percentange = Number(percentage);
			return;
		}
		percentange =
			number === 0 || isNaN(((number - backdateData) / number) * 100)
				? 0
				: ((number - backdateData) / number) * 100;
	});
	$effect(() => {
		if (percentange < 0) {
			increase = 'down';
		} else {
			increase = 'up';
			if (type == 'percent') {
				increase = 'down';
			}
		}
	});
</script>

<div
	title={hint}
	class="views bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-4 transition-all duration-300 hover:border-stone-200 dark:hover:border-stone-700 rounded-none shadow-none"
	class:active={filter_on}
>
	<div class="mb-1 flex items-center justify-between gap-2 text-stone-400">
		<p class="text-[10px] font-black uppercase tracking-[0.2em]">{name}</p>
		{#if Icon}<Icon size={14} stroke-width={1.8} aria-hidden="true" />{/if}
	</div>
	<p class="text-xl font-bold dark:text-white tabular-nums leading-tight mb-2">
		{type == 'time'
			? formatDuration(parseInt(isNaN(number) ? 0 : number))
			: type == 'percent'
				? `${isNaN(number) ? 0 : number}%`
				: formatNumber(number)}
	</p>
	{#if !filter_on}
		<p
			transition:slide={{ duration: 100 }}
			title="{percentange}% compare to last {globalRange.getRange()} days"
			class="flex items-center gap-1 text-[10px] font-bold {type != 'percent'
				? increase == 'up'
					? `text-emerald-600 dark:text-emerald-400`
					: `text-red-600 dark:text-red-400`
				: increase == 'down'
					? `text-emerald-600 dark:text-emerald-400`
					: `text-red-600 dark:text-red-400`}"
		>
			{#if increase == 'up'}
				<ArrowUp size={10} stroke-width={3} />
			{:else}
				<ArrowDown size={10} stroke-width={3} />
			{/if}
			{parseInt(percentange) < 0
				? `${parseInt(isNaN(percentange) ? 0 : percentange) * -1}%`
				: `${parseInt(isNaN(percentange) ? 0 : percentange)}%`}
		</p>
	{/if}
</div>

<style>
	.views.active {
		border-width: 2px;
		border-color: var(--accent-color);
	}
</style>
