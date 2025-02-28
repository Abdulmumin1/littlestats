<script>
	import { page } from '$app/stores';
	import { color } from '$lib/colors/mixer.js';
	import Logo from '../lib/components/generals/logo.svelte';

	let status = $page.status;
</script>

<svelte:head>
	<title>{status} Error - Littlestats.click</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center">
	<p style="font-size:14rem; line-height: 0.2;" class="text-{$color}-300 font-extrabold">
		{status}
	</p>
	{#if status == 404}
		<p class="bg-{$color}-200 rounded-full px-2 py-1">The page you're looking for is not found</p>
	{:else if status == 500}
		<p class="bg-{$color}-200 rounded-full px-2 py-1">An error occured from our end</p>
	{/if}
	<a href="/" class="mt-10 flex flex-col items-center">
		<Logo />
		<h4 class="pb-6 text-2xl font-bold text-{$color}-400 sm:mb-0 sm:text-3xl">Littlestats.click</h4>
	</a>
</div>
