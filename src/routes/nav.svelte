<script>
	import MixerComp from '../lib/colors/mixerComp.svelte';
	import { color } from '$lib/colors/mixer.js';
	import DarkMode from '../lib/components/generals/darkMode.svelte';

	let navContainer = $state();

	// Navigation items with optional icons
	const navItems = [
		{ href: '/#pricing', label: 'Pricing' },
		{ href: '/signin', label: 'Sign in' }
	];
</script>

<nav
	class="relative border-stone-800 text-black dark:border-b dark:bg-stone-900 bg-{$color}-100/50 mx-4 mt-4 max-w-[1100px] rounded-full py-1 md:mx-auto md:py-1 dark:bg-stone-800/50"
>
	<!-- Ambient Glow Effects -->

	<div class=" relative mx-auto max-w-[1000px]  px-4 py-4">
		<div class="flex flex-col items-center justify-between md:flex-row">
			<!-- Logo -->
			<a
				href="/"
				class="group relative text-2xl font-black tracking-tight text-black dark:text-white"
			>
				Littlestats.click
			</a>

			<!-- Navigation Container -->
			<div class="flex flex-col items-center gap-4 md:flex-row">
				<!-- Color Mixer with custom styling -->
				<div
					class="z-50 flex items-center gap-2 rounded-full border-stone-800 p-1 backdrop-blur-sm dark:border dark:bg-stone-800/50"
				>
					<!-- <div class="absolute inset-0 -z-10 bg-gradient-to-r from-{$color}-500/5 to-purple-500/5" /> -->
					<MixerComp hide={false} />
					<DarkMode />
				</div>

				<!-- Main Navigation -->
				<div
					bind:this={navContainer}
					class="relative items-center gap-1 rounded-full border-stone-800 py-2 dark:border bg-{$color}-100/50 p-1 text-black backdrop-blur-sm dark:bg-stone-800/50"
				>
					{#each navItems as item}
						<a
							href={item.href}
							class="relative z-10 px-4 py-1.5 text-sm font-medium text-black transition-colors dark:text-white"
						>
							{item.label}
						</a>
					{/each}
				</div>

				<!-- CTA Button -->
				<a
					href="/signup"
					class="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-{$color}-500 to-purple-500 px-4 py-2 text-sm font-semibold text-black transition-all hover:-translate-y-0.5 dark:text-white"
				>
					Start free
					<svg
						class="h-4 w-4 transition-transform group-hover:translate-x-0.5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
							clip-rule="evenodd"
						/>
					</svg>
					<!-- Button Glow -->
					<div
						class="absolute -inset-1 -z-10 rounded-full bg-gradient-to-r from-{$color}-500 to-purple-500 opacity-30 blur group-hover:opacity-50"
					></div>
				</a>

				<!-- Mobile Menu Button (You can expand this)
		  <button class="rounded-full border border-stone-800 p-2 text-stone-400 hover:text-white md:hidden">
			<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
			</svg>
		  </button> -->
			</div>
		</div>
	</div>
</nav>

<style>
	/* Optional: Add any custom animations or transitions here */
	/* For small screens (e.g., smartphones) */
	@media only screen and (max-width: 767px) {
		/* styles for mobile layout */
		nav {
			background-color: transparent !important;
		}
	}
</style>
