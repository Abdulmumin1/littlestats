<script>
	import { color } from '$lib/colors/mixer.js';
	import { ArrowDown, ArrowUp } from 'lucide-svelte';

	export let name = 'view';
	export let number = '4.5k';
	export let backdateData = number;
	export let percentange = '504%';
	let increase = 'up';
	export let type = 'normal';

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
	$: percentange = ((number - backdateData) / number) * 100;
	$: {
		if (percentange < 0) {
			increase = 'down';
		} else {
			increase = 'up';
		}
	}
</script>

<div class="views bg-{$color}-200 px-6" class:red={increase == 'down'}>
	<p class="text-gray-800">{name}</p>
	<p class="text-2xl font-extrabold leading-10">
		{type == 'time' ? formatDuration(parseInt(number)) : type == 'percent' ? `${number}%` : number}
	</p>
	<p
		title="{percentange}% compare to last x days"
		class="m-0 flex w-fit items-center gap-1 rounded-md p-0 {increase == 'up'
			? `bg-${$color}-300 text-${$color}-800`
			: 'bg-ds-300 text-red-700'} px-1 font-bold"
	>
		{#if increase == 'up'}
			<ArrowUp size={14} />
		{:else}
			<ArrowDown size={14} />
		{/if}
		{parseInt(percentange) < 0 ? `${parseInt(percentange) * -1}%` : `${parseInt(percentange)}%`}
	</p>
</div>

<style>
	.views {
		/* background-color: #22c55e9c; */
		padding-top: 1rem;
		padding-bottom: 1rem;
		border-radius: 0.5rem;
	}
</style>
