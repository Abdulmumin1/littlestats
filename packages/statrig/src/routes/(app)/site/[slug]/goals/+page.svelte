<script>
	import { api } from '$lib/api/analytics.ts';
	import { color } from '$lib/colors/mixer.js';
	import { dashboardStore } from '$lib/stores/dashboard.svelte.js';
	import { Target, TrendingUp } from 'lucide-svelte';

	let { data } = $props();
	let siteId = $derived(data.siteId);

	let loading = $state(true);
	let eventNames = $state([]);
	let selectedGoal = $state('');
	let goalSummary = $state(null);

	let attributionSearch = $state('');
	let sortBy = $state('conversions');
	let sortDir = $state('desc');

	async function fetchEventNames() {
		if (!siteId) return;
		try {
			const response = await api.getEventNames(siteId);
			eventNames = response.eventNames || [];
			if (eventNames.length > 0 && !selectedGoal) {
				selectedGoal = eventNames[0];
			}
		} catch (err) {
			console.error('Event names fetch error:', err);
		}
	}

	async function fetchGoalSummary() {
		if (!siteId || !selectedGoal) {
			loading = false;
			return;
		}
		loading = true;
		try {
			goalSummary = await api.getGoalSummary(siteId, selectedGoal, dashboardStore.dateRange);
		} catch (err) {
			console.error('Goal summary fetch error:', err);
			goalSummary = null;
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (siteId) fetchEventNames();
	});

	$effect(() => {
		if (siteId && selectedGoal) fetchGoalSummary();
	});

	$effect(() => {
		if (siteId && selectedGoal && dashboardStore?.dateRange?.startDate && dashboardStore?.dateRange?.endDate) fetchGoalSummary();
	});

	function formatBucket(bucket) {
		if (bucket === 'Direct') return 'Direct';
		if (bucket.includes('|')) {
			const [source, medium, campaign] = bucket.split('|');
			const parts = [];
			if (source !== 'unknown') parts.push(source);
			if (medium !== 'unknown') parts.push(medium);
			if (campaign !== 'unknown') parts.push(campaign);
			return parts.join(' / ') || bucket;
		}
		return bucket;
	}

	function matchesSearch(row) {
		if (!attributionSearch) return true;
		const q = attributionSearch.trim().toLowerCase();
		if (!q) return true;
		return String(row.bucket || '').toLowerCase().includes(q) || formatBucket(row.bucket).toLowerCase().includes(q);
	}

	function sortRows(rows) {
		const dir = sortDir === 'asc' ? 1 : -1;
		return rows.slice().sort((a, b) => {
			if (sortBy === 'name') return formatBucket(a.bucket).localeCompare(formatBucket(b.bucket)) * dir;
			const av = Number(a[sortBy] ?? 0);
			const bv = Number(b[sortBy] ?? 0);
			if (bv === av) return formatBucket(a.bucket).localeCompare(formatBucket(b.bucket));
			return (av - bv) * dir;
		});
	}

	let attributionRows = $derived.by(() => {
		const rows = goalSummary?.byBucket || [];
		return sortRows(rows.filter(matchesSearch));
	});

	let bestAttributionByConv = $derived.by(() => {
		if (!attributionRows.length) return null;
		return attributionRows.reduce((best, r) => (!best || r.conversions > best.conversions ? r : best), null);
	});

	let bestAttributionByRate = $derived.by(() => {
		if (!attributionRows.length) return null;
		return attributionRows.reduce((best, r) => (!best || r.conversionRate > best.conversionRate ? r : best), null);
	});

	let series = $derived.by(() => (goalSummary?.timeSeries || []).slice());
	let seriesMax = $derived.by(() => {
		if (!series.length) return 0;
		return series.reduce((m, p) => Math.max(m, Number(p.conversions ?? 0)), 0);
	});
	let seriesBars = $derived.by(() => {
		const height = 56;
		const width = 240;
		const padding = 2;
		const max = seriesMax || 1;
		const n = series.length;
		if (!n) return [];
		const gap = 2;
		const barW = Math.max(2, Math.floor((width - padding * 2 - gap * (n - 1)) / n));
		return series.map((p, i) => {
			const v = Number(p.conversions ?? 0);
			const h = Math.round(((height - padding * 2) * v) / max);
			const x = padding + i * (barW + gap);
			const y = height - padding - h;
			return { x, y, w: barW, h, v, date: p.date };
		});
	});
