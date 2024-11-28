<script>

	import { onMount } from 'svelte';
	import ViewCard from '$lib/components/analytics/viewCard.svelte';
	import PageItem from '$lib/components/analytics/pageItem.svelte';
	import { color } from '$lib/colors/mixer.js';


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
	import PickDate from '../../../../lib/components/generals/pickDate.svelte';
	
	let { data = $bindable() } = $props();

	let page_data = $state(data.records);

	$effect(() => {
		page_data = data.records;
	});

	let views = $derived(page_data.filter((e) => e.event_type != 'pageExit'));
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

	function calculateAverageDuration(events) {
		// Filter out 'pageExit' events that have a valid 'duration'
		const validEvents = events.filter((e) => e.event_type === 'pageExit' && e.duration > 0);

		// Check if there are no valid events
		if (validEvents.length === 0) {
			return 0;
		}

		// Calculate total duration
		const totalDuration = validEvents.reduce((acc, curr) => acc + curr.duration, 0);

		// Calculate average duration
		const averageDuration = totalDuration / validEvents.length;

		return averageDuration;
	}

// Function to calculate bounce rate
function calculateBounceRate(events) {
    let totalVisits = 0; // Total number of page views
    let bounceCount = 0;

    // Create a map to track users by session or unique identifier
    const userSessions = {};

    // Iterate through events and categorize them
    for (const event of events) {
        const { user_agent, event_type } = event;

        // Ensure we are using user_agent or user_agent as a unique user identifier
        if (!userSessions[user_agent]) {
            userSessions[user_agent] = { pageViews: 0 };
        }

        // Count the pageviews for each user
        if (event_type === 'pageview') {
            totalVisits++;
            userSessions[user_agent].pageViews++;
        }

        // Mark as bounce if the user only visited a single page and left
        if (userSessions[user_agent].pageViews === 1 && event_type === 'pageExit') {
            bounceCount++;
        }
    }

    // Prevent division by zero if no page views
    const bounceRate = totalVisits === 0 ? 0 : (bounceCount / totalVisits) * 100;

    return {
        bounceRate: bounceRate.toFixed(2), // Format to two decimal places
        totalVisits: totalVisits,
        bounceCount: bounceCount
    };
}

	let bounces = $derived(calculateBounceRate(page_data));
	let averageVisitDuration = $derived(calculateAverageDuration(page_data));
	// $: formatDr = formatDuration(parseInt(averageVisitDuration));
	let uniqueUserAgents = $derived(getUniqueUserAgents(page_data));

	let backdateRecords = $state([]);
	
	let backdateViews = $state(0);
	
	let backdateBounces = $state(0);
	
	let backdateaverageVisitDuration = $state(0);
	
	let backdateuniqueUserAgents = $state([]);
	

	let filters = $state([]);

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
	let loading = $state(false);

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

	let sortInterval = $state(1);
	
	let chartD;
	$effect(() => {
		chartD = { data: views, label: 'Views' };
	});

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

		if (filters.length > 0) {
			applyfilter(filters);
		}
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

	let datePickerModal = $state(null);
	let selectedStartDate = $state(new Date());
	let selectedEndDate = $state(null);
	let isOpen = $state(false);

	function openDatePicker() {
		isOpen = !isOpen;
	}

	function handleCustomDateChange(event) {
		selectedStartDate = event.detail.startDate;
		selectedEndDate = event.detail.endDate;
	}
</script>

<svelte:head>
	<Seo title={`${current_domain[0].name} Analytics - littlestats`} />
</svelte:head>

<div class="min-h-screen p-2 text-black">
	<!-- <div>devcanvas.art</div> -->
	<PickDate
		bind:this={datePickerModal}
		bind:startDate={selectedStartDate}
		bind:endDate={selectedEndDate}
		bind:isOpen
		on:dateChange={handleCustomDateChange}
		on:clear={() => {
			selectedStartDate = null;
			selectedEndDate = null;
		}}
	/>
	{#if loading}
		<LoadingState />
	{/if}

	<div class="container mx-auto flex flex-col gap-4 dark:text-white">
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
					{#snippet btn()}
										<div >
							<a href="/settings">+ add domain</a>
						</div>
									{/snippet}
				</Dropdown>

				<!-- <div class="flex items-center gap-2">
					<div class="h-3 w-3 rounded-full bg-{$color}-400"></div>
					0 current visitors
				</div> -->
			</div>
			<Dropdown on:change={handleDateChange} title="Filter" options={optis}>
				{#snippet btn()}
								<div >
						<button onclick={openDatePicker} class="flex items-center gap-1">
							<Calendar size={16} /> Custom Date
						</button>
					</div>
							{/snippet}
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
						onclick={() => removeFilter(filter)}
						class="flex w-fit gap-1 rounded-full bg-{$color}-700 dark:bg-{$color}-700 items-center p-1 px-2 text-gray-100"
						>{filter.type}
						<span
							class="bg-{$color}-100 rounded-full px-2 text-black dark:bg-stone-800 dark:text-gray-100"
							>{filter.query}</span
						>
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
