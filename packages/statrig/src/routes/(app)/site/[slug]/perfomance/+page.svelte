<script>
	import { color } from '$lib/colors/mixer.js';
	import { Search } from 'lucide-svelte';
	import Dropdown from '$lib/components/generals/dropdown.svelte';
	import LoadingState from '$lib/components/analytics/graphStuff/loadingState.svelte';
	import { deserialize } from '$app/forms';
	import { scale, slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { onMount } from 'svelte';
	import { defaultRange as globalRange, optis, datacache } from '$lib/globalstate.svelte.js';

	// New filter state
	let searchQuery = '';
	let loadTimeFilter = 'all';
	let memoryFilter = 'all';
	let currentSort = { key: 'url', asc: true };

	// Performance analysis functions
	function parseEventData(eventData) {
		try {
			return JSON.parse(eventData);
		} catch {
			return {};
		}
	}

	function getPerformanceMetrics(data) {
		try {
			if (!Array.isArray(data)) {
				throw new Error('Invalid data format: expected array');
			}

			const metrics = {
				loadTimes: [],
				memoryUsage: [],
				sessionDurations: {},
				byUrl: {}
			};

			// Process all events
			data.forEach((event) => {
				const ed = parseEventData(event.event_data);

				// Page load times
				if (event.event_type === 'pageview' && typeof ed?.pageLoadTime === 'number') {
					metrics.loadTimes.push(ed.pageLoadTime);

					// Track by URL
					metrics.byUrl[event.url] = metrics.byUrl[event.url] || { loadTimes: [], memory: [] };
					metrics.byUrl[event.url].loadTimes.push(ed.pageLoadTime);
				}

				// Memory usage
				if (ed?.memory && typeof ed?.memory?.usedJSHeapSize === 'number') {
					metrics.memoryUsage.push({
						used: ed.memory.usedJSHeapSize,
						total: ed.memory.totalJSHeapSize
					});

					// Track by URL
					metrics.byUrl[event.url] = metrics.byUrl[event.url] || { loadTimes: [], memory: [] };
					metrics.byUrl[event.url].memory.push({
						used: ed.memory.usedJSHeapSize,
						total: ed.memory.totalJSHeapSize
					});
				}

				// Session durations
				if (event.event_type === 'pageExit' && typeof event.duration === 'number') {
					metrics.sessionDurations[event.session_id] =
						(metrics.sessionDurations[event.session_id] || 0) + event.duration;
				}
			});

			// Calculate averages
			const avgLoad =
				metrics.loadTimes.length > 0
					? metrics.loadTimes.reduce((a, b) => a + b, 0) / metrics.loadTimes.length
					: 0;

			const avgMemory =
				metrics.memoryUsage.length > 0
					? metrics.memoryUsage.reduce(
							(acc, curr) => ({
								used: acc.used + curr.used,
								total: acc.total + curr.total
							}),
							{ used: 0, total: 0 }
						)
					: { used: 0, total: 0 };

			avgMemory.used /= metrics.memoryUsage.length || 1;
			avgMemory.total /= metrics.memoryUsage.length || 1;

			const sessions = Object.values(metrics.sessionDurations);
			const avgSession =
				sessions.length > 0 ? sessions.reduce((a, b) => a + b, 0) / sessions.length : 0;

			// Process URL-based metrics
			const urlMetrics = {};
			Object.entries(metrics.byUrl).forEach(([url, data]) => {
				urlMetrics[url] = {
					loadTime:
						data.loadTimes.length > 0
							? data.loadTimes.reduce((a, b) => a + b, 0) / data.loadTimes.length
							: 0,
					memory:
						data.memory.length > 0
							? data.memory.reduce(
									(acc, curr) => ({
										used: acc.used + curr.used,
										total: acc.total + curr.total
									}),
									{ used: 0, total: 0 }
								)
							: { used: 0, total: 0 }
				};
				urlMetrics[url].memory.used /= data.memory.length || 1;
				urlMetrics[url].memory.total /= data.memory.length || 1;
			});

			return {
				avgLoadTime: avgLoad,
				avgMemory,
				avgSessionDuration: avgSession,
				urlMetrics
			};
		} catch (error) {
			console.error('Metrics calculation error:', error);
			return {
				avgLoadTime: 0,
				avgMemory: { used: 0, total: 0 },
				avgSessionDuration: 0,
				urlMetrics: {}
			};
		}
	}

	// Component logic
	let { data = { records: [] } } = $props();
	let page_data = $state([]);

	$effect(() => {
		page_data = data.records;
	});
	let metrics = $derived(getPerformanceMetrics(page_data));
	let formattedMetrics = $derived({
		avgLoad: metrics.avgLoadTime.toFixed(1),
		avgMemUsed: (metrics.avgMemory.used / 1024 / 1024).toFixed(2),
		avgMemTotal: (metrics.avgMemory.total / 1024 / 1024).toFixed(2),
		avgSession: metrics.avgSessionDuration.toFixed(1),
		urlMetrics: metrics.urlMetrics
	});

	let sortInterval = $derived(globalRange.getSingle());
	let loading = $state(false);

	// async function fetchFromDefaultDates(date) {
	// 	loading = true;
	// 	const form = new FormData();
	// 	form.append('defaultRange', date);
	// 	form.append('domain_id', data.domain_id);

	// 	const response = await fetch('?/fetchPerfomance', { method: 'POST', body: form });
	// 	if (response.ok) {
	// 		const result = deserialize(await response.text());
	// 		page_data = result.data.records;

	// 		data.records = page_data;
	// 	}
	// 	loading = false;
	// }
	let showSearch = $state(false);

	function startSeach(e) {
		let query = e.target.value;
		console.log(query);
	}

	// Filter functions
	const filterFunctions = {
		search: ([url, _]) => {
			return url.toLowerCase().includes(searchQuery.toLowerCase());
		},
		loadTime: ([_, data]) => {
			if (loadTimeFilter === 'fast') return data.loadTime < 1000;
			if (loadTimeFilter === 'slow') return data.loadTime >= 1000;
			return true;
		},
		memory: ([_, data]) => {
			const usedMB = data.memory.used / 1024 / 1024;
			if (memoryFilter === 'low') return usedMB < 5;
			if (memoryFilter === 'high') return usedMB >= 5;
			return true;
		}
	};

	// Sorting functions
	const sortFunctions = {
		url: ([a], [b]) => a.localeCompare(b) * (currentSort.asc ? 1 : -1),
		loadTime: ([_, a], [__, b]) => (a.loadTime - b.loadTime) * (currentSort.asc ? 1 : -1),
		memory: ([_, a], [__, b]) => (a.memory.used - b.memory.used) * (currentSort.asc ? 1 : -1)
	};

	// Processed URL metrics with error handling
	let processedUrlMetrics = $state({});

	$effect(() => {
		processedUrlMetrics = (() => {
			try {
				return Object.entries(formattedMetrics.urlMetrics || {})
					.filter(filterFunctions.search)
					.filter(filterFunctions.loadTime)
					.filter(filterFunctions.memory)
					.sort(sortFunctions[currentSort.key]);
			} catch (error) {
				console.error('URL metrics processing error:', error);
				return [];
			}
		})();
	});

	// Enhanced fetch with error handling
	async function fetchFromDefaultDates(date, isCustom, selectedStartDate, selectedEndDate) {
		try {
			if (!isCustom) {
				const form = new FormData();
				form.append('defaultRange', date);
				form.append('domain_id', data.domain_id);

				const response = await fetch('?/fetchDate', { method: 'POST', body: form });
				if (response.ok) {
					const result = deserialize(await response.text());
					page_data = result.data.records;

					// data.records = page_data;
					// datacache.setCach(`events-${date}-${data.domain_id}`, result.data.records);
				}
			} else {
				const form = new FormData();
				form.append('start', new Date(selectedStartDate).toISOString());
				form.append('end', new Date(selectedEndDate).toISOString());
				form.append('domain_id', data.domain_id);

				const response = await fetch('?/fetchRange', { method: 'POST', body: form });
				if (response.ok) {
					const result = deserialize(await response.text());
					page_data = result.data.records;

					// data.records = page_data;
				}
			}
		} catch (error) {
			page_data = []
		}
	}

	// Sorting handler
	function handleSort(key) {
		if (currentSort.key === key) {
			currentSort.asc = !currentSort.asc;
		} else {
			currentSort = { key, asc: true };
		}
	}

	let [selectedStartDate, selectedEndDate] = $derived(globalRange.getRange());
	let isCustom = $derived(globalRange.getCustom());


	$effect(async () => {
		loading = true;
		await fetchFromDefaultDates(sortInterval, isCustom, selectedStartDate, selectedEndDate);
		loading = false;
		// await fetchSpikes(date);
	});

	const current_domain = data.domains.find((e) => e.id === data.domain_id);
</script>

<svelte:head>
	<title>{current_domain.name} - Peformance Analytics</title>
</svelte:head>

{#if loading}
	<LoadingState />
{/if}
<div class="mx-auto text-gray-100">
	<div class="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3 rounded-none">
		<div
			class="rounded-none bg-{$color}-200 flex flex-col gap-3 bg-opacity-35 p-4 py-8 text-center dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-none"
		>
			<h3 class="text-sm text-stone-600 dark:text-stone-400">Avg Page Load</h3>
			<div class="text-xl font-bold text-stone-900 dark:text-white">{(formattedMetrics.avgLoad / 1000).toFixed(1)}s</div>
		</div>
		<div
			class="rounded-none bg-{$color}-200 flex flex-col gap-3 bg-opacity-35 p-4 py-8 text-center dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-none"
		>
			<h3 class="text-sm text-stone-600 dark:text-stone-400">Avg Memory Usage</h3>
			<div class="text-xl font-bold text-stone-900 dark:text-white">
				{formattedMetrics.avgMemUsed}MB / {formattedMetrics.avgMemTotal}MB
			</div>
		</div>
		<div
			class="rounded-none bg-{$color}-200 flex flex-col gap-3 bg-opacity-35 p-4 py-8 text-center dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-none"
		>
			<h3 class="text-sm text-stone-600 dark:text-stone-400">Avg Session Duration</h3>
			<div class="text-xl font-bold text-stone-900 dark:text-white">{formattedMetrics.avgSession}s</div>
		</div>
	</div>

	<div class="mt-6 rounded-none bg-{$color}-200 bg-opacity-35 p-4 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-none">
		<div class="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-none">
			<h3 class="text-lg font-semibold text-stone-900 dark:text-white">Performance by Page</h3>
			<div class="flex flex-wrap items-center gap-2 rounded-none">
				<button onclick={() => (showSearch = !showSearch)} class="text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors">
					<Search size={18} />
				</button>
			</div>
		</div>
		{#if showSearch}
			<input
				class="w-full rounded-none bg-{$color}-100/50 p-2 text-stone-900 dark:text-gray-200 border border-stone-200 dark:border-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400"
				placeholder="Search pages..."
				bind:value={searchQuery}
				type="search"
			/>
		{/if}

		<div
			class="mb-2 mt-4 flex justify-between gap-4 border-b border-stone-700 py-2 text-stone-900 dark:text-gray-300 rounded-none"
		>
			<div class="text-stone-500 dark:text-stone-400 text-xs font-black uppercase tracking-widest">Sort</div>
			<div class="flex gap-3 rounded-none">
				<button class="flex items-center gap-1 text-left rounded-none text-xs font-bold" onclick={() => handleSort('loadTime')}>
					<div class="size-3 rounded-none bg-blue-500"></div>
					Load Time {currentSort.key === 'loadTime' ? (currentSort.asc ? '↑' : '↓') : ''}</button
				>
				<button class="flex items-center gap-1 text-left rounded-none text-xs font-bold" onclick={() => handleSort('memory')}>
					<div class="size-3 rounded-none bg-green-500"></div>
					Memory {currentSort.key === 'memory' ? (currentSort.asc ? '↑' : '↓') : ''}</button
				>
			</div>
		</div>
		<div class="flex flex-col gap-2 rounded-none">
			{#each processedUrlMetrics as [url, data], i (url)}
				<div
					animate:flip={{ duration: 199 }}
					class="url-metric flex flex-col gap-1 bg-{$color}-100/50 rounded-none p-2 dark:bg-stone-700/40 border border-stone-100 dark:border-stone-800"
				>
					<div class="url truncate text-black dark:text-gray-100 rounded-none">{url}</div>
					<div class="bars flex flex-col gap-1 rounded-none">
						<div class="load-bar bg-blue-500 rounded-none" style="width: {Math.min(data.loadTime / 100, 100)}%">
							{(data.loadTime / 1000).toFixed(1)}s
						</div>
						<div
							class="memory-bar bg-green-700 rounded-none"
							style="width: {Math.min((data.memory.used / data.memory.total) * 100, 100)}%"
						>
							{(data.memory.used / 1024 / 1024).toFixed(1)}MB
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.load-bar,
	.memory-bar {
		height: 24px;
		padding: 0 0.5rem;
		font-size: 0.8rem;
		display: flex;
		align-items: center;
		color: white;
		border-radius: 0;
		transition: width 0.3s ease;
	}
</style>
