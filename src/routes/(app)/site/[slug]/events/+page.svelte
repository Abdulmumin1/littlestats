<script>
	import { onMount } from 'svelte';
	import ViewCard from '$lib/components/analytics/viewCard.svelte';
	import { color } from '$lib/colors/mixer.js';
	import ReferrerSection from '$lib/components/analytics/referrerSection.svelte';
	import TinyChat from '../../../../../lib/components/analytics/graphStuff/tinyChat.svelte';
	import { flip } from 'svelte/animate';
	import { getCountry } from '$lib/slug/helpers.js';
	import EmptyValues from '../../../../../lib/components/analytics/emptyValues.svelte';
	import Dropdown from '../../../../../lib/components/generals/dropdown.svelte';
	import LoadingState from '$lib/components/analytics/graphStuff/loadingState.svelte';
	import { deserialize } from '$app/forms';
	import ChartJsGraph from '$lib/components/analytics/graphStuff/chartJsGraph.svelte';
	import { defaultRange as globalRange, optis, datacache } from '$lib/globalstate.svelte.js';
	import Drawer from '../../../../../lib/components/generals/drawer.svelte';
	import BottomDrawer from '../../../../../lib/components/generals/bottomDrawer.svelte';
	import { MoreVertical } from 'lucide-svelte';
	import PageItem from '../../../../../lib/components/analytics/pageItem.svelte';
	import {
		bucketEventsByName,
		mergeEventData,
		sortReferals,
		sortCountryData,
		sumData
	} from '$lib/events/helpers.js';
	import { generateRandomEvents } from '$lib/mockData.js';
	import { executeInWorker } from '$lib/utils';

	let { data } = $props();
	let page_data = $state(data.records);
	let sortInterval = $state(1);

	// Use the provided records

	let events = $state([]);

	$effect(async () => {
		let dataSnapshot = $state.snapshot(page_data);
		// console.log(dataSnapshot)
		events = await executeInWorker(bucketEventsByName, dataSnapshot);
		
	});

	let activeEvent = $state(0);
	let activeEventData = $derived(events.length > 0 ? events[activeEvent][1] : []);
	let activeEventTitle = $derived(events.length > 0 ? events[activeEvent][0] : '-');
	let activeSubData = $derived(mergeEventData(activeEventData));

	let sortedReferals = $state([]);
	let sortedCountryData = $state([]);
	
	
	$effect(async () => {
		let dataSnapshot = $state.snapshot(activeEventData);
		sortedReferals = await executeInWorker(sortReferals, dataSnapshot);
		sortedCountryData = await executeInWorker(sortCountryData, dataSnapshot);
		console.log(dataSnapshot);
	});

	// $effect(() => {
	// 	$inspect(a);
	// });

	let sumReferalData = $state(0);
	let sumCountryData = $state(0);

	$effect(async () => {
		let dataSnapshot = $state.snapshot(sortedReferals);
		sumReferalData = await executeInWorker(sumData, dataSnapshot);
	});
	$effect(async () => {
		let dataSnapshot = $state.snapshot(sortedCountryData);
		sumCountryData = await executeInWorker(sumData, dataSnapshot);
	});

	let loading = $state(false);
	let dropDownContent = [];
	// $effect(() => {
	// 	console.log(events);
	// });

	async function handleDateChange(event) {
		const date = event.detail.value;
		await fetchFromDefaultDates(date);
		sortInterval = parseInt(date);
		globalRange.setRange(sortInterval);
	}

	async function fetchFromDefaultDates(date) {
		loading = true;
		let cache = datacache.getCache(`events-${date}-${data.domain_id}`);
		if (cache?.length) {
			page_data = cache;
			data.records = cache;
			loading = false;
			return;
		}
		const form = new FormData();
		form.append('defaultRange', date);
		form.append('domain_id', data.domain_id);

		const response = await fetch('?/fetchCustomEvents', { method: 'POST', body: form });
		if (response.ok) {
			const result = deserialize(await response.text());
			page_data = result.data.records;

			data.records = page_data;
			datacache.setCach(`events-${date}-${data.domain_id}`, result.data.records);
		}
		loading = false;
	}

	// onMount(async () => {
	// 	let date = globalRange.getRange();
	// 	await fetchFromDefaultDates(date);
	// 	sortInterval = parseInt(date);
	// 	// await fetchSpikes(date);
	// });

	const domain_options = data.domains.map((e) => ({ value: e.id, label: e.name }));
	const current_domain = data.domains.find((e) => e.id === data.domain_id);
</script>

<svelte:head>
	<title>{current_domain.name} - Event Analytics</title>
</svelte:head>

