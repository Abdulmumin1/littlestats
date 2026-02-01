<script>
	import { api } from '$lib/api/analytics.ts';
	import { color, colorList } from '$lib/colors/mixer.js';
	import { dashboardStore } from '$lib/stores/dashboard.svelte.js';
	import { Megaphone, Users, Target, TrendingUp } from 'lucide-svelte';
	import StackedChart from '$lib/components/analytics/graphStuff/stackedChart.svelte';
	import CustomSelect from '$lib/components/generals/customSelect.svelte';

	let { data } = $props();
	let siteId = $derived(data.siteId);

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

	async function fetchGoalNames() {
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
		if (!siteId) return;
		stackedLoading = true;
		try {
			const goal = selectedGoal || undefined;

			const startStr = dashboardStore?.dateRange?.startDate;
			const endStr = dashboardStore?.dateRange?.endDate;
			let granularity = 'day';

			if (startStr && endStr) {
				const s = new Date(startStr);
				const e = new Date(endStr);
				s.setHours(0, 0, 0, 0);
				e.setHours(0, 0, 0, 0);
				if (s.getTime() === e.getTime()) {
					granularity = 'hour';
				}
			}

			stackedSeries = await api.getCampaignsSegmentedTimeSeries(siteId, {
				filter: dashboardStore.dateRange,
				groupBy: stackedGroupBy,
				metric: stackedMetric,
				granularity,
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
		if (!siteId) return;
		fetchGoalNames();
	});

	$effect(() => {
		if (!siteId) return;
		fetchCampaigns();
	});

	$effect(() => {
		if (!siteId) return;
		if (!dashboardStore?.dateRange?.startDate || !dashboardStore?.dateRange?.endDate) return;
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

	let stackedSegments = $derived.by(() => (stackedSeries?.segments || []).map((s) => s.key));
	function isToday(dateString) {
		if (!dateString) return false;
		const d = new Date(dateString);
		const today = new Date();
		return d.getDate() === today.getDate() &&
			d.getMonth() === today.getMonth() &&
			d.getFullYear() === today.getFullYear();
	}

	let stackedPoints = $derived.by(() => {
		const points = stackedSeries?.points || [];
		const segs = stackedSegments;
		const startStr = dashboardStore?.dateRange?.startDate;
		const endStr = dashboardStore?.dateRange?.endDate;
		if (!startStr || !endStr) return points;

		const start = new Date(startStr);
		const end = new Date(endStr);
		if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return points;
		start.setHours(0, 0, 0, 0);
		end.setHours(0, 0, 0, 0);

		const isSingleDay = start.getTime() === end.getTime();

		if (isSingleDay) {
			if (isToday(endStr)) {
				// Relative buckets for Today
				const now = new Date();
				const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
				const intervals = [
					{ label: 'a while ago', min: 0, max: 1 },
					{ label: '1 - 4hr ago', min: 1, max: 4 },
					{ label: '4 - 8hr ago', min: 4, max: 8 },
					{ label: '8 - 12hr ago', min: 8, max: 12 },
					{ label: '12 - 16hr ago', min: 12, max: 16 },
					{ label: '16 - 20hr ago', min: 16, max: 20 },
					{ label: '20 - 24hr ago', min: 20, max: 24 }
				];

				const buckets = intervals.map((i) => ({
					label: i.label,
					total: 0,
					segments: Object.fromEntries(segs.map((s) => [s, 0])),
					timestamp: now.toISOString()
				}));

				points.forEach((p) => {
					const recordDate = new Date(p.timestamp);
					if (isNaN(recordDate.getTime())) return;

					const hoursAgo = (now.getTime() - recordDate.getTime()) / (1000 * 60 * 60);

					for (let i = 0; i < intervals.length; i++) {
						if (hoursAgo >= intervals[i].min && hoursAgo < intervals[i].max) {
							const b = buckets[i];
							b.total += Number(p.total || 0);
							for (const s of segs) {
								b.segments[s] += Number(p.segments?.[s] || 0);
							}
							break;
						}
					}
				});
				return buckets.reverse();
			} else {
				// Hourly view for other days
				const byHour = new Map();
				for (const p of points) {
					const d = new Date(p.timestamp);
					d.setMinutes(0, 0, 0, 0);
					byHour.set(d.toISOString(), p);
				}

				const filled = [];
				const cur = new Date(start);
				const endHour = new Date(start);
				endHour.setHours(23);

				while (cur <= endHour) {
					const key = cur.toISOString();
					const label = cur.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });

					if (byHour.has(key)) {
						filled.push({ ...byHour.get(key), label });
					} else {
						const segments = {};
						for (const k of segs) segments[k] = 0;
						filled.push({ timestamp: key, total: 0, segments, label });
					}
					cur.setHours(cur.getHours() + 1);
				}
				return filled;
			}
		}

		const byDay = new Map();
		for (const p of points) {
			const ts = String(p.timestamp || '').slice(0, 10);
			if (!ts) continue;
			const segments = { ...(p.segments || {}) };
			for (const k of segs) {
				if (segments[k] == null) segments[k] = 0;
			}
			const total = segs.reduce((sum, k) => sum + Number(segments[k] || 0), 0);
			byDay.set(ts, { timestamp: ts, total, segments });
		}

		const filled = [];
		const cur = new Date(start);
		while (cur <= end) {
			const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
			if (byDay.has(key)) {
				filled.push(byDay.get(key));
			} else {
				const segments = {};
				for (const k of segs) segments[k] = 0;
				filled.push({ timestamp: key, total: 0, segments });
			}
			cur.setDate(cur.getDate() + 1);
		}

		return filled;
	});
	let stackedMax = $derived.by(() => {
		if (!stackedPoints.length) return 0;
		return stackedPoints.reduce((m, p) => Math.max(m, Number(p.total ?? 0)), 0);
	});
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
	let stackedSegmentsList = $derived.by(() => stackedSeries?.segments || []);
</script>

<div class="space-y-8">
	<!-- Header -->
	<div class="px-2 flex flex-wrap items-center justify-between gap-4">
		<div>
			<h1 class="text-xl font-bold text-stone-900 dark:text-white tracking-tight">Campaigns</h1>
			<p class="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mt-1">Traffic sources & attribution</p>
		</div>
		<div class="flex items-center gap-2 min-w-[200px]">
			<CustomSelect
				id="campaigns-goal"
				label="Goal:"
				bind:value={selectedGoal}
				onchange={() => { fetchCampaigns(); fetchStackedSeries(); }}
				options={[
					{ value: '', label: 'All custom events' },
					...goalNames.map(g => ({ value: g, label: g }))
				]}
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
		<!-- Stats Cards -->
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
							<div class="flex bg-stone-100/50 dark:bg-stone-800/40 p-1 border border-stone-200 dark:border-stone-800 h-[38px] items-center">
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
				<div class="flex flex-wrap items-center gap-3 pt-2 border-t border-stone-100 dark:border-stone-800">
					<input
						bind:value={search}
						placeholder="Search sources / UTMs"
						class="flex-1 min-w-48 px-4 py-2 text-xs font-bold rounded-none border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-stone-500 transition-all"
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
				<div class="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
					<div class="min-w-0">
						<span class="text-stone-500 dark:text-stone-400">Best conversions:</span>
						{#if bestByConversions}
							<span class="font-bold text-stone-900 dark:text-white truncate"> {bestByConversions.bucket}</span>
							<span class="text-stone-500 dark:text-stone-400"> · </span>
							<span class="font-bold text-stone-900 dark:text-white tabular-nums">{bestByConversions.conversions.toLocaleString()}</span>
						{:else}
							<span class="font-bold text-stone-400"> —</span>
						{/if}
					</div>
					<div class="min-w-0">
						<span class="text-stone-500 dark:text-stone-400">Best rate:</span>
						{#if bestByRate}
							<span class="font-bold text-stone-900 dark:text-white truncate"> {bestByRate.bucket}</span>
							<span class={`font-bold tabular-nums ${bestByRate.conversionRate > 0 ? `text-${$color}-600 dark:text-${$color}-400` : 'text-stone-400'}`}>
								 {' '}· {bestByRate.conversionRate}%
							</span>
						{:else}
							<span class="font-bold text-stone-400"> —</span>
						{/if}
					</div>
				</div>
				</div>
			</div>
		</div>

		<!-- Sources List -->
		<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 overflow-hidden flex flex-col shadow-none">
			<div class="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-white/50 dark:bg-stone-900/50 rounded-none">
				<h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Traffic Sources</h2>
				<span class="text-xs font-bold text-stone-900 dark:text-white font-serif italic text-opacity-50">Conversion Details</span>
			</div>
			<div class="p-2 rounded-none">
				<div class="divide-y divide-stone-50 dark:divide-stone-800 rounded-none">
					{#each displayRows as campaign}
						<div class="px-5 py-3 flex items-center justify-between hover:bg-white dark:hover:bg-stone-800 rounded-none transition-all duration-300 border border-transparent hover:border-stone-200 dark:hover:border-stone-800">
							<div class="flex-1 min-w-0 rounded-none">
								<p class="text-sm font-bold text-stone-900 dark:text-white truncate">
									{campaign.bucket}
								</p>
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
									<span class="text-xs font-bold text-stone-900 dark:text-white tabular-nums">{campaign.conversions}</span>
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
		</div>
	{/if}
</div>
