<script>
	import { color } from '$lib/colors/mixer.js';
	import Seo from '$lib/components/generals/seo.svelte';
	import LoadingState from '$lib/components/analytics/graphStuff/loadingState.svelte';
	import { defaultRange as globalRange } from '$lib/globalstate.svelte.js';
	import { show_toast } from '$lib/toast.js';
	import { api } from '$lib/api/analytics.ts';
	import Traffic from '$lib/components/pages/traffic.svelte';

	let { data } = $props();
	let siteId = $derived(data.siteId);
	let current_domain = $derived(data.site);

	// State
	let loading = $state(false);
	let error = $state(null);
	let page_data = $state(null);

	// Date range
	let dateRange = $derived.by(() => {
		const range = globalRange?.range || [new Date(), new Date()];
		const start = range[0] instanceof Date ? range[0].toISOString() : range[0];
		const end = range[1] instanceof Date ? range[1].toISOString() : range[1];
		return {
			startDate: start?.split('T')[0],
			endDate: end?.split('T')[0]
		};
	});

	// Transform API data to component format
	function transformStatsData(stats, timeSeries) {
		if (!stats || !timeSeries) return null;

		return {
			views: stats.views || 0,
			uniqueUserAgents: stats.visitors || 0,
			bounce_rate: {
				bounceRate: stats.bounceRate?.toString() || '0.00',
				totalVisits: stats.visits || 0,
				bounceCount: Math.round((stats.visits || 0) * (stats.bounceRate || 0) / 100)
			},
			averageVisitDuration: stats.avgDuration || 0,
			sortedURls: timeSeries.pages || [],
			sortedReferrers: timeSeries.referrers || [],
			sortedContries: timeSeries.countries || [],
			sortedBrowsers: timeSeries.browsers || [],
			sortedOS: timeSeries.os || [],
			graph: timeSeries.data?.map(d => d.views) || [],
			visitorgraph: timeSeries.data?.map(d => d.visitors) || [],
			interval: '30',
			domain_id: siteId
		};
	}

	// Fetch traffic data
	async function fetchTrafficData() {
		if (!siteId) return;

		loading = true;
		error = null;

		try {
			const [stats, timeSeries] = await Promise.all([
				api.getStatsSummary(siteId, dateRange),
				api.getTimeSeries(siteId, dateRange, 'day')
			]);

			page_data = transformStatsData(stats, timeSeries);
		} catch (err) {
			console.error('Traffic fetch error:', err);
			error = err.message || 'Failed to load traffic data';
			show_toast.set({ message: error, type: 'error' });
		} finally {
			loading = false;
		}
	}

	// Watch for date range changes
	$effect(() => {
		if (dateRange.startDate && dateRange.endDate && siteId) {
			fetchTrafficData();
		}
	});
</script>

<svelte:head>
	<Seo title={`${current_domain?.name || 'Site'} - Traffic Analytics`} />
</svelte:head>

{#if loading && !page_data}
	<LoadingState />
{/if}

{#if error && !page_data}
	<div class="container mx-auto p-4 rounded-none">
		<div class="rounded-none bg-red-100 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-200 border border-red-200 dark:border-red-900/30">
			<p class="font-semibold rounded-none">Error loading traffic data</p>
			<p class="text-sm rounded-none">{error}</p>
			<button 
				onclick={fetchTrafficData}
				class="mt-2 rounded-none bg-red-200 px-4 py-2 text-sm font-medium hover:bg-red-300 dark:bg-red-800 dark:hover:bg-red-700 transition-all"
			>
				Retry
			</button>
		</div>
	</div>
{/if}

{#if page_data}
	<Traffic {page_data} {current_domain} domain_id={siteId} />
{/if}
