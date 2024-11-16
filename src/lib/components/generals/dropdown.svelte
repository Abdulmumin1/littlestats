<script>
	import { ChevronDown } from 'lucide-svelte';
	import { color } from '$lib/colors/mixer.js';
	import { createEventDispatcher, onMount } from 'svelte';
	// export let color = 'blue'; // can be passed as prop to match your theme
	export let value = 0;
	export let title = '';
	let isOpen = false;

	const dispatch = createEventDispatcher();
	export let options = [];

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

<svelte:window on:click={handleClickOutside} />

<div class="flex items-center gap-2">
	<label for="custom-select" class="font-medium">{title}</label>
	<div class="select-container relative">
		<button
			id="custom-select"
			on:click={() => (isOpen = !isOpen)}
			class="flex w-48 items-center justify-between px-4 py-1 text-gray-100  bg-{$color}-700  border-{$color}-500 rounded-full  font-bold"
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
							on:click={() => handleSelect(option.value)}
							on:keydown={(e) => e.key === 'Enter' && handleSelect(option.value)}
							tabindex="0"
							class="cursor-pointer px-4 py-2 hover:bg-gray-100
                  {value === option.value
								? 'bg-' + $color + '-50 text-' + $color + '-600'
								: 'text-gray-700'}"
						>
							{option.label}
						</li>
					{/each}
					<li role="option" class=" px-4 py-2 dark:text-black"><slot name="btn" /></li>
				</ul>
			</div>
		{/if}
	</div>
</div>
