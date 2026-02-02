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

	let { views, domain, jump = true, sorted = false } = $props();
	let max_page_item_count = 6;

	async function g(ip) {
		try {
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

		for (let index = 0; index < events.length; index++) {
			const event = events[index];
			const timezone = event.timezone;
			let country = timezone;

			if (timezone && timezone.trim() !== '') {
				try {
					country = getCountry(timezone) || timezone;
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
				if (!uniquePages.has(country)) {
					uniquePages.set(country, 1);
				} else {
					uniquePages.set(country, uniquePages.get(country) + 1);
				}
			}
		}

		return Array.from(uniquePages).sort((a, b) => b[1] - a[1]);
	}

	let pages = $derived(sorted ? views : fetchPages(views));
	let fullPages = $state([]);
	let truncated_pages = $derived(pages.slice(0, max_page_item_count));

	$effect(() => {
		fullPages = [...pages];
	});

	let trottle;
	function searchQuery(event) {
		clearTimeout(trottle);
		trottle = setTimeout(() => {
			let query = event.target.value;
			fullPages = pages.filter((e) => e[0].toLowerCase().search(query.toLowerCase()) !== -1);
		});
	}
</script>

<MiniSectionWrapper title="Country">
	<div class="w-ful flex h-full flex-col gap-1">
		{#each truncated_pages as page (page[0])}
			<div animate:flip={{ duration: 150 }} class="min-w-full">
				<PageItem {jump} on:filter type="country" path={page[0]} views={page[1]} />
			</div>
		{:else}
			<EmptyValues />
		{/each}

		{#if truncated_pages.length < pages.length}
			<BottomDrawer {searchQuery} let:handle let:header let:content>
				<div slot="handle" class="z-0">
					<button class="no-bg mx-auto flex items-center justify-center gap-2 text-right">
						more <Maximize size={15} />
					</button>
				</div>
				<div slot="header" style="padding: 0 20px;" class="sticky top-0 mb-3 flex justify-between text-gray-950 dark:text-gray-100">
					<p>Country</p>
					<p>Views</p>
				</div>
				<div slot="content" class="no-scrollbar relative flex flex-col gap-1 overflow-y-auto px-5 py-2">
					{#each fullPages as page (page[0])}
						<div animate:flip={{ duration: 100 }}>
							<PageItem {jump} on:filter type="country" path={page[0]} views={page[1]} />
						</div>
					{:else}
						<p>Nothing yet!</p>
					{/each}
				</div>
			</BottomDrawer>
		{/if}
	</div>
</MiniSectionWrapper>
