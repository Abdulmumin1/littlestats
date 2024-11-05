<script>
	import { flip } from 'svelte/animate';
	import BottomDrawer from '../generals/bottomDrawer.svelte';
	import EmptyValues from './emptyValues.svelte';
	import PageItem from './pageItem.svelte';

	export let views, domain;
	let max_page_item_count = 6;

	function parseUserAgent(userAgent) {
		let os = 'Unknown';

		// OS detection
		if (userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('iPod')) {
			os = 'iOS';
		} else if (userAgent.includes('Android')) {
			os = 'Android';
		} else if (userAgent.includes('Win')) {
			os = 'Windows';
		} else if (userAgent.includes('Mac')) {
			os = 'MacOS';
		} else if (userAgent.includes('X11')) {
			os = 'Linux';
		} else if (userAgent.includes('Linux')) {
			os = 'Linux';
		}

		return os;
	}

	function fetchPages(events) {
		let uniquePages = new Map();

		events.forEach((event) => {
			// console.log(event);
			let ref = event.user_agent;

			if (ref) {
				let os = parseUserAgent(event.user_agent);
				if (os != domain.name) {
					if (!uniquePages.has(os)) {
						uniquePages.set(os, 1);
					} else {
						uniquePages.set(os, uniquePages.get(os) + 1);
					}
				}
			}
		});

		return Array.from(uniquePages).sort((a, b) => b[1] - a[1]);
	}

	$: pages = fetchPages(views);
	$: trunaced_pages = pages.splice(0, max_page_item_count);

	$: console.log(pages);
</script>

<div class="min-h-[130px] min-w-[230px] flex-1">
	<div class="mb-3 flex justify-between text-gray-950">
		<p>Operating System</p>
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
			<div animate:flip={{ duration: 150 }} class="w-full">
				<PageItem on:filter type="os" path={page[0]} views={page[1]} />
			</div>
		{:else}
			<EmptyValues />
		{/each}

		{#if pages.length > max_page_item_count}
			<BottomDrawer>
				<div slot="handle">
					<button class="no-bg text-right">more &rarr;</button>
				</div>
				<div slot="content" class="relative flex flex-col gap-1 overflow-y-auto">
					<div class="sticky top-0 mb-3 flex justify-between text-gray-950">
						<p>Referrer</p>
						<p>Views</p>
					</div>
					{#each fetchPages(views) as page}
						<PageItem on:filter type="os" path={page[0]} views={page[1]} />
					{:else}
						<p>Nothing yet!</p>
					{/each}
				</div>
			</BottomDrawer>
		{/if}
	</div>
</div>
