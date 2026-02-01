<script>
	import Seo from '$lib/components/generals/seo.svelte';
	import LoadingState from '$lib/components/analytics/graphStuff/loadingState.svelte';
	import { dashboardStore } from '$lib/stores/dashboard.svelte.js';
	import { show_toast } from '$lib/toast.js';
	import { api } from '$lib/api/analytics.ts';
	import Events from '$lib/components/pages/events.svelte';

	let { data } = $props();
	let siteId = $derived(data.siteId);
	let current_domain = $derived(data.site);

	// State for event name counts (full date range totals)
	let loadingCounts = $state(false);
	let eventCounts = $state([]);

	// State for individual event log (paginated)
	let loadingLog = $state(false);
	let error = $state(null);
	let eventLog = $state([]);
	let logLimit = $state(100);
	let totalLogEvents = $state(0);
	let nextCursor = $state(null);
	let selectedEventName = $state(null);
	const maxRowsInMemory = 2000;

	// Fetch event name counts for the full date range
	async function fetchEventCounts() {
		if (!siteId) return;
		loadingCounts = true;
		try {
			const response = await api.getCustomEvents(siteId, {
				...dashboardStore.dateRange,
				excludePageview: true
			});
			eventCounts = response.events || [];
		} catch (err) {
			console.error('Event counts fetch error:', err);
			eventCounts = [];
		} finally {
			loadingCounts = false;
		}
	}

	// Fetch individual event log (paginated, optionally filtered by event name)
	async function fetchEventLog(reset = true) {
		if (!siteId) return;
		loadingLog = true;
		error = null;
		try {
			const response = await api.getEvents(siteId, {
				limit: logLimit,
				cursor: reset ? undefined : nextCursor,
				filter: {
					...dashboardStore.dateRange,
					excludePageview: true
				},
				eventName: selectedEventName || undefined
			});
			totalLogEvents = response.total || 0;
			nextCursor = response.nextCursor;
			if (reset) {
				eventLog = response.events || [];
			} else {
				eventLog = [...eventLog, ...(response.events || [])].slice(0, maxRowsInMemory);
			}
		} catch (err) {
			console.error('Event log fetch error:', err);
			error = err.message || 'Failed to load event log';
			show_toast.set({ message: error, type: 'error' });
			eventLog = [];
			totalLogEvents = 0;
			nextCursor = null;
		} finally {
			loadingLog = false;
		}
	}

	function loadMore() {
		if (!nextCursor) return;
		fetchEventLog(false);
	}

	function selectEvent(eventName) {
		selectedEventName = selectedEventName === eventName ? null : eventName;
		fetchEventLog(true);
	}

	// Fetch counts when site or date range changes
	$effect(() => {
		if (siteId && dashboardStore?.dateRange?.startDate && dashboardStore?.dateRange?.endDate) {
			fetchEventCounts();
		}
	});

	// Fetch log when site, date range, or selected event changes
	$effect(() => {
		if (siteId && dashboardStore?.dateRange?.startDate && dashboardStore?.dateRange?.endDate) {
			fetchEventLog(true);
		}
	});
</script>

<svelte:head>
	<Seo title={`${current_domain?.name || 'Site'} - Event Analytics`} />
</svelte:head>

{#if loadingCounts && eventCounts.length === 0}
	<LoadingState />
{/if}

{#if error && eventLog.length === 0}
	<div class="container mx-auto p-4 rounded-none">
		<div class="rounded-none bg-red-100 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-200 border border-red-200 dark:border-red-900/30">
			<p class="font-semibold rounded-none">Error loading events</p>
			<p class="text-sm rounded-none">{error}</p>
			<button 
				onclick={() => { fetchEventCounts(); fetchEventLog(true); }}
				class="mt-2 rounded-none bg-red-200 px-4 py-2 text-sm font-medium hover:bg-red-300 dark:bg-red-800 dark:hover:bg-red-700 transition-all"
			>
				Retry
			</button>
		</div>
	</div>
{/if}

<Events 
	page_data={eventLog} 
	{eventCounts} 
	{selectedEventName}
	{selectEvent}
	{loadMore}
	{nextCursor}
	{loadingLog}
	{totalLogEvents}
	{logLimit}
	rangeStart={dashboardStore?.dateRange?.startDate}
	rangeEnd={dashboardStore?.dateRange?.endDate}
/>
