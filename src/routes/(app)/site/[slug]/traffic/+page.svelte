<script>
	import { onMount } from 'svelte';
	import ViewCard from '$lib/components/analytics/viewCard.svelte';
	import PageItem from '$lib/components/analytics/pageItem.svelte';
	import { color } from '$lib/colors/mixer.js';
	import { deserialize } from '$app/forms';
	import PagesSection from '$lib/components/analytics/pagesSection.svelte';
	import ChartJsGraph from '$lib/components/analytics/graphStuff/chartJsGraph.svelte';
	import Seo from '$lib/components/generals/seo.svelte';
	import ReferrerSection from '$lib/components/analytics/referrerSection.svelte';
	import BrowserSection from '$lib/components/analytics/browserSection.svelte';
	import OsSection from '$lib/components/analytics/OsSection.svelte';
	import LoadingState from '$lib/components/analytics/graphStuff/loadingState.svelte';
	import { X, Calendar } from 'lucide-svelte';
	import { scale, slide } from 'svelte/transition';
	import CountrySection from '$lib/components/analytics/CountrySection.svelte';
	import Dropdown from '$lib/components/generals/dropdown.svelte';
	import PickDate from '$lib/components/generals/pickDate.svelte';
	import { derived } from 'svelte/store';
	import { defaultRange as globalRange, optis, datacache } from '$lib/globalstate.svelte.js';
	import { fetchUpdates } from '$lib/slug/liveFetch.js';
	import { getUniqueUserAgents, filterView, createFilter, calculateAverageDuration, calculateBounceRate } from '$lib/traffic/helpers.js';
	import { executeInWorker } from '$lib/utils';
	

	let { data } = $props();

	let page_data = $state(data.records);
	let lastEvent = $derived(data.records?.[data.records.length - 1]);

	$effect(() => {
		page_data = data.records;
		// console.log([...page_data.splice(0,10)])
	});

	// $effect(() => {
		
	// 	console.log([...page_data.splice(0,10)])
	// });
	// Derived state for views, unique user agents, bounces, and average duration
	let views = $state([]);
	let uniqueUserAgents = $state([]);
	let bounces = $state({ bounceRate: 0, totalVisits:0, bounceCount:0 });
	let averageVisitDuration = $state(0);

	$effect(async ()=>{
		let dataSnapshot = $state.snapshot(page_data)
		views = await executeInWorker(filterView, dataSnapshot)
		uniqueUserAgents = await executeInWorker(getUniqueUserAgents, dataSnapshot)
		bounces = await executeInWorker(calculateBounceRate, dataSnapshot)
		averageVisitDuration = await executeInWorker(calculateAverageDuration, dataSnapshot)
	})
	// Backdate state
	let backdateRecords = $state([]);
	let backdateViews = $state(0);
	let backdateBounces = $state(0);
	let backdateaverageVisitDuration = $state(0);
	let backdateuniqueUserAgents = $state([]);

	// Filters and UI state
	let filters = $state([]);
	let loading = $state(false);
	let sortInterval = $state(1);
	let chartFilter = $state('Views');

	let chartD = $derived({
		data:
			chartFilter === 'Visitors'
				? uniqueUserAgents
				: chartFilter === 'Views'
					? views
					: [averageVisitDuration],
		label: chartFilter
	});
	let datePickerModal = $state(null);
	let selectedStartDate = $state(new Date());
	let selectedEndDate = $state(null);
	let isOpen = $state(false);


	async function triggerFilter(e) {
		let filter = e.detail;
		// let local_filters = [];

		if (filters.length > 0) {
			let seqmented = filters;
			const found = filters.find((value, index) => {
				return value.type == filter.type;
			});
			if (found) {
				let ind = seqmented.findIndex((e) => e == found);
				// console.log(found, ind);
				seqmented[ind] = filter;
			} else {
				seqmented = [...seqmented, filter];
			}
			filters = seqmented;
		} else {
			filters = [...filters, filter];
		}
		await applyFilter(filters);
	}
	async function removeFilter(filter) {
		filters = filters.filter((e) => e != filter);
		await applyFilter(filters);
	}
	async function applyFilter(filters) {
		let dataSnapshot = $state.snapshot(data.records)
		let filtersSnapshot = $state.snapshot(filters)
		let filteredData = await executeInWorker(createFilter, dataSnapshot, filtersSnapshot)
		page_data = filteredData;
	}

	async function fetchFromDefaultDates(date) {
		loading = true;
		let cache = datacache.getCache(`traffic-${date}-${data.domain_id}`);
		if (cache) {
			page_data = cache;
			data.records = cache;
			loading = false;

			return;
		}

		const form = new FormData();
		form.append('defaultRange', date);
		form.append('domain_id', data.domain_id);

		const response = await fetch('?/fetchDate', { method: 'POST', body: form });
		if (response.ok) {
			const result = deserialize(await response.text());
			page_data = result.data.records;
			data.records = page_data;
			datacache.setCach(`traffic-${date}-${data.domain_id}`, result.data.records);
		}
		loading = false;
	}

	async function updateSpikeCache(date, data) {
		const form = new FormData();
		form.append('defaultRange', date);
		form.append('domain_id', data.domain_id);
		form.append('data', JSON.stringify(data));

		const response = await fetch('?/updateSpikes', { method: 'POST', body: form });
		return response.ok;
	}

	async function fetchSpikes(date) {
		const form = new FormData();
		form.append('defaultRange', date);
		form.append('domain_id', data.domain_id);

		const response = await fetch('?/fetchSpikes', { method: 'POST', body: form });
		if (response.ok) {
			const result = deserialize(await response.text());
			if (!result.data.cache) {

				backdateRecords = result.data.results ?? [];
				let dataSnapshot = $state.snapshot(backdateRecords)
				backdateViews = backdateRecords.filter((e) => e.event_type !== 'pageExit');

				backdateBounces = await executeInWorker(calculateBounceRate, dataSnapshot);
				backdateaverageVisitDuration = await executeInWorker(calculateAverageDuration, dataSnapshot);
				backdateuniqueUserAgents = await executeInWorker(getUniqueUserAgents, dataSnapshot);

				await updateSpikeCache(date, {
					views: backdateViews.length,
					visitors: backdateuniqueUserAgents.length,
					visit_duration: parseInt(backdateaverageVisitDuration || 0),
					bounce_rate: parseInt(backdateBounces.bounceRate || 0),
					domain_id: data.domain_id
				});
			} else {
				backdateViews = result.data.results.record.views;
				backdateBounces = { bounceRate: result.data.results.record.bounce_rate };
				backdateaverageVisitDuration = result.data.results.record.visit_duration;
				backdateuniqueUserAgents = result.data.results.record.visitors;
			}
		}
	}

	function handleChartFilter(event) {
		chartFilter = event.detail.query;
	}

	async function handleDateChange(event) {
		const date = event.detail.value;
		await fetchFromDefaultDates(date);
		sortInterval = parseInt(date);
		globalRange.setRange(sortInterval);
		if (filters.length > 0) applyFilter(filters);
		await fetchSpikes(date);
	}

	let fetchUpdatesInterval = null;
	async function fetchUpdateFunction() {
		if (!lastEvent?.timestamp) return
		let updates = await fetchUpdates(data.domain_id, lastEvent.timestamp,);
		
		if (updates.length) {
			page_data = [...page_data, ...updates];
			data.records = page_data;
			datacache.setCach(`traffic-${sortInterval}-${data.domain_id}`, page_data);
		}
	}
	onMount(async () => {
		let date = globalRange.getRange();
		await fetchFromDefaultDates(date);
		sortInterval = parseInt(date);
		await fetchSpikes(date);

		fetchUpdatesInterval = setInterval(fetchUpdateFunction, 5*60*1000);

		return () => {
			clearInterval(fetchUpdatesInterval);
		};
	});

	const domain_options = data.domains.map((e) => ({ value: e.id, label: e.name }));
	const current_domain = data.domains.find((e) => e.id === data.domain_id);
