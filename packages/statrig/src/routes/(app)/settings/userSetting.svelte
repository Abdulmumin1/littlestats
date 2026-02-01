<script>
	import { onMount } from 'svelte';
	import { Moon, Sun, Palette, Check } from 'lucide-svelte';
	import { color, colorList } from '$lib/colors/mixer.js';
	import { fly } from 'svelte/transition';

	let isDark = $state(false);

	onMount(() => {
		isDark = document.documentElement.classList.contains('dark');
	});

	function toggleDarkMode() {
		isDark = !isDark;
		if (isDark) {
			document.documentElement.classList.add('dark');
			localStorage.setItem('theme', 'dark');
		} else {
			document.documentElement.classList.remove('dark');
			localStorage.setItem('theme', 'light');
		}
	}

	function setAccentColor(newColor) {
		color.set(newColor);
		localStorage.setItem('little_stat_color', newColor);
	}

	const colors = Object.keys(colorList);
</script>

<div in:fly={{ y: 13, duration: 100 }} class="flex flex-1 flex-col gap-8 rounded-none">
	<header class="px-2 rounded-none">
		<h1 class="text-xl font-bold text-stone-900 dark:text-white tracking-tight rounded-none">Appearance</h1>
		<p class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mt-1 rounded-none">Customize your interface theme and accents</p>
	</header>

	<!-- Dark Mode -->
	<div class="rounded-none bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-6 shadow-none">
		<div class="flex items-center justify-between">
			<div class="space-y-1">
				<h2 class="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-white uppercase tracking-tight rounded-none">
					{#if isDark}
						<Moon size={16} class="text-stone-400" />
					{:else}
						<Sun size={16} class="text-stone-400" />
					{/if}
					Dark Mode
				</h2>
				<p class="text-xs text-stone-500 dark:text-stone-400">Toggle between light and dark interface</p>
			</div>
			<button
				onclick={toggleDarkMode}
				class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-none border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 {isDark ? `bg-${$color}-600` : 'bg-stone-200 dark:bg-stone-700'}"
				role="switch"
				aria-checked={isDark}
			>
				<span
					aria-hidden="true"
					class="pointer-events-none inline-block h-5 w-5 transform rounded-none bg-white shadow ring-0 transition duration-200 ease-in-out {isDark ? 'translate-x-5' : 'translate-x-0'}"
				></span>
			</button>
		</div>
	</div>

	<!-- Accent Color -->
	<div class="rounded-none bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-6 shadow-none">
		<h2 class="mb-6 flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-white uppercase tracking-tight rounded-none">
			<Palette size={16} class="text-stone-400" />
			Accent Color
		</h2>
		<div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
			{#each colors as c}
				<button
					onclick={() => setAccentColor(c)}
					class="group relative flex flex-col items-center gap-2 transition-all"
				>
					<div 
						class="h-10 w-10 rounded-none border-2 transition-all flex items-center justify-center {c === $color ? `border-${$color}-600 ring-2 ring-${$color}-600 ring-offset-2 dark:ring-offset-stone-900` : 'border-transparent hover:border-stone-300 dark:hover:border-stone-600'}"
						style="background-color: {colorList[c].primary}"
					>
						{#if c === $color}
							<Check size={16} class="text-white" />
						{/if}
					</div>
					<span class="text-[10px] font-bold uppercase tracking-widest text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-200 transition-colors">
						{c}
					</span>
				</button>
			{/each}
		</div>
	</div>
</div>
