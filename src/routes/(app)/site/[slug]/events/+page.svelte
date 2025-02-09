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
	import { defaultRange as globalRange, optis } from '$lib/globalstate.svelte.js';
	import Drawer from '../../../../../lib/components/generals/drawer.svelte';
	import BottomDrawer from '../../../../../lib/components/generals/bottomDrawer.svelte';
	import { MoreVertical } from 'lucide-svelte';
	import PageItem from '../../../../../lib/components/analytics/pageItem.svelte';

	// You can import additional components (e.g., charts, filters) as needed

	// Example JSON data (this would normally come from your server or props)
	// Helper Functions
	function randomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function randomFromArray(arr) {
		return arr[randomInt(0, arr.length - 1)];
	}

	function randomIp() {
		return `${randomInt(1, 254)}.${randomInt(0, 254)}.${randomInt(0, 254)}.${randomInt(1, 254)}`;
	}

	// A basic random UUID generator (not RFC compliant but good enough for simulation)
	function randomUUID() {
		const s4 = () =>
			Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1);
		return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
	}

	// Random date generator between two dates
	function randomDate(start, end) {
		const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
		// Format as "YYYY-MM-DD HH:MM:SS"
		const pad = (n) => (n < 10 ? '0' + n : n);
		return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
	}

	// Arrays for random selection
	const eventTypes = ['customEvent', 'pageview', 'pageExit'];
	const urls = ['/', '/about', '/contact', '/pricing', '/features', '/blog'];
	const referrers = [
		'',
		'https://google.com',
		'https://facebook.com',
		'https://twitter.com',
		'https://linkedin.com',
		'https://news.ycommbinator.com',
		'https://lofa.com',
		'https://yaqeen.e.com',
		'https://es.ru',
		'https://minorotr.io'
	];
	const userAgents = [
		'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:134.0) Gecko/20100101 Firefox/134.0',
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/90.0.4430.85 Safari/537.36',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15',
		'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15A372 Safari/604.1'
	];
	const timezones = [
		'Africa/Lagos',
		'America/New_York',
		'Europe/London',
		'Asia/Tokyo',
		'Australia/Sydney'
	];
	const screens = ['1920x1080', '1366x768', '1440x900', '1536x864', '1280x720'];
	const languages = ['en-US', 'fr-FR', 'es-ES', 'de-DE', 'zh-CN'];
	const eventNames = ['Get Started', 'Sign Up', 'Purchase', 'Logout', 'View Page', 'Add to Cart'];
	const buttonColors = ['blue', 'red', 'green', 'yellow', 'purple'];
	const campaigns = [
		'summer-sale',
		'winter-discount',
		'spring-offer',
		'autumn-promo',
		'black-friday'
	];

	// Date range for the simulation
	const startDate = new Date('2025-02-03T00:00:00');
	const endDate = new Date('2025-02-04T00:00:00');

	// Build the data object with 400 records
	// const data = $state({
	// 	records: [],
	// 	domain_id: 'mwn1qyxs2n8ha58',
	// 	domains: [{ id: 'mwn1qyxs2n8ha58', name: 'Demo Domain' }]
	// });

	let { data } = $props();
	let page_data = $state(data.records);
	let sortInterval = $state(1);

	// for (let i = 0; i < 19; i++) {
	// 	// Randomly choose properties
	// 	const event_type = randomFromArray(eventTypes);
	// 	const url = randomFromArray(urls);
	// 	const referrer = randomFromArray(referrers);
	// 	const user_agent = randomFromArray(userAgents);
	// 	const timestamp = randomDate(startDate, endDate);
	// 	// For 'pageExit' events, give a random duration between 1 and 500 seconds; otherwise null.
	// 	const duration = event_type === 'pageExit' ? randomInt(1, 500) : null;
	// 	const ip = randomIp();
	// 	const timezone = randomFromArray(timezones);
	// 	// Use the same timestamp for created_at for simplicity.
	// 	const created_at = timestamp;
	// 	const user_id = randomUUID();
	// 	const screen = randomFromArray(screens);
	// 	const language = randomFromArray(languages);
	// 	const event_name = randomFromArray(eventNames);
	// 	// Build a random event_data payload
	// 	const eventDataObj = {
	// 		buttonId: 'cta-button',
	// 		buttonColor: randomFromArray(buttonColors),
	// 		campaign: randomFromArray(campaigns),
	// 		pageLoadTime: randomInt(500, 2000)
	// 	};
	// 	const event_data = JSON.stringify(eventDataObj);
	// 	const session_id = randomUUID();

	// 	// Assemble the event object
	// 	page_data.push({
	// 		domain_id: 'mwn1qyxs2n8ha58',
	// 		event_type,
	// 		url,
	// 		referrer,
	// 		user_agent,
	// 		timestamp,
	// 		duration,
	// 		ip,
	// 		timezone,
	// 		created_at,
	// 		user_id,
	// 		screen,
	// 		language,
	// 		event_name,
	// 		event_data,
	// 		session_id
	// 	});
	// }

	function bucketEventsByName(events) {
		return events.reduce((buckets, event) => {
			// Use the event_name as the bucket key.
			if (!buckets[event.event_name]) {
				buckets[event.event_name] = [];
			}
			buckets[event.event_name].push(event);
			return buckets;
		}, {});
	}
	function mergeEventData(bucket) {
		const mergedData = {};

		for (const event of bucket) {
			if ('event_data' in event) {
				const eventData = JSON.parse(event.event_data); // Parse the JSON string

				for (const [key, value] of Object.entries(eventData)) {
					if (key == 'pageLoadTime' || key == 'memory') continue;
					if (key in mergedData) {
						mergedData[key][value] = mergedData[key][value] ?  mergedData[key][value] + 1: 1 ;
					} else {
						mergedData[key] = Object.fromEntries([[value, 1]]);
					}
				}
				// Object.assign(mergedData, eventData); // Merge the data into a single object
			}
		}

		return mergedData;
	}
	// Use the provided records
	let events = $derived(Object.entries(bucketEventsByName(page_data)));

	let activeEvent = $state(0);
	let activeEventData = $derived(events.length > 0 ? events[activeEvent][1] : []);
	let activeEventTitle = $derived(events.length > 0 ? events[activeEvent][0] : '-');
	let activeSubData = $derived(mergeEventData(activeEventData));

	// $effect(() => {
	// 	$inspect(activeSubData);
	// });

	function sortReferals(events) {
		let uniquePages = new Map();
		let direct = 'Direct';

		events.forEach((event) => {
			// console.log(event);
			let ref = event.referrer;

			if (ref) {
				try {
					let hostname = new URL(ref).hostname;
					if (!hostname) {
						const customUrlRegex = /^([a-zA-Z-]+):\/\/([^\/]+)(\/.*)?$/;
						const match = ref.match(customUrlRegex);
						if (match) {
							hostname = match[2];
						}
					}
					if (hostname != 'name.dev') {
						if (!uniquePages.has(hostname)) {
							uniquePages.set(hostname, 1);
						} else {
							uniquePages.set(hostname, uniquePages.get(hostname) + 1);
						}
					} else {
						if (!uniquePages.has(direct)) {
							uniquePages.set(direct, 1);
						} else {
							uniquePages.set(direct, uniquePages.get(direct) + 1);
						}
					}
				} catch (error) {}
			} else {
				if (!uniquePages.has(direct)) {
					uniquePages.set(direct, 1);
				} else {
					uniquePages.set(direct, uniquePages.get(direct) + 1);
				}
			}
		});

		return Array.from(uniquePages).sort((a, b) => b[1] - a[1]);
	}

	function sortCountryData(events) {
		let uniquePages = new Map();
		let loading_indicator = [1]; // Consider updating or removing this if it's unnecessary

		// Loop through all events
		for (let index = 0; index < events.length; index++) {
			const event = events[index];
			const timezone = event.timezone;

			// Check if the timezone exists and is not empty
			let country = 'United States of America'; // Default fallback

			if (timezone && timezone.trim() !== '') {
				try {
					country = getCountry(timezone) || 'Unknown'; // Fallback if getCountry returns falsy
					// Update the uniquePages Map
					if (!uniquePages.has(country)) {
						uniquePages.set(country, 1);
					} else {
						uniquePages.set(country, uniquePages.get(country) + 1);
					}
				} catch (error) {
					if (!uniquePages.has(country)) {
						uniquePages.set(country, 1);
					} else {
						uniquePages.set(country, uniquePages.get(country) + 1);
					}
				}
			} else {
				// If no timezone, set country as 'Unknown'
				if (!uniquePages.has(country)) {
					uniquePages.set(country, 1);
				} else {
					uniquePages.set(country, uniquePages.get(country) + 1);
				}
			}
		}

		// Sort the uniquePages Map by frequency (highest to lowest)
		return Array.from(uniquePages).sort((a, b) => b[1] - a[1]);
	}

	let sortedReferals = $derived(sortReferals(activeEventData));
	let sortedCountryData = $derived(sortCountryData(activeEventData));
	function sumData(d) {
		return Math.max(...d.map((item) => item[1]));
	}


	let sumReferalData = $derived(sumData(sortedReferals));
	let sumCountryData = $derived(sumData(sortedCountryData));
	let loading = $state(false);
	let dropDownContent = []
	// $effect(() => {
	// 	console.log(events);
	// });
	const domain_options = data.domains.map((e) => ({ value: e.id, label: e.name }));

	async function handleDateChange(event) {
		const date = event.detail.value;
		await fetchFromDefaultDates(date);
		sortInterval = parseInt(date);
		globalRange.setRange(sortInterval);
	}

	async function fetchFromDefaultDates(date) {
		loading = true;
		const form = new FormData();
		form.append('defaultRange', date);
		form.append('domain_id', data.domain_id);

		const response = await fetch('?/fetchCustomEvents', { method: 'POST', body: form });
		if (response.ok) {
			const result = deserialize(await response.text());
			page_data = result.data.records;

			data.records = page_data;
		}
		loading = false;
	}

	onMount(async () => {
		let date = globalRange.getRange();
		await fetchFromDefaultDates(date);
		sortInterval = parseInt(date);
		// await fetchSpikes(date);
	});
