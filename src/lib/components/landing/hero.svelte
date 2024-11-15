<script>
	import Logo from '$lib/components/generals/logo.svelte';
	import { color } from '$lib/colors/mixer.js';

</script>
<div
			class="relative container max-w-[1500px] mx-auto flex flex-col items-center justify-start text-center md:items-center md:justify-center md:text-left"
		>
			<h1
				class=" mb-4 text-center mt-20 max-w-6xl text-balance text-4xl font-extrabold leading-tight text-black dark:text-white sm:mb-6 sm:text-5xl lg:text-7xl"
			>
				Just another analytics website <span class="block text-{$color}-400 sm:inline"
					>But Affordable</span
				>
			</h1>
			<p class=" max-w-xl text-lg  text-gray-900 dark:text-white sm:mb-8 sm:max-w-2xl sm:text-xl">
				Your analytics needs without breaking the bank
			</p>
			<a
				href="/signin"
				class="inline-block w-fit transform rounded-full text-white bg-{$color}-500 px-6 py-2 text-base font-semibold text-black transition duration-300 hover:-translate-y-1 hover:bg-{$color}-400 sm:px-8 sm:py-3 sm:text-lg"
			>
				Get Started
			</a>
			<!-- <div class="pointer-events-none absolute bottom-0 right-0 -z-0 hidden md:block">
				<Logo size={300} />
			</div> -->
		</div>