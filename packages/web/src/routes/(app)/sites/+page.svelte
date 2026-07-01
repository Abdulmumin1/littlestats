<script>
	import { color } from '$lib/colors/mixer.js';
	import CuteCloud from '$lib/components/generals/cuteCloud.svelte';
	import Seo from '$lib/components/generals/seo.svelte';
	import InsideNav from '$lib/components/generals/insideNav.svelte';
	import DarkMode from '$lib/components/generals/darkMode.svelte';
	import { api } from '$lib/api/analytics.ts';
	import { show_toast } from '$lib/toast.js';
	import { LayoutGrid, Globe, Plus, ArrowRight, Activity, Users, Eye, Settings } from 'lucide-svelte';
	import { page } from '$app/stores';

	let sites = $state([]);
	let loading = $state(true);
	let error = $state(null);

	let path = $derived($page.url.pathname);

	async function loadSites() {
		loading = true;
		error = null;
		try {
			const response = await api.getSites();
			sites = response.sites || [];
			// Onboarding redirect is now handled server-side in +page.server.js
		} catch (err) {
			console.error('Sites fetch error:', err);
			error = err.message || 'Failed to load sites';
			show_toast.set({ message: error, type: 'error' });
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		loadSites();
	});
</script>

<svelte:head>
	<Seo title="Dashboard - Littlestats" />
</svelte:head>

<div class="min-h-screen text-stone-900 dark:text-stone-100 max-w-7xl mx-auto rounded-none">
	<main class="px-1 pb-28 pt-4 md:px-8 md:py-8 rounded-none space-y-8">
		<div class="flex flex-col md:flex-row gap-10 rounded-none">
			<!-- Sidebar -->
			<aside class="hidden w-full md:block md:w-64 shrink-0 rounded-none">
				<div class="sticky top-24 space-y-1 rounded-none">
					<p class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-4 ml-4">Dashboard</p>
					<nav class="flex flex-col gap-1 rounded-none">
						<a
							href="/sites"
							class={`flex items-center gap-3 px-4 py-2.5 rounded-none text-sm font-bold transition-all duration-200 bg-${$color}-600 text-white border border-${$color}-600 shadow-none`}
						>
							<LayoutGrid size={16} stroke-width={2.5} />
							All Sites
						</a>
						<a
							href="/settings"
							class="flex items-center gap-3 px-4 py-2.5 rounded-none text-sm font-bold transition-all duration-200 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100 border border-transparent shadow-none"
						>
							<Settings size={16} stroke-width={2} />
							Settings
						</a>
					</nav>

					<div class="pt-8 px-4 rounded-none">
						<a 
							href="/settings" 
							class="flex items-center justify-center gap-2 w-full py-2.5 rounded-none bg-stone-100 dark:bg-stone-800 text-[10px] font-black uppercase tracking-widest text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors border border-stone-200 dark:border-stone-700 shadow-none"
						>
							<Plus size={12} /> Add Domain
						</a>
					</div>

					
				</div>
			</aside>

			<!-- Content -->
			<div class="flex-1 min-w-0 space-y-8 rounded-none">
				<header class="px-2 rounded-none">
					<h1 class="text-xl font-bold text-stone-900 dark:text-white tracking-tight">All Sites</h1>
					<p class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mt-1">Manage your domains</p>
				</header>

				{#if loading}
					<div class="grid grid-cols-1 gap-4 animate-pulse rounded-none">
						{#each Array(3) as _}
							<div class="h-20 rounded-none bg-stone-100 dark:bg-stone-900/50 border border-stone-200/50 dark:border-stone-800/50"></div>
						{/each}
					</div>
				{:else if error}
					<div class="p-8 rounded-none border-2 border-dashed border-red-100 dark:border-red-900/20 text-center space-y-4">
						<p class="text-red-600 dark:text-red-400 text-sm font-serif italic">{error}</p>
						<button onclick={loadSites} class="px-6 py-2 rounded-none bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors">Retry</button>
					</div>
				{:else if sites.length > 0}
					<div class="space-y-3 rounded-none">
						{#each sites as site}
							<a 
								href="/site/{site.id}"
								class="group flex items-center justify-between p-4 px-6 rounded-none bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 hover:bg-white dark:hover:bg-stone-800 hover:border-stone-200 dark:hover:border-stone-700 transition-all duration-300"
							>
								<div class="flex items-center gap-4 flex-1 min-w-0 rounded-none">
									<div class="h-10 w-10 rounded-none bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-400 group-hover:text-stone-900 dark:group-hover:text-stone-100 transition-colors">
										<Globe size={18} />
									</div>
									<div class="truncate rounded-none">
										<div class="flex items-center gap-2">
											<h3 class="text-sm font-bold text-stone-900 dark:text-white truncate lowercase">{site.name || site.domain}</h3>
											{#if !site.verifiedAt}
												<span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
													UNVERIFIED
												</span>
											{/if}
										</div>
										<p class="text-[10px] font-mono text-stone-400 mt-0.5">{site.domain}</p>
									</div>
								</div>

								<div class="flex items-center gap-8 ml-4 rounded-none">
									<div class="hidden sm:flex items-center gap-6 rounded-none">
										<div class="text-right rounded-none">
											<div class="flex items-center gap-1.5 justify-end rounded-none">
												<Users size={12} class="text-stone-400" />
												<span class="text-xs font-bold text-stone-900 dark:text-white tabular-nums">{site.sessionCount || 0}</span>
											</div>
											<p class="text-[10px] font-black uppercase tracking-tighter text-stone-400 opacity-50">visits</p>
										</div>
										<div class="text-right rounded-none">
											<div class="flex items-center gap-1.5 justify-end rounded-none">
												<Eye size={12} class="text-stone-400" />
												<span class="text-xs font-bold text-stone-900 dark:text-white tabular-nums">{site.events24h || 0}</span>
											</div>
											<p class="text-[10px] font-black uppercase tracking-tighter text-stone-400 opacity-50">24h</p>
										</div>
									</div>
									<div class="h-8 w-8 rounded-none bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-400 group-hover:translate-x-1 transition-all">
										<ArrowRight size={14} />
									</div>
								</div>
							</a>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</main>
</div>

<nav class="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 grid grid-cols-2 rounded-full border border-white/60 bg-white/75 p-1.5 shadow-[0_12px_45px_rgba(28,25,23,0.18)] backdrop-blur-2xl backdrop-saturate-150 md:hidden dark:border-white/10 dark:bg-stone-900/75" aria-label="Dashboard navigation">
	<a href="/sites" aria-current="page" class="mx-0.5 flex min-h-12 items-center justify-center gap-2 rounded-full bg-{$color}-600 px-3 text-xs font-bold text-white shadow-sm"><LayoutGrid size={18} /> Sites</a>
	<a href="/settings" class="mx-0.5 flex min-h-12 items-center justify-center gap-2 rounded-full px-3 text-xs font-bold text-stone-500 dark:text-stone-400"><Settings size={18} /> Settings</a>
</nav>
