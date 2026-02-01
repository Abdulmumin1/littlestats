<script>
	import { dashboardStore } from '$lib/stores/dashboard.svelte.js';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { color } from '$lib/colors/mixer.js';
	import { api } from '$lib/api/analytics.ts';
	import { formatNumber } from '$lib/slug/helpers.js';
	import ViewCard from '$lib/components/analytics/viewCard.svelte';
	import ChartJsGraph from '$lib/components/analytics/graphStuff/chartJsGraph.svelte';
	import LoadingState from '$lib/components/analytics/graphStuff/loadingState.svelte';
	import SectionWrapper from '$lib/components/analytics/sectionWrapper.svelte';
	import PageItem from '$lib/components/analytics/pageItem.svelte';
	import Seo from '$lib/components/generals/seo.svelte';
	import { Activity, Eye, Clock, ArrowUpRight, Globe, Monitor, Smartphone, Tablet } from 'lucide-svelte';
	let { data } = $props();
	let siteId = $derived(data.siteId);
	
	// State
	let loading = $state(true);
	let error = $state(null);
	let stats = $state(null);
	let timeSeries = $state([]);
	let referrers = $state([]);
	let pages = $state([]);
	let countries = $state([]);
	let devices = $state([]);
	let realtimeStats = $state(null);

	// Drilldown filters (URL-driven)
	let drilldown = $derived.by(() => {
		const sp = $page.url.searchParams;
		const pagePath = sp.get('page');
		const referrer = sp.get('referrer');
		const country = sp.get('country');
		return {
			pagePath,
			referrer,
			country
		};
	});

	// Modal State
	let activeModal = $state(null); // 'pages' | 'referrers' | 'countries' | null
	let modalSearch = $state('');
	let modalLoading = $state(false);
	let modalError = $state(null);
	let modalItems = $state([]);

	async function openModal(type) {
		activeModal = type;
		modalSearch = '';
		modalError = null;
		await fetchModalData();
	}

	function closeModal() {
		activeModal = null;
		modalSearch = '';
		modalItems = [];
		modalError = null;
	}

	async function fetchModalData() {
		if (!activeModal || !siteId) return;
		modalLoading = true;
		modalError = null;
		try {
			const filter = {
				...dashboardStore.dateRange,
				urlPattern: drilldown.pagePath || undefined,
				referrerDomain: drilldown.referrer || undefined,
				country: drilldown.country || undefined
			};

			if (activeModal === 'pages') {
				const res = await api.getPages(siteId, { limit: 100, filter, q: modalSearch.trim() || undefined });
				modalItems = res.pages || [];
			} else if (activeModal === 'referrers') {
				const res = await api.getReferrers(siteId, { limit: 100, filter, q: modalSearch.trim() || undefined });
				modalItems = res.referrers || [];
			} else if (activeModal === 'countries') {
				const res = await api.getCountries(siteId, { limit: 100, filter, q: modalSearch.trim() || undefined });
				modalItems = res.countries || [];
			}
		} catch (err) {
			console.error('Modal fetch error:', err);
			modalError = err.message || 'Failed to load data';
			modalItems = [];
		} finally {
			modalLoading = false;
		}
	}

	$effect(() => {
		if (activeModal) {
			fetchModalData();
		}
	});

	let modalData = $derived.by(() => modalItems);

	let modalTotal = $derived.by(() => {
		if (activeModal === 'pages') return stats?.views || 0;
		return modalData.reduce((acc, item) => acc + (item.views || 0), 0);
	});

	function nextSearchParams(updates) {
		const url = new URL($page.url);
		for (const [k, v] of Object.entries(updates)) {
			if (v == null || v === '') url.searchParams.delete(k);
			else url.searchParams.set(k, String(v));
		}
		return url;
	}

	function toggleFilter(kind, value) {
		const current = $page.url.searchParams.get(kind);
		const nextValue = current === value ? null : value;
		goto(nextSearchParams({ [kind]: nextValue }), { keepfocus: true, noScroll: true, replaceState: false });
	}

	let modalSearchTimeout;
	$effect(() => {
		if (!activeModal) return;
		clearTimeout(modalSearchTimeout);
		modalSearchTimeout = setTimeout(() => {
			fetchModalData();
		}, 200);
	});

	function onKeyDown(e) {
		if (e.key === 'Escape' && activeModal) {
			closeModal();
		}
	}

	let rangeDays = $derived.by(() => {
		const start = dashboardStore?.dateRange?.startDate;
		const end = dashboardStore?.dateRange?.endDate;
		if (!start || !end) return 1;
		const startTime = new Date(start).getTime();
		const endTime = new Date(end).getTime();
		if (Number.isNaN(startTime) || Number.isNaN(endTime)) return 1;
		return Math.max(1, Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24)));
	});

	let timeSeriesGranularity = $derived.by(() => (rangeDays <= 2 ? 'hour' : 'day'));
	let chartSortInterval = $derived.by(() => (rangeDays <= 2 ? 1 : rangeDays));
	
	// Fetch all data
	async function fetchDashboardData() {
		if (!siteId) return;
		
		loading = true;
		error = null;
		
		try {
			const filter = {
				...dashboardStore.dateRange,
				urlPattern: drilldown.pagePath || undefined,
				referrerDomain: drilldown.referrer || undefined,
				country: drilldown.country || undefined
			};

			const [statsData, seriesData, refsData, pagesData, countriesData, devicesData] = await Promise.all([
				api.getStatsSummary(siteId, filter),
				api.getTimeSeries(siteId, filter, timeSeriesGranularity),
				api.getReferrers(siteId, { limit: 5, filter }),
				api.getPages(siteId, { limit: 5, filter }),
				api.getCountries(siteId, { limit: 5, filter }),
				api.getDevices(siteId)
			]);
			
			stats = statsData;
			timeSeries = seriesData.data || [];
			referrers = refsData.referrers || [];
			pages = pagesData.pages || [];
			countries = countriesData.countries || [];
			devices = devicesData.devices || [];
		} catch (err) {
			console.error('Dashboard error:', err);
			error = err.message || 'Failed to load dashboard data';
		} finally {
			loading = false;
		}
	}
	
	// Real-time updates
	let disconnectRealtime = $state(null);
	
	function setupRealtime() {
		if (!siteId || !browser) return;
		
		disconnectRealtime = api.connectRealtime(siteId, (data) => {
			realtimeStats = data;
		});
	}
	
	$effect(() => {
		if (siteId && dashboardStore.dateRange) {
			fetchDashboardData();
			setupRealtime();
		}
	});
	
	
	onDestroy(() => {
		if (disconnectRealtime) {
			disconnectRealtime();
		}
	});
	
	// Calculate device icon
	function getDeviceIcon(device) {
		switch (device?.toLowerCase()) {
			case 'mobile': return Smartphone;
			case 'tablet': return Tablet;
			default: return Monitor;
		}
	}
