<script>
	import { dashboardStore } from '$lib/stores/dashboard.svelte.js';
	import { api } from '$lib/api/analytics.ts';
	import { formatDate } from '$lib/utils.js';
	import { fromDateKey, toLocalDateKey } from '$lib/utils/dateRange.js';
	import { page } from '$app/stores';
	import { color } from '$lib/colors/mixer.js';
	import { CalendarHeart, CalendarRange, LayoutDashboard, Megaphone, Settings, Globe, GitBranch, Mailbox, Menu, X } from 'lucide-svelte';
	import PickDate from '$lib/components/generals/pickDate.svelte';
	import Dropdown from '$lib/components/generals/dropdown.svelte';
	import Logo from '../../../../lib/components/generals/logo.svelte';

	let { children, data } = $props();

	const links = $derived([
		{ href: `/site/${$page.params.slug}`, text: 'Overview', icon: LayoutDashboard },
		{ href: `/site/${$page.params.slug}/campaigns`, text: 'Campaigns', icon: Megaphone },
		{ href: `/site/${$page.params.slug}/funnels`, text: 'Funnels', icon: GitBranch },
		{ href: `/site/${$page.params.slug}/events`, text: 'Events', icon: CalendarHeart },
		{ href: `/site/${$page.params.slug}/feedback`, text: 'Feedback', icon: Mailbox },
		{ href: `/site/${$page.params.slug}/settings`, text: 'Settings', icon: Settings },
	]);

	function isActive(href) {
		const normalize = (str) => str.replace(/\/$/, '');
		return normalize($page.url.pathname) === normalize(href);
	}

	let isOpen = $state(false);
	let mobileMenuOpen = $state(false);
	let newFeedbackCount = $state(0);
	let selectedStartDate = $state(fromDateKey(dashboardStore.dateRange.startDate) ?? new Date());
	let selectedEndDate = $state(fromDateKey(dashboardStore.dateRange.endDate) ?? new Date());
	const domain_options = $derived(data.domains.map((e) => ({ value: e.id, label: e.name })));

	$effect(() => {
		if (!data.domain_id) return;

		let cancelled = false;
		newFeedbackCount = 0;

		api.getFeedback(data.domain_id, { status: 'new', limit: 1 })
			.then((response) => {
				if (!cancelled) newFeedbackCount = response.total || 0;
			})
			.catch((error) => {
				if (!cancelled) console.error('Error fetching feedback count:', error);
			});

		return () => {
			cancelled = true;
		};
	});

	$effect(() => {
		if (isOpen) return;

		const nextStart = fromDateKey(dashboardStore.dateRange.startDate);
		const nextEnd = fromDateKey(dashboardStore.dateRange.endDate);
		if (nextStart) selectedStartDate = nextStart;
		if (nextEnd) selectedEndDate = nextEnd;
	});
</script>

<PickDate bind:isOpen bind:startDate={selectedStartDate} bind:endDate={selectedEndDate} on:close={(e) => {
	dashboardStore.setDateRange(
		toLocalDateKey(e.detail.startDate),
		toLocalDateKey(e.detail.endDate)
	);
}} />

