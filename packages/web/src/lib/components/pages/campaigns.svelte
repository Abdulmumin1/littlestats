
<script>
	import { api } from '$lib/api/analytics.ts';
	import { color, colorList } from '$lib/colors/mixer.js';
	import { dashboardStore } from '$lib/stores/dashboard.svelte.js';
	import { Megaphone, Users, Target, TrendingUp } from 'lucide-svelte';
	import StackedChart from '$lib/components/analytics/graphStuff/stackedChart.svelte';
	import CustomSelect from '$lib/components/generals/customSelect.svelte';

	let { siteId = null, demo = false, events = [], dateRange = null } = $props();

	let loading = $state(true);
	let campaigns = $state([]);
	let limit = $state(20);

	let goalNames = $state([]);
	let selectedGoal = $state('');

	let stackedLoading = $state(true);
	let stackedSeries = $state(null);
	let stackedGroupBy = $state('source');
	let stackedMetric = $state('conversions');
	let stackedSegmentsLimit = $state(6);
	let stackedChartType = $state('bar');

	let search = $state('');
	let groupBy = $state('full');
	let sortBy = $state('conversions');
	let sortDir = $state('desc');

	function getEffectiveRange() {
		return demo ? (dateRange || {}) : (dashboardStore.dateRange || {});
	}

	function filterEventsLocal(rows, range) {
		if (!range || !range.startDate || !range.endDate) return rows || [];
		const start = new Date(range.startDate);
		start.setHours(0, 0, 0, 0);
		const end = new Date(range.endDate);
		end.setHours(23, 59, 59, 999);
		const startTime = start.getTime();
		const endTime = end.getTime();
		return (rows || []).filter((e) => {
			const t = new Date(e.timestamp).getTime();
			return t >= startTime && t <= endTime;
		});
	}

	function parseEventData(event) {
		if (!event?.event_data || typeof event.event_data !== 'string') return null;
		try {
			return JSON.parse(event.event_data);
		} catch {
			return null;
		}
	}

	function getRefHost(referrer) {
		if (!referrer) return 'Direct';
		try {
			const u = new URL(referrer);
			return u.hostname || 'Direct';
		} catch {
			return 'Direct';
		}
	}

	function buildBucket(event) {
		const refHost = getRefHost(event?.referrer);
		if (refHost === 'Direct') return 'Direct';
		const obj = parseEventData(event);
		const source = refHost || 'unknown';
		const medium = 'referral';
		const campaign = obj?.campaign || 'unknown';
		return `${source}|${medium}|${campaign}`;
	}

	function computeGoalNamesFromEvents() {
		const range = getEffectiveRange();
		const filtered = filterEventsLocal(events, range);
		const set = new Set();
		for (const e of filtered) {
			if (e?.event_type === 'pageview') continue;
			const name = e?.event_name || e?.event_type;
			if (name) set.add(name);
		}
		return Array.from(set.values()).sort((a, b) => String(a).localeCompare(String(b)));
	}

	function computeCampaignRowsFromEvents() {
		const range = getEffectiveRange();
		const filtered = filterEventsLocal(events, range);

		const byBucket = new Map();
		for (const e of filtered) {
			const bucket = buildBucket(e);
			const row = byBucket.get(bucket) || { bucket, visits: 0, conversions: 0 };

			if (e?.event_type === 'pageview') {
				row.visits += 1;
			} else {
				const name = e?.event_name || e?.event_type;
				if (!selectedGoal || name === selectedGoal) {
					row.conversions += 1;
				}
			}

			byBucket.set(bucket, row);
		}

		return Array.from(byBucket.values()).map((r) => ({
			...r,
			conversionRate: r.visits > 0 ? Math.round((r.conversions / r.visits) * 10000) / 100 : 0
		}));
	}

	function computeStackedSeriesFromEvents() {
		const range = getEffectiveRange();
		const filtered = filterEventsLocal(events, range);

		const segTotals = new Map();
		const byDay = new Map();

		for (const e of filtered) {
			const dt = new Date(e.timestamp);
			if (Number.isNaN(dt.getTime())) continue;
			const dayKey = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;

			const bucket = buildBucket(e);
			let segKey = 'Other';
			if (bucket === 'Direct') {
				segKey = 'Direct';
			} else {
				const [source = 'unknown', medium = 'unknown'] = bucket.split('|');
				segKey = stackedGroupBy === 'medium' ? medium : source;
			}

			let metricVal = 0;
			if (stackedMetric === 'visits') {
				metricVal = e?.event_type === 'pageview' ? 1 : 0;
			} else {
				if (e?.event_type !== 'pageview') {
					const name = e?.event_name || e?.event_type;
					metricVal = !selectedGoal || name === selectedGoal ? 1 : 0;
				}
			}

			if (!metricVal) continue;

			segTotals.set(segKey, (segTotals.get(segKey) || 0) + metricVal);
			const point = byDay.get(dayKey) || { timestamp: dayKey, total: 0, segments: {} };
			point.total += metricVal;
			point.segments[segKey] = (point.segments[segKey] || 0) + metricVal;
			byDay.set(dayKey, point);
		}

		const segmentsSorted = Array.from(segTotals.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, Number(stackedSegmentsLimit) || 6);
		const segmentKeys = segmentsSorted.map(([k]) => k);
		const segments = segmentsSorted.map(([key, total]) => ({ key, total }));

		const points = Array.from(byDay.values())
			.map((p) => {
				const segs = {};
				for (const k of segmentKeys) segs[k] = Number(p.segments?.[k] || 0);
				return { timestamp: p.timestamp, total: p.total, segments: segs };
			})
			.sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)));

		return {
			granularity: 'day',
			metric: stackedMetric,
			groupBy: stackedGroupBy,
			segments,
			points
		};
	}

	async function fetchGoalNames() {
		if (demo) {
			goalNames = computeGoalNamesFromEvents();
			return;
		}
		if (!siteId) return;
		try {
			const response = await api.getEventNames(siteId);
			goalNames = response.eventNames || [];
		} catch (err) {
			console.error('Goal names fetch error:', err);
			goalNames = [];
		}
	}

	async function fetchCampaigns() {
		if (demo) {
			loading = true;
			try {
				campaigns = computeCampaignRowsFromEvents().slice(0, Number(limit) || 20);
			} finally {
				loading = false;
			}
			return;
		}
		if (!siteId) return;
		loading = true;
		try {
			const goal = selectedGoal || undefined;
			const response = await api.getCampaigns(siteId, dashboardStore.dateRange, limit, goal);
			campaigns = response.campaigns || [];
		} catch (err) {
			console.error('Campaigns fetch error:', err);
			campaigns = [];
		} finally {
			loading = false;
		}
	}

	async function fetchStackedSeries() {
		if (demo) {
			stackedLoading = true;
			try {
				stackedSeries = computeStackedSeriesFromEvents();
			} finally {
				stackedLoading = false;
			}
			return;
		}
		if (!siteId) return;
		stackedLoading = true;
		try {
			const goal = selectedGoal || undefined;
			stackedSeries = await api.getCampaignsSegmentedTimeSeries(siteId, {
				filter: dashboardStore.dateRange,
				groupBy: stackedGroupBy,
				metric: stackedMetric,
				granularity: 'day',
				segmentsLimit: stackedSegmentsLimit,
				goalEventName: goal
			});
		} catch (err) {
			console.error('Campaigns segmented timeseries fetch error:', err);
			stackedSeries = null;
		} finally {
			stackedLoading = false;
		}
	}

	$effect(() => {
		fetchGoalNames();
	});

	$effect(() => {
		if (!demo && !siteId) return;
		fetchCampaigns();
	});

	$effect(() => {
		const range = getEffectiveRange();
		if (!range?.startDate || !range?.endDate) return;
		if (!demo && !siteId) return;
		fetchStackedSeries();
	});

	function formatBucket(bucket) {
		if (bucket === 'Direct') return 'Direct';
		if (bucket.includes('|')) {
			const [source, medium, campaign] = bucket.split('|');
			const parts = [];
			if (source !== 'unknown') parts.push(source);
			if (medium !== 'unknown') parts.push(medium);
			if (campaign !== 'unknown') parts.push(campaign);
			return parts.join(' / ') || 'UTM Campaign';
		}
		return bucket;
	}

	function parseBucket(bucket) {
		if (!bucket || bucket === 'Direct') return { source: 'Direct', medium: '', campaign: '' };
		if (!bucket.includes('|')) return { source: bucket, medium: '', campaign: '' };
		const [source = '', medium = '', campaign = ''] = bucket.split('|');
		return { source, medium, campaign };
	}

	function getGroupLabel(row) {
		const { source, medium, campaign } = parseBucket(row.bucket);
		if (groupBy === 'source') return source || 'unknown';
		if (groupBy === 'medium') return medium || 'unknown';
		if (groupBy === 'campaign') return campaign || 'unknown';
		return formatBucket(row.bucket);
	}

	function aggregate(rows) {
		const map = new Map();
		for (const r of rows) {
			const label = getGroupLabel(r);
			const current = map.get(label) || { bucket: label, visits: 0, conversions: 0 };
			current.visits += r.visits || 0;
			current.conversions += r.conversions || 0;
			map.set(label, current);
		}
		return Array.from(map.values()).map((r) => ({
			...r,
			conversionRate: r.visits > 0 ? Math.round((r.conversions / r.visits) * 10000) / 100 : 0
		}));
	}

	function matchesSearch(row) {
		if (!search) return true;
		const q = search.trim().toLowerCase();
		if (!q) return true;
		return String(row.bucket || '').toLowerCase().includes(q);
	}

	function sortRows(rows) {
		const dir = sortDir === 'asc' ? 1 : -1;
		return rows.slice().sort((a, b) => {
			if (sortBy === 'name') return String(a.bucket).localeCompare(String(b.bucket)) * dir;
			const av = Number(a[sortBy] ?? 0);
			const bv = Number(b[sortBy] ?? 0);
			if (bv === av) return String(a.bucket).localeCompare(String(b.bucket));
			return (av - bv) * dir;
		});
	}

	let displayRows = $derived.by(() => {
		const base = groupBy === 'full' ? campaigns : aggregate(campaigns);
		const filtered = base.filter(matchesSearch);
		return sortRows(filtered);
	});

	let totals = $derived({
		sources: campaigns.length,
		visits: campaigns.reduce((sum, c) => sum + c.visits, 0),
		conversions: campaigns.reduce((sum, c) => sum + c.conversions, 0)
	});

	let avgConvRate = $derived(
		totals.visits > 0 ? Math.round((totals.conversions / totals.visits) * 10000) / 100 : 0
	);

	let bestByConversions = $derived.by(() => {
		const rows = displayRows;
		if (!rows.length) return null;
		return rows.reduce((best, r) => (!best || r.conversions > best.conversions ? r : best), null);
	});

	let bestByRate = $derived.by(() => {
		const rows = displayRows;
		if (!rows.length) return null;
		return rows.reduce((best, r) => (!best || r.conversionRate > best.conversionRate ? r : best), null);
	});

	let stackedPoints = $derived.by(() => stackedSeries?.points || []);
	let stackedSegmentsList = $derived.by(() => stackedSeries?.segments || []);
	let stackedSegments = $derived.by(() => stackedSegmentsList.map((s) => s.key));

	let stackedColors = $derived.by(() => {
		const other = '#94a3b8';
		const segs = stackedSegments;
		const map = new Map();
		const palette = [
			colorList?.[$color]?.primary || '#e11d48',
			'#2563eb',
			'#16a34a',
			'#f59e0b',
			'#7c3aed',
			'#06b6d4',
			'#f97316',
			'#db2777',
			'#84cc16',
			'#0ea5e9'
		];
		for (let i = 0; i < segs.length; i++) {
			const k = segs[i];
			if (k === 'Other') {
				map.set(k, { fill: other, opacity: 0.55 });
				continue;
			}
			map.set(k, { fill: palette[i % palette.length], opacity: 0.9 });
		}
		return map;
	});
