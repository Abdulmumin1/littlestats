<script>
	import { dashboardStore } from '$lib/stores/dashboard.svelte.js';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { api } from '$lib/api/analytics.ts';
	import { formatNumber } from '$lib/slug/helpers.js';
	import { getInclusiveRangeDays } from '$lib/utils/dateRange.js';
	import ViewCard from '$lib/components/analytics/viewCard.svelte';
	import ChartJsGraph from '$lib/components/analytics/graphStuff/chartJsGraph.svelte';
	import TrafficSkeleton from '$lib/components/analytics/graphStuff/trafficSkeleton.svelte';
	import LoadingBoundary from '$lib/components/generals/loadingBoundary.svelte';
	import Seo from '$lib/components/generals/seo.svelte';
	import { SOURCE_CHANNELS, channelTotals, isSameSiteSource, sourceFromCampaign } from '$lib/analytics/sourceChannels.js';
	import { Activity, Eye, Globe, Monitor, Smartphone, Tablet } from 'lucide-svelte';

	let { domain_id, current_domain = null, demoData = null } = $props();
	let siteId = $derived(domain_id);
	let isDemo = $derived(!!demoData);

	// State
	let loading = $state(true);
	let error = $state(null);
	let stats = $state(null);
	let timeSeries = $state([]);
	let acquisition = $state([]);
	let selectedSourceChannel = $state('All');
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
	let activeModal = $state(null); // 'pages' | 'countries' | null
	let modalSearch = $state('');
	let modalLoading = $state(false);
	let modalError = $state(null);
	let modalItems = $state([]);
	let modalAbortController = null;
	let modalRequestId = 0;

	function openModal(type) {
		activeModal = type;
		modalSearch = '';
		modalError = null;
	}

	function closeModal() {
		modalAbortController?.abort();
		activeModal = null;
		modalSearch = '';
		modalItems = [];
		modalError = null;
	}

	async function fetchModalData() {
		if (!activeModal || !siteId) return;
		const requestId = ++modalRequestId;
		modalAbortController?.abort();
		modalAbortController = new AbortController();
		const { signal } = modalAbortController;

		// Use demo data for modals
		if (isDemo && demoData) {
			modalLoading = true;
			modalError = null;
			try {
				let items = [];
				if (activeModal === 'pages') {
					items = demoData.allPages || demoData.pages || [];
				} else if (activeModal === 'countries') {
					items = demoData.allCountries || demoData.countries || [];
				}

				// Filter by search if provided
				if (modalSearch.trim()) {
					const search = modalSearch.trim().toLowerCase();
					items = items.filter(item => {
						const name = item.path || item.country || '';
						return name.toLowerCase().includes(search);
					});
				}

				if (requestId === modalRequestId) modalItems = items;
			} catch (err) {
				console.error('Modal fetch error:', err);
				modalError = err.message || 'Failed to load data';
				modalItems = [];
			} finally {
				if (requestId === modalRequestId) modalLoading = false;
			}
			return;
		}

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
				const res = await api.getPages(siteId, { limit: 100, filter, q: modalSearch.trim() || undefined, signal });
				if (requestId === modalRequestId) modalItems = res.pages || [];
			} else if (activeModal === 'countries') {
				const res = await api.getCountries(siteId, { limit: 100, filter, q: modalSearch.trim() || undefined, signal });
				if (requestId === modalRequestId) modalItems = res.countries || [];
			}
		} catch (err) {
			if (signal.aborted) return;
			console.error('Modal fetch error:', err);
			if (requestId === modalRequestId) {
				modalError = err.message || 'Failed to load data';
				modalItems = [];
			}
		} finally {
			if (requestId === modalRequestId) modalLoading = false;
		}
	}

	$effect(() => {
		if (!activeModal) return;
		const delay = modalSearch.trim() ? 200 : 0;
		const timeout = setTimeout(fetchModalData, delay);
		return () => {
			clearTimeout(timeout);
			modalAbortController?.abort();
		};
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
		if (isDemo) {
			// In demo mode, just log or handle differently since we can't navigate
			console.log('Demo mode: Filter toggle', kind, value);
			return;
		}
		const current = $page.url.searchParams.get(kind);
		const nextValue = current === value ? null : value;
		goto(nextSearchParams({ [kind]: nextValue }), { keepfocus: true, noScroll: true, replaceState: false });
	}

	function onKeyDown(e) {
		if (e.key === 'Escape' && activeModal) {
			closeModal();
		}
	}

	let rangeDays = $derived.by(() => {
		const start = dashboardStore?.dateRange?.startDate;
		const end = dashboardStore?.dateRange?.endDate;
		return getInclusiveRangeDays(start, end);
	});

	let timeSeriesGranularity = $derived.by(() => (rangeDays <= 2 ? 'hour' : 'day'));
	let chartSortInterval = $derived.by(() => (rangeDays <= 2 ? 1 : rangeDays));
	let dashboardAbortController = null;
	let dashboardRequestId = 0;

	// Fetch all data
	async function fetchDashboardData() {
		if (!siteId) return;
		const requestId = ++dashboardRequestId;
		dashboardAbortController?.abort();
		dashboardAbortController = new AbortController();
		const { signal } = dashboardAbortController;

		loading = true;
		error = null;

		try {
			// Use demo data if provided
			if (isDemo && demoData) {
				stats = demoData.stats;
				timeSeries = demoData.timeSeries || [];
				acquisition = (demoData.referrers || []).map((row) => ({
					bucket: row.referrer || 'Direct',
					visits: row.visits || row.views || 0,
					conversions: 0,
					conversionRate: 0
				}));
				pages = demoData.pages || [];
				countries = demoData.countries || [];
				devices = demoData.devices || [];
				if (requestId === dashboardRequestId) loading = false;
				return;
			}

			const filter = {
				...dashboardStore.dateRange,
				urlPattern: drilldown.pagePath || undefined,
				referrerDomain: drilldown.referrer || undefined,
				country: drilldown.country || undefined
			};

			const [statsData, seriesData, pagesData, countriesData, devicesData, acquisitionData] = await Promise.all([
				api.getStatsSummary(siteId, filter, signal),
				api.getTimeSeries(siteId, filter, timeSeriesGranularity, signal),
				api.getPages(siteId, { limit: 5, filter, signal }),
				api.getCountries(siteId, { limit: 5, filter, signal }),
				api.getDevices(siteId, filter, signal),
				api.getCampaigns(siteId, filter, 100)
			]);
			if (requestId !== dashboardRequestId) return;

			stats = statsData;
			timeSeries = seriesData.data || [];
			acquisition = acquisitionData.campaigns || [];
			pages = pagesData.pages || [];
			countries = countriesData.countries || [];
			devices = devicesData.devices || [];
		} catch (err) {
			if (signal.aborted) return;
			console.error('Dashboard error:', err);
			if (requestId === dashboardRequestId) error = err.message || 'Failed to load dashboard data';
		} finally {
			if (requestId === dashboardRequestId) loading = false;
		}
	}

	// Real-time updates (disabled in demo mode)
	$effect(() => {
		if (siteId && dashboardStore.dateRange) {
			fetchDashboardData();
		}
		return () => dashboardAbortController?.abort();
	});

	$effect(() => {
		if (!siteId || !browser || isDemo) return;
		realtimeStats = null;
		return api.connectRealtime(siteId, (data) => {
			realtimeStats = data;
		});
	});

	// Calculate device icon
	function getDeviceIcon(device) {
		switch (device?.toLowerCase()) {
			case 'mobile': return Smartphone;
			case 'tablet': return Tablet;
			default: return Monitor;
		}
	}

	let sourceRows = $derived(
		acquisition
			.map(sourceFromCampaign)
			.filter((row) => !isSameSiteSource(row.source, current_domain?.domain || current_domain?.name || ''))
	);
	let sourceTotals = $derived(channelTotals(sourceRows));
	let visibleSources = $derived(
		sourceRows
			.filter((row) => selectedSourceChannel === 'All' || row.channel === selectedSourceChannel)
			.slice()
			.sort((a, b) => b.visits - a.visits)
			.slice(0, 5)
	);
	let allSourceVisits = $derived(sourceRows.reduce((total, row) => total + Number(row.visits || 0), 0));
</script>

<LoadingBoundary loading={loading && !stats} label="Loading traffic analytics">
	{#snippet fallback()}
		<TrafficSkeleton />
	{/snippet}

	<div class="space-y-8">
	{#if error}
		<div class="flex min-h-[40vh] items-center rounded-none">
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
	{#if drilldown.pagePath || drilldown.referrer || drilldown.country || drilldown.pagePath}
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
{/if}
		<div class="flex min-h-[60vh] flex-col  rounded-none ">
			<!-- Real-time indicator -->
			<div class="flex mb-5 md:mb-8 h-7 items-center gap-2 px-4 rounded-none bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 w-fit text-[10px] font-black text-stone-500 dark:text-stone-400 uppercase tracking-widest leading-none">
				<span class="relative flex h-1.5 w-1.5 rounded-none">
					{#if realtimeStats}
						<span class="absolute inline-flex h-1.5 w-1.5 animate-ping rounded-none bg-green-400 opacity-75"></span>
					{/if}
					<span class="relative inline-flex h-1.5 w-1.5 rounded-none {realtimeStats ? 'bg-green-500' : 'bg-stone-300 dark:bg-stone-700'}"></span>
				</span>
				<span>{realtimeStats?.activeVisitors ?? 0} active visitors now</span>
			</div>

			<!-- Stats Cards -->
			<div class="grid mb-5 md:mb-8 grid-cols-2 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-5 rounded-none [&>*:last-child]:col-span-2 lg:[&>*:last-child]:col-span-1">
				<ViewCard
					name="Views"
					number={stats.views}
					percentage={stats.change.views}
					icon={Eye}
					hint="Page loads during the selected period"
				/>
				<ViewCard
					name="Visits"
					number={stats.visits}
					percentage={stats.change.visits}
					icon={Activity}
					hint="Distinct browsing sessions"
				/>
				<ViewCard
					name="Visitors"
					number={stats.visitors}
					percentage={stats.change.visitors}
					icon={Globe}
					hint="Distinct visitors during the selected period"
				/>
				<ViewCard
					name="Bounce Rate"
					number={stats.bounceRate}
					percentage={stats.change.bounceRate}
					type="percent"
					hint="Visits with exactly one page view"
				/>
                <ViewCard
					name="Avg. Session"
					number={stats.avgDuration}
					percentage={stats.change.avgDuration}
					type="time"
					hint="Average recorded visit duration"
				/>
			</div>

			<!-- Main Chart -->
				<div class="rounded-none">
					<ChartJsGraph
						chartD={{ data: timeSeries, label: 'Views' }}
						showChart={true}
						sortInterval={chartSortInterval}
						rangeStart={dashboardStore?.dateRange?.startDate}
						rangeEnd={dashboardStore?.dateRange?.endDate}
					/>
				</div>

			<!-- Breakdown Sections -->
			<div class="grid grid-cols-1 gap-6 lg:grid-cols-2 rounded-none">
				<!-- Top Pages -->
				<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 overflow-hidden flex flex-col">
					<div class="px-4 md:px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-white/50 dark:bg-stone-900/50 rounded-none h-14">
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

				<!-- Traffic Sources -->
				<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 overflow-hidden flex flex-col">
					<div class="px-4 md:px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-white/50 dark:bg-stone-900/50 rounded-none h-14">
						<span class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 rounded-none">Traffic Sources</span>
						<a
							href={`/site/${$page.params.slug}/campaigns`}
							class="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
						>
							Open acquisition →
						</a>
					</div>
					<div class="flex flex-1 flex-col rounded-none p-2">
						<div class="mb-2 flex flex-wrap gap-1.5 px-1 pt-1" aria-label="Filter traffic sources">
							{#each SOURCE_CHANNELS as channel (channel)}
								{@const count = channel === 'All' ? allSourceVisits : sourceTotals.get(channel) || 0}
								<button type="button" onclick={() => (selectedSourceChannel = channel)} class="border px-2 py-1 text-[10px] font-bold transition-colors {selectedSourceChannel === channel ? 'border-stone-900 bg-stone-900 text-white dark:border-white dark:bg-white dark:text-stone-900' : 'border-stone-200 bg-white text-stone-500 hover:border-stone-400 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-400'}">
									{channel} <span class="ml-0.5 opacity-60 tabular-nums">{count.toLocaleString()}</span>
								</button>
							{/each}
						</div>
						{#if sourceRows.length === 0}
							<p class="py-10 text-center text-stone-400 italic font-serif text-sm rounded-none">No data available</p>
						{:else if visibleSources.length === 0}
							<p class="py-10 text-center text-stone-400 text-sm rounded-none">No {selectedSourceChannel.toLowerCase()} visits in this period</p>
						{:else}
							<div class="space-y-0.5 rounded-none">
								{#each visibleSources as source (source.bucket)}
									<div class="flex w-full items-center justify-between border border-stone-200 px-5 py-3 dark:border-stone-800">
										<div class="min-w-0">
											<div class="flex items-center gap-2">
												<span class="truncate text-xs font-medium text-stone-600 dark:text-stone-400">{source.source}</span>
												<span class="shrink-0 text-[9px] font-bold uppercase tracking-wide text-stone-400">{source.channel}</span>
											</div>
											{#if source.detail}<p class="mt-0.5 truncate text-[10px] text-stone-400">{source.detail}</p>{/if}
										</div>
										<span class="text-sm font-bold text-stone-900 dark:text-white tabular-nums rounded-none">{source.visits || 0}</span>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</div>

				<!-- Countries -->
				<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 overflow-hidden flex flex-col">
					<div class="px-4 md:px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-white/50 dark:bg-stone-900/50 rounded-none h-14">
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
					<div class="px-4 md:px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-white/50 dark:bg-stone-900/50 rounded-none">
						<span class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 rounded-none">Devices</span>
						<span class="text-xs font-bold text-stone-900 dark:text-white font-serif italic rounded-none">Views</span>
					</div>
					<div class="p-4 md:p-6 flex-1 rounded-none">
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
			class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/20 backdrop-blur-sm p-4 sm:p-6 "
		>
			<button
				type="button"
				class="absolute inset-0 cursor-default border-none bg-transparent"
				onclick={closeModal}
				aria-label="Close modal"
			></button>
			<div
				class="relative bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 w-full min-h-[40vh] max-w-2xl max-h-[80vh] flex flex-col shadow-2xl rounded-none cursor-auto"
				role="dialog"
				aria-modal="true"
				tabindex="-1"
			>
				<div class="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-950/50">
					<div>
						<h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
							{activeModal === 'pages' ? 'All Pages' : 'All Countries'}
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
								<p class="text-stone-400 italic font-serif text-sm ">Loading…</p>
							</div>
						{:else if modalError}
							<div class="py-20 text-center">
								<p class="text-stone-400 italic font-serif text-sm">{modalError}</p>
							</div>
						{:else}
						{#each modalData as item (item.path || item.code || item.country)}
							{@const name = item.path || item.country || 'Unknown'}
							{@const filterKind = activeModal === 'pages' ? 'page' : 'country'}
							{@const filterValue = activeModal === 'pages' ? item.path : (item.code || item.country || 'XX')}
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
</LoadingBoundary>
