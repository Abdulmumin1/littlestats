<script>
	import { page } from '$app/stores';
	import { color } from '$lib/colors/mixer.js';
	import { Globe, CreditCard, User, LayoutGrid, Palette, Birdhouse } from 'lucide-svelte';

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
	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 rounded-none">
		<div class="flex flex-col md:flex-row gap-10 rounded-none">
			<!-- Sidebar -->
			<aside class="w-full md:w-64 shrink-0 rounded-none">
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
				</div>
			</aside>

			<!-- Content -->
			<div class="flex-1 min-w-0 rounded-none shadow-none">
				{@render children?.()}
			</div>
		</div>
	</main>
</div>
