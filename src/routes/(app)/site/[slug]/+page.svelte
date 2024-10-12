<script>
	import { onMount } from 'svelte';
	import ViewCard from '$lib/components/analytics/viewCard.svelte';
	import PageItem from '$lib/components/analytics/pageItem.svelte';
	import { color } from '$lib/colors/mixer.js';

	export let data;
	import { deserialize } from '$app/forms';
	import BottomDrawer from '../../../../lib/components/generals/bottomDrawer.svelte';
	import PagesSection from '../../../../lib/components/analytics/pagesSection.svelte';
	import GrapthView from '../../../../lib/components/analytics/graphStuff/grapthView.svelte';
	import MdGraphStuff from '../../../../lib/components/analytics/graphStuff/mdGraphStuff.svelte';
	import ChartJsGraph from '../../../../lib/components/analytics/graphStuff/chartJsGraph.svelte';
	import AnotherChart from '../../../../lib/components/analytics/graphStuff/anotherChart.svelte';
	import Seo from '../../../../lib/components/generals/seo.svelte';
	import ReferrerSection from '../../../../lib/components/analytics/referrerSection.svelte';
	import BrowserSection from '../../../../lib/components/analytics/browserSection.svelte';
	import CountrySection from '../../../../lib/components/analytics/countrySection.svelte';
	import LoadingState from '../../../../lib/components/analytics/graphStuff/loadingState.svelte';

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
			// console.log(local_records);
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
			console.log(local_result.data);

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
				console.log('Not using catch');

				await updateSpikeCache(date, d2);
			} else {
				// update spike values.
				console.log('Using using catch');
				console.log(local_result.data);
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

	async function handleDateChange(e) {
		// console.log(parseInt(e.target.value));
		await fetchFromDefaultDates(e.target.value);
		await fetchSpikes(e.target.value);

		sortInterval = parseInt(e.target.value);
	}

	onMount(async () => {
		// console.log(result);
		await fetchSpikes(0);
	});
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
				<select
					name="domains"
					id="domains"
					on:change={(e) => {
						window.location.href = `/site/${e.target.value}`;
					}}
					class="rounded-full border border-gray-600 font-bold text-white bg-{$color}-500 px-2 py-1"
				>
					<!-- devcanvas.art -->
					{#each managed_domains as domain}
						<option value={domain.id}>{domain.name}</option>
					{/each}
					<button>Add domain</button>
				</select>
				<div class="flex items-center gap-2">
					<div class="h-3 w-3 rounded-full bg-{$color}-400"></div>
					0 current visitors
				</div>
			</div>
			<div class="flex items-center gap-2">
				<label for="filter">Filter</label>
				<select
					name="domains"
					id="filter"
					on:change={handleDateChange}
					class="rounded-full border border-gray-600 font-bold text-white bg-{$color}-500 px-4 py-1"
				>
					<!-- devcanvas.art -->
					<option value="0">Last 24 hours</option>

					<option value="7">Last 7 days</option>
					<option value="14">Last 14 days</option>
					<option value="21">Last 21 days</option>
					<option value="30">Last 30 days</option>
					<!-- <option value="devcanvas.art">Last 50 days</option> -->
				</select>
			</div>
		</nav>
		<header class="grid grid-cols-2 gap-1 divide-gray-500 md:grid-cols-3 lg:grid-cols-5">
			<ViewCard
				name="Views"
				backdateData={backdateViews.length ?? backdateViews}
				number={views.length}
				percentange="434%"
			/>
			<ViewCard
				name="Visitors"
				backdateData={backdateuniqueUserAgents.length ?? backdateuniqueUserAgents}
				number={uniqueUserAgents.length}
				percentange="4%"
			/>
			<ViewCard
				name="Visit Duration"
				backdateData={isNaN(backdateaverageVisitDuration) ? 0 : backdateaverageVisitDuration}
				number={averageVisitDuration}
				type="time"
				percentange="94%"
			/>
			<ViewCard
				name="Bounce rate"
				number={parseInt(bounces.bounceRate)}
				backdateData={parseInt(isNaN(backdateBounces.bounceRate) ? 0 : backdateBounces.bounceRate)}
				percentange="14%"
				increase="down"
				type="percent"
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
		<ChartJsGraph viewRecords={views} {sortInterval} />
		<div class="mt-6 flex flex-wrap gap-6">
			<PagesSection {views} />
			<ReferrerSection {views} domain={current_domain[0]} />
		</div>
		<div class="mb-12 mt-12 flex flex-wrap gap-12">
			<BrowserSection {views} domain={current_domain[0]} />
			<CountrySection {views} domain={current_domain[0]} />
		</div>
	</div>
</div>

<style>
	.no-bg {
		background-color: transparent !important;
	}
</style>
