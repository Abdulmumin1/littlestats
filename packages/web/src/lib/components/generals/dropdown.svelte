<script>
	import { ChevronDown } from 'lucide-svelte';
	import { color } from '$lib/colors/mixer.js';
	import { createEventDispatcher, onMount } from 'svelte';

	let isOpen = $state(false);

	const dispatch = createEventDispatcher();
	/**
	 * @typedef {Object} Props
	 * @property {number} [value] - export let color = 'blue'; // can be passed as prop to match your theme
	 * @property {string} [title]
	 * @property {any} [options]
	 * @property {import('svelte').Snippet} [btn]
	 */

	/** @type {Props} */
	let { value = $bindable(0), title = '', options = [], btn } = $props();

	function handleSelect(newValue) {
		if (value == newValue) {
			isOpen = false;
			return;
		}
		value = newValue;
		isOpen = false;
		dispatch('change', { value: newValue });
	}

	// Close dropdown when clicking outside
	function handleClickOutside(event) {
		if (!event.target.closest('.select-container')) {
			isOpen = false;
		}
	}
</script>

<svelte:window onclick={handleClickOutside} />

<div class="flex items-center gap-2">
	<label for="custom-select" class="font-medium">{title}</label>
	<div class="select-container relative">
		<button
			id="custom-select"
			onclick={() => (isOpen = !isOpen)}
			class="flex w-full min-w-[12rem] items-center justify-between px-4 py-2 text-stone-900 dark:text-white bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-none font-bold hover:border-stone-300 dark:hover:border-stone-700 transition-all shadow-none"
			type="button"
			aria-haspopup="listbox"
			aria-expanded={isOpen}
		>
			<span class="truncate">{options.find((opt) => String(opt.value) === String(value))?.label || 'Select Site'}</span>
			<ChevronDown class="h-4 w-4 text-stone-400 transition-transform duration-200 {isOpen ? 'rotate-180' : ''}" />
		</button>

		{#if isOpen}
			<div
				class="absolute z-50 mt-1 w-full rounded-none border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900 shadow-2xl"
				role="listbox"
			>
				<ul class="py-1">
					{#each options as option}
						<li
							role="option"
							aria-selected={String(value) === String(option.value)}
							onclick={() => handleSelect(option.value)}
							onkeydown={(e) => e.key === 'Enter' && handleSelect(option.value)}
							tabindex="0"
							class="cursor-pointer px-4 py-2 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors
                  {String(value) === String(option.value)
								? `bg-${$color}-600 text-white`
								: 'text-stone-700 dark:text-stone-200'}"
						>
							{option.label}
						</li>
					{/each}
					<li role="option" class="px-4 py-2 border-t border-stone-100 dark:border-stone-800">{@render btn?.()}</li>
				</ul>
			</div>
		{/if}
	</div>
</div>
