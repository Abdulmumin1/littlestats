<script>
	import { onMount } from 'svelte';
	import ViewCard from '$lib/components/analytics/viewCard.svelte';
	import { color } from '$lib/colors/mixer.js';
	import { deserialize } from '$app/forms';
	import PagesSection from '$lib/components/analytics/pagesSection.svelte';
	import ChartJsGraph from '$lib/components/analytics/graphStuff/chartJsGraph.svelte';
	import ReferrerSection from '$lib/components/analytics/referrerSection.svelte';
	import BrowserSection from '$lib/components/analytics/browserSection.svelte';
	import OsSection from '$lib/components/analytics/OsSection.svelte';
	import { X } from 'lucide-svelte';
	import { scale, slide } from 'svelte/transition';
	import CountrySection from '$lib/components/analytics/CountrySection.svelte';

	import { derived } from 'svelte/store';
	import { defaultRange as globalRange, optis, datacache } from '$lib/globalstate.svelte.js';
	import { createFilter } from '$lib/traffic/helpers.js';
	import { executeInWorker } from '$lib/utils';

	let empty = {
		views: 0,
		bounce_rate: {
			bounceRate: '0.00',
			totalVisits: 0,
			bounceCount: 0
		},
		uniqueUserAgents: 0,
		averageVisitDuration: 0,
		sortedURls: [],
		sortedReferrers: [],
		sortedContries: [],
		sortedBrowsers: [],
		sortedOS: [],
		graph: {},
		visitorgraph: {},
		interval: '30',
		domain_id: ''
	};

	let { page_data, current_domain, domain_id } = $props();

	// $effect(() => {

	// 	console.log([...page_data.splice(0,10)])
	// });
	// Derived state for views, unique user agents, bounces, and average duration
	let views = $derived(page_data?.views ?? 0);
	let uniqueUserAgents = $derived(page_data?.uniqueUserAgents ?? 0);
	let visitorgraph = $derived(page_data?.visitorgraph ?? []);
	let viewgraph = $derived(page_data?.graph ?? []);
	let bounces = $derived(
		page_data?.bounce_rate ?? {
			bounceRate: '0.00',
			totalVisits: 0,
			bounceCount: 0
		}
	);
	let averageVisitDuration = $derived(page_data?.averageVisitDuration ?? 0);

	// Backdate state
	let backdateRecords = $state([]);
	let backdateViews = $state(0);
	let backdateBounces = $state(0);
	let backdateaverageVisitDuration = $state(0);
	let backdateuniqueUserAgents = $state([]);

	// Filters and UI state
	let filters = $state([]);
	let loading = $state(false);
	let sortInterval = $derived(globalRange.getSingle());
	let chartFilter = $state('Views');

	let chartD = $derived({
		data:
			chartFilter === 'Visitors'
				? visitorgraph
				: chartFilter === 'Views'
					? viewgraph
					: [averageVisitDuration],
		label: chartFilter
	});

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
		// await applyFilter(filters);
	}

	async function removeFilter(filter) {
		filters = filters.filter((e) => e != filter);
		// await applyFilter(filters);
	}
	async function applyFilter(filters) {
		let dataSnapshot = $state.snapshot(data.records);
		let filtersSnapshot = $state.snapshot(filters);
		let filteredData = await executeInWorker(createFilter, dataSnapshot, filtersSnapshot);
		page_data = filteredData;
	}

	async function updateSpikeCache(date, data) {
		const form = new FormData();
		form.append('defaultRange', date);
		form.append('domain_id', domain_id);
		form.append('data', JSON.stringify(data));

		const response = await fetch('?/updateSpikes', { method: 'POST', body: form });
		return response.ok;
	}

	async function fetchSpikes() {
		const date = globalRange.getRangeInterval();
		// console.log(date)

		try {
			const form = new FormData();
			form.append('defaultRange', date);
			form.append('domain_id', domain_id);

			const response = await fetch('?/fetchSpikes', { method: 'POST', body: form });
			if (response.ok) {
				const result = deserialize(await response.text());
				if (result?.status != 200) {
					backdateViews = empty.views;
					backdateBounces = { bounceRate: empty.bounce_rate };
					backdateaverageVisitDuration = empty.averageVisitDuration;
					backdateuniqueUserAgents = empty.uniqueUserAgents;
					return;
				}
				backdateViews = result.data.records.views;
				backdateBounces = { bounceRate: result.data.records.bounce_rate };
				backdateaverageVisitDuration = result.data.records.averageVisitDuration;
				backdateuniqueUserAgents = result.data.records.uniqueUserAgents;
			}
		} catch (error) {
			backdateViews = empty.views;
			backdateBounces = { bounceRate: empty.bounce_rate };
			backdateaverageVisitDuration = empty.averageVisitDuration;
			backdateuniqueUserAgents = empty.uniqueUserAgents;
			// console.error(error)
		}
	}

	function handleChartFilter(event) {
		chartFilter = event.detail.query;
	}

	$effect(async () => {
		let x = page_data;
		console.log('changed');
		await fetchSpikes();
	});
</script>

<div class="min-h-screen p-2 text-black">
	<div class="container mx-auto flex flex-col gap-4 dark:text-white">
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
				number={views}
				percentange="434%"
				on:chart_filter={handleChartFilter}
				filter_on={filters.length > 0}
			/>
			<ViewCard
				name="Visitors"
				backdateData={backdateuniqueUserAgents.length ?? backdateuniqueUserAgents}
				number={uniqueUserAgents}
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

		<ChartJsGraph {chartD} sorted={true} {sortInterval} showChart={true} />
		<div class="mt-6 flex flex-wrap gap-6">
			<PagesSection views={page_data?.sortedURls ?? []} sorted={true} on:filter={triggerFilter} />
			<ReferrerSection
				views={page_data?.sortedReferrers ?? []}
				sorted={true}
				on:filter={triggerFilter}
				domain={current_domain}
			/>
		</div>
		<div class="mb-12 mt-12 flex flex-wrap gap-12">
			<CountrySection
				views={page_data?.sortedContries ?? []}
				sorted={true}
				on:filter={triggerFilter}
				domain={current_domain}
			/>
			<BrowserSection
				views={page_data?.sortedBrowsers ?? []}
				sorted={true}
				on:filter={triggerFilter}
				domain={current_domain}
			/>
			<OsSection
				views={page_data?.sortedOS ?? []}
				sorted={true}
				on:filter={triggerFilter}
				domain={current_domain}
			/>
		</div>
	</div>
</div>

<style>
	.no-bg {
		background-color: transparent !important;
	}
</style>
