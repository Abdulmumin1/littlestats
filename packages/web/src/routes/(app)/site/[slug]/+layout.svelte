<script>
	import { dashboardStore } from '$lib/stores/dashboard.svelte.js';
	import { formatDate } from '$lib/utils.js';
	import { page } from '$app/stores';
	import { color } from '$lib/colors/mixer.js';
	import { CalendarHeart, CalendarRange, LayoutDashboard, Target, Megaphone, Settings, Globe, Plus, GitBranch } from 'lucide-svelte';
	import PickDate from '$lib/components/generals/pickDate.svelte';
	import Dropdown from '$lib/components/generals/dropdown.svelte';
	import Logo from '../../../../lib/components/generals/logo.svelte';

	let { children, data } = $props();

	const links = $derived([
		{ href: `/site/${$page.params.slug}`, text: 'Overview', icon: LayoutDashboard },
		{ href: `/site/${$page.params.slug}/campaigns`, text: 'Campaigns', icon: Megaphone },
		{ href: `/site/${$page.params.slug}/funnels`, text: 'Funnels', icon: GitBranch },
		{ href: `/site/${$page.params.slug}/events`, text: 'Events', icon: CalendarHeart },
		{ href: `/site/${$page.params.slug}/settings`, text: 'Settings', icon: Settings },
	]);

	function isActive(href) {
		const normalize = (str) => str.replace(/\/$/, '');
		return normalize($page.url.pathname) === normalize(href);
	}

	let isOpen = $state(false);
	let selectedStartDate = $state(new Date(dashboardStore.dateRange.startDate));
	let selectedEndDate = $state(new Date(dashboardStore.dateRange.endDate));
	const domain_options = $derived(data.domains.map((e) => ({ value: e.id, label: e.name })));

	console.log(data	)
</script>

<PickDate bind:isOpen bind:startDate={selectedStartDate} bind:endDate={selectedEndDate} on:close={(e) => {
	dashboardStore.setDateRange(
		new Date(e.detail.startDate).toISOString().split('T')[0],
		new Date(e.detail.endDate).toISOString().split('T')[0]
	);
}} />

<div class="min-h-screen rounded-none">
	<main class=" mx-auto px-4 sm:px-6 lg:px-8 py-8 rounded-none">
		<div class="flex flex-col md:flex-row gap-10 rounded-none">
			<!-- Sidebar -->
			<aside class="w-full md:w-64 shrink-0 rounded-none">
				<div class="sticky top-18 space-y-8 rounded-none">
					<a href="/" class="flex flex-col  gap-2 text-black dark:text-white font-sans uppercase text-sm ml-2"><Logo size={24} /> <span >Littlestats</span></a>
					
					<!-- Site Selector -->
					<div class="space-y-2 rounded-none">
						<p class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-2 flex items-center gap-2"><Globe size={12}/> Domain</p>
						<div class="rounded-none">
							<Dropdown
								on:change={(e) => (window.location.href = `/site/${e.detail.value}`)}
								title=""
								value={data.domain_id}
								options={domain_options}
							>
								<a href="/settings" class="text-[10px] font-bold text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors">+ Add site</a>
							</Dropdown>
						</div>
					</div>

					<!-- Navigation -->
					<div class="space-y-2 rounded-none">
						<p class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-4">Analytics</p>
						<nav class="flex flex-col gap-1 rounded-none">
							{#each links as link}
								{@const Active = isActive(link.href)}
								<a
									href={link.href}
									class="flex items-center gap-3 px-4 py-2.5 rounded-none text-sm font-bold transition-all duration-200 {Active 
										? `bg-${$color}-600 text-white` 
										: 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100'}"
								>
									<link.icon size={16} stroke-width={Active ? 2.5 : 2} />
									{link.text}
								</a>
							{/each}
						</nav>
					</div>

					<!-- Date Range -->
					<div class="space-y-2 rounded-none">
						<p class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-4">Timeframe</p>
						<div class="px-2 rounded-none">
							<button
								onclick={() => { isOpen = !isOpen; }}
								class="flex flex-col items-start gap-1 w-full p-4 rounded-none bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 hover:border-stone-200 dark:hover:border-stone-700 transition-all text-left group"
							>
								<div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400">
									<CalendarRange size={12} />
									Selected Range
								</div>
								<span class="text-xs font-bold text-stone-900 dark:text-white tabular-nums">
									{#if dashboardStore.dateRange.startDate && dashboardStore.dateRange.endDate}
										{formatDate(new Date(dashboardStore.dateRange.startDate))} - {formatDate(new Date(dashboardStore.dateRange.endDate))}
									{:else}
										Select date range
									{/if}
								</span>
							</button>
						</div>
					</div>
				</div>
			</aside>

			<!-- Content -->
			<div class="flex-1 min-w-0 rounded-none">
				{@render children?.()}
			</div>
		</div>
	</main>
</div>