<div class="min-h-screen rounded-none">
	<main class="mx-auto px-0 pb-28 pt-4 md:px-8 md:py-8 rounded-none">
		<!-- Mobile context bar -->
		<div class="mb-5 flex items-center gap-2 border-b border-stone-100 px-3 pb-3 dark:border-stone-800 md:hidden">
			<a href="/" class="grid size-10 shrink-0 place-items-center text-black dark:text-white" aria-label="Littlestats home">
				<Logo size={20} />
			</a>
			<div class="mobile-domain-control min-w-0 flex-1">
				<Dropdown
					on:change={(e) => (window.location.href = `/site/${e.detail.value}`)}
					title=""
					value={data.domain_id}
					options={domain_options}
				>
					<a href="/settings" class="text-[10px] font-bold text-stone-400">+ Add site</a>
				</Dropdown>
			</div>
			<button
				type="button"
				onclick={() => (isOpen = true)}
				class="grid size-10 shrink-0 place-items-center text-stone-600 dark:text-stone-300"
				aria-label="Choose date range"
			>
				<CalendarRange size={18} />
			</button>
		</div>
		<div class="mobile-app-content flex flex-col gap-10 rounded-none md:flex-row">
			<!-- Sidebar -->
			<aside class="hidden w-full md:block md:w-64 shrink-0 rounded-none">
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
						<nav class="flex flex-col gap-1 rounded-none" data-sveltekit-preload-data="hover">
							{#each links as link (link.href)}
								{@const Active = isActive(link.href)}
								<a
									href={link.href}
									class="flex items-center justify-between px-4 py-2.5 rounded-none text-sm font-bold transition-all duration-200 {Active 
										? `bg-${$color}-600 text-white` 
										: 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100'}"
								>
									<div class="flex items-center gap-3">
										<link.icon size={16} stroke-width={Active ? 2.5 : 2} />
										{link.text}
									</div>

									{#if link.text === 'Feedback' && newFeedbackCount > 0}
										<span class="{Active ? 'bg-white/20 text-white' : `bg-${$color}-600 text-white`} text-[10px] font-black px-1.5 py-0.5 rounded-none min-w-[1.2rem] text-center tabular-nums">
											{newFeedbackCount}
										</span>
									{/if}
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

<!-- Mobile navigation -->
<nav
	class="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 grid grid-cols-5 items-center rounded-full border border-white/60 bg-white/72 p-1.5 shadow-[0_12px_45px_rgba(28,25,23,0.18)] backdrop-blur-2xl backdrop-saturate-150 md:hidden dark:border-white/10 dark:bg-stone-900/72"
	aria-label="Analytics navigation"
	data-sveltekit-preload-data="hover"
>
	{#each links.slice(0, 4) as link (link.href)}
		{@const Active = isActive(link.href)}
		<a
			href={link.href}
			class="relative mx-0.5 flex min-h-12 flex-col items-center justify-center gap-1 rounded-full px-1 text-[9px] font-bold transition-all {Active ? `bg-${$color}-600 text-white shadow-sm` : 'text-stone-500 dark:text-stone-400'}"
			aria-current={Active ? 'page' : undefined}
		>
			<link.icon size={19} stroke-width={Active ? 2.5 : 2} />
			<span>{link.text}</span>
		</a>
	{/each}
	<button
		type="button"
		onclick={() => (mobileMenuOpen = true)}
		class="relative mx-0.5 flex min-h-12 flex-col items-center justify-center gap-1 rounded-full px-1 text-[9px] font-bold {links.slice(4).some((link) => isActive(link.href)) ? `bg-${$color}-600 text-white shadow-sm` : 'text-stone-500 dark:text-stone-400'} transition-all"
		aria-label="Open more navigation options"
	>
		<Menu size={19} />
		<span>More</span>
		{#if newFeedbackCount > 0}
			<span class="absolute right-[5%] top-1 grid min-w-4 place-items-center bg-{$color}-600 px-1 text-[9px] text-white tabular-nums">{newFeedbackCount}</span>
		{/if}
	</button>
</nav>

{#if mobileMenuOpen}
	<div class="fixed inset-0 z-50 md:hidden" role="presentation">
		<button
			type="button"
			class="absolute inset-0 bg-stone-950/25 backdrop-blur-[2px]"
			onclick={() => (mobileMenuOpen = false)}
			aria-label="Close navigation menu"
		></button>
		<div class="absolute inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] rounded-[1.75rem] border border-white/60 bg-white/82 p-4 shadow-2xl backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-stone-900/85">
			<div class="mb-4 flex items-center justify-between">
				<div>
					<p class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Workspace</p>
					<p class="text-sm font-bold text-stone-900 dark:text-white">More controls</p>
				</div>
				<button type="button" onclick={() => (mobileMenuOpen = false)} class="grid size-9 place-items-center rounded-full bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300" aria-label="Close menu"><X size={17} /></button>
			</div>
			<div class="grid grid-cols-2 gap-2">
				{#each links.slice(4) as link (link.href)}
					{@const Active = isActive(link.href)}
					<a href={link.href} class="relative flex items-center gap-3 rounded-2xl border border-stone-200/70 p-3 text-xs font-bold {Active ? `bg-${$color}-600 text-white border-${$color}-600` : 'bg-white/45 text-stone-700 dark:border-white/10 dark:bg-white/5 dark:text-stone-200'}">
						<link.icon size={18} />
						{link.text}
						{#if link.text === 'Feedback' && newFeedbackCount > 0}<span class="ml-auto tabular-nums">{newFeedbackCount}</span>{/if}
					</a>
				{/each}
				<button type="button" onclick={() => { mobileMenuOpen = false; isOpen = true; }} class="col-span-2 flex items-center gap-3 rounded-2xl border border-stone-200/70 bg-white/45 p-3 text-left text-xs font-bold text-stone-700 dark:border-white/10 dark:bg-white/5 dark:text-stone-200">
					<CalendarRange size={18} />
					<span class="min-w-0 flex-1">
						<span class="block text-[9px] uppercase tracking-widest text-stone-400">Date range</span>
						<span class="block truncate tabular-nums">{formatDate(new Date(dashboardStore.dateRange.startDate))} – {formatDate(new Date(dashboardStore.dateRange.endDate))}</span>
					</span>
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	@media (max-width: 767px) {
		.mobile-domain-control :global(.select-container) {
			width: 100%;
		}

		.mobile-domain-control :global(#custom-select) {
			min-width: 0;
			border: 0;
			background: transparent;
			padding-inline: 0.5rem;
			font-size: 1rem;
		}

		.mobile-app-content :global(input),
		.mobile-app-content :global(select),
		.mobile-app-content :global(textarea) {
			min-height: 2.75rem;
			font-size: 16px;
		}

		.mobile-app-content :global(table) {
			min-width: 42rem;
		}

		.mobile-app-content :global(.overflow-x-auto) {
			-webkit-overflow-scrolling: touch;
			scrollbar-width: none;
		}

		.mobile-app-content :global(.overflow-x-auto::-webkit-scrollbar) {
			display: none;
		}
	}
</style>