</script>

<div class="space-y-8">
	<!-- Header with Goal Selector -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-2">
		<div>
			<h1 class="text-xl font-bold text-stone-900 dark:text-white tracking-tight">Goals</h1>
			<p class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mt-1">Track conversion events</p>
		</div>
		
		{#if eventNames.length > 0}
			<select
				bind:value={selectedGoal}
				class="px-4 py-2 text-xs font-bold rounded-none border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-stone-500 transition-all"
			>
				{#each eventNames as name}
					<option value={name}>{name}</option>
				{/each}
			</select>
		{/if}
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-12 rounded-none">
			<div class="w-6 h-6 border-2 border-stone-200 dark:border-stone-800 border-t-stone-900 dark:border-t-white rounded-none animate-spin"></div>
		</div>
	{:else if eventNames.length === 0}
		<div class="text-center py-16 bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800">
			<Target size={32} class="mx-auto text-stone-300 dark:text-stone-700 mb-3" />
			<p class="text-stone-500 dark:text-stone-400 text-sm font-serif italic">No custom events tracked yet</p>
			<p class="text-[10px] font-black uppercase tracking-widest text-stone-400 mt-1">Events will appear here once tracked</p>
		</div>
	{:else if goalSummary}
		<!-- Stats Cards -->
		<div class="grid grid-cols-2 gap-4 rounded-none">
			<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 p-4 shadow-none">
				<div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2">
					<Target size={12} />
					Conversions
				</div>
				<p class="text-xl font-bold text-stone-900 dark:text-white tabular-nums leading-none">
					{goalSummary.conversions.toLocaleString()}
				</p>
			</div>
			<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 p-4 shadow-none">
				<div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2">
					<TrendingUp size={12} />
					Conversion Rate
				</div>
				<p class={`text-xl font-bold text-${$color}-600 dark:text-${$color}-400 tabular-nums leading-none`}>
					{goalSummary.conversionRate}%
				</p>
			</div>
			<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 p-4 shadow-none col-span-2">
				<div class="flex flex-wrap items-center gap-3">
					<input
						bind:value={attributionSearch}
						placeholder="Search attribution"
						class="flex-1 min-w-48 px-4 py-2 text-xs font-bold rounded-none border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-stone-500 transition-all"
					/>
					<select
						bind:value={sortBy}
						class="px-4 py-2 text-xs font-bold rounded-none border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-stone-500 transition-all"
					>
						<option value="conversions">Sort: Conversions</option>
						<option value="conversionRate">Sort: Rate</option>
						<option value="name">Sort: Name</option>
					</select>
					<select
						bind:value={sortDir}
						class="px-4 py-2 text-xs font-bold rounded-none border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-stone-500 transition-all"
					>
						<option value="desc">Direction: Desc</option>
						<option value="asc">Direction: Asc</option>
					</select>
				</div>
				<div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div class="px-4 py-3 bg-white/60 dark:bg-stone-950/40 border border-stone-100 dark:border-stone-800 rounded-none">
						<p class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Top source by conversions</p>
						{#if bestAttributionByConv}
							<p class="text-sm font-bold text-stone-900 dark:text-white truncate mt-1">{formatBucket(bestAttributionByConv.bucket)}</p>
							<p class="text-xs font-bold text-stone-600 dark:text-stone-300 tabular-nums mt-1">
								{bestAttributionByConv.conversions.toLocaleString()} conv
							</p>
						{:else}
							<p class="text-xs font-bold text-stone-400 mt-1">—</p>
						{/if}
					</div>
					<div class="px-4 py-3 bg-white/60 dark:bg-stone-950/40 border border-stone-100 dark:border-stone-800 rounded-none">
						<p class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Top source by rate</p>
						{#if bestAttributionByRate}
							<p class="text-sm font-bold text-stone-900 dark:text-white truncate mt-1">{formatBucket(bestAttributionByRate.bucket)}</p>
							<p class={`text-xs font-bold tabular-nums mt-1 ${bestAttributionByRate.conversionRate > 0 ? `text-${$color}-600 dark:text-${$color}-400` : 'text-stone-400'}`}>
								{bestAttributionByRate.conversionRate}%
							</p>
						{:else}
							<p class="text-xs font-bold text-stone-400 mt-1">—</p>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<!-- Attribution Table -->
		{#if goalSummary.byBucket.length > 0}
			<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 overflow-hidden flex flex-col shadow-none">
				<div class="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-white/50 dark:bg-stone-900/50 rounded-none">
					<h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Attribution</h2>
					<span class="text-xs font-bold text-stone-900 dark:text-white font-serif italic text-opacity-50">Source Performance</span>
				</div>
				<div class="p-2 rounded-none">
					<div class="divide-y divide-stone-50 dark:divide-stone-800 rounded-none">
						{#each attributionRows as row}
							<div class="px-5 py-3 flex items-center justify-between hover:bg-white dark:hover:bg-stone-800 rounded-none transition-all duration-300">
								<span class="text-sm font-bold text-stone-900 dark:text-white truncate flex-1">
									{formatBucket(row.bucket)}
								</span>
								<div class="flex items-center gap-6 text-sm ml-4 rounded-none">
									<div class="text-right rounded-none">
										<span class="text-xs font-bold text-stone-900 dark:text-white tabular-nums">{row.conversions}</span>
										<span class="text-[10px] font-black uppercase tracking-tighter text-stone-400 ml-1 opacity-50">conv</span>
									</div>
									<span class={`tabular-nums w-16 text-right text-xs font-bold ${row.conversionRate > 0 ? `text-${$color}-600 dark:text-${$color}-400` : 'text-stone-400'}`}>
										{row.conversionRate}%
									</span>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}

		<!-- Recent Conversions -->
		{#if goalSummary.timeSeries.length > 0}
			<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 overflow-hidden flex flex-col shadow-none">
				<div class="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-white/50 dark:bg-stone-900/50 rounded-none">
					<h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Daily Conversions</h2>
					<span class="text-xs font-bold text-stone-900 dark:text-white font-serif italic text-opacity-50">Timeline</span>
				</div>
				<div class="p-2 rounded-none">
					<div class="px-4 py-3 bg-white/60 dark:bg-stone-950/40 border border-stone-100 dark:border-stone-800 rounded-none">
						<div class="flex items-center justify-between gap-4">
							<div class="min-w-0">
								<p class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Trend</p>
								<p class="text-xs font-bold text-stone-900 dark:text-white tabular-nums mt-1">
									Max {seriesMax.toLocaleString()}
								</p>
							</div>
							<svg viewBox="0 0 240 56" class="w-60 h-14 shrink-0">
								{#each seriesBars as b (b.date)}
									<rect
										x={b.x}
										y={b.y}
										width={b.w}
										height={b.h}
										rx={1}
										class={b.v > 0 ? `fill-${$color}-600 dark:fill-${$color}-400` : 'fill-stone-200 dark:fill-stone-800'}
									>
										<title>{b.date}: {b.v}</title>
									</rect>
								{/each}
							</svg>
						</div>
					</div>
					<div class="divide-y divide-stone-50 dark:divide-stone-800 max-h-64 overflow-y-auto rounded-none">
						{#each goalSummary.timeSeries.slice().reverse() as row}
							<div class="px-5 py-3 flex items-center justify-between hover:bg-white dark:hover:bg-stone-800 rounded-none transition-all duration-300">
								<span class="text-xs font-mono text-stone-500 dark:text-stone-400">{row.date}</span>
								<span class="text-sm font-bold text-stone-900 dark:text-white tabular-nums">
									{row.conversions}
								</span>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	{/if}
</div>
