<script>
	import { fly } from 'svelte/transition';
	import { color } from './mixer.js';
	import { clickOutside } from '$lib/utils';
	import { Palette } from 'lucide-svelte';

	
	let pickerOpen = $state(false);

	function togglePicker() {
		console.log('click');
		pickerOpen = !pickerOpen;
	}

	const tailwindColors = [
		'stone',
		'red',
		'orange',
		'amber',
		'yellow',
		'lime',
		'green',
		'emerald',
		'teal',
		'cyan',
		'sky',
		'blue',
		'indigo',
		'violet',
		'purple',
		'fuchsia',
		'pink',
		'rose'
	];

	function selectColor(s) {
		color.set(s);
		localStorage.setItem('little_stat_color', s);
	}

	function closePicker() {
		pickerOpen = false;
	}
	/**
	 * @typedef {Object} Props
	 * @property {boolean} [hide]
	 */

	/** @type {Props} */
	let { hide = true,bottom = false } = $props();
</script>

<div class="relative">
	<button
		onclick={togglePicker}
		class="flex gap-1 border border-{$color}-600 bg-{$color}-50 items-center rounded-full dark:bg-stone-800 dark:text-white {hide
			? 'p-1'
			: ' px-2 py-1'}"
		>{#if !hide}
			Change Theme
		{/if}
		<Palette class="text-black dark:text-white" />

		<!-- <div class="h-5 w-5 bg-{$color}-500 rounded-full"></div> -->
	</button>

	{#if pickerOpen}
		<div
			use:clickOutside
			onclick_outside={closePicker}
			transition:fly={{ y: 10 }}
			class="glass-effect bg-{$color}-50 absolute z-50 border-{$color}-300 mt-1 grid w-[210px] grid-cols-6 gap-4 border bg-{$color}-100/50  translate-x-[-50%] rounded-xl p-4 {bottom?'bottom-12 left-[63%]':'left-[50%]'}"
		>
			{#each tailwindColors.reverse() as c}
				<button
					onclick={() => selectColor(c)}
					class="w-5 rounded-full hover:scale-125 bg-{c}-500 h-5"
				>
					<!-- <Palette /> -->
				</button>
				<!-- {c} -->
			{/each}
		</div>
	{/if}
</div>

<style>
	.glass-effect {
		background: #78787811;
		backdrop-filter: blur(8px); /* Adjust the blur value as needed */
		-webkit-backdrop-filter: blur(8px); /* For Safari support */
		border-radius: 10px; /* Optional: rounds the corners */
		border: 1px solid rgba(255, 255, 255, 0.18); /* Optional: adds a subtle border */
		/* box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37); Optional: adds depth */
	}
</style>
