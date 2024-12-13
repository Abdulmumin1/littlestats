<script>
	import Logo from '$lib/components/generals/logo.svelte';
	import { color } from '$lib/colors/mixer.js';
</script>

<div
	class="container relative mx-auto flex max-w-[1500px] flex-col items-center justify-start text-center md:items-center md:justify-center md:text-left"
>
	<h1
		class=" mb-4 mt-20 max-w-6xl text-balance text-center text-4xl font-extrabold leading-tight text-black sm:mb-6 sm:text-5xl lg:text-7xl dark:text-white"
	>
		Just another analytics website <span class="block text-{$color}-600 sm:inline"
			>But Affordable</span
		>
	</h1>
	<p
		class=" mb-3 max-w-xl px-3 text-lg text-gray-900 sm:mb-8 sm:max-w-2xl sm:text-xl md:p-0 dark:text-white"
	>
		Your analytics needs without breaking the bank
	</p>
	<a
		href="/signin"
		class="inline-block w-fit transform rounded-full text-white bg-{$color}-600 dark:bg-{$color}-700 px-6 py-2 text-base font-semibold text-black transition duration-300 hover:-translate-y-1 hover:bg-{$color}-400 sm:px-8 sm:py-3 sm:text-lg"
	>
		Get Started
	</a>
	<!-- <div class="pointer-events-none absolute bottom-0 right-0 -z-0 hidden md:block">
				<Logo size={300} />
			</div> -->
</div>
