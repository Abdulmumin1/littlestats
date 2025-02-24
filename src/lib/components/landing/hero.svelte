<script>
	import Logo from '$lib/components/generals/logo.svelte';
	import { color } from '$lib/colors/mixer.js';
	import { fly, fade } from 'svelte/transition';
</script>

<div class="relative flex min-h-[80vh] items-center justify-center overflow-hidden">
	<!-- Background Elements -->
	<!-- <div class="absolute inset-0 overflow-hidden">
		<div
			in:fade={{ duration: 1000 }}
			class="absolute -right-4 -top-4 h-64 w-64 bg-{$color}-200 dark:bg-{$color}-800/20 rounded-full opacity-30 blur-3xl animate-pulse"
		/>
		<div
			in:fade={{ duration: 1000, delay: 200 }}
			class="absolute bottom-4 -left-8 h-72 w-72 bg-{$color}-300 dark:bg-{$color}-700/20 rounded-full opacity-20 blur-3xl animate-pulse"
		/>
	</div> -->

	<div
		class="container mx-auto flex max-w-7xl flex-col items-center justify-center px-4 text-center"
	>
		<div class="relative z-10 space-y-6 md:space-y-8">
			<!-- Main heading -->
			<h1
				class="mx-auto max-w-[50rem] text-balance font-lato text-4xl font-extrabold leading-tight text-black sm:text-5xl lg:text-7xl dark:text-white"
			>
				The Analytics Tool With the
				<span class="relative inline-block text-{$color}-500 font-inter italic tracking-wide">
					Right
					<span
						class="absolute bottom-0 left-0 h-0 w-full bg-{$color}-100 dark:bg-{$color}-700 -z-10 -skew-x-12 transform"
					/>
				</span>
				<span class="relative inline-block text-{$color}-600">
					Metrics
					<span
						class="absolute bottom-0 left-0 h-2 w-full bg-{$color}-200 dark:bg-{$color}-800 -z-10 -skew-x-12 transform"
					/>
				</span>
			</h1>

			<!-- Subheading -->
			<p class="mx-auto max-w-xl text-lg text-gray-700 sm:text-xl md:max-w-2xl dark:text-gray-300">
				Analytics that helps you grow
			</p>

			<!-- CTA Button -->
			<div class="flex items-center justify-center gap-4">
				<a
					href="/signin"
					on:click={() => {
						window.trackEvent('Get Started');
					}}
					class="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-{$color}-600 px-8 py-3 font-semibold text-white transition duration-300 hover:bg-{$color}-500 dark:bg-{$color}-700 dark:hover:bg-{$color}-600"
				>
					<span class="relative">Get Started</span>
					<span
						class="absolute right-0 translate-x-full transition-transform duration-300 group-hover:-translate-x-4"
					>
						→
					</span>
				</a>
			</div>
		</div>
	</div>
</div>

<style>
	@keyframes pulse {
		0%,
		100% {
			transform: scale(1);
			opacity: 0.3;
		}
		50% {
			transform: scale(1.05);
			opacity: 0.4;
		}
	}

	.animate-pulse {
		animation: pulse 4s ease-in-out infinite;
	}
</style>
