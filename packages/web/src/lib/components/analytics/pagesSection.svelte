<script>
	import { flip } from 'svelte/animate';
	import BottomDrawer from '../generals/bottomDrawer.svelte';
	import EmptyValues from './emptyValues.svelte';
	import PageItem from './pageItem.svelte';
	import { color } from '$lib/colors/mixer.js';
	import SectionWrapper from './sectionWrapper.svelte';
	import { Maximize } from 'lucide-svelte';

	let { views, jump = true, sorted = false } = $props();
	let max_page_item_count = 10;

	function fetchPages(events) {
		let uniquePages = new Map();

		events.forEach((event) => {
			if (!uniquePages.has(event.url)) {
				uniquePages.set(event.url, 1);
			} else {
				uniquePages.set(event.url, uniquePages.get(event.url) + 1);
			}
		});

		return Array.from(uniquePages).sort((a, b) => b[1] - a[1]);
	}

	let pages = $derived(sorted ? views : fetchPages(views));
	let fullPages = $derived([...pages]);
	let truncated_pages = $derived(pages.slice(0, max_page_item_count));

	let trottle;
	function searchQuery(event) {
		clearTimeout(trottle);
		trottle = setTimeout(() => {
			let query = event.target.value;
			fullPages = pages.filter((e) => e[0].search(query) !== -1);
		});
	}
</script>

<SectionWrapper title="Pages">
	<div class="flex h-full flex-col gap-1">
		{#each truncated_pages as page (page[0])}
			<div animate:flip={{ duration: 150 }} class="min-w-full">
				<PageItem {jump} type="page" on:filter path={page[0]} views={page[1]} />
			</div>
		{:else}
			<EmptyValues />
		{/each}

		{#if truncated_pages.length < pages.length}
			<BottomDrawer {searchQuery} let:handle let:header let:content>
				<div slot="handle">
					<button class="no-bg mx-auto flex items-center justify-center gap-2 text-right">
						more <Maximize size={15} />
					</button>
				</div>
				<div slot="header" style="padding: 0 20px;" class="sticky top-0 mb-3 flex justify-between text-gray-950 dark:text-gray-100">
					<p>Pages</p>
					<p>Views</p>
				</div>
				<div slot="content" class="no-scrollbar relative flex flex-col gap-1 overflow-y-auto px-5 py-2">
					{#each fullPages as page (page[0])}
						<div animate:flip={{ duration: 100 }}>
							<PageItem {jump} on:filter type="page" path={page[0]} views={page[1]} />
						</div>
					{:else}
						<p>Nothing!</p>
					{/each}
				</div>
			</BottomDrawer>
		{/if}
	</div>
</SectionWrapper>
