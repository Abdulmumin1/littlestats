<script>
	import { page } from '$app/stores';
	import { color } from '$lib/colors/mixer.js';
	import { AudioLines, CalendarHeart, Gauge } from 'lucide-svelte';
	import { onMount } from 'svelte';

	/** @type {import('svelte').Snippet} */
	export let children;

	const links = [
		{ href: `/site/${$page.params.slug}`, text: 'Traffic', icon:AudioLines },
		{ href: `/site/${$page.params.slug}`+ '/events', text: 'Events', icon:CalendarHeart },
		{ href: `/site/${$page.params.slug}` + '/perfomance', text: 'Performance', icon:Gauge },
	];

	$: path = $page.url.pathname;
	
	function isActive(href) {
		const normalize = (str) => str.replace(/\/$/, '');
		return normalize(path) === normalize(href);
	}
	onMount(()=>{
		console.log($page.params.slug)
	})
	const baseClasses = 'rounded-xl px-4 py-1 transition-colors duration-200 w-fit md:w-full text-center md:text-start inline-flex gap-2 items-center';
</script>

<div class="min-h-screen relative p-0 text-black h-full">
	<div class="container flex flex-col md:flex-row gap-4 md:h-full">
		<nav class="bg-stone-800 md:bg-transparent py-6 md:py-3 justify-around fixed md:absolute top-auto md:top-0 bottom-[-12px] md:bottom-auto left-0 right-0 flex mx-auto md:opacity-30 transition-all duration-300 gap-2 max-w-xl  hover:opacity-100 items-center md:justify-center">
			{#each links as link}
				<a
					href={link.href}
					class={`${baseClasses} ${
						isActive(link.href)
							? `bg-${$color}-600 border-${$color}-800 dark:bg-${$color}-700 text-white border-2`
							: `bg-${$color}-100 hover:bg-${$color}-200 dark:bg-stone-800/50 dark:hover:bg-stone-700/60 dark:text-gray-100`
					}`}
					aria-current={isActive(link.href) ? 'page' : undefined}
				>
				<svelte:component this={link.icon} size={16}/>
					<span class="{isActive(link.href) ? 'sr-only':'block'}">{link.text}</span>
				</a>
			{/each}
		</nav>

		<main class="w-full px-2 max-w-7xl mx-auto mb-20 md:mb-0">
			{@render children?.()}
		</main>
	</div>
</div>

<style>
	.wavy-line {
		--s: 2.3px; /* size of the wave */
		--b: 2.3px; /* thickness of the line */
		--m: 0.4; /* curvature of the wave [0 2] */

		--R: calc(var(--s) * sqrt(var(--m) * var(--m) + 1) + var(--b) / 2);
		height: calc(2 * var(--R));
		width: 100%;
		--_g: #0000 calc(99% - var(--b)), #000 calc(101% - var(--b)) 99%, #0000 101%;
		mask:
			radial-gradient(var(--R) at left 50% bottom calc(-1 * var(--m) * var(--s)), var(--_g))
				calc(50% - 2 * var(--s)) calc(50% - var(--s) / 2 - var(--b) / 2) / calc(4 * var(--s))
				calc(var(--s) + var(--b)) repeat-x,
			radial-gradient(var(--R) at left 50% top calc(-1 * var(--m) * var(--s)), var(--_g)) 50%
				calc(50% + var(--s) / 2 + var(--b) / 2) / calc(4 * var(--s)) calc(var(--s) + var(--b))
				repeat-x;
	}

	
</style>