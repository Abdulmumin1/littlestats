<script>
	import { page } from '$app/stores';
	import { color } from '$lib/colors/mixer.js';
	import { Globe, CreditCard, User, LayoutGrid, Palette, Birdhouse } from 'lucide-svelte';
	import DarkMode from '$lib/components/generals/darkMode.svelte';

	let { children } = $props();
	let path = $derived($page.url.pathname);

	const navLinks = [
		{ href: '/sites', label: 'Home', icon: Birdhouse },
		{ href: '/settings', label: 'Manage Domain', icon: Globe },
		{ href: '/settings/subscription', label: 'Subscription', icon: CreditCard },
		{ href: '/settings/appearance', label: 'Appearance', icon: Palette },
		{ href: '/settings/account', label: 'Account', icon: User },
	];

	function isActive(href) {
		if (href === '/settings') {
			return path === '/settings' || path === '/settings/';
		}
		return path.startsWith(href);
	}
</script>

<div class="min-h-screen rounded-none">
	<main class="max-w-7xl mx-auto px-1 pb-28 pt-4 md:px-8 md:py-8 rounded-none">
		<div class="flex flex-col md:flex-row gap-10 rounded-none">
			<!-- Sidebar -->
			<aside class="hidden w-full md:block md:w-64 shrink-0 rounded-none">
				<div class="sticky top-24 space-y-1 rounded-none">
					<p class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-4 ml-4">Settings</p>
					<nav class="flex flex-col gap-1 rounded-none">
						{#each navLinks as link}
							{@const Active = isActive(link.href)}
							<a
								href={link.href}
								class="flex items-center gap-3 px-4 py-2.5 rounded-none text-sm font-bold transition-all duration-200 {Active 
									? `bg-${$color}-600 text-white` 
									: 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100'}"
							>
								<link.icon size={16} stroke-width={Active ? 2.5 : 2} />
							{link.label}
						</a>
						{/each}
					</nav>

					<!-- Theme Selector -->
					<div class="pt-8 space-y-2 rounded-none">
						<p class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-4">Appearance</p>
						<div class="px-2 rounded-none">
							<DarkMode />
						</div>
					</div>
				</div>
			</aside>

			<!-- Content -->
			<div class="flex-1 min-w-0 rounded-none shadow-none">
				{@render children?.()}
			</div>
		</div>
	</main>
</div>

<nav class="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 grid grid-cols-5 rounded-full border border-white/60 bg-white/75 p-1.5 shadow-[0_12px_45px_rgba(28,25,23,0.18)] backdrop-blur-2xl backdrop-saturate-150 md:hidden dark:border-white/10 dark:bg-stone-900/75" aria-label="Settings navigation">
	{#each navLinks as link (link.href)}
		{@const Active = isActive(link.href)}
		<a href={link.href} aria-current={Active ? 'page' : undefined} class="mx-0.5 flex min-h-12 flex-col items-center justify-center gap-1 rounded-full px-1 text-center text-[8px] font-bold transition-all {Active ? `bg-${$color}-600 text-white shadow-sm` : 'text-stone-500 dark:text-stone-400'}">
			<link.icon size={18} stroke-width={Active ? 2.5 : 2} />
			<span class="max-w-full truncate">{link.label === 'Manage Domain' ? 'Domains' : link.label}</span>
		</a>
	{/each}
</nav>

<style>
	@media (max-width: 767px) {
		main :global(input), main :global(select), main :global(textarea) { min-height: 2.75rem; font-size: 16px; }
		main :global(form) { width: 100%; }
	}
</style>