</script>

<svelte:head>
	<title>{data.domains[0].name} - Event Analytics</title>
</svelte:head>

{#if loading}
	<LoadingState />
{/if}
<div class="min-h-screen p-4 text-white">
	<h1 class="mb-4 px-2 pt-4 text-2xl font-bold text-gray-100 md:text-3xl">Events</h1>
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
						class="views cursor-pointer bg-{$color}-100/50 px-6 dark:bg-stone-800/50 {index ==
						activeEvent
							? `border-${$color}-600 border-2`
							: ''}"
					>
						<h2>{eventName} ({events.length})</h2>
					</section>
				{/each}
			</ul>
			<div class="flex flex-wrap gap-2">
				{#each Object.entries(activeSubData) as d}
					<div
						class="flex flex-col w-fit  gap-1 rounded-xl bg-{$color}-600 p-1 px-2 text-gray-300 dark:bg-stone-800"
					>
						{d[0]}
						<span
							class="rounded-full bg-{$color}-100 px-2 py-1 text-lg text-black dark:bg-stone-950 dark:text-gray-100"
						>
							<BottomDrawer>
								{#snippet handle()}
									<button>
										{Object.entries(d[1])[0][0]}
										<!-- {#if Array.from(d[1]).length > 1}
											<MoreVertical />
										{/if} -->
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
			</div>
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
			<ul class="w-full max-w-xl">
				<h2 class="mt-4 py-3 text-xl font-bold">Referals</h2>

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
			<ul class="w-full max-w-xl">
				<h2 class="mt-4 py-3 text-xl font-bold">Country</h2>

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
