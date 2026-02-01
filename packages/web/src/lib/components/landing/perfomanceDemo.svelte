<script>
	import { color } from '$lib/colors/mixer.js';
	import { Search } from 'lucide-svelte';
	import Dropdown from '$lib/components/generals/dropdown.svelte';
	import LoadingState from '$lib/components/analytics/graphStuff/loadingState.svelte';
	import { deserialize } from '$app/forms';
	import { scale, slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { onMount } from 'svelte';
	import { defaultRange as globalRange, optis } from '$lib/demostate.svelte.js';
	import DemoLoadingState from '../analytics/graphStuff/demoLoadingState.svelte';

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
	export let data = { records: [] };
	$: page_data = data.records;
	$: metrics = getPerformanceMetrics(page_data);
	$: formattedMetrics = {
		avgLoad: metrics.avgLoadTime.toFixed(1),
		avgMemUsed: (metrics.avgMemory.used / 1024 / 1024).toFixed(2),
		avgMemTotal: (metrics.avgMemory.total / 1024 / 1024).toFixed(2),
		avgSession: metrics.avgSessionDuration.toFixed(1),
		urlMetrics: metrics.urlMetrics
	};

	let sortInterval;
	let loading = false;



	async function handleDateChange(event) {
		const date = event.detail.value;
		// await fetchFromDefaultDates(date);
		sortInterval = parseInt(date);
		globalRange.setRange(sortInterval)

	}

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
	let showSearch = false;

	function startSeach(e) {
		let query = e.target.value;
		console.log(query);
	}

	// Filter functions
	const filterFunctions = {
		search: ([url, _]) => {
            return url.toLowerCase().includes(searchQuery.toLowerCase())
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
	$: processedUrlMetrics = (() => {
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

	// Enhanced fetch with error handling
	async function fetchFromDefaultDates(date) {
		loading = true;
		try {
			const form = new FormData();
			form.append('defaultRange', date);
			form.append('domain_id', data.domain_id);

			const response = await fetch('?/fetchDate', {
				method: 'POST',
				body: form
			});

			if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

			const result = deserialize(await response.text());

			if (!result?.data?.records) {
				throw new Error('Invalid response structure');
			}

			page_data = result.data.records;
			data.records = page_data;
		} catch (error) {
			console.error('Fetch failed:', error);
			// Consider adding user-facing error notification
		} finally {
			loading = false;
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

	onMount(async () => {
		let date = globalRange.getRange()
		// await fetchFromDefaultDates(date);
		sortInterval = parseInt(date);
		// await fetchSpikes(date);
	});
</script>


{#if loading}
	<DemoLoadingState />
{/if}


<div class="mx-auto  text-gray-100">

	<nav class="flex flex-wrap justify-between gap-4 py-2">
		yaqeen.me
		<Dropdown on:change={handleDateChange} title="Filter" options={optis} value={sortInterval}>
			<button class="flex items-center gap-1 text-gray-300">
				<Calendar size={16} /> Custom Date
			</button>
		</Dropdown>
	</nav>
	<div class="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3 text-black dark:text-white">
		<div class="rounded-xl bg-{$color}-200 bg-opacity-35 dark:bg-stone-800 p-4 text-center flex flex-col gap-3 py-8">
			<h3 class="text-sm ">Avg Page Load</h3>
			<div class="text-xl font-bold">{(formattedMetrics.avgLoad/1000).toFixed(1)}s</div>
		</div>
		<div class="rounded-xl bg-{$color}-200 bg-opacity-35 dark:bg-stone-800 p-4 text-center flex flex-col gap-3 py-8">
			<h3 class="text-sm ">Avg Memory Usage</h3>
			<div class="text-xl font-bold">
				{formattedMetrics.avgMemUsed}MB / {formattedMetrics.avgMemTotal}MB
			</div>
		</div>
		<div class="rounded-xl bg-{$color}-200 bg-opacity-35 dark:bg-stone-800 p-4 text-center flex flex-col gap-3 py-8">
			<h3 class="text-sm ">Avg Session Duration</h3>
			<div class="text-xl font-bold">{formattedMetrics.avgSession}s</div>
		</div>
	</div>

	<div class="mt-6 rounded-xl bg-{$color}-200 bg-opacity-35 dark:bg-stone-800 p-4">
		<div class="mb-4 flex items-center flex-wrap  gap-4 justify-between text-black dark:text-white">
			<h3 class="text-lg font-semibold">Performance by Page</h3>
			<div class="flex items-center gap-2 flex-wrap">
				<!-- <Dropdown
					title="Load Time"
					bind:value={loadTimeFilter}
					options={[
						{ value: 'all', label: 'All Load Times' },
						{ value: 'fast', label: 'Fast (< 1s)' },
						{ value: 'slow', label: 'Slow (≥ 1s)' }
					]}
				/>
				<Dropdown
					title="Memory"
					bind:value={memoryFilter}
					options={[
						{ value: 'all', label: 'All Memory' },
						{ value: 'low', label: 'Low (< 5MB)' },
						{ value: 'high', label: 'High (≥ 5MB)' }
					]}
				/> -->
               <!-- <div class="flex gap-3 flex-wrap">
                <div class="flex gap-1 items-center">
                    <div class="size-4 bg-blue-500">
    
                    </div>
                    <span>Memory</span>
                   </div>
                   <div class="flex gap-1 items-center">
                    <div class="size-4 bg-green-500">
    
                    </div>
                    <span>Load time</span>
                   </div>
               </div> -->
				<button onclick={() => (showSearch = !showSearch)} class="">
					<Search size={18} />
				</button>
			</div>
		</div>
        <!-- transition:slide={{}} -->
		{#if showSearch}
			<input
				class="w-full rounded-lg bg-{$color}-100/50 dark:bg-stone-800 p-2 text-black dark:text-gray-200"
				placeholder="Search pages..."
				bind:value={searchQuery}
				type="search"
			/>
		{/if}

		<div class="mt-4 flex justify-between gap-4 text-black dark:text-gray-300 py-2 border-b mb-2 border-stone-700">
            <div>
                Sort
            </div>
			<div class="flex gap-3">
                <button class="flex gap-1 items-center text-left" onclick={() => handleSort('loadTime')}
                    >
                    <div class="size-4 bg-blue-500 rounded">
        
                    </div>
                    Load Time {currentSort.key === 'loadTime' ? (currentSort.asc ? '↑' : '↓'):''}</button
                >
                <button class="flex gap-1 items-center text-left" onclick={() => handleSort('memory')}
                    >
                    <div class="size-4 bg-green-500 rounded">
        
                    </div>
                    Memory {currentSort.key === 'memory' ? (currentSort.asc ? '↑' : '↓'):''}</button
                >
            </div>
		</div>
<div class="flex flex-col gap-2">

	{#each processedUrlMetrics as [url, data], i (url)}
	<div animate:flip={{duration:199}} class="url-metric flex flex-col gap-1  bg-{$color}-100/50 dark:bg-stone-700/40 p-2 rounded">
		<div class="url text-black dark:text-gray-100 truncate">{url}</div>
		<div class="bars flex flex-col gap-1">
			<div class="load-bar bg-blue-500" style="width: {Math.min(data.loadTime / 100, 100)}%">
				{(data.loadTime/1000).toFixed(1)}s
			</div>
			<div
				class="memory-bar bg-green-700"
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
		border-radius: 4px;
		transition: width 0.3s ease;
	}

	
</style>
