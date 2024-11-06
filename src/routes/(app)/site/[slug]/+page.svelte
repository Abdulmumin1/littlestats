<script>
	import { onMount } from 'svelte';
	import ViewCard from '$lib/components/analytics/viewCard.svelte';
	import PageItem from '$lib/components/analytics/pageItem.svelte';
	import { color } from '$lib/colors/mixer.js';

	export let data;

	import { deserialize } from '$app/forms';
	import PagesSection from '../../../../lib/components/analytics/pagesSection.svelte';
	import ChartJsGraph from '../../../../lib/components/analytics/graphStuff/chartJsGraph.svelte';
	import Seo from '../../../../lib/components/generals/seo.svelte';
	import ReferrerSection from '../../../../lib/components/analytics/referrerSection.svelte';
	import BrowserSection from '../../../../lib/components/analytics/browserSection.svelte';
	import OsSection from '../../../../lib/components/analytics/OsSection.svelte';
	import LoadingState from '../../../../lib/components/analytics/graphStuff/loadingState.svelte';
	import { X, Calendar } from 'lucide-svelte';
	import { scale, slide } from 'svelte/transition';
	import { isOsInUserAgent, isBrowserInUserAgent, getCountry } from '$lib/slug/helpers.js';
	import CountrySection from '../../../../lib/components/analytics/CountrySection.svelte';
	import Dropdown from '../../../../lib/components/generals/dropdown.svelte';

	$: page_data = data.records;

	$: views = page_data.filter((e) => e.event_type != 'pageExit');
	// Function to get unique user agents
	function getUniqueUserAgents(events) {
		const uniqueAgents = new Map();

		events.forEach((event) => {
			if (!uniqueAgents.has(event.user_agent)) {
				uniqueAgents.set(event.user_agent, event);
			}
		});

		return Array.from(uniqueAgents.values());
	}

	// Function to calculate average visit duration
	function calculateAverageDuration(events) {
		// Filter out events with duration
		const durations = events.map((event) => event.duration);

		// Calculate total duration
		const totalDuration = durations.reduce((acc, curr) => acc + curr, 0);

		// Calculate average
		const averageDuration = totalDuration / durations.length;

		return averageDuration;
	}

	// Function to calculate bounce rate
	function calculateBounceRate(events) {
		let totalVisits = events.length; // Total number of page views
		let bounceCount = 0;

		// Create a map to track user interactions
		const userInteractions = {};

		// Iterate through events and categorize them
		for (const event of events) {
			const { user_agent, url } = event;

			// If the user has not interacted with a different page
			if (!userInteractions[user_agent]) {
				userInteractions[user_agent] = { visited: false };
			}

			// Mark as visited
			userInteractions[user_agent].visited = true;

			// Check for any page transitions or interactions
			// For example, if you have an event type that indicates a new page visit
			if (event.event_type === 'pageview' && userInteractions[user_agent].visited) {
				// Increment bounce count if this is the only interaction for the user
				bounceCount++;
			}
		}

		// Bounce rate calculation
		const bounceRate = (bounceCount / totalVisits) * 100;

		return {
			bounceRate: bounceRate.toFixed(2), // Format to two decimal places
			totalVisits: totalVisits,
			bounceCount: bounceCount
		};
	}
	$: bounces = calculateBounceRate(page_data);
	$: averageVisitDuration = calculateAverageDuration(page_data);
	// $: formatDr = formatDuration(parseInt(averageVisitDuration));
	$: uniqueUserAgents = getUniqueUserAgents(page_data);

	$: backdateRecords = [];
	$: backdateViews = 0;
	$: backdateBounces = 0;
	$: backdateaverageVisitDuration = 0;
	$: backdateuniqueUserAgents = [];

	let filters = [];

	function handleAddfilter(filter) {
		filter = filter.detail;
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

		// filters = local_filters;
		applyfilter(filters);
	}

	function removeFilter(filter) {
		filters = filters.filter((e) => e != filter);
		applyfilter(filters);
	}

	function applyfilter(ft) {
		let mock_page = [...data.records];

		ft.forEach((filter) => {
			if (filter.type == 'page') {
				mock_page = mock_page.filter((e) => e.url == filter.query);
			} else if (filter.type == 'ref') {
				mock_page = mock_page.filter((e) => {
					if (filter.query == 'Direct') {
						return !e.referrer;
					} else {
						return e.referrer.includes(filter.query);
					}
				});
			} else if (filter.type == 'browser') {
				mock_page = mock_page.filter((e) => {
					return isBrowserInUserAgent(e.user_agent, filter.query);
				});
			} else if (filter.type == 'os') {
				mock_page = mock_page.filter((e) => {
					return isOsInUserAgent(e.user_agent, filter.query);
				});
			} else if (filter.type == 'country') {
				mock_page = mock_page.filter((e) => {
					// console.log(e.timezone == '', filter.query);
					try {
						if (e.timezone == '') return false;
						return getCountry(e?.timezone) == filter.query;
					} catch (error) {
						return false;
					}
				});
			}
		});

		// console.log(mock_page.length, data.records.length);
		page_data = [...mock_page];
		// filterlegth = mock_page.length;
		// console.log(mock_page.length, data.records.length);
	}

	let current_domain = data.domains.filter((e) => e.id == data.domain_id);
	let temp_domain = data.domains.filter((e) => e.id != data.domain_id);
	let managed_domains = [...current_domain, ...temp_domain];
	let loading = false;

	async function fetchFromDefaultDates(date) {
		loading = true;

		let form = new FormData();
		form.append('defaultRange', date);
		form.append('domain_id', data.domain_id);

		let response = await fetch('?/fetchDate', {
			method: 'post',
			body: form
		});

		if (response.ok) {
			let local_result = deserialize(await response.text());
			let local_records = local_result.data;
			page_data = local_records;
			data.records = page_data;
			// console.log(local_records);
			if (filters.length > 0) {
				applyfilter(filters);
			}
		}
	}

	async function updateSpikeCache(date, dt) {
		let form = new FormData();
		form.append('defaultRange', date);
		form.append('domain_id', data.domain_id);
		form.append('data', JSON.stringify(dt));

		let response = await fetch('?/updateSpikes', {
			method: 'post',
			body: form
		});

		if (response.ok) {
			return true;
		}
		return false;
	}
	async function fetchSpikes(date) {
		let form = new FormData();
		form.append('defaultRange', date);
		form.append('domain_id', data.domain_id);

		let response = await fetch('?/fetchSpikes', {
			method: 'post',
			body: form
		});

		if (response.ok) {
			let local_result = deserialize(await response.text());
			// console.log(local_result.data);

			if (!local_result.data.cache) {
				let local_records = local_result.data.results ?? [];
				backdateRecords = local_records;
				backdateViews = backdateRecords.filter((e) => e.event_type != 'pageExit');
				backdateBounces = calculateBounceRate(backdateRecords);
				backdateaverageVisitDuration = calculateAverageDuration(backdateRecords);
				backdateuniqueUserAgents = getUniqueUserAgents(backdateRecords);

				// console.log(backdateBounces, backdateuniqueUserAgents);
				// create spike values.
				// update spikes tables.
				// updateSpikeCache()
				let d2 = {
					views: backdateViews.length,
					visitors: backdateuniqueUserAgents.length,
					// bounce_rate:isNaN();
					visit_duration: parseInt(
						isNaN(backdateaverageVisitDuration) ? 0 : backdateaverageVisitDuration
					),
					bounce_rate: parseInt(isNaN(backdateBounces.bounceRate) ? 0 : backdateBounces.bounceRate),
					domain_id: data.domain_id
				};
				// console.log('Not using catch');

				await updateSpikeCache(date, d2);
			} else {
				// update spike values.
				// console.log('Using using catch');
				// console.log(local_result.data);
				backdateViews = local_result.data.results.record.views;
				backdateBounces = { bounceRate: local_result.data.results.record.bounce_rate };
				backdateaverageVisitDuration = local_result.data.results.record.visit_duration;
				backdateuniqueUserAgents = local_result.data.results.record.visitors;
			}
		}
		setTimeout(() => {
			loading = false;
		}, 200);
	}

	$: sortInterval = 1;
	$: chartD = { data: views, label: 'Views' };

	let filterlegth = 0;

	function handleChartFilter(event) {
		let fl = event.detail.query;
		// console.log(fl);
		if (fl == 'Visitors') {
			chartD = { data: uniqueUserAgents, label: 'Visitors' };
		} else if (fl == 'Views') {
			chartD = { data: views, label: 'Views' };
		} else if (fl == 'Visit Duration') {
			chartD = { data: [averageVisitDuration], label: 'Visit Duration' };
		} else if (fl == 'Bounce Rate') {
			chartD = { data: [averageVisitDuration], label: 'Bounce Rate' };
		}
	}
	async function handleDateChange(e) {
		// console.log(e.detail);
		// return;
		await fetchFromDefaultDates(e.detail.value);
		await fetchSpikes(e.detail.value);

		sortInterval = parseInt(e.detail.value);
	}

	onMount(async () => {
		// console.log(result);
		await fetchSpikes(0);
	});

	let optis = [
		{ value: 0, label: 'Last 24 hours' },
		{ value: 7, label: 'Last 7 days' },
		{ value: 14, label: 'Last 14 days' },
		{ value: 21, label: 'Last 21 days' },
		{ value: 30, label: 'Last 30 days' }
	];
	let domain_options = Array.from(managed_domains).map((e) => {
		return { value: e.id, label: e.name };
	});
	// console.log(domain_options);
