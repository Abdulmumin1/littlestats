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
	import { isOsInUserAgent, isBrowserInUserAgent, getCountry } from '$lib/slug/helpers.js';
	import CountrySection from '$lib/components/analytics/CountrySection.svelte';
	import Dropdown from '$lib/components/generals/dropdown.svelte';
	import PickDate from '$lib/components/generals/pickDate.svelte';
	import { derived } from 'svelte/store';
	import { defaultRange as globalRange, optis } from '$lib/demostate.svelte.js';
	import DemoLoadingState from '../analytics/graphStuff/demoLoadingState.svelte';

	let { data } = $props();

	let page_data = $state(data.records);

	$effect(() => {
		page_data = data.records;
	});

	// Derived state for views, unique user agents, bounces, and average duration
	let views = $derived(page_data.filter((e) => e.event_type !== 'pageExit'));
	let uniqueUserAgents = $derived(getUniqueUserAgents(page_data));
	let bounces = $derived(calculateBounceRate(page_data));
	let averageVisitDuration = $derived(calculateAverageDuration(page_data));

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

	// Helper functions
	function getUniqueUserAgents(events) {
		const uniqueAgents = new Map();
		events.forEach((event) => {
			if (!uniqueAgents.has(event.ip)) {
				uniqueAgents.set(event.ip, event);
			}
		});
		return Array.from(uniqueAgents.values());
	}

	function calculateAverageDuration(events) {
		const validEvents = events.filter((e) => e.event_type === 'pageExit' && e.duration > 0);
		if (validEvents.length === 0) return 0;
		const totalDuration = validEvents.reduce((acc, curr) => acc + curr.duration, 0);
		return totalDuration / validEvents.length;
	}

	function calculateBounceRate(events) {
		const userSessions = {};
		let totalVisits = 0;
		let bounceCount = 0;

		events.forEach((event) => {
			const { ip, event_type, session_id } = event;
			if (!userSessions[ip]) userSessions[ip] = { pageViews: 0 };

			if (event_type === 'pageview') {
				totalVisits++;
				userSessions[ip].pageViews++;
			}

			if (userSessions[ip].pageViews === 1 && event_type === 'pageExit') {
				bounceCount++;
			}
		});

		const bounceRate = totalVisits === 0 ? 0 : (bounceCount / totalVisits) * 100;
		return { bounceRate: bounceRate.toFixed(2), totalVisits, bounceCount };
	}

	function triggerFilter(e) {
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
		applyFilter(filters);
	}
	function removeFilter(filter) {
		filters = filters.filter((e) => e != filter);
		applyFilter(filters);
	}
	function applyFilter(filters) {
		let filteredData = [...data.records];
		filters.forEach((filter) => {
			switch (filter.type) {
				case 'page':
					filteredData = filteredData.filter((e) => e.url === filter.query);
					break;
				case 'ref':
					filteredData = filteredData.filter((e) =>
						filter.query === 'Direct' ? !e.referrer : e.referrer?.includes(filter.query)
					);
					break;
				case 'browser':
					filteredData = filteredData.filter((e) =>
						isBrowserInUserAgent(e.user_agent, filter.query)
					);
					break;
				case 'os':
					filteredData = filteredData.filter((e) => isOsInUserAgent(e.user_agent, filter.query));
					break;
				case 'country':
					filteredData = filteredData.filter((e) => {
						try {
							return e.timezone && getCountry(e.timezone) === filter.query;
						} catch {
							return false;
						}
					});
					break;
			}
		});
		page_data = filteredData;
	}

	async function fetchFromDefaultDates(date) {
		loading = true;
		const form = new FormData();
		form.append('defaultRange', date);
		form.append('domain_id', data.domain_id);

		const response = await fetch('?/fetchDate', { method: 'POST', body: form });
		if (response.ok) {
			const result = deserialize(await response.text());
			page_data = result.data.records;

			data.records = page_data;
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
				backdateViews = backdateRecords.filter((e) => e.event_type !== 'pageExit');
				backdateBounces = calculateBounceRate(backdateRecords);
				backdateaverageVisitDuration = calculateAverageDuration(backdateRecords);
				backdateuniqueUserAgents = getUniqueUserAgents(backdateRecords);

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

	onMount(async () => {
		let date = globalRange.getRange();
		await fetchFromDefaultDates(date);
		sortInterval = parseInt(date);
		await fetchSpikes(date);
	});

	let current_domain = 'yaqeen.me'
</script>

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
	<h1 class="mb-4 px-2 pt-4 text-2xl font-bold text-gray-100 md:text-3xl">Traffic</h1>

	{#if loading}
		<DemoLoadingState />
	{/if}

	<div class="container mx-auto flex flex-col gap-4 dark:text-white">
		<nav class="flex flex-wrap justify-between gap-4 py-2">
			<div class="flex flex-wrap items-center gap-4 md:gap-5">yaqeen.me</div>
			<Dropdown
				on:change={handleDateChange}
				title="Filter"
				options={optis}
				value={sortInterval}
			></Dropdown>
		</nav>

		{#if filters.length > 0}
			<div in:slide={{ duration: 230 }} class="flex w-full flex-row flex-wrap gap-1">
				{#each filters as filter}
					<button
						transition:scale
						onclick={() => removeFilter(filter)}
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
