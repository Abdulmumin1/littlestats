<script>
	import { flip } from 'svelte/animate';
	import EmptyValues from '$lib/components/analytics/emptyValues.svelte';

	import ChartJsGraph from '$lib/components/analytics/graphStuff/chartJsGraph.svelte';

	import { Search, Activity, Globe, Users, MoreVertical, Check, ChevronDown } from 'lucide-svelte';
	import CustomSelect from '$lib/components/generals/customSelect.svelte';
	import {
		sortReferals,
		sortCountryData,
		sumData
	} from '$lib/events/helpers.js';
	import { executeInWorker } from '$lib/utils';

	let { 
		page_data = [],
		eventCounts = [],
		selectedEventName = null,
		selectEvent = () => {},
		loadMore = () => {},
		nextCursor = null,
		loadingLog = false,
		totalLogEvents = 0,
		logLimit = 100,
		rangeStart = undefined,
		rangeEnd = undefined
	} = $props();

	let rangeDays = $derived.by(() => {
		if (!rangeStart || !rangeEnd) return 1;
		const startTime = new Date(rangeStart).getTime();
		const endTime = new Date(rangeEnd).getTime();
		if (Number.isNaN(startTime) || Number.isNaN(endTime)) return 1;
		return Math.max(1, Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24)));
	});

	let sortInterval = $derived.by(() => (rangeDays <= 2 ? 1 : rangeDays));

	// Use eventCounts from backend for the event name list (full date range totals)
	let events = $derived.by(() => {
		return eventCounts.map(e => [e.name, e.count]);
	});

	// Active event is determined by selectedEventName or first in list
	let activeEventTitle = $derived(selectedEventName || (events.length > 0 ? events[0][0] : '-'));
	
	// For the chart and detail views, use page_data (the paginated event log)
	let activeEventData = $derived(page_data || []);

	let eventSearch = $state('');
	let detailSearch = $state('');
	let filterPage = $state('');
	let filterReferrer = $state('');
	let filterHasCampaign = $state(false);

	let visibleEvents = $derived.by(() => {
		const list = events || [];
		const q = eventSearch.trim().toLowerCase();
		if (!q) return list;
		return list.filter(([name]) => String(name || '').toLowerCase().includes(q));
	});

	function hasCampaign(eventData) {
		const data = safeJsonParse(eventData);
		return !!(data && typeof data === 'object' && (data.campaign || data.utm_campaign));
	}

	let filteredActiveEventData = $derived.by(() => {
		const rows = activeEventData || [];
		const q = detailSearch.trim().toLowerCase();
		const pageFilter = String(filterPage || '').trim();
		const refFilter = String(filterReferrer || '').trim();
		return rows.filter((event) => {
			if (filterHasCampaign && !hasCampaign(event?.event_data)) return false;
			const page = getPagePath(event?.url) || '';
			const ref = getReferrerHost(event?.referrer) || '';
			if (pageFilter && page !== pageFilter) return false;
			if (refFilter && ref !== refFilter) return false;
			if (!q) return true;
			const user = event?.user_id || '';
			const props = summarizeEventData(event?.event_data).join(' ');
			return `${page} ${ref} ${user} ${props}`.toLowerCase().includes(q);
		});
	});

	let availablePages = $derived.by(() => {
		const set = new Set();
		for (const e of activeEventData || []) {
			const p = getPagePath(e?.url);
			if (p) set.add(p);
		}
		return Array.from(set.values()).sort((a, b) => String(a).localeCompare(String(b)));
	});

	let availableReferrers = $derived.by(() => {
		const set = new Set();
		for (const e of activeEventData || []) {
			const r = getReferrerHost(e?.referrer);
			if (r) set.add(r);
		}
		return Array.from(set.values()).sort((a, b) => String(a).localeCompare(String(b)));
	});

	let activeTotals = $derived.by(() => {
		const rows = filteredActiveEventData || [];
		const users = new Set();
		const pages = new Map();
		const referrers = new Map();
		for (const e of rows) {
			if (e?.user_id) users.add(e.user_id);
			const page = getPagePath(e?.url);
			if (page) pages.set(page, (pages.get(page) || 0) + 1);
			const ref = getReferrerHost(e?.referrer);
			if (ref) referrers.set(ref, (referrers.get(ref) || 0) + 1);
		}
		return {
			triggers: rows.length,
			uniqueUsers: users.size,
			topPage: maxByCount(pages),
			topReferrer: maxByCount(referrers)
		};
	});

	let sortedReferals = $state([]);
	let sortedCountryData = $state([]);

	$effect(async () => {
		let dataSnapshot = $state.snapshot(filteredActiveEventData);
		if (!dataSnapshot || dataSnapshot.length === 0) {
			sortedReferals = [];
			sortedCountryData = [];
			return;
		}
		sortedReferals = await executeInWorker(sortReferals, dataSnapshot)
		sortedCountryData = await executeInWorker(sortCountryData, dataSnapshot)
	});

	// $effect(() => {
	// 	$inspect(a);
	// });

	let sumReferalData = $state(0);
	let sumCountryData = $state(0);

	$effect(async () => {
		let dataSnapshot = $state.snapshot(sortedReferals);
		if (!dataSnapshot || dataSnapshot.length === 0) {
			sumReferalData = 0;
			return;
		}
		sumReferalData = await executeInWorker(sumData, dataSnapshot);
	});

	$effect(async () => {
		let dataSnapshot = $state.snapshot(sortedCountryData);
		if (!dataSnapshot || dataSnapshot.length === 0) {
			sumCountryData = 0;
			return;
		}
		sumCountryData = await executeInWorker(sumData, dataSnapshot);
	});

	let expanded = $state(null);

	function getPagePath(url) {
		if (!url) return '';
		try {
			const u = new URL(url);
			return u.pathname || '/';
		} catch {
			return String(url);
		}
	}

	function maxByCount(map) {
		let best = null;
		for (const [key, val] of map.entries()) {
			if (!best || val > best.count) best = { key, count: val };
		}
		return best;
	}

	function safeJsonParse(str) {
		if (!str || typeof str !== 'string') return null;
		try {
			return JSON.parse(str);
		} catch {
			return null;
		}
	}

	function summarizeEventData(eventData) {
		const data = safeJsonParse(eventData);
		if (!data || typeof data !== 'object') return [];
		const entries = Object.entries(data)
			.filter(([k, v]) => k !== 'memory' && v !== null && v !== undefined)
			.map(([k, v]) => {
				if (typeof v === 'string') return `${k}: ${v}`;
				if (typeof v === 'number' || typeof v === 'boolean') return `${k}: ${String(v)}`;
				try {
					return `${k}: ${JSON.stringify(v)}`;
				} catch {
					return `${k}: [object]`;
				}
			})
			.sort((a, b) => a.localeCompare(b));
		return entries.slice(0, 3);
	}

	function getReferrerHost(referrer) {
		try {
			const url = new URL(referrer);
			return url.hostname;
		} catch {
			return referrer || 'Direct';
		}
	}

	let activeModal = $state(null); // 'referrers' | 'countries' | null
	let modalSearch = $state('');

	function openModal(type) {
		activeModal = type;
		modalSearch = '';
	}

	function closeModal() {
		activeModal = null;
		modalSearch = '';
	}

	let modalData = $derived.by(() => {
		if (!activeModal) return [];
		const source = activeModal === 'referrers' ? sortedReferals : sortedCountryData;
		const q = modalSearch.trim().toLowerCase();
		if (!q) return source;
		return source.filter(([name]) => String(name || '').toLowerCase().includes(q));
	});

	let modalTotal = $derived(modalData.reduce((acc, [_, val]) => acc + val, 0));
	function onKeyDown(e) {
		if (e.key === 'Escape' && activeModal) {
			closeModal();
		}
	}