</script>

<svelte:head>
	<Seo title={`${current_domain[0].name} Analytics - littlestats`} />
</svelte:head>

<div class="min-h-screen p-2 text-black">
	<!-- <div>devcanvas.art</div> -->
	{#if loading}
		<LoadingState />
	{/if}

	<div class="container mx-auto flex flex-col gap-4">
		<nav class="flex flex-wrap justify-between gap-4 py-2">
			<div class="flex flex-wrap items-center gap-4 md:gap-5">
				<!-- <select
					name="domains"
					id="domains"
					on:change={(e) => {
						window.location.href = `/site/${e.target.value}`;
					}}
					class="rounded-full border border-gray-600 font-bold text-white bg-{$color}-500 px-2 py-1"
				>
					{#each managed_domains as domain}
						<option value={domain.id}>{domain.name}</option>
					{/each}
					<button>Add domain</button>
				</select> -->
				<Dropdown
					on:change={(e) => {
						window.location.href = `/site/${e.detail.value}`;
					}}
					title=""
					value={data.domain_id}
					options={domain_options}
				>
					<div slot="btn">
						<a href="/settings">+ add domain</a>
					</div>
				</Dropdown>

				<div class="flex items-center gap-2">
					<div class="h-3 w-3 rounded-full bg-{$color}-400"></div>
					0 current visitors
				</div>
			</div>
			<Dropdown on:change={handleDateChange} title="Filter" options={optis}>
				<div slot="btn">
					<button class="flex items-center gap-1">
						<Calendar size={16} /> Custom Date
					</button>
				</div>
			</Dropdown>

			<!-- <div class="flex items-center gap-2">
				<label for="filter">Filter</label>
				<select
					name="domains"
					id="filter"
					on:change={handleDateChange}
					class="rounded-full border border-gray-600 font-bold text-white bg-{$color}-500 px-4 py-1"
				>
					<option value="0">Last 24 hours</option>

					<option value="7">Last 7 days</option>
					<option value="14">Last 14 days</option>
					<option value="21">Last 21 days</option>
					<option value="30">Last 30 days</option>
				</select>
			</div> -->
		</nav>

		{#if filters.length > 0}
			<div in:slide={{ duration: 230 }} class="flex w-full flex-row flex-wrap gap-1">
				{#each filters as filter}
					<button
						transition:scale
						on:click={() => removeFilter(filter)}
						class="flex w-fit gap-1 rounded-full bg-{$color}-300 items-center p-1 px-2"
						>{filter.type} <span class="bg-{$color}-100 rounded-full px-2">{filter.query}</span>
						<span><X size={13} /></span></button
					>
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
			<!-- <ViewCard
				name="Visitors"
				number="{parseInt(bounces.totalVisits)}%"
				percentange="14%"
				type="down"
			/> -->
		</header>

		<!-- {backdateaverageVisitDuration}{JSON.stringify(backdateBounces)}{backdateBounces.bounceRate ==
			NaN} -->
		<!-- <GrapthView viewRecords={views} /> -->
		<!-- <MdGraphStuff /> -->
		<!-- <AnotherChart viewRecords={views} {sortInterval} /> -->
		<ChartJsGraph {chartD} {sortInterval} />
		<div class="mt-6 flex flex-wrap gap-6">
			<PagesSection {views} on:filter={handleAddfilter} />
			<ReferrerSection {views} on:filter={handleAddfilter} domain={current_domain[0]} />
		</div>
		<div class="mb-12 mt-12 flex flex-wrap gap-12">
			<BrowserSection {views} on:filter={handleAddfilter} domain={current_domain[0]} />
			<OsSection {views} on:filter={handleAddfilter} domain={current_domain[0]} />
			<CountrySection {views} on:filter={handleAddfilter} domain={current_domain[0]} />
		</div>
	</div>
</div>

<style>
	.no-bg {
		background-color: transparent !important;
	}
</style>
