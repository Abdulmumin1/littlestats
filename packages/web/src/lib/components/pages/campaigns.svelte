<script>
	import { api } from '$lib/api/analytics.ts';
	import { color } from '$lib/colors/mixer.js';
	import { dashboardStore } from '$lib/stores/dashboard.svelte.js';
	import { SOURCE_CHANNELS, channelTotals, isSameSiteSource, sourceFromCampaign } from '$lib/analytics/sourceChannels.js';
	import { Compass, Search, Target, Users } from 'lucide-svelte';
	import CustomSelect from '$lib/components/generals/customSelect.svelte';
	import LoadingBoundary from '$lib/components/generals/loadingBoundary.svelte';

	let { siteId = null, siteDomain = '', demo = false, events = [], dateRange = null } = $props();

	let loading = $state(true);
	let campaigns = $state([]);
	let goalNames = $state([]);
	let selectedGoal = $state('');
	let selectedChannel = $state('All');
	let search = $state('');
	let requestId = 0;

	function effectiveRange() {
		return demo ? dateRange || {} : dashboardStore.dateRange || {};
	}

	function eventProperties(event) {
		if (!event?.event_data) return {};
		if (typeof event.event_data === 'object') return event.event_data;
		try {
			return JSON.parse(event.event_data);
		} catch {
			return {};
		}
	}

	function eventBucket(event) {
		const data = eventProperties(event);
		const source = data.utm_source || data.source;
		const medium = data.utm_medium || data.medium;
		const campaign = data.utm_campaign || data.campaign;
		if (source || medium || campaign) {
			return `${source || 'unknown'}|${medium || 'unknown'}|${campaign || 'unknown'}`;
		}
		if (!event?.referrer) return 'Direct';
		try {
			return new URL(event.referrer).hostname || 'Direct';
		} catch {
			return 'Direct';
		}
	}

	function demoCampaigns(goal, range) {
		const start = range?.startDate ? new Date(`${range.startDate}T00:00:00`).getTime() : -Infinity;
		const end = range?.endDate ? new Date(`${range.endDate}T23:59:59.999`).getTime() : Infinity;
		const buckets = new Map();

		for (const event of events || []) {
			const timestamp = new Date(event.timestamp).getTime();
			if (!Number.isFinite(timestamp) || timestamp < start || timestamp > end) continue;
			const bucket = eventBucket(event);
			const visitId = event.session_id || event.user_id;
			if (!visitId) continue;
			const row = buckets.get(bucket) || { bucket, visits: new Set(), conversions: new Set() };
			row.visits.add(visitId);
			const eventName = event.event_name || event.event_type;
			if (goal && event.event_type !== 'pageview' && eventName === goal) row.conversions.add(visitId);
			buckets.set(bucket, row);
		}

		return Array.from(buckets.values()).map((row) => {
			const visits = row.visits.size;
			const conversions = row.conversions.size;
			return {
				bucket: row.bucket,
				visits,
				conversions,
				conversionRate: visits ? Math.round((conversions / visits) * 10000) / 100 : 0
			};
		});
	}

	async function loadGoalNames() {
		if (demo) {
			goalNames = Array.from(
				new Set((events || []).filter((event) => event.event_type !== 'pageview').map((event) => event.event_name || event.event_type).filter(Boolean))
			).sort();
			return;
		}
		if (!siteId) return;
		try {
			const response = await api.getEventNames(siteId);
			goalNames = response.eventNames || [];
		} catch (error) {
			console.error('Goal names fetch error:', error);
			goalNames = [];
		}
	}

	async function loadCampaigns(goal, range) {
		const currentRequest = ++requestId;
		loading = true;
		try {
			const rows = demo
				? demoCampaigns(goal, range)
				: (await api.getCampaigns(siteId, range, 100, goal || undefined)).campaigns || [];
			if (currentRequest === requestId) campaigns = rows;
		} catch (error) {
			console.error('Acquisition fetch error:', error);
			if (currentRequest === requestId) campaigns = [];
		} finally {
			if (currentRequest === requestId) loading = false;
		}
	}

	$effect(() => {
		if (demo || siteId) loadGoalNames();
	});

	$effect(() => {
		const range = effectiveRange();
		const goal = selectedGoal;
		if (!range?.startDate || !range?.endDate || (!demo && !siteId)) return;
		loadCampaigns(goal, { startDate: range.startDate, endDate: range.endDate });
	});

	let sourceRows = $derived(campaigns.map(sourceFromCampaign).filter((row) => !isSameSiteSource(row.source, siteDomain)));
	let totalsByChannel = $derived(channelTotals(sourceRows));
	let displayRows = $derived.by(() => {
		const query = search.trim().toLowerCase();
		return sourceRows
			.filter((row) => selectedChannel === 'All' || row.channel === selectedChannel)
			.filter((row) => !query || `${row.source} ${row.detail} ${row.channel}`.toLowerCase().includes(query))
			.sort((a, b) => b.visits - a.visits || b.conversions - a.conversions);
	});

	let totals = $derived({
		visits: sourceRows.reduce((sum, row) => sum + Number(row.visits || 0), 0),
		conversions: sourceRows.reduce((sum, row) => sum + Number(row.conversions || 0), 0),
		sources: sourceRows.length
	});
	let conversionRate = $derived(totals.visits ? Math.round((totals.conversions / totals.visits) * 10000) / 100 : 0);
	let topSource = $derived(sourceRows.slice().sort((a, b) => b.visits - a.visits)[0] || null);
	let maxVisits = $derived(Math.max(1, ...displayRows.map((row) => Number(row.visits || 0))));
