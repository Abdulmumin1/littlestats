<script>
	import { page } from '$app/stores';
	import { color } from '$lib/colors/mixer.js';
	import { AudioLines, CalendarHeart, Filter, Gauge, GaugeCircle, LayoutDashboard, MousePointerClick, Settings } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import InsideNav from '../../../../lib/components/generals/insideNav.svelte';
	import MixerComp from '../../../../lib/colors/mixerComp.svelte';
	import DarkMode from '../../../../lib/components/generals/darkMode.svelte';

	/** @type {import('svelte').Snippet} */
	let {children} = $props();

	let Active = $state('Dashboard')
	const links = [
		{ href: `/site/${$page.params.slug}`, text: 'Dashboard', icon: LayoutDashboard },

		{ href: `/site/${$page.params.slug}` + '/funnel', text: 'Funnel', icon: Filter },
		{ href: `/site/${$page.params.slug}` + '/traffic', text: 'Traffic', icon: AudioLines },
		{ href: `/site/${$page.params.slug}` + '/events', text: 'Events', icon: CalendarHeart },
		{ href: `/site/${$page.params.slug}` + '/perfomance', text: 'Performance', icon: Gauge }
	];


	function isActive(href) {
		const normalize = (str) => str.replace(/\/$/, '');
		return normalize($page.url.pathname) === normalize(href);
	}
	onMount(() => {
		console.log($page.params.slug);
	});
	const baseClasses =
		'rounded-xl py-2 px-2 text-sm  transition-colors duration-200 w-fit md:w-full text-center md:text-start inline-flex gap-2 items-center';

	let innerWidth = $state(0)
</script>

<svelte:window bind:innerWidth={innerWidth}/>
<div class="relative h-full min-h-[0px] md:min-h-screen p-0 text-black">
	<div class="relative flex flex-col  p-0 md:h-full md:flex-row">
		{#if innerWidth < 740}
		<nav class="bg-white z-[999] dark:bg-stone-800 md:bg-transparent py-6 md:py-3 justify-around fixed md:absolute top-auto md:top-0 bottom-[-12px] md:bottom-auto left-0 right-0 flex mx-auto md:opacity-30 transition-all duration-300 gap-2 max-w-xl  hover:opacity-100 items-center md:justify-center">
			{#each links as link}
				<a
					href={link.href}
					class={`${baseClasses} ${
						isActive(link.href)
							? `bg-${$color}-600 border-${$color}-800 dark:bg-${$color}-700 text-white border-2`
							: `bg-${$color}-100 hover:bg-${$color}-100 dark:bg-stone-800/50 dark:hover:bg-stone-700/60 dark:text-gray-100`
					}`}
					aria-current={isActive(link.href) ? 'page' : undefined}
				>
				<svelte:component this={link.icon} size={20}/>
					<!-- <span >{link.text}</span> -->
				</a>
			{/each}
			<a
			href='/settings'
			class={`${baseClasses} ${
				
					`bg-${$color}-100 hover:bg-${$color}-200 dark:bg-stone-800/50 dark:hover:bg-stone-700/60 dark:text-gray-100`
			}`}
			
		>
		<Settings size={16}/>
			<!-- <span >{link.text}</span> -->
		</a>
		</nav>
		{:else}
		<div class="sticky  top-0 min-w-[245px]  bg-{$color}-200 bg-opacity-20 dark:bg-stone-800/50 px-2 pt-12 h-screen overflow-y-hidden font-inter">
			<div class="py-4 ">
				<a href="/" class="">
					<span class="px-2 text-lg tracking-wider    dark:text-gray-100 flex gap-2 items-center"><MousePointerClick size={20}/>Littlestats</span>
				</a>
			</div>
			<nav class="flex flex-col h-full justify-between gap-2">
				<ul class="flex flex-col gap-2">
					{#each links as link}
					<li>
						<a
						href={link.href}
						onclick={()=>{
							Active = link.text
						}}
						class={`${baseClasses} ${
							isActive(link.href)
								? `bg-${$color}-600 border-b-4 border border-${$color}-800 dark:bg-${$color}-700  text-white`
								: ` hover:bg-${$color}-100  dark:text-gray-100 dark:hover:bg-stone-700/60`
						}`}
						aria-current={isActive(link.href) ? 'page' : undefined}
					>
						<svelte:component this={link.icon} size={16} />
						<span >{link.text}</span
						>
					</a>
					</li>
				{/each}
				</ul>
				<ul class='mb-16 px-2 rounded-xl flex justify-between bg-{$color}-300 bg-opacity-20 dark:bg-stone-800 text-white py-2 flex-col gap-3'>
					<a href="/settings">
						<li class="px-2 py-2  bg-{$color}-50  dark:bg-stone-900 rounded-xl text-black dark:text-white">
							Settings
						</li>
					</a>
					<li>
						<ul class='flex items-center gap-1 text-black dark:text-white'>
							<li>
								<MixerComp bottom={true} hide={false}/>
							</li>
							<li>
								<DarkMode bottom={true}/>
							</li>
						</ul>
					</li>

					
			</ul>
			</nav>
		</div>
		{/if}
		<section class="w-full">
			<!-- <InsideNav >
				{#snippet title()}
				<h1 class="text-xl font-bold text-gray-100">{Active}</h1>

				{/snippet}
			</InsideNav> -->
			<main class="max-w-full px-6  py-4 mb-24 md:mb-4">
				{@render children?.()}
			</main>
		</section>
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
