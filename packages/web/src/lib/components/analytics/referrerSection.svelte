<script>
	import { flip } from 'svelte/animate';
	import BottomDrawer from '../generals/bottomDrawer.svelte';
	import EmptyValues from './emptyValues.svelte';
	import PageItem from './pageItem.svelte';
	import { color } from '$lib/colors/mixer.js';
	import SectionWrapper from './sectionWrapper.svelte';
	import { Maximize } from 'lucide-svelte';

	let { views, domain, jump = true, sorted = false } = $props();
	let max_page_item_count = 10;

	function fetchPages(events) {
		let uniquePages = new Map();
		let direct = 'Direct';

		events.forEach((event) => {
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
					if (hostname != domain.name) {
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

<SectionWrapper title="Referrer">
	<div class="flex h-full flex-col gap-1">
		{#each truncated_pages as page (page[0])}
			<div animate:flip={{ duration: 150 }} class="w-full">
				<PageItem {jump} on:filter type="ref" path={page[0]} views={page[1]} />
			</div>
		{:else}
			<EmptyValues />
		{/each}

		{#if truncated_pages.length < pages.length}
			<BottomDrawer {searchQuery} let:handle let:header let:content>
				<div slot="handle">
					<div class="no-bg mx-auto flex items-center justify-center gap-2 text-right">
						more <Maximize size={15} />
					</div>
				</div>
				<div slot="header" style="padding: 0 20px;" class="sticky top-0 mb-3 flex justify-between text-gray-950 dark:text-gray-100">
					<p>Referrer</p>
					<p>Views</p>
				</div>
				<div slot="content" class="no-scrollbar relative flex flex-col gap-1 overflow-y-auto px-5 py-2">
					{#each fullPages as page (page[0])}
						<div animate:flip={{ duration: 100 }}>
							<PageItem {jump} on:filter type="ref" path={page[0]} views={page[1]} />
						</div>
					{:else}
						<p>Nothing yet!</p>
					{/each}
				</div>
			</BottomDrawer>
		{/if}
	</div>
</SectionWrapper>