</script>

<svelte:window onkeydown={onKeyDown} />

<div class="space-y-8">
	<div class="px-2">
		<h1 class="text-xl font-bold text-stone-900 dark:text-white tracking-tight">Events</h1>
		<p class="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mt-1">Track, validate, and debug product actions</p>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
		<div class="lg:col-span-4 space-y-4">
			<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 p-4 shadow-none">
				<div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-3">
					<Search size={12} />
					Events
				</div>
				<input
					bind:value={eventSearch}
					placeholder="Search event name"
					class="w-full px-4 py-2 text-xs font-bold rounded-none border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-stone-500 transition-all"
				/>
			</div>

			<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 overflow-hidden shadow-none">
				<div class="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-white/50 dark:bg-stone-900/50 rounded-none">
					<h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Event names</h2>
					<span class="text-xs font-bold text-stone-900 dark:text-white font-serif italic text-opacity-50">Triggers</span>
				</div>
				<div class="p-2">
					{#if visibleEvents.length === 0}
						<p class="py-10 text-center text-stone-400 italic font-serif text-sm">No events found</p>
					{:else}
						<div class="space-y-0.5">
							{#each visibleEvents as [eventName, eventCount], index (eventName)}
								{@const isActive = selectedEventName === eventName || (!selectedEventName && index === 0)}
								<button
									type="button"
									onclick={() => {
										selectEvent(eventName);
										expanded = null;
									}}
									class={`w-full text-left px-5 py-3 flex items-center justify-between hover:bg-white dark:hover:bg-stone-800 rounded-none transition-all duration-300 border border-transparent hover:border-stone-200 dark:hover:border-stone-800 ${isActive ? `bg-white dark:bg-stone-950/40 border-stone-200 dark:border-stone-800` : ''}`}
								>
									<div class="min-w-0">
										<p class="text-sm font-bold text-stone-900 dark:text-white truncate">{eventName}</p>
										<p class="text-[10px] font-black uppercase tracking-widest text-stone-400 mt-1">{eventCount.toLocaleString()} triggers</p>
									</div>
									<span class="text-xs font-bold text-stone-900 dark:text-white tabular-nums">{eventCount.toLocaleString()}</span>
								</button>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>

		<div class="lg:col-span-8 space-y-6">
			<div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
				<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 p-4 transition-all duration-300 shadow-none">
					<div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2">
						<Activity size={12} />
						Triggers
					</div>
					<p class="text-xl font-bold text-stone-900 dark:text-white tabular-nums leading-none">{activeTotals.triggers.toLocaleString()}</p>
					<p class="text-[10px] font-black uppercase tracking-widest text-stone-400 mt-2 truncate">{activeEventTitle}</p>
				</div>
				<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 p-4 transition-all duration-300 shadow-none">
					<div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2">
						<Users size={12} />
						Users
					</div>
					<p class="text-xl font-bold text-stone-900 dark:text-white tabular-nums leading-none">{activeTotals.uniqueUsers.toLocaleString()}</p>
					<p class="text-[10px] font-black uppercase tracking-widest text-stone-400 mt-2">Unique in range</p>
				</div>
				<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 p-4 transition-all duration-300 shadow-none">
					<div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2">
						<Globe size={12} />
						Top referrer
					</div>
					{#if activeTotals.topReferrer}
						<p class="text-sm font-bold text-stone-900 dark:text-white truncate">{activeTotals.topReferrer.key}</p>
						<p class="text-[10px] font-black uppercase tracking-widest text-stone-400 mt-2">{activeTotals.topReferrer.count.toLocaleString()} triggers</p>
					{:else}
						<p class="text-xl font-bold text-stone-900 dark:text-white tabular-nums leading-none">—</p>
					{/if}
				</div>
				<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 p-4 transition-all duration-300 shadow-none">
					<div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2">
						<Search size={12} />
						Top page
					</div>
					{#if activeTotals.topPage}
						<p class="text-sm font-bold text-stone-900 dark:text-white truncate">{activeTotals.topPage.key}</p>
						<p class="text-[10px] font-black uppercase tracking-widest text-stone-400 mt-2">{activeTotals.topPage.count.toLocaleString()} triggers</p>
					{:else}
						<p class="text-xl font-bold text-stone-900 dark:text-white tabular-nums leading-none">—</p>
					{/if}
				</div>
			</div>

			<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 p-6 relative overflow-hidden shadow-none">
				<ChartJsGraph
					chartD={{
						data: filteredActiveEventData,
						label: activeEventTitle
					}}
					{sortInterval}
					{rangeStart}
					{rangeEnd}
					showChart={true}
				/>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 overflow-hidden shadow-none">
					<div class="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-white/50 dark:bg-stone-900/50 rounded-none h-14">
						<span class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Referrers</span>
						<button 
							onclick={() => openModal('referrers')}
							class="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
						>
							See more →
						</button>
					</div>
					<div class="p-2">
						<div class="flex w-full flex-col gap-0.5">
							{#each sortedReferals as page (page[0])}
								<div animate:flip={{ duration: 150 }} class="relative h-fit w-full">
									<div
										class="bg-stone-900 dark:bg-stone-100 absolute h-full rounded-none opacity-[0.06]"
										style="width: {sumReferalData > 0 ? (page[1] / sumReferalData) * 100 : 0}%;"
									></div>
									<div class="flex justify-between gap-2 px-5 py-3 hover:bg-white dark:hover:bg-stone-800 rounded-none transition-all duration-300 border border-transparent hover:border-stone-200 dark:hover:border-stone-800">
										<span class="text-xs font-bold text-stone-900 dark:text-white truncate">{page[0]}</span>
										<span class="text-xs font-bold text-stone-900 dark:text-white tabular-nums">{page[1]}</span>
									</div>
								</div>
							{:else}
								<div class="py-10">
									<EmptyValues />
								</div>
							{/each}
						</div>
					</div>
				</div>

				<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 overflow-hidden shadow-none">
					<div class="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-white/50 dark:bg-stone-900/50 rounded-none h-14">
						<span class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Countries</span>
						<button 
							onclick={() => openModal('countries')}
							class="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
						>
							See more →
						</button>
					</div>
					<div class="p-2">
						<div class="flex w-full flex-col gap-0.5">
							{#each sortedCountryData as page (page[0])}
								<div animate:flip={{ duration: 150 }} class="relative h-fit w-full">
									<div
										class="bg-stone-900 dark:bg-stone-100 absolute h-full rounded-none opacity-[0.06]"
										style="width: {sumCountryData > 0 ? (page[1] / sumCountryData) * 100 : 0}%;"
									></div>
									<div class="flex justify-between gap-2 px-5 py-3 hover:bg-white dark:hover:bg-stone-800 rounded-none transition-all duration-300 border border-transparent hover:border-stone-200 dark:hover:border-stone-800">
										<span class="text-xs font-bold text-stone-900 dark:text-white truncate">{page[0]}</span>
										<span class="text-xs font-bold text-stone-900 dark:text-white tabular-nums">{page[1]}</span>
									</div>
								</div>
							{:else}
								<div class="py-10">
									<EmptyValues />
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 overflow-hidden shadow-none">
				<div class="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex flex-wrap gap-3 items-center justify-between bg-white/50 dark:bg-stone-900/50 rounded-none">
					<div class="min-w-0">
						<h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Event log</h2>
						<p class="text-xs font-bold text-stone-900 dark:text-white font-serif italic truncate">{activeEventTitle}</p>
					</div>
					<div class="flex flex-wrap items-center gap-2 justify-end">
						<div class="w-48">
							<CustomSelect
								bind:value={filterPage}
								options={[
									{ value: '', label: 'Page: All' },
									...availablePages.map(p => ({ value: p, label: p }))
								]}
							/>
						</div>
						<div class="w-48">
							<CustomSelect
								bind:value={filterReferrer}
								options={[
									{ value: '', label: 'Referrer: All' },
									...availableReferrers.map(r => ({ value: r, label: r }))
								]}
							/>
						</div>
						<label class="flex items-center gap-2 h-[38px] px-4 text-xs font-bold border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white select-none">
							<input
								type="checkbox"
								bind:checked={filterHasCampaign}
								class="accent-stone-900 dark:accent-stone-100"
							/>
							Campaign only
						</label>
						<input
							bind:value={detailSearch}
							placeholder="Search user, properties"
							class="w-full sm:w-72 px-4 py-2 text-xs font-bold rounded-none border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-stone-500 transition-all"
						/>
					</div>
				</div>
				<div class="max-h-[700px] overflow-y-auto">
					<table class="min-w-full divide-y divide-stone-200 dark:divide-stone-800">
						<thead class="bg-white dark:bg-stone-900">
							<tr>
								<th class="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">User</th>
								<th class="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Page</th>
								<th class="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Referrer</th>
								<th class="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Properties</th>
								<th class="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">When</th>
								<th class="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Location</th>
								<th class="w-8"></th>
							</tr>
						</thead>
						<tbody class="divide-y divide-stone-200 dark:divide-stone-800 bg-white dark:bg-stone-900">
							{#each filteredActiveEventData as event, i (event.id ?? `${event.timestamp}-${event.user_id ?? ''}-${i}`)}
								{@const eventKey = event.id ?? `${event.timestamp}-${event.user_id ?? ''}-${i}`}
								<tr
									class="group cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50"
									onclick={() => (expanded = expanded === eventKey ? null : eventKey)}
								>
									<td class="px-4 py-3 text-xs font-mono text-stone-600 dark:text-stone-300 truncate max-w-40">{event.user_id?.slice(0, 8) || 'Anonymous'}</td>
									<td class="max-w-50 truncate px-4 py-3 text-xs font-mono text-stone-600 dark:text-stone-300">{getPagePath(event.url) || 'Unknown'}</td>
									<td class="truncate px-4 py-3 text-xs font-bold text-stone-900 dark:text-white">{getReferrerHost(event.referrer)}</td>
									<td class="px-4 py-3 text-xs text-stone-600 dark:text-stone-300">
										{#if summarizeEventData(event.event_data).length}
											<div class="flex flex-wrap gap-1">
												{#each summarizeEventData(event.event_data) as line (line)}
													<span class="px-2 py-1 rounded-none border border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-stone-950/30 font-mono text-[10px] truncate max-w-56">{line}</span>
												{/each}
											</div>
										{:else}
											<span class="text-stone-400">—</span>
										{/if}
									</td>
									<td class="whitespace-nowrap px-4 py-3 text-xs font-bold text-stone-900 dark:text-white">
										{new Date(event.timestamp).toLocaleDateString()}<br />
										<span class="text-[10px] font-black uppercase tracking-widest text-stone-400">{new Date(event.timestamp).toLocaleTimeString()}</span>
									</td>
									<td class="px-4 py-3 text-xs font-bold text-stone-600 dark:text-stone-300">{event.timezone}</td>
									<td class="px-4 py-3">
										<MoreVertical size={16} class="text-stone-300 dark:text-stone-600 group-hover:text-stone-900 dark:group-hover:text-white transition-colors" />
									</td>
								</tr>
								{#if expanded === eventKey}
									<tr class="bg-stone-50 dark:bg-stone-800/40">
										<td colspan="7" class="px-4 py-4 text-xs">
											<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
												<div>
													<div class="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">User</div>
													<div class="truncate font-bold text-stone-900 dark:text-white">{event.user_id?.slice(0, 8) || 'Anonymous'}</div>
												</div>
												{#if event.event_data}
													{@const data = safeJsonParse(event.event_data)}
													{#if data?.campaign}
														<div>
															<div class="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Campaign</div>
															<div class="truncate font-bold text-stone-900 dark:text-white">{data.campaign}</div>
														</div>
													{/if}
												{/if}
												<div>
													<div class="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Performance</div>
													{#if event.event_data}
														{@const data = safeJsonParse(event.event_data)}
														<span class={`font-bold ${data?.pageLoadTime > 2000 ? 'text-red-600' : 'text-green-600'}`}>{data?.pageLoadTime ? `${data.pageLoadTime}ms` : 'N/A'}</span>
													{:else}
														<span class="font-bold text-stone-400">N/A</span>
													{/if}
												</div>
												<div>
													<div class="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Language</div>
													<div class="font-bold text-stone-900 dark:text-white">{event.language?.split('-')[0]}</div>
												</div>
												{#if event.event_data}
													{@const data = safeJsonParse(event.event_data)}
													<div class="sm:col-span-2 lg:col-span-4">
														<div class="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Event details</div>
														<div class="space-y-1">
															{#each Object.entries(data || {}) as [title, dx]}
																<div class="truncate">
																	<span class="font-bold text-stone-900 dark:text-white">{title}:</span>
																	<span class="text-stone-600 dark:text-stone-300"> {dx}</span>
																</div>
															{/each}
															<div class="truncate">
																<span class="font-bold text-stone-900 dark:text-white">Full referrer URL:</span>
																<span class="text-stone-600 dark:text-stone-300"> {event?.referrer ? event.referrer : 'None'}</span>
															</div>
														</div>
													</div>
												{/if}
											</div>
										</td>
									</tr>
								{/if}
							{:else}
								<tr>
									<td colspan="6" class="px-6 py-10 text-center text-sm text-stone-400 italic font-serif">No events recorded</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<div class="px-6 py-4 border-t border-stone-100 dark:border-stone-800 flex flex-wrap gap-3 items-center justify-between bg-white/50 dark:bg-stone-900/50">
					<div class="text-xs font-bold text-stone-500 dark:text-stone-400">
						Showing <span class="text-stone-900 dark:text-white tabular-nums">{filteredActiveEventData.length.toLocaleString()}</span>
						{#if totalLogEvents}
							of <span class="text-stone-900 dark:text-white tabular-nums">{totalLogEvents.toLocaleString()}</span>
						{/if}
					</div>
					{#if nextCursor}
						<button
							type="button"
							onclick={loadMore}
							disabled={loadingLog}
							class="px-4 py-2 text-xs font-bold rounded-none border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-white hover:bg-white dark:hover:bg-stone-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loadingLog ? 'Loading...' : 'Load more'}
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>

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
							{activeModal === 'referrers' ? 'All Referrers' : 'All Countries'}
						</h3>
						<p class="text-xs font-bold text-stone-900 dark:text-white font-serif italic truncate">{activeEventTitle}</p>
					</div>
					<button 
						onclick={closeModal}
						class="text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors p-2"
					>
						<MoreVertical size={16} class="rotate-45" />
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
						{#each modalData as [name, count] (name)}
							<div class="relative h-fit w-full">
								<div
									class="bg-stone-900 dark:bg-stone-100 absolute h-full rounded-none opacity-[0.06]"
									style="width: {modalTotal > 0 ? (count / modalTotal) * 100 : 0}%;"
								></div>
								<div class="flex justify-between gap-2 px-5 py-3 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-none transition-all duration-300 border border-transparent hover:border-stone-200 dark:hover:border-stone-800">
									<span class="text-xs font-bold text-stone-900 dark:text-white truncate">{name || 'Unknown'}</span>
									<span class="text-xs font-bold text-stone-900 dark:text-white tabular-nums">{count.toLocaleString()}</span>
								</div>
							</div>
						{:else}
							<div class="py-20 text-center">
								<p class="text-stone-400 italic font-serif text-sm">No matches found</p>
							</div>
						{/each}
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

	<style>
		th,
		thead {
			position: sticky;
			top: 0;
		}
	</style>
