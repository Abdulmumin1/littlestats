<script>
	import { flip } from 'svelte/animate';
	import BottomDrawer from '../generals/bottomDrawer.svelte';
	import EmptyValues from './emptyValues.svelte';
	import PageItem from './pageItem.svelte';
	import { color } from '$lib/colors/mixer.js';
	import SectionWrapper from './sectionWrapper.svelte';
	import { Expand, Maximize } from 'lucide-svelte';

	let { views, jump = true } = $props();
	let max_page_item_count = 10;

	function fetchPages(events) {
		let uniquePages = new Map();

		events.forEach((event) => {
			// console.log(event);
			if (!uniquePages.has(event.url)) {
				uniquePages.set(event.url, 1);
			} else {
				uniquePages.set(event.url, uniquePages.get(event.url) + 1);
			}
		});

		return Array.from(uniquePages).sort((a, b) => b[1] - a[1]);
	}
	let pages = $derived(fetchPages(views));
	let fullPages = $state([...pages])
	let trunaced_pages = $derived([...pages].splice(0, max_page_item_count));

	let trottle;
	function searchQuery(event) {
		clearTimeout(trottle)
		trottle = setTimeout(()=>{
			let query = event.target.value
				
			fullPages = pages.filter((e) => e[0].search(query) !== -1);
			// console.log(fullPages)
		})
	}
</script>

<SectionWrapper title="Pages">
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

	<div class="flex h-full flex-col gap-1">
		{#each trunaced_pages as page (page[0])}
			<div animate:flip={{ duration: 150 }} class="min-w-full">
				<PageItem {jump} type="page" on:filter path={page[0]} views={page[1]} />
			</div>
		{:else}
			<EmptyValues />
		{/each}
		<!-- {trunaced_pages.length}={ fetchPages(views).length}={pages.length} -->
		{#if trunaced_pages.length < fetchPages(views).length}
			<BottomDrawer {searchQuery}>
				{#snippet handle()}
					<div>
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
						<p>Pages</p>
						<p>Views</p>
					</div>
				{/snippet}
				{#snippet content()}
					<div class="relative flex flex-col gap-1 px-[20px] py-2 overflow-y-auto no-scrollbar">
						{#each fullPages as page (page[0])}
							<div animate:flip={{duration:100}}>

								<PageItem {jump} on:filter type="page" path={page[0]} views={page[1]} />
							</div>
						{:else}
							<p>Nothing!</p>
						{/each}
					</div>
				{/snippet}
			</BottomDrawer>
		{/if}
	</div>
</SectionWrapper>

