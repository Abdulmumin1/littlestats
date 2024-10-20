<script>
	import { ChartBar, Settings, User, LogOut } from 'lucide-svelte';
	import { page } from '$app/stores';
	import { color } from '$lib/colors/mixer.js';
	import MixerComp from '../../colors/mixerComp.svelte';
	import { slide } from 'svelte/transition';
	import { clickOutside } from '$lib/utils';

	let isMenuOpen = false;
	let closed = true;

	function toggleMenu() {
		if (closed) {
			closed = false;
			return;
		}
		isMenuOpen = !isMenuOpen;
	}

	function closeMenu() {
		isMenuOpen = false;
		closed = true;
	}

	$: path = $page.url.pathname;
</script>

<nav class="mb-4 text-black">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<div class="flex items-center">
				<a
					href="/"
					class="flex flex-shrink-0 items-center rounded-full border-2 border-{$color}-600 bg-{$color}-500 px-2 py-1"
				>
					<!-- <ChartBar size={18} class="text-{$color}-950" /> -->
					<span class="px-2 text-lg font-bold text-white">Littlestats</span>
				</a>
			</div>
			<div class="flex items-center gap-1">
				<MixerComp />
				<div
					class="hidden items-center rounded-full border-2 px-4 py-2 md:flex border-{$color}-600 bg-{$color}-500 px-2 py-1 md:block"
				>
					<div class=" flex items-center justify-center gap-3 text-white md:ml-0">
						<div class="flex">
							<a href="/sites" class=" rounded-md text-sm font-bold">Dashboard</a>
						</div>
						<a
							href="/settings"
							class="rounded-full hover:bg-{$color}-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-{$color}-800"
						>
							<Settings size={20} />
						</a>

						<!-- <button
							class="rounded-full hover:bg-{$color}-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-{$color}-800"
						>
							<LogOut size={20} />
						</button> -->
					</div>
				</div>
				<div class="-mr-2 flex md:hidden">
					<button
						on:click={toggleMenu}
						type="button"
						class="inline-flex items-center justify-center rounded-md p-2 text-black ring-black hover:text-black focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-{$color}-800"
					>
						<svg
							class="h-6 w-6"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 6h16M4 12h16M4 18h16"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	</div>

	{#if isMenuOpen}
		<div transition:slide use:clickOutside on:click_outside={closeMenu} class="md:hidden">
			<!-- <div class="space-y-1 px-2 pb-3 pt-2 sm:px-3">
				<a
					href="/"
					on:click={closeMenu}
					class="block rounded-md px-3 py-2 text-base font-medium"
					class:bg-{$color}-800={path === '/'}>Dashboard</a
				>
				<a
					href="/domains"
					on:click={closeMenu}
					class="block rounded-md px-3 py-2 text-base font-medium"
					class:bg-{$color}-800={path === '/domains'}>Domains</a
				>
				<a
					href="/reports"
					on:click={closeMenu}
					class="block rounded-md px-3 py-2 text-base font-medium"
					class:bg-{$color}-800={path === '/reports'}>Reports</a
				>
			</div> -->
			<div class="wavy-line bg-{$color}-500"></div>
			<div class=" bg-gray-50 pb-3 pt-4">
				<!-- <div class="flex items-center px-5">
					<div class="flex-shrink-0">
						<User size={40} class="rounded-full" />
					</div>
					<div class="ml-3">
						<div class="text-base font-medium leading-none">John Doe</div>
						<div class="text-sm font-medium leading-none text-gray-400">john@example.com</div>
					</div>
				</div> -->
				<div class="mt-1 space-y-1 px-2">
					<a
						href="/settings"
						class="block rounded-md px-3 py-2 text-base font-medium hover:bg-{$color}-500"
						>Settings</a
					>
					<a
						href="/logout"
						class="block rounded-md px-3 py-2 text-base font-medium hover:bg-{$color}-500"
						>Sign out</a
					>
				</div>
			</div>
		</div>
	{/if}
	<div class="wavy-line bg-{$color}-600"></div>
</nav>

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