</script>

<svelte:head>
	<Seo title={`${current_domain.name} - littlestats`} />
</svelte:head>

<div class="min-h-screen p-2 text-black">
	<!-- <PickDate
		bind:this={datePickerModal}
		bind:startDate={selectedStartDate}
		bind:endDate={selectedEndDate}
		bind:isOpen
		on:dateChange={handleCustomDateChange}
		on:clear={() => {
			selectedStartDate = null;
			selectedEndDate = null;
		}}
	/> -->

	{#if loading}
		<LoadingState />
	{/if}

	<div class="container mx-auto flex flex-col gap-4 dark:text-white">
		<nav class="flex flex-wrap justify-between gap-4 py-2">
			<div class="flex flex-wrap items-center gap-4 md:gap-5">
				<Dropdown
					on:change={(e) => (window.location.href = `/site/${e.detail.value}/traffic`)}
					title=""
					value={data.domain_id}
					options={domain_options}
				>
					<a href="/settings">+ add domain</a>
				</Dropdown>
			</div>
			<Dropdown on:change={handleDateChange} title="Filter" options={optis} value={sortInterval}>
				<button onclick={() => (isOpen = !isOpen)} class="flex items-center gap-1">
					<Calendar size={16} /> Custom Date
				</button>
			</Dropdown>
		</nav>

		{#if filters.length > 0}
			<div in:slide={{ duration: 230 }} class="flex w-full flex-row flex-wrap gap-1">
				{#each filters as filter}
					<button
						transition:scale
						onclick={async () => await removeFilter(filter)}
						class="flex w-fit items-center gap-1 rounded-full bg-{$color}-600 dark:bg-{$color}-700 p-1 px-2 text-gray-100"
					>
						{filter.type}
						<span
							class="rounded-full bg-{$color}-100 px-2 text-black dark:bg-stone-800 dark:text-gray-100"
						>
							{filter.query}
						</span>
						<span><X size={13} /></span>
					</button>
				{/each}
			</div>
		{/if}

		<header class="grid grid-cols-2 gap-1 divide-gray-500 md:grid-cols-3 lg:grid-cols-5">
			<ViewCard
				name="Views"
				backdateData={backdateViews.length ?? backdateViews}
				number={views.length}
				percentange="434%"
				on:chart_filter={handleChartFilter}
				filter_on={filters.length > 0}
			/>
			<ViewCard
				name="Visitors"
				backdateData={backdateuniqueUserAgents.length ?? backdateuniqueUserAgents}
				number={uniqueUserAgents.length}
				percentange="4%"
				on:chart_filter={handleChartFilter}
				filter_on={filters.length > 0}
			/>
			<ViewCard
				name="Visit Duration"
				backdateData={isNaN(backdateaverageVisitDuration) ? 0 : backdateaverageVisitDuration}
				number={averageVisitDuration}
				type="time"
				percentange="94%"
				filter_on={filters.length > 0}
			/>
			<ViewCard
				name="Bounce Rate"
				number={parseInt(bounces.bounceRate)}
				backdateData={parseInt(isNaN(backdateBounces.bounceRate) ? 0 : backdateBounces.bounceRate)}
				percentange="14%"
				increase="down"
				type="percent"
				filter_on={filters.length > 0}
			/>
		</header>

		<ChartJsGraph {chartD} {sortInterval} showChart={true} />
		<div class="mt-6 flex flex-wrap gap-6">
			<PagesSection {views} on:filter={triggerFilter} />
			<ReferrerSection {views} on:filter={triggerFilter} domain={current_domain} />
		</div>
		<div class="mb-12 mt-12 flex flex-wrap gap-12">
			<CountrySection {views} on:filter={triggerFilter} domain={current_domain} />
			<BrowserSection {views} on:filter={triggerFilter} domain={current_domain} />
			<OsSection {views} on:filter={triggerFilter} domain={current_domain} />
		</div>
	</div>
</div>

<style>
	.no-bg {
		background-color: transparent !important;
	}
</style>
