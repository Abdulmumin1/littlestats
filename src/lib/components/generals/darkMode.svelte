<script>
	import { onMount } from 'svelte';
	import { Moon, Sun, Monitor } from 'lucide-svelte';
	import { clickOutside } from '$lib/utils';
	import { fly, slide } from 'svelte/transition';
	import { color } from '$lib/colors/mixer.js';

	let darkMode = $state(false);
	let isOpen = $state(false);
	let clickoutside = false;

	function toggleDropdown() {
		if (clickoutside) {
			clickoutside = false;
			return;
		}
		isOpen = !isOpen;
	}

	function closeDropdown() {
		clickoutside = true;
		isOpen = false;
	}

	onMount(() => {
		const savedTheme = localStorage.getItem('theme');
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		darkMode = savedTheme === 'dark' || (!savedTheme && prefersDark);
		updateTheme(darkMode);
	});

	function updateTheme(isDark) {
		if (isDark) {
			document.documentElement.classList.add('dark');
			localStorage.setItem('theme', 'dark');
		} else {
			document.documentElement.classList.remove('dark');
			localStorage.setItem('theme', 'light');
		}
		darkMode = isDark;
		isOpen = false;
	}

	function setSystemTheme() {
		localStorage.removeItem('theme');
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		updateTheme(prefersDark);
	}

	let {bottom = false} = $props()
</script>

<div class="relative">
	<button
		onclick={toggleDropdown}
		class="flex items-center justify-center rounded-full border p-2 border-{$color}-600 bg-{$color}-50 text-black dark:bg-stone-900 dark:text-gray-100"
		aria-label="Toggle theme"
	>
		{#if darkMode}
			<Moon size={20} class="fill-white" />
		{:else}
			<Sun size={20} class="fill-white" />
		{/if}
	</button>

	{#if isOpen}
		<div
			transition:fly={{ y: 10 }}
			use:clickOutside
			onclick_outside={closeDropdown}
			class="absolute right-0 mt-2 w-48 rounded-md border border-{$color}-200 z-50 bg-white text-black dark:bg-stone-800 dark:text-white dark:border-0 shadow-lg {bottom?'bottom-12':''}"
		>
			<div class="py-1">
				<button
					onclick={() => updateTheme(false)}
					class="flex w-full items-center px-4 py-2 text-sm hover:bg-{$color}-600 hover:dark:bg-{$color}-700 hover:text-white"
				>
					<Sun size={16} class="mr-2" />
					Light (experimental)
				</button>
				<button
					onclick={() => updateTheme(true)}
					class="flex w-full items-center px-4 py-2 text-sm hover:bg-{$color}-600 hover:dark:bg-{$color}-700 hover:text-white"
				>
					<Moon size={16} class="mr-2" />
					Dark 
				</button>
				<button
					onclick={setSystemTheme}
					class="flex w-full items-center px-4 py-2 text-sm hover:bg-{$color}-600 hover:dark:bg-{$color}-700 hover:text-white"
				>
					<Monitor size={16} class="mr-2" />
					System
				</button>
			</div>
		</div>
	{/if}
</div>
