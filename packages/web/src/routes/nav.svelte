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


<!-- <button onclick={tracking}>
	click
</button> -->
<nav
	class="relative mx-4 mt-4 max-w-275 border border-black/10 bg-white/80 py-1 text-black backdrop-blur-md md:mx-auto md:py-1 dark:border-white/10 dark:bg-stone-900/80 dark:text-white"
>
	<!-- Ambient Glow Effects -->

	<div class=" relative mx-auto max-w-250  px-4 py-4">
		<div class="flex flex-col items-center justify-between md:flex-row">
			<!-- Logo -->
			<a
				href="/"
				class="group relative text-2xl font-black tracking-tight text-black dark:text-white"
			>
				Littlestats.click
			</a>

			<!-- Navigation Container -->
			<div class="flex flex-col items-center gap-4 md:flex-row pointer-events-auto">
				<!-- Color Mixer with custom styling -->
				<div
					class="z-50 flex items-center gap-2 border border-black/10 p-1 backdrop-blur-sm dark:border-white/10 dark:bg-stone-800/50"
				>
					<!-- <div class="absolute inset-0 -z-10 bg-gradient-to-r from-{$color}-500/5 to-purple-500/5" /> -->
					<MixerComp hide={false} />
					<DarkMode />
				</div>

				<!-- Main Navigation -->
				<div
					bind:this={navContainer}
					class="relative items-center gap-1 border border-black/10 py-2 p-1 text-black backdrop-blur-sm dark:border-white/10 dark:bg-stone-800/50"
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
					onclick={()=>{
						track('Get Started', {
							color: $color,
						});
					}}
					class="group relative inline-flex items-center gap-2 border border-black/10 bg-{$color}-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 dark:border-white/20"
				>
					Get Started
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
					<!-- <div
						class="absolute -inset-1 -z-10 bg-linear-to-r from-{$color}-500 opacity-30 blur group-hover:opacity-50"
					></div> -->
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
