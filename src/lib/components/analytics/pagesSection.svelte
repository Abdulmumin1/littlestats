<script>
	import { flip } from 'svelte/animate';
	import BottomDrawer from '../generals/bottomDrawer.svelte';
	import EmptyValues from './emptyValues.svelte';
	import PageItem from './pageItem.svelte';
	import { color } from '$lib/colors/mixer.js';

	export let views;
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
	$: pages = fetchPages(views);
	$: trunaced_pages = pages.splice(0, max_page_item_count);
</script>

<div class="min-h-24 min-w-[230px] flex-1 md:min-h-[240px]">
	<div class="mb-3 flex justify-between text-gray-950">
		<p>Pages</p>
		<p>Views</p>
	</div>
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
				<PageItem type="page" on:filter path={page[0]} views={page[1]} />
			</div>
		{:else}
			<EmptyValues />
		{/each}

		{#if trunaced_pages.length < pages.length}
			<BottomDrawer>
				<div slot="handle">
					<button class="no-bg text-right">more &rarr;</button>
				</div>
				<div
					slot="header"
					style="padding: 0 20px;"
					class="sticky top-0 mb-3 flex justify-between text-gray-950"
				>
					<p>Pages</p>
					<p>Views</p>
				</div>
				<div slot="content" class="relative flex flex-col gap-1 overflow-y-auto">
					{#each fetchPages(views) as page}
						<PageItem on:filter type="page" path={page[0]} views={page[1]} />
					{:else}
						<p>Nothing yet!</p>
					{/each}
				</div>
			</BottomDrawer>
		{/if}
	</div>
</div>