</script>

<svelte:head>
	<Seo title={`${data.site?.name || 'Site'} - Analytics Dashboard`} />
</svelte:head>

<div class="min-h-screen p-6 text-stone-900 dark:text-stone-100 space-y-8 max-w-7xl mx-auto rounded-none">
	{#if loading && !stats}
		<LoadingState />
	{/if}

	{#if error}
		<div class="container mx-auto rounded-none">
			<div class="rounded-none bg-red-100 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-200">
				<p class="font-semibold rounded-none">Error loading dashboard</p>
				<p class="text-sm rounded-none">{error}</p>
				<button 
					onclick={fetchDashboardData}
					class="mt-2 rounded-none bg-red-200 px-4 py-2 text-sm font-medium hover:bg-red-300 dark:bg-red-800 dark:hover:bg-red-700"
				>
					Retry
				</button>
			</div>
		</div>
	{/if}

	{#if stats}
		<div class="flex flex-wrap gap-2">
			{#if drilldown.pagePath}
				<button onclick={() => toggleFilter('page', drilldown.pagePath)} class="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-none">
					Page: {drilldown.pagePath}
				</button>
			{/if}
			{#if drilldown.referrer}
				<button onclick={() => toggleFilter('referrer', drilldown.referrer)} class="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-none">
					Referrer: {drilldown.referrer}
				</button>
			{/if}
			{#if drilldown.country}
				<button onclick={() => toggleFilter('country', drilldown.country)} class="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-none">
					Country: {drilldown.country}
				</button>
			{/if}
			{#if drilldown.pagePath || drilldown.referrer || drilldown.country}
				<button onclick={() => goto(nextSearchParams({ page: null, referrer: null, country: null }), { keepfocus: true, noScroll: true })} class="px-3 py-1 text-[10px] font-black uppercase tracking-widest border border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 rounded-none">
					Clear
				</button>
			{/if}
		</div>
		<div class="flex flex-col gap-8 rounded-none">
			<!-- Real-time indicator -->
			{#if realtimeStats}
				<div class="flex items-center gap-2 px-4 py-1.5 rounded-none bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 w-fit text-[10px] font-black text-stone-500 dark:text-stone-400 uppercase tracking-widest leading-none">
					<span class="flex h-1.5 w-1.5 rounded-none">
						<span class="absolute inline-flex h-1.5 w-1.5 animate-ping rounded-none bg-green-400 opacity-75"></span>
						<span class="relative inline-flex h-1.5 w-1.5 rounded-none bg-green-500"></span>
					</span>
					<span>{realtimeStats.activeVisitors} active visitors now</span>
				</div>
			{/if}
			
			<!-- Stats Cards -->
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 rounded-none">
				<ViewCard 
					name="Views" 
					number={stats.views} 
					percentage={stats.change.views}
					icon={Eye}
				/>
				<ViewCard 
					name="Visits" 
					number={stats.visits} 
					percentage={stats.change.visits}
					icon={Activity}
				/>
				<ViewCard 
					name="Visitors" 
					number={stats.visitors} 
					percentage={stats.change.visitors}
					icon={Globe}
				/>
				<ViewCard 
					name="Bounce Rate" 
					number={stats.bounceRate} 
					percentage={stats.change.bounceRate}
					type="percent"
				/>
                <ViewCard 
					name="Avg. Session" 
					number={stats.avgDuration} 
					percentage={stats.change.avgDuration}
					type="time"
				/>
			</div>
			
			<!-- Main Chart -->
			<div class="rounded-none bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-6 relative overflow-hidden">
				<div class="h-95 rounded-none">
					<ChartJsGraph
						chartD={{ data: timeSeries, label: 'Views' }}
						showChart={true}
						sortInterval={chartSortInterval}
						rangeStart={dashboardStore?.dateRange?.startDate}
						rangeEnd={dashboardStore?.dateRange?.endDate}
					/>
				</div>
			</div>
			
			<!-- Breakdown Sections -->
			<div class="grid grid-cols-1 gap-6 lg:grid-cols-2 rounded-none">
				<!-- Top Pages -->
				<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 overflow-hidden flex flex-col">
					<div class="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-white/50 dark:bg-stone-900/50 rounded-none h-14">
						<span class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 rounded-none">Top Pages</span>
						<button 
							onclick={() => openModal('pages')}
							class="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
						>
							See more →
						</button>
					</div>
					<div class="p-2 flex-1 rounded-none">
						{#if pages.length === 0}
							<p class="py-10 text-center text-stone-400 italic font-serif text-sm rounded-none">No data available</p>
						{:else}
							<div class="space-y-0.5 rounded-none">
								{#each pages as page (page.path)}
									<button onclick={() => toggleFilter('page', page.path)} class="w-full text-left px-5 py-3 flex justify-between items-center group border border-stone-200 dark:border-stone-800 rounded-none transition-all duration-300 hover:bg-white dark:hover:bg-stone-800">
										<span class="text-xs font-medium text-stone-600 dark:text-stone-400 font-mono truncate max-w-[75%] rounded-none">{page.path}</span>
										<span class="text-sm font-bold text-stone-900 dark:text-white tabular-nums rounded-none">{page.views || 0}</span>
									</button>
								{/each}
							</div>
						{/if}
					</div>
				</div>
				
				<!-- Top Referrers -->
				<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 overflow-hidden flex flex-col">
					<div class="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-white/50 dark:bg-stone-900/50 rounded-none h-14">
						<span class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 rounded-none">Top Referrers</span>
						<button 
							onclick={() => openModal('referrers')}
							class="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
						>
							See more →
						</button>
					</div>
					<div class="p-2 flex-1 rounded-none">
						{#if referrers.length === 0}
							<p class="py-10 text-center text-stone-400 italic font-serif text-sm rounded-none">No data available</p>
						{:else}
							<div class="space-y-0.5 rounded-none">
								{#each referrers as ref (ref.referrer)}
									<button onclick={() => toggleFilter('referrer', ref.referrer || 'Direct')} class="w-full text-left px-5 py-3 flex justify-between items-center group hover:bg-white dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 rounded-none transition-all duration-300">
										<span class="text-xs font-medium text-stone-600 dark:text-stone-400 truncate max-w-[75%] rounded-none">{ref.referrer || 'Direct'}</span>
										<span class="text-sm font-bold text-stone-900 dark:text-white tabular-nums rounded-none">{ref.views || 0}</span>
									</button>
								{/each}
							</div>
						{/if}
					</div>
				</div>
				
				<!-- Countries -->
				<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 overflow-hidden flex flex-col">
					<div class="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-white/50 dark:bg-stone-900/50 rounded-none h-14">
						<span class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 rounded-none">Countries</span>
						<button 
							onclick={() => openModal('countries')}
							class="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
						>
							See more →
						</button>
					</div>
					<div class="p-2 flex-1 rounded-none">
						{#if countries.length === 0}
							<p class="py-10 text-center text-stone-400 italic font-serif text-sm rounded-none">No data available</p>
						{:else}
							<div class="space-y-0.5 rounded-none">
								{#each countries as country (country.country)}
									<button onclick={() => toggleFilter('country', country.code || country.country || 'XX')} class="w-full text-left px-5 py-3 flex justify-between items-center group hover:bg-white dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 rounded-none transition-all duration-300">
										<span class="text-xs font-medium text-stone-600 dark:text-stone-400 truncate max-w-[75%] rounded-none">{country.country || 'Unknown'}</span>
										<span class="text-sm font-bold text-stone-900 dark:text-white tabular-nums rounded-none">{country.views || 0}</span>
									</button>
								{/each}
							</div>
						{/if}
					</div>
				</div>
				
				<!-- Devices -->
				<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 overflow-hidden flex flex-col">
					<div class="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-white/50 dark:bg-stone-900/50 rounded-none">
						<span class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 rounded-none">Devices</span>
						<span class="text-xs font-bold text-stone-900 dark:text-white font-serif italic rounded-none">Views</span>
					</div>
					<div class="p-6 flex-1 rounded-none">
						{#if devices.length === 0}
							<p class="py-10 text-center text-stone-400 italic font-serif text-sm rounded-none">No data available</p>
						{:else}
							<div class="space-y-4 rounded-none">
								{#each devices as device (device.device)}
									{@const Icon = getDeviceIcon(device.device)}
									<div class="space-y-2 rounded-none">
										<div class="flex items-center justify-between rounded-none">
											<div class="flex items-center gap-2 rounded-none">
												<Icon size={14} class="text-stone-400" />
												<span class="text-xs font-bold text-stone-900 dark:text-white capitalize tracking-tight leading-none rounded-none">{device.device}</span>
											</div>
											<span class="text-[10px] font-black text-stone-900 dark:text-white tabular-nums leading-none rounded-none">{formatNumber(device.views || 0)}</span>
										</div>
										<div class="h-1 rounded-none bg-stone-200 dark:bg-stone-800 overflow-hidden">
											<div 
												class="h-full bg-stone-900 dark:bg-stone-100 transition-all duration-500 rounded-none"
												style="width: {stats.views > 0 ? (device.views / stats.views) * 100 : 0}%"
											></div>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/if}

	{#if activeModal}
		<div 
			class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/20 backdrop-blur-sm p-4 sm:p-6"
		>
			<button 
				type="button"
				class="absolute inset-0 cursor-default border-none bg-transparent"
				onclick={closeModal}
				aria-label="Close modal"
			></button>
			<div 
				class="relative bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl rounded-none cursor-auto"
				role="dialog"
				aria-modal="true"
				tabindex="-1"
			>
				<div class="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-950/50">
					<div>
						<h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
							{#if activeModal === 'pages'}All Pages{:else if activeModal === 'referrers'}All Referrers{:else}All Countries{/if}
						</h3>
						<p class="text-xs font-bold text-stone-900 dark:text-white font-serif italic truncate">Site Overview</p>
					</div>
					<button 
						onclick={closeModal}
						class="text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors p-2"
					>
						<Activity size={16} class="rotate-45" />
					</button>
				</div>
				
				<div class="p-4 border-b border-stone-100 dark:border-stone-800">
					<input
						bind:value={modalSearch}
						placeholder="Search {activeModal}..."
						class="w-full px-4 py-2 text-xs font-bold rounded-none border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-stone-500 transition-all"
					/>
				</div>

				<div class="flex-1 overflow-y-auto p-2">
					<div class="flex w-full flex-col gap-0.5">
						{#if modalLoading}
							<div class="py-20 text-center">
								<p class="text-stone-400 italic font-serif text-sm">Loading…</p>
							</div>
						{:else if modalError}
							<div class="py-20 text-center">
								<p class="text-stone-400 italic font-serif text-sm">{modalError}</p>
							</div>
						{:else}
							{#each modalData as item}
								{@const name = item.path || item.referrer || item.country || 'Unknown'}
								{@const filterKind = activeModal === 'pages' ? 'page' : activeModal === 'referrers' ? 'referrer' : 'country'}
								{@const filterValue = activeModal === 'pages'
									? item.path
									: activeModal === 'referrers'
										? (item.referrer || 'Direct')
										: (item.code || item.country || 'XX')}
								<div class="relative h-fit w-full">
									<div
										class="bg-stone-900 dark:bg-stone-100 absolute h-full rounded-none opacity-[0.06]"
										style="width: {modalTotal > 0 ? ((item.views || 0) / modalTotal) * 100 : 0}%;"
									></div>
									<button onclick={() => { toggleFilter(filterKind, filterValue); closeModal(); }} class="w-full text-left flex justify-between gap-2 px-5 py-3 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-none transition-all duration-300 border border-transparent hover:border-stone-200 dark:hover:border-stone-800">
										<span class="text-xs font-bold text-stone-900 dark:text-white truncate">{name}</span>
										<span class="text-xs font-bold text-stone-900 dark:text-white tabular-nums">{(item.views || 0).toLocaleString()}</span>
									</button>
								</div>
							{:else}
								<div class="py-20 text-center">
									<p class="text-stone-400 italic font-serif text-sm">No matches found</p>
								</div>
							{/each}
						{/if}
					</div>
				</div>
				
				<div class="px-6 py-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/50 flex justify-between items-center">
					<span class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
						{modalData.length} items
					</span>
					<button 
						onclick={closeModal}
						class="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:opacity-90 transition-opacity rounded-none"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
