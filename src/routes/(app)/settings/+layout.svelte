<script>
	import { page } from '$app/stores';
	import { fly } from 'svelte/transition';
	import { color } from '$lib/colors/mixer.js';

	$: path = $page.url.pathname;
</script>

<div class="min-h-screen p-0 text-black  md:p-2">
	<div class="container mx-auto flex flex-col gap-4 pt-2 md:flex-row md:pt-6">
		<div class="flex w-full flex-col gap-1 px-0 md:w-[300px] md:px-4">
			<a
				class="rounded-full {path === '/settings' || path === '/settings/'
					? `border-${$color}-800 bg-${$color}-500 border-2 text-white`
					: `bg-${$color}-100 dark:bg-stone-800/50 dark:text-gray-100`} px-4 py-2"
				href="/settings">Manage Domain</a
			>
			<a
				class="rounded-full {path.endsWith('/settings/subscription')
					? `border-${$color}-800 bg-${$color}-500 border-2 text-white`
					: `bg-${$color}-100 dark:bg-stone-800/50 dark:text-gray-100`} px-4 py-2"
				href="/settings/subscription">Subscription</a
			>
			<a
				class="rounded-full {path.endsWith('/settings/account')
					? `border-${$color}-800 bg-${$color}-500 border-2 text-white`
					: `bg-${$color}-100 dark:bg-stone-800/50 dark:text-gray-100`} px-4 py-2"
				href="/settings/account">Account</a
			>
		</div>
		<div class="wavy-line block md:hidden bg-{$color}-600"></div>

		<div class="w-full px-2">
			<slot />
		</div>
	</div>
</div>

<style>
	.wavy-line {
		--s: 2.3px; /* size of the wave */
		--b: 2.3px; /* thickness of the line */
		--m: 0.4; /* curvature of the wave [0 2] */

		/* background: #008c9e; */
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
