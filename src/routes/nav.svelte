<script>
	import MixerComp from '../lib/colors/mixerComp.svelte';
	import Logo from '../lib/components/generals/logo.svelte';
	import { color } from '$lib/colors/mixer.js';
</script>

<nav
	class="mb-8 flex flex-col items-center justify-between sm:mb-12 sm:flex-row md:items-end lg:mb-16"
>
	<div
		class="mb-4 flex flex-col items-center text-2xl font-bold text-{$color}-600 sm:mb-0 sm:text-3xl"
	>
		<!-- <Logo size={180} />  -->
		<a href="/">Littlestats.click</a>
	</div>
	<div class="flex flex-wrap items-center justify-center space-x-2 sm:justify-end sm:space-x-4">
		<!-- <a href="#" class="px-2 py-1 text-gray-600 hover:text-{$color}-600">Features</a> -->
		<MixerComp />
		<a href="#pricing" class="px-2 py-1 text-gray-600 hover:text-{$color}-600">Pricing</a>
		<a href="/signin" class="px-2 py-1 text-gray-600 hover:text-{$color}-600">Signin</a>
		<a
			href="/signup"
			class="mt-12 hidden rounded-full text-white md:mt-0 md:block bg-{$color}-500 px-3 py-2 text-gray-950 hover:bg-{$color}-600"
			>Start free trial</a
		>
		<!-- <a href="#" class="px-2 py-1 text-gray-600 hover:text-{$color}-600">Contact</a> -->
	</div>
</nav>

<style>
</style>
