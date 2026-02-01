<script>
	import { ChevronDown, Check } from 'lucide-svelte';
	import { color } from '$lib/colors/mixer.js';
	import { createEventDispatcher } from 'svelte';

	let { 
		value = $bindable(), 
		options = [], 
		placeholder = 'Select...',
		label = '',
		id = crypto.randomUUID(),
		onchange
	} = $props();

	let isOpen = $state(false);
	let container;

	const dispatch = createEventDispatcher();

	const selectedOption = $derived(options.find(opt => String(opt.value) === String(value)));

	function handleSelect(newValue) {
		value = newValue;
		isOpen = false;
		if (onchange) onchange(newValue);
		dispatch('change', { value: newValue });
	}

	function toggle() {
		isOpen = !isOpen;
	}

	function handleClickOutside(event) {
		if (container && !container.contains(event.target)) {
			isOpen = false;
		}
	}

	function handleKeydown(event) {
		if (event.key === 'Escape') {
			isOpen = false;
		}
	}
</script>

<svelte:window onclick={handleClickOutside} onkeydown={handleKeydown} />

<div class="flex flex-col gap-1.5 w-full relative" bind:this={container}>
	{#if label}
		<label for={id} class="text-[10px] font-black uppercase tracking-widest text-stone-400 select-none">
			{label}
		</label>
	{/if}
	
	<div class="relative w-full">
		<button
			{id}
			type="button"
			onclick={toggle}
			aria-haspopup="listbox"
			aria-expanded={isOpen}
			class="flex w-full items-center justify-between px-3 py-2 text-xs font-bold bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-none text-stone-900 dark:text-white hover:border-stone-300 dark:hover:border-stone-700 transition-all focus:outline-none focus:ring-2 focus:ring-stone-500/50"
		>
			<span class="truncate">
				{selectedOption ? selectedOption.label : placeholder}
			</span>
			<ChevronDown 
				size={14} 
				class="text-stone-400 shrink-0 ml-2 transition-transform duration-200 {isOpen ? 'rotate-180' : ''}" 
			/>
		</button>

		{#if isOpen}
			<div
				class="absolute z-100 mt-1 w-full min-w-50 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-none shadow-xl overflow-hidden"
				role="listbox"
			>
				<div class="max-h-60 overflow-y-auto py-1 custom-scrollbar">
					{#each options as option}
						{@const isSelected = String(value) === String(option.value)}
						<button
							role="option"
							aria-selected={isSelected}
							onclick={() => handleSelect(option.value)}
							class="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-left transition-colors
								{isSelected 
									? `bg-${$color}-600 text-white` 
									: 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'}"
						>
							<span class="truncate">{option.label}</span>
							{#if isSelected}
								<Check size={12} class="shrink-0" />
							{/if}
						</button>
					{:else}
						<div class="px-4 py-3 text-xs text-stone-400 italic font-serif">
							No options available
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(139, 139, 139, 0.2);
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: rgba(139, 139, 139, 0.4);
	}
</style>
