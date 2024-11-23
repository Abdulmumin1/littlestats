<script>
	import { color } from '$lib/colors/mixer.js';
	import { ArrowDown, ArrowUp } from 'lucide-svelte';
	import { formatNumber } from '$lib/slug/helpers.js';
	import { createEventDispatcher } from 'svelte';
	import { fly, slide } from 'svelte/transition';

	const dispatch = createEventDispatcher();

	export let name = 'view';
	export let number = '4.5k';
	export let backdateData = number;
	export let percentange = '504%';
	export let filter_on = false;
	let increase = 'up';
	export let type = 'normal';

	function sendFilter() {
		dispatch('chart_filter', {
			type,
			query: name
		});
	}

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
	$: percentange = (number === 0 || isNaN(((number - backdateData) / number) * 100)) ? 0 : ((number - backdateData) / number) * 100;
	$: {
		if (percentange < 0) {
			increase = 'down';
		} else {
			increase = 'up';
			if (type == 'percent'){
				increase = 'down'
			}
		}
	}
</script>

<div
	on:click={sendFilter}
	class="views cursor-pointer bg-{$color}-100 dark:bg-stone-800/50 px-6"
	class:red={increase == 'down'}
>
	<p class="text-gray-800 dark:text-white">{name}</p>
	<p class="text-2xl font-extrabold leading-10 dark:text-white">
		{type == 'time'
			? formatDuration(parseInt(isNaN(number) ? 0 : number))
			: type == 'percent'
				? `${isNaN(number) ? 0 : number}%`
				: formatNumber(number)}
	</p>
	{#if !filter_on}
		<p
			transition:slide={{ duration: 100 }}
			title="{percentange}% compare to last x days"
			class="m-0 flex w-fit items-center gap-1 rounded-md p-0 {type != 'percent'
				? increase == 'up'
					? `bg-${$color}-50 dark:bg-stone-900 text-green-700 dark:text-green-500`
					: `bg-${$color}-50 dark:bg-stone-900 text-red-700 dark:text-red-500`
				: increase == 'down'
					? `bg-${$color}-50 dark:bg-stone-900 text-green-700 dark:text-green-500`
					: `bg-${$color}-50 dark:bg-stone-900 text-red-700 dark:text-red-500`} px-1 font-bold"
		>
			{#if increase == 'up'}
				<ArrowUp size={14} />
			{:else}
				<ArrowDown size={14} />
			{/if}
			{parseInt(percentange) < 0
				? `${parseInt(isNaN(percentange) ? 0 : percentange) * -1}%`
				: `${parseInt(isNaN(percentange) ? 0 : percentange)}%`}
		</p>
	{/if}
</div>

<style>
	.views {
		/* background-color: #22c55e9c; */
		padding-top: 1rem;
		padding-bottom: 1rem;
		border-radius: 0.5rem;
	}
</style>