</script>

<div class="space-y-6">
	<div class="flex flex-col gap-4 px-2 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<h1 class="text-xl font-bold tracking-tight text-stone-900 dark:text-white">Acquisition</h1>
			<p class="mt-1 text-sm text-stone-500 dark:text-stone-400">Where visits came from and which sources led to a goal.</p>
		</div>
		<div class="w-full sm:w-64">
			<CustomSelect
				id="acquisition-goal"
				label="Conversion goal"
				bind:value={selectedGoal}
				options={[{ value: '', label: 'Traffic only' }, ...goalNames.map((goal) => ({ value: goal, label: goal }))]}
			/>
		</div>
	</div>

	<LoadingBoundary {loading} label="Loading acquisition analytics">
		{#snippet fallback()}
			<div class="flex min-h-[45vh] items-center justify-center">
				<div class="size-6 animate-spin border-2 border-stone-200 border-t-stone-900 dark:border-stone-800 dark:border-t-white"></div>
			</div>
		{/snippet}

		{#if sourceRows.length === 0}
			<div class="flex min-h-[45vh] flex-col items-center justify-center border border-stone-100 bg-stone-50 py-16 text-center dark:border-stone-800 dark:bg-stone-900">
				<Compass size={32} class="mb-3 text-stone-300 dark:text-stone-700" />
				<p class="text-sm font-medium text-stone-600 dark:text-stone-300">No acquisition data in this period</p>
				<p class="mt-1 text-xs text-stone-400">Direct, referral and tagged visits will appear here.</p>
			</div>
		{:else}
			<div class="grid gap-4 sm:grid-cols-3">
				<div class="border border-stone-100 bg-stone-50 p-5 dark:border-stone-800 dark:bg-stone-900">
					<div class="mb-2 flex items-center gap-2 text-xs text-stone-500"><Users size={14} /> Visits</div>
					<p class="text-2xl font-bold tabular-nums text-stone-900 dark:text-white">{totals.visits.toLocaleString()}</p>
				</div>
				{#if selectedGoal}
					<div class="border border-stone-100 bg-stone-50 p-5 dark:border-stone-800 dark:bg-stone-900">
						<div class="mb-2 flex items-center gap-2 text-xs text-stone-500"><Target size={14} /> {selectedGoal}</div>
						<p class="text-2xl font-bold tabular-nums text-stone-900 dark:text-white">{totals.conversions.toLocaleString()}</p>
					</div>
					<div class="border border-stone-100 bg-stone-50 p-5 dark:border-stone-800 dark:bg-stone-900">
						<p class="mb-2 text-xs text-stone-500">Visit-to-goal rate</p>
						<p class="text-2xl font-bold tabular-nums text-{$color}-600 dark:text-{$color}-400">{conversionRate}%</p>
					</div>
				{:else}
					<div class="border border-stone-100 bg-stone-50 p-5 dark:border-stone-800 dark:bg-stone-900">
						<p class="mb-2 text-xs text-stone-500">Sources</p>
						<p class="text-2xl font-bold tabular-nums text-stone-900 dark:text-white">{totals.sources}</p>
					</div>
					<div class="border border-stone-100 bg-stone-50 p-5 dark:border-stone-800 dark:bg-stone-900">
						<p class="mb-2 text-xs text-stone-500">Top source</p>
						<p class="truncate text-lg font-bold text-stone-900 dark:text-white">{topSource?.source || '—'}</p>
					</div>
				{/if}
			</div>

			<div class="overflow-hidden border border-stone-100 bg-stone-50 dark:border-stone-800 dark:bg-stone-900">
				<div class="space-y-4 border-b border-stone-100 bg-white/60 p-4 dark:border-stone-800 dark:bg-stone-900/60">
					<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h2 class="text-sm font-bold text-stone-900 dark:text-white">Traffic sources</h2>
							<p class="text-xs text-stone-500">UTM means a deliberately tagged campaign link.</p>
						</div>
						<label class="relative block sm:w-64">
							<span class="sr-only">Search traffic sources</span>
							<Search size={14} class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
							<input bind:value={search} placeholder="Search sources" class="w-full border border-stone-200 bg-white py-2 pl-9 pr-3 text-xs text-stone-900 outline-none focus:border-stone-400 dark:border-stone-700 dark:bg-stone-950 dark:text-white" />
						</label>
					</div>
					<div class="flex flex-wrap gap-2" aria-label="Filter by source type">
						{#each SOURCE_CHANNELS as channel (channel)}
							{@const count = channel === 'All' ? totals.visits : totalsByChannel.get(channel) || 0}
							<button type="button" onclick={() => (selectedChannel = channel)} class="border px-3 py-1.5 text-xs font-medium transition-colors {selectedChannel === channel ? 'border-stone-900 bg-stone-900 text-white dark:border-white dark:bg-white dark:text-stone-900' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-400 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-300'}">
								{channel} <span class="ml-1 opacity-65 tabular-nums">{count.toLocaleString()}</span>
							</button>
						{/each}
					</div>
				</div>

				<div class="divide-y divide-stone-100 dark:divide-stone-800">
					{#each displayRows as row (row.bucket)}
						<div class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-5 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_7rem_7rem]">
							<div class="min-w-0">
								<div class="flex min-w-0 items-center gap-2">
									<p class="truncate text-sm font-semibold text-stone-900 dark:text-white">{row.source}</p>
									<span class="shrink-0 border border-stone-200 bg-white px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-stone-500 dark:border-stone-700 dark:bg-stone-950">{row.channel}</span>
								</div>
								{#if row.detail}<p class="mt-1 truncate text-xs text-stone-400">{row.detail}</p>{/if}
								<div class="mt-2 h-1 max-w-md bg-stone-200 dark:bg-stone-800"><div class="h-full bg-{$color}-600" style={`width: ${Math.max(2, (row.visits / maxVisits) * 100)}%`}></div></div>
							</div>
							<div class="text-right">
								<p class="text-sm font-bold tabular-nums text-stone-900 dark:text-white">{row.visits.toLocaleString()}</p>
								<p class="text-[10px] uppercase tracking-wide text-stone-400">visits</p>
							</div>
							{#if selectedGoal}
								<div class="col-span-2 text-right sm:col-span-1">
									<p class="text-sm font-bold tabular-nums text-stone-900 dark:text-white">{row.conversions.toLocaleString()} <span class="font-normal text-stone-400">· {row.conversionRate}%</span></p>
									<p class="text-[10px] uppercase tracking-wide text-stone-400">conversions</p>
								</div>
							{/if}
						</div>
					{:else}
						<p class="px-5 py-10 text-center text-sm text-stone-400">No sources match this filter.</p>
					{/each}
				</div>
			</div>
		{/if}
	</LoadingBoundary>
</div>
