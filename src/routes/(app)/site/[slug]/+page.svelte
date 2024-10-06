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

	function formatDuration(seconds) {
		// Calculate hours, minutes, and remaining seconds
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;

		// Build the formatted string
		let formattedDuration = '';

		// Append hours if greater than 0
		if (hours > 0) {
			formattedDuration += `${hours}h `;
		}

		// If there are no hours, append minutes if greater than 0
		if (formattedDuration === '' && minutes > 0) {
			formattedDuration += `${minutes}m `;
		}

		// Append seconds if minutes are not present or if they are zero
		if (formattedDuration === '' || minutes === 0) {
			formattedDuration += `${secs}s`;
		}

		return formattedDuration.trim(); // Remove any trailing whitespace
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
	$: formatDr = formatDuration(parseInt(averageVisitDuration));
	$: averageVisitDuration = calculateAverageDuration(page_data);
	$: uniqueUserAgents = getUniqueUserAgents(page_data);

	let current_domain = data.domains.filter((e) => e.id == data.domain_id);
	let temp_domain = data.domains.filter((e) => e.id != data.domain_id);
	let managed_domains = [...current_domain, ...temp_domain];

	async function fetchFromDefaultDates(date) {
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

	$: sortInterval = 1;

	async function handleDateChange(e) {
		// console.log(parseInt(e.target.value));
		await fetchFromDefaultDates(e.target.value);
		sortInterval = parseInt(e.target.value);
	}

	onMount(() => {
		// console.log(result);
	});
</script>

<svelte:head>
	<Seo title={`${current_domain[0].name} Analytics - littlestats`} />
</svelte:head>

<div class="min-h-screen p-2 text-black">
	<!-- <div>devcanvas.art</div> -->

	<div class="container mx-auto flex flex-col gap-4">
		<nav class="flex flex-wrap justify-between gap-4 py-2">
			<div class="flex flex-wrap items-center gap-4 md:gap-5">
				<select
					name="domains"
					id="domains"
					on:change={(e) => {
						window.location.href = `/site/${e.target.value}`;
					}}
					class="rounded-md border border-gray-600 bg-{$color}-500 px-2 py-1"
				>
					<!-- devcanvas.art -->
					{#each managed_domains as domain}
						<option value={domain.id}>{domain.name}</option>
					{/each}
					<button>Add domain</button>
				</select>
				<div class="flex items-center gap-2">
					<div class="h-3 w-3 rounded-full bg-{$color}-400"></div>
					123 current visitors
				</div>
			</div>
			<div class="flex items-center gap-2">
				<label for="filter">Filter</label>
				<select
					name="domains"
					id="filter"
					on:change={handleDateChange}
					class="rounded-md border border-gray-600 bg-{$color}-500 px-4 py-1"
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
		<header
			class="grid grid-cols-2 gap-1 divide-gray-500 md:grid-cols-3 lg:grid-cols-5 lg:divide-x-2"
		>
			<ViewCard name="Views" number={views.length} percentange="434%" />
			<ViewCard name="Visitors" number={uniqueUserAgents.length} percentange="4%" />
			<ViewCard name="Visit Duration" number={formatDr} percentange="94%" />
			<ViewCard
				name="Bounce rate"
				number="{parseInt(bounces.bounceRate)}%"
				percentange="14%"
				type="down"
			/>
			<!-- <ViewCard
				name="Visitors"
				number="{parseInt(bounces.totalVisits)}%"
				percentange="14%"
				type="down"
			/> -->
		</header>

		<!-- <GrapthView viewRecords={views} /> -->
		<!-- <MdGraphStuff /> -->
		<!-- <AnotherChart viewRecords={views} {sortInterval} /> -->
		<ChartJsGraph viewRecords={views} {sortInterval} />
		<div class="mt-6 flex flex-wrap gap-6">
			<PagesSection {views} />
			<div class="flex-1">
				<div class="mb-3 flex justify-between text-gray-950">
					<p>Referrers</p>
					<p>Views</p>
				</div>
				<div class="flex flex-col gap-1 *:rounded-md *:px-[9px] *:py-[3px]">
					<div class="flex justify-between bg-{$color}-200">
						<p>news.ycombinator.com</p>
						<p>3.4k</p>
					</div>
					<div class="flex justify-between bg-{$color}-200">
						<p>t.co</p>
						<p>3.1k</p>
					</div>
					<div class="flex justify-between bg-{$color}-200">
						<p>dev.to</p>
						<p>2.9k</p>
					</div>
					<div class="flex justify-between bg-{$color}-200">
						<p>reddit.com</p>
						<p>2.5k</p>
					</div>
					<div class="flex justify-between bg-{$color}-200">
						<p>google.com</p>
						<p>1.3k</p>
					</div>
					<div class="flex justify-between bg-{$color}-200">
						<p>aqe.me</p>
						<p>1.1k</p>
					</div>
					<div class="flex justify-between bg-{$color}-200">
						<p>bing.com</p>
						<p>1k</p>
					</div>
					<div class="flex justify-between bg-{$color}-200">
						<p>naresa.com</p>
						<p>946</p>
					</div>
					<div class="flex justify-between bg-{$color}-200">
						<p>karim.us</p>
						<p>894</p>
					</div>
					<button class="no-bg text-right">more &rarr;</button>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.no-bg {
		background-color: transparent !important;
	}
</style>
