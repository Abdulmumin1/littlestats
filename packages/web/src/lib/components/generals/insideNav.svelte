<script>
	import { ChartBar, Settings, X, LogOut } from 'lucide-svelte';
	import { page } from '$app/stores';
	import { color } from '$lib/colors/mixer.js';
	import MixerComp from '../../colors/mixerComp.svelte';
	import { slide } from 'svelte/transition';
	import { clickOutside } from '$lib/utils';
	import DarkMode from './darkMode.svelte';
	import Logo from './logo.svelte';

	let isMenuOpen = $state(false);
	
	function toggleMenu() {
		// console.log(isMenuOpen);
		if (isMenuOpen) {
			closeMenu();
		} else {
			openMenu();
		}
	}

	function openMenu() {
		isMenuOpen = true;
	}
	function closeMenu() {
		isMenuOpen = false;
	}

	let path = $derived($page.url.pathname);

	let {title=false} = $props()
</script>

<div class="sticky top-0 z-40">
	<div class="px-4 sm:px-6 lg:px-8 pt-3">
		<nav
			class="mx-auto max-w-7xl rounded-full border border-stone-200 bg-white/90 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/80"
		>
			<div class="px-2 py-1.5">
				<div class="flex items-center justify-between">
					<a
						href="/"
						class="flex items-center gap-2 rounded-full px-2 py-1.5 text-xs font-bold text-stone-900 dark:text-white transition-opacity hover:opacity-80 uppercase tracking-widest"
					>
						<span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200">
							<Logo size={18} />
						</span>
						<span>Littlestats</span>
					</a>

					<div class="flex items-center gap-1.5">
						<MixerComp hide={true} />
						<DarkMode />

						<div class="hidden md:flex items-center rounded-full border border-stone-200 bg-stone-50 px-0.5 py-0.5 dark:border-stone-800 dark:bg-stone-950">
							<a
								href="/sites"
								class="rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${path.startsWith('/sites') ? `bg-${$color}-600 text-white` : 'text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800'}"
							>
								Dashboard
							</a>
							<a
								href="/settings"
								class="rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${path.startsWith('/settings') ? `bg-${$color}-600 text-white` : 'text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800'}"
							>
								Settings
							</a>
						</div>

						<div class="-mr-1 flex md:hidden">
							<button
								onclick={toggleMenu}
								type="button"
								class="inline-flex items-center justify-center rounded-full border border-stone-200 bg-stone-50 p-1.5 text-stone-800 backdrop-blur-md dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100"
							>
								{#if isMenuOpen}
									<X />
								{:else}
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
								{/if}
							</button>
						</div>
					</div>
				</div>
			</div>
		</nav>
	</div>
</div>
{#if isMenuOpen}
	<div transition:slide use:clickOutside onclick_outside={closeMenu} class="md:hidden">
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
		<!-- <div class="wavy-line bg-{$color}-600 dark:bg-{$color}-700"></div> -->
		<div class=" bg-inherit pb-3">
			<!-- <div class="flex items-center px-5">
			<div class="flex-shrink-0">
				<User size={40} class="rounded-full" />
			</div>
			<div class="ml-3">
				<div class="text-base font-medium leading-none">John Doe</div>
				<div class="text-sm font-medium leading-none text-gray-400">john@example.com</div>
			</div>
		</div> -->
			<div class="mt-1 flex items-center justify-center gap-2">
				<a
					href="/sites"
					onclick={closeMenu}
					class="block rounded-2xl px-3 py-2 text-base font-medium dark:text-gray-100 hover:bg-{$color}-600 hover:text-gray-100 dark:bg-stone-800/50"
					>Dashboard</a
				>
				<a
					href="/settings"
					onclick={closeMenu}
					class="block rounded-2xl px-3 py-2 text-base font-medium dark:text-gray-100 hover:bg-{$color}-600 hover:text-gray-100 dark:bg-stone-800/50"
					>Settings</a
				>
			</div>
		</div>
	</div>
{/if}

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