{#if loading}
	<LoadingState />
{/if}
<div class="min-h-screen p-4 text-black dark:text-white">
	<!-- <h1 class="mb-4 px-2 pt-4 text-2xl font-bold text-gray-100 md:text-3xl">Events</h1> -->
	<nav class="flex flex-wrap justify-between gap-4 py-2">
		<div class="flex flex-wrap items-center gap-4 md:gap-5">
			<Dropdown
				on:change={(e) => (window.location.href = `/site/${e.detail.value}/events`)}
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

	<div class="mt-5 flex flex-col gap-12">
		<div class="flex flex-col gap-2">
			<ul class="flex flex-wrap gap-2">
				{#each events as [eventName, events], index}
					<section
						onclick={() => {
							activeEvent = index;
						}}
						class="views w-full max-w-[300px] cursor-pointer bg-{$color}-200 bg-opacity-35 px-6 dark:bg-stone-800/50 {index ==
						activeEvent
							? `border-${$color}-700 border border-b-2`
							: ''}"
					>
						<h2>{eventName}</h2>
						<div class="mt-2 text-2xl font-bold">
							{events.length}
						</div>
					</section>
				{/each}
			</ul>
			<!-- <div class="flex flex-wrap gap-2">
				{#each Object.entries(activeSubData) as d}
					<div
						class="flex w-fit flex-col gap-1 rounded-xl bg-{$color}-600 p-1 px-2 text-gray-300 dark:bg-stone-800"
					>
						{d[0]}
						<span
							class="rounded-full bg-{$color}-100 px-2 py-1 text-lg text-black dark:bg-stone-950 dark:text-gray-100"
						>
							<BottomDrawer>
								{#snippet handle()}
									<button>
										{Object.entries(d[1])[0][0]}
										
									</button>
								{/snippet}

								{#snippet content()}
									<div
										class="no-scrollbar relative flex flex-col gap-1 overflow-y-auto px-[20px] py-2"
									>
										{#each Object.entries(d[1]) as page (page)}
											<div animate:flip={{ duration: 100 }}>
												<PageItem on:filter type="ref" path={page[0]} views={page[1]} />
											</div>
										{/each}
									</div>
								{/snippet}
							</BottomDrawer>
						</span>
					</div>
				{/each}
			</div> -->
		</div>
		<ChartJsGraph
			chartD={{
				data: activeEventData,
				label: activeEventTitle
			}}
			{sortInterval}
			bar={true}
			showChart={true}
		/>

		<div class="flex flex-col gap-5 p-2 md:flex-row">
			<ul class="w-full flex-1">
				<h2 class="mt-4 py-3">Referals</h2>

				<div class="flex justify-between">
					<div class="flex w-full flex-col gap-1">
						{#each sortedReferals as page (page[0])}
							<div animate:flip={{ duration: 150 }} class="relative h-fit w-full">
								<div
									class="bg-{$color}-500 absolute h-full rounded bg-opacity-5"
									style="width: {(page[1] / sumReferalData) * 100}%;"
								></div>
								<div
									class="flex justify-between gap-2 px-2 py-1 dark:border-x-[13px] border-{$color}-700 rounded-md"
								>
									<span>{page[0]}</span> <span>{page[1]}</span>
								</div>
							</div>
						{:else}
							<EmptyValues />
						{/each}
					</div>
					<!-- <div  class="w-full flex-1">
                        {#key sortedReferals}
                            
                        <TinyChat data={sortedReferals} />
                        {/key}
                    </div> -->
				</div>
			</ul>
			<ul class="w-full flex-1">
				<h2 class="mt-4 py-3 text-base">Country</h2>

				<div class="flex flex-wrap justify-between">
					<div class="flex w-full flex-col gap-1">
						{#each sortedCountryData as page (page[0])}
							<div animate:flip={{ duration: 150 }} class="relative h-fit w-full">
								<div
									class="bg-{$color}-500 absolute h-full rounded bg-opacity-5"
									style="width: {(page[1] / sumCountryData) * 100}%;"
								></div>
								<div
									class="flex justify-between gap-2 px-2 py-1 dark:border-x-[13px] border-{$color}-700 rounded-md"
								>
									<span>{page[0]}</span> <span>{page[1]}</span>
								</div>
							</div>
						{:else}
							<EmptyValues />
						{/each}
					</div>
					<!-- <div class="h-[300px]">
                        {#key sortedReferals}
                            
                        <TinyChat data={sortedReferals} />
                        {/key}
                    </div> -->
				</div>
			</ul>
		</div>
	</div>
</div>

<style>
	.min-h-screen {
		min-height: 100vh;
	}
	.views {
		/* background-color: #22c55e9c; */
		padding-top: 1rem;
		padding-bottom: 1rem;
		border-radius: 0.5rem;
	}
</style>