</script>

<div class="space-y-8">
	<div class="px-2 flex flex-wrap items-center justify-between gap-4">
		<div>
			<h1 class="text-xl font-bold text-stone-900 dark:text-white tracking-tight">Campaigns</h1>
			<p class="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mt-1">Traffic sources & attribution</p>
		</div>
		<div class="flex items-center gap-2 min-w-50">
			<CustomSelect
				id="campaigns-goal"
				label="Goal:"
				bind:value={selectedGoal}
				onchange={() => {
					fetchCampaigns();
					fetchStackedSeries();
				}}
				options={[{ value: '', label: 'All custom events' }, ...goalNames.map((g) => ({ value: g, label: g }))]}
			/>
		</div>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-12 rounded-none">
			<div class="w-6 h-6 border-2 border-stone-200 dark:border-stone-800 border-t-stone-900 dark:border-t-white rounded-none animate-spin"></div>
		</div>
	{:else if campaigns.length === 0}
		<div class="text-center py-16 bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800">
			<Megaphone size={32} class="mx-auto text-stone-300 dark:text-stone-700 mb-3" />
			<p class="text-stone-500 dark:text-stone-400 text-sm font-serif italic">No traffic data yet</p>
			<p class="text-[10px] font-black uppercase tracking-widest text-stone-400 mt-1">Visitors will appear once they arrive</p>
		</div>
	{:else}
		<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-none">
			<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 p-4 transition-all duration-300 shadow-none">
				<div class="flex items-center gap-2 text-[11px] font-medium text-stone-500 dark:text-stone-400 mb-2">
					<Megaphone size={12} />
					Sources
				</div>
				<p class="text-xl font-bold text-stone-900 dark:text-white tabular-nums leading-none">{totals.sources}</p>
			</div>
			<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 p-4 transition-all duration-300 shadow-none">
				<div class="flex items-center gap-2 text-[11px] font-medium text-stone-500 dark:text-stone-400 mb-2">
					<Users size={12} />
					Visits
				</div>
				<p class="text-xl font-bold text-stone-900 dark:text-white tabular-nums leading-none">{totals.visits.toLocaleString()}</p>
			</div>
			<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 p-4 transition-all duration-300 shadow-none">
				<div class="flex items-center gap-2 text-[11px] font-medium text-stone-500 dark:text-stone-400 mb-2">
					<Target size={12} />
					Conversions
				</div>
				<p class="text-xl font-bold text-stone-900 dark:text-white tabular-nums leading-none">{totals.conversions.toLocaleString()}</p>
			</div>
			<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 p-4 transition-all duration-300 shadow-none">
				<div class="flex items-center gap-2 text-[11px] font-medium text-stone-500 dark:text-stone-400 mb-2">
					<TrendingUp size={12} />
					Avg. Rate
				</div>
				<p class={`text-xl font-bold text-${$color}-600 dark:text-${$color}-400 tabular-nums leading-none`}>{avgConvRate}%</p>
			</div>
			<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 p-4 transition-all duration-300 shadow-none col-span-2 sm:col-span-4">
				<div class="flex flex-col gap-3">
					<div class="flex flex-wrap items-center justify-between gap-3">
						<div class="min-w-0">
							<p class="text-[11px] font-medium text-stone-500 dark:text-stone-400">Segmented trend</p>
							<p class="text-xs font-bold text-stone-900 dark:text-white truncate">{stackedGroupBy} · {stackedMetric}</p>
						</div>
						<div class="flex flex-wrap items-center gap-2">
							<div class="flex bg-stone-100/50 dark:bg-stone-800/40 p-1 border border-stone-200 dark:border-stone-800 h-9.5 items-center">
								<button
									onclick={() => (stackedChartType = 'bar')}
									class="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all border border-transparent {stackedChartType === 'bar'
										? `bg-white/70 dark:bg-stone-900/60 text-stone-900 dark:text-white border-stone-200 dark:border-stone-700`
										: 'text-stone-500 hover:text-stone-900 dark:hover:text-white'}"
								>
									Bar
								</button>
								<button
									onclick={() => (stackedChartType = 'line')}
									class="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all border border-transparent {stackedChartType === 'line'
										? `bg-white/70 dark:bg-stone-900/60 text-stone-900 dark:text-white border-stone-200 dark:border-stone-700`
										: 'text-stone-500 hover:text-stone-900 dark:hover:text-white'}"
								>
									Line
								</button>
							</div>
							<div class="w-40">
								<CustomSelect
									bind:value={stackedGroupBy}
									onchange={() => fetchStackedSeries()}
									options={[
										{ value: 'source', label: 'Group: Source' },
										{ value: 'medium', label: 'Group: Medium' }
									]}
								/>
							</div>
							<div class="w-44">
								<CustomSelect
									bind:value={stackedMetric}
									onchange={() => fetchStackedSeries()}
									options={[
										{ value: 'conversions', label: 'Metric: Conversions' },
										{ value: 'visits', label: 'Metric: Visits' }
									]}
								/>
							</div>
							<div class="w-32">
								<CustomSelect
									bind:value={stackedSegmentsLimit}
									onchange={() => fetchStackedSeries()}
									options={[
										{ value: 4, label: 'Top: 4' },
										{ value: 6, label: 'Top: 6' },
										{ value: 8, label: 'Top: 8' },
										{ value: 10, label: 'Top: 10' }
									]}
								/>
							</div>
						</div>
					</div>

					{#if stackedLoading}
						<div class="flex items-center justify-center py-6 rounded-none">
							<div class="w-5 h-5 border-2 border-stone-200 dark:border-stone-800 border-t-stone-900 dark:border-t-white rounded-none animate-spin"></div>
						</div>
					{:else if stackedPoints.length === 0}
						<p class="py-6 text-center text-stone-400 italic font-serif text-sm">No campaign data yet</p>
					{:else}
						<div class="flex items-start justify-between gap-4">
							<div class="flex-1 min-w-0">
								<StackedChart
									points={stackedPoints}
									segments={stackedSegmentsList}
									colors={stackedColors}
									chartType={stackedChartType}
									metric={stackedMetric}
								/>
							</div>
							<div class="hidden sm:flex flex-col gap-1 w-44 shrink-0">
								{#each stackedSegmentsList.slice(0, 6) as seg (seg.key)}
									{@const style = stackedColors.get(seg.key)}
									<div class="flex items-center justify-between gap-2">
										<div class="flex items-center gap-2 min-w-0">
											<span class="w-2 h-2 rounded-none" style={`background: ${style?.fill}; opacity: ${style?.opacity ?? 0.6};`}></span>
											<span class="text-[11px] font-medium text-stone-500 dark:text-stone-400 truncate">{seg.key}</span>
										</div>
										<span class="text-xs font-bold text-stone-900 dark:text-white tabular-nums">{seg.total.toLocaleString()}</span>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 overflow-hidden flex flex-col shadow-none">
			<div class="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex flex-wrap gap-3 items-center justify-between bg-white/50 dark:bg-stone-900/50 rounded-none">
				<div class="min-w-0">
					<h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Traffic Sources</h2>
					<p class="text-xs font-bold text-stone-900 dark:text-white font-serif italic truncate">Conversion details</p>
				</div>
				<div class="flex flex-wrap items-center gap-2 justify-end">
					<input
						bind:value={search}
						placeholder="Search sources / UTMs"
						class="w-full sm:w-64 px-4 py-2 text-xs font-bold rounded-none border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-stone-500 transition-all"
					/>
					<div class="w-44">
						<CustomSelect
							bind:value={groupBy}
							options={[
								{ value: 'full', label: 'Group: Full UTM' },
								{ value: 'source', label: 'Group: Source' },
								{ value: 'medium', label: 'Group: Medium' },
								{ value: 'campaign', label: 'Group: Campaign' }
							]}
						/>
					</div>
					<div class="w-44">
						<CustomSelect
							bind:value={sortBy}
							options={[
								{ value: 'conversions', label: 'Sort: Conversions' },
								{ value: 'conversionRate', label: 'Sort: Rate' },
								{ value: 'visits', label: 'Sort: Visits' },
								{ value: 'name', label: 'Sort: Name' }
							]}
						/>
					</div>
					<div class="w-44">
						<CustomSelect
							bind:value={sortDir}
							options={[
								{ value: 'desc', label: 'Direction: Desc' },
								{ value: 'asc', label: 'Direction: Asc' }
							]}
						/>
					</div>
					<div class="w-32">
						<CustomSelect
							bind:value={limit}
							onchange={() => fetchCampaigns()}
							options={[
								{ value: 20, label: 'Limit: 20' },
								{ value: 50, label: 'Limit: 50' },
								{ value: 100, label: 'Limit: 100' }
							]}
						/>
					</div>
				</div>
			</div>
			<div class="p-2 rounded-none">
				<div class="divide-y divide-stone-50 dark:divide-stone-800 rounded-none">
					{#each displayRows as campaign (campaign.bucket)}
						<div class="px-5 py-3 flex items-center justify-between hover:bg-white dark:hover:bg-stone-800 rounded-none transition-all duration-300 border border-transparent hover:border-stone-200 dark:hover:border-stone-800">
							<div class="flex-1 min-w-0 rounded-none">
								<p class="text-sm font-bold text-stone-900 dark:text-white truncate">{formatBucket(campaign.bucket)}</p>
								{#if groupBy === 'full' && campaign.bucket.includes('|') && campaign.bucket !== formatBucket(campaign.bucket)}
									<p class="text-[10px] font-mono text-stone-400 truncate mt-0.5">{campaign.bucket}</p>
								{/if}
							</div>
							<div class="flex items-center gap-6 text-sm ml-4 rounded-none">
								<div class="text-right rounded-none">
									<span class="text-xs font-bold text-stone-900 dark:text-white tabular-nums">{campaign.visits.toLocaleString()}</span>
									<span class="text-[10px] font-black uppercase tracking-tighter text-stone-400 ml-1 opacity-50">visits</span>
								</div>
								<div class="text-right w-20 rounded-none">
									<span class="text-xs font-bold text-stone-900 dark:text-white tabular-nums">{campaign.conversions.toLocaleString()}</span>
									<span class="text-[10px] font-black uppercase tracking-tighter text-stone-400 ml-1 opacity-50">conv</span>
								</div>
								<span class="tabular-nums w-16 text-right text-xs font-bold {campaign.conversionRate > 0 ? `text-${$color}-600 dark:text-${$color}-400` : 'text-stone-400'}">
									{campaign.conversionRate}%
								</span>
							</div>
						</div>
					{/each}
				</div>
			</div>
			<div class="px-6 py-4 border-t border-stone-100 dark:border-stone-800 flex flex-wrap gap-3 items-center justify-between bg-white/50 dark:bg-stone-900/50">
				<div class="text-xs font-bold text-stone-500 dark:text-stone-400">
					Best conversions:
					{#if bestByConversions}
						<span class="text-stone-900 dark:text-white"> {formatBucket(bestByConversions.bucket)}</span>
						<span class="text-stone-500 dark:text-stone-400"> · </span>
						<span class="text-stone-900 dark:text-white tabular-nums">{bestByConversions.conversions.toLocaleString()}</span>
					{:else}
						<span class="text-stone-400"> —</span>
					{/if}
				</div>
				<div class="text-xs font-bold text-stone-500 dark:text-stone-400">
					Best rate:
					{#if bestByRate}
						<span class="text-stone-900 dark:text-white"> {formatBucket(bestByRate.bucket)}</span>
						<span class={`tabular-nums ${bestByRate.conversionRate > 0 ? `text-${$color}-600 dark:text-${$color}-400` : 'text-stone-400'}`}>
							 {' '}· {bestByRate.conversionRate}%
						</span>
					{:else}
						<span class="text-stone-400"> —</span>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
