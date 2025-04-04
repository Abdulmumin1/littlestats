<script>
	import { fade } from 'svelte/transition';
	import BottomDrawer from '../generals/bottomDrawer.svelte';
	import EmptyValues from './emptyValues.svelte';
	import PageItem from './pageItem.svelte';
	import { LoaderPinwheel, Maximize } from 'lucide-svelte';
	import { color } from '$lib/colors/mixer.js';
	import { ip_cache } from '$lib/cache/ips.js';
	import { flip } from 'svelte/animate';
	import { getCountry } from '$lib/slug/helpers.js';
	import MiniSectionWrapper from './miniSectionWrapper.svelte';

	let { views, domain, jump = true, sorted=false } = $props();
	let max_page_item_count = 6;

	// Function using IP geolocation service

	async function g(ip) {
		try {
			// Using ipapi.co - free tier has rate limits
			const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country`);
			if (!response.ok) {
				throw new Error('Failed to fetch location data');
			}

			const data = await response.json();
			return data.country;
		} catch (error) {
			throw new Error(`IP Geolocation error: ${error.message}`);
		}
	}
	

	let loading = false;
	let loading_indicator = [1];

	function fetchPages(events) {
		let uniquePages = new Map();
		let loading_indicator = [1]; // Consider updating or removing this if it's unnecessary

		// Loop through all events
		for (let index = 0; index < events.length; index++) {
			const event = events[index];
			const timezone = event.timezone;

			// Check if the timezone exists and is not empty
			let country = timezone; // Default fallback

			if (timezone && timezone.trim() !== '') {
				try {
					country = getCountry(timezone) || timezone; // Fallback if getCountry returns falsy
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

	let pages = $derived(sorted?views:fetchPages(views));
	let fullPages = $state([...pages]);
	let trunaced_pages = $derived([...pages].splice(0, max_page_item_count));

	let trottle;
	function searchQuery(event) {
		clearTimeout(trottle);
		trottle = setTimeout(() => {
			let query = event.target.value;

			fullPages = pages.filter((e) => e[0].toLowerCase().search(query.toLowerCase()) !== -1);
			// console.log(fullPages)
		});
	}
	// $: console.log(pages);
</script>

<MiniSectionWrapper title="Country">
	<!-- <div class="flex flex-col gap-1 *:rounded-md *:bg-{$color}-200 *:px-[9px] *:py-[3px]">
        <div class="flex justify-between">
            <p>/</p>
            <p>3.4k</p>
        </div>
        <div class="flex justify-between">
            <p>/play/fdww3</p>
            <p>3.1k</p>
        </div>
        <div class="flex justify-between">
            <p>/blog/why-is-this-viewed</p>
            <p>2.9k</p>
        </div>
        <div class="flex justify-between">
            <p>/explore</p>
            <p>2.5k</p>
        </div>
        <div class="flex justify-between">
            <p>/about</p>
            <p>1.3k</p>
        </div>
        <button class="no-bg text-right">more &rarr;</button>
    </div> -->

	<div class="w-ful flex h-full flex-col gap-1">
		{#each trunaced_pages as page (page[0])}
			<div animate:flip={{ duration: 150 }} class="min-w-full">
				<PageItem {jump} on:filter type="country" path={page[0]} views={page[1]} />
			</div>
		{:else}
			<EmptyValues />
		{/each}

		{#if trunaced_pages.length < views.length}
			<BottomDrawer {searchQuery}>
				{#snippet handle()}
					<div class="z-0">
						<button class="no-bg mx-auto flex items-center justify-center gap-2 text-right"
							>more <Maximize size={15} /></button
						>
					</div>
				{/snippet}
				{#snippet header()}
					<div
						style="padding: 0 20px;"
						class="sticky top-0 mb-3 flex justify-between text-gray-950 dark:text-gray-100"
					>
						<p>Country</p>
						<p>Views</p>
					</div>
				{/snippet}
				{#snippet content()}
					<div class="no-scrollbar relative flex flex-col gap-1 overflow-y-auto px-[20px] py-2">
						{#each fullPages as page (page[0])}
							<div animate:flip={{ duration: 100 }}>
								<PageItem {jump} on:filter type="country" path={page[0]} views={page[1]} />
							</div>
						{:else}
							<p>Nothing yet!</p>
						{/each}
					</div>
				{/snippet}
			</BottomDrawer>
		{/if}
	</div>
</MiniSectionWrapper>
