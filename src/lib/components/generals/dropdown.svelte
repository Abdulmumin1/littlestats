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
			class="flex w-48 items-center justify-between px-4 py-1 text-gray-100 bg-{$color}-600 dark:bg-{$color}-700 border border-stone-800 rounded-2xl font-bold"
			type="button"
			aria-haspopup="listbox"
			aria-expanded={isOpen}
		>
			<span>{options.find((opt) => opt.value === value)?.label}</span>
			<ChevronDown class="h-4 w-4 transition-transform duration-200 {isOpen ? 'rotate-180' : ''}" />
		</button>

		{#if isOpen}
			<div
				class="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg"
				role="listbox"
			>
				<ul class="py-1">
					{#each options as option}
						<li
							role="option"
							aria-selected={value === option.value}
							onclick={() => handleSelect(option.value)}
							onkeydown={(e) => e.key === 'Enter' && handleSelect(option.value)}
							tabindex="0"
							class="cursor-pointer px-4 py-2 hover:bg-gray-100
                  {value === option.value
								? 'bg-' + $color + '-50 text-' + $color + '-600'
								: 'text-gray-700'}"
						>
							{option.label}
						</li>
					{/each}
					<li role="option" class=" px-4 py-2 dark:text-black">{@render btn?.()}</li>
				</ul>
			</div>
		{/if}
	</div>
</div>
