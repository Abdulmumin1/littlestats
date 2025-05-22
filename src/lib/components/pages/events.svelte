<script>
	import { onMount } from 'svelte';
	import { color } from '$lib/colors/mixer.js';

	import { flip } from 'svelte/animate';
	import EmptyValues from '$lib/components/analytics/emptyValues.svelte';

	import ChartJsGraph from '$lib/components/analytics/graphStuff/chartJsGraph.svelte';
	import { defaultRange as globalRange } from '$lib/globalstate.svelte.js';

	import { MoreVertical } from 'lucide-svelte';
	import {
		bucketEventsByName,
		mergeEventData,
		sortReferals,
		sortData,
		sortCountryData,
		sumData
	} from '$lib/events/helpers.js';
	import { generateRandomEvents } from '$lib/mockData.js';
	import { executeInWorker } from '$lib/utils';

	let { page_data } = $props();
	let sortInterval = $derived(globalRange.getSingle());

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
		sortedReferals = await executeInWorker(sortReferals, dataSnapshot)
		sortedCountryData = await executeInWorker(sortCountryData, dataSnapshot)
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

	let expanded = $state(null);

	function getReferrerHost(referrer) {
  try {
    const url = new URL(referrer);
    return url.hostname;
  } catch {
    // If it's not a valid URL, just return the raw referrer string
    return referrer || 'Direct';
  }
}
</script>

<div class="min-h-screen p-4 text-black dark:text-white">
	<div class="mt-5 flex flex-col gap-12">
		<div class="flex flex-col gap-2">
			<ul class="flex flex-wrap gap-2">
				{#each events as [eventName, events], index}
					<section
						onclick={() => {
							activeEvent = index;
						}}
						class="views flex justify-between items-center  w-full max-w-[300px] cursor-pointer bg-{$color}-200 bg-opacity-35 px-6 dark:bg-stone-800/50 {index ==
						activeEvent
							? `border-${$color}-700 border border-b-2`
							: ''}"
					>
						<h2>{eventName}</h2>
						<div class="text-lg font-bold ">
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

		<div class="mt-8">
			<h2 class="mb-4 text-xl font-semibold">Event Details</h2>
			<div
				class="max-h-[700px] overflow-y-auto rounded-lg border border-stone-200 dark:border-stone-700"
			>
				<table class="min-w-full divide-y divide-stone-200 dark:divide-stone-700">
					<thead class="bg-{$color}-50 dark:bg-stone-800">
						<tr class="bg-{$color}-50 dark:bg-stone-800">
							<th
								class="bg-{$color}-50 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider dark:bg-stone-800"
								>Event</th
							>
							<th
								class=" bg-{$color}-50 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider dark:bg-stone-800"
								>Page</th
							>
							<th
								class=" bg-{$color}-50 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider dark:bg-stone-800"
								>Referrer</th
							>
							<th
								class=" bg-{$color}-50 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider dark:bg-stone-800"
								>When</th
							>
							<th
								class=" bg-{$color}-50 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider dark:bg-stone-800"
								>Location</th
							>
							<th class="bg-{$color}-50 w-8 dark:bg-stone-800"></th>
						</tr>
					</thead>
					<tbody class="divide-y divide-stone-200 bg-white dark:divide-stone-700 dark:bg-stone-900">
						{#each activeEventData as event (event.timestamp)}
							
							<tr
								class="group cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50"
								onclick={() => (expanded = expanded === event.timestamp ? null : event.timestamp)}
							>
								<!-- Main Columns -->
								<td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
									{event.event_name}
								</td>
								<td
									class="max-w-[160px] truncate px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
								>
									{event.url?.split('/').slice(-2).join('/') || 'Unknown'}
								</td>
								<td class="truncate px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
									<!-- {@const user = event.user_id?.slice(0, 8)} -->
									<!-- {event.user_id?.slice(0, 8) || 'Anonymous'} -->
									{getReferrerHost(event.referrer)}
								</td>
								<td class="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
									{new Date(event.timestamp).toLocaleDateString()}<br />
									<span class="text-xs text-stone-500 dark:text-stone-300">
										{new Date(event.timestamp).toLocaleTimeString()}
									</span>
								</td>
								<td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
									<div>{event.timezone}</div>
								</td>
								<td class="px-4 py-3">
									<MoreVertical
										size={16}
										class="text-gray-400 group-hover:text-{$color}-500 transition-colors"
									/>
								</td>
							</tr>

							<!-- Expanded Details -->
							{#if expanded === event.timestamp}
								<tr class="bg-stone-50 dark:bg-stone-800">
									<td colspan="6" class="px-4 py-3 text-sm">
										<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
											<div>
												<div class="mb-1 text-xs font-medium text-stone-500 dark:text-stone-300">
													User
												</div>
												<div class="truncate">
													{event.user_id?.slice(0, 8) || 'Anonymous'}
												</div>
											</div>
											{#if event.event_data}
												{@const data = JSON.parse(event.event_data)}

                                                {#if data.campaign}
												<div>
													<div class="mb-1 text-xs font-medium text-stone-500 dark:text-stone-300">
														Campaign
													</div>
														<div>{data.campaign}</div>
                                                    </div>
													{/if}
											{/if}
											<div>
												<div class="mb-1 text-xs font-medium text-stone-500 dark:text-stone-300">
													Performance
												</div>
												{#if event.event_data}
													{@const data = JSON.parse(event.event_data)}
													<span
														class="font-medium {data.pageLoadTime > 2000
															? 'text-red-600'
															: 'text-green-600'}"
													>
														{data.pageLoadTime ? `${data.pageLoadTime}ms` : 'N/A'}
													</span>
												{:else}
													N/A
												{/if}
											</div>
											<div>
												<div class="mb-1 text-xs font-medium text-stone-500 dark:text-stone-300">
													Language
												</div>
												<div>{event.language?.split('-')[0]}</div>
											</div>
											{#if event.event_data}
												{@const data = JSON.parse(event.event_data)}
												<div class="col-span-2 md:col-span-4">
													<div class="mb-1 text-xs font-medium text-stone-500 dark:text-stone-300">
														Event Details
													</div>
													<div class="space-y-1">
														{#each Object.entries(data) as [title, dx]}
															<div class="truncate">
																{title}:
																<span class="text-stone-600 dark:text-stone-300">{dx}</span>
															</div>
														{/each}
														{#if data.memory}
															<div>
																Memory Usage: <span class="text-stone-600 dark:text-stone-300"
																	>{(data.memory.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB</span
																>
															</div>
														{/if}
														<div class="truncate">
															Full Referrer URL: <span class="text-stone-600 dark:text-stone-300"
																>{event?.referrer ? event.referrer : 'None'}</span
															>
														</div>
													</div>
												</div>
											{/if}
										</div>
									</td>
								</tr>
							{/if}
						{:else}
							<tr>
								<td
									colspan="6"
									class="px-6 py-4 text-center text-sm text-stone-500 dark:text-stone-300 dark:text-gray-400"
								>
									No events recorded
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>

<style>
	.min-h-screen {
		min-height: 100vh;
	}
	.views {
		/* background-color: #22c55e9c; */
		padding-top: .2rem;
		padding-bottom: .2rem;
		border-radius: 0.5rem;
	}

	th, thead {
		position: sticky;
		top: 0;
	}
</style>
