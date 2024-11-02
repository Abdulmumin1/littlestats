<script>
	import { CircleOff } from 'lucide-svelte';
	import BottomDrawer from '../generals/bottomDrawer.svelte';
	import PageItem from './pageItem.svelte';
	import { color } from '$lib/colors/mixer.js';
	import EmptyValues from './emptyValues.svelte';
	import { flip } from 'svelte/animate';

	export let views, domain;
	let max_page_item_count = 10;
	function parseUserAgent(userAgent) {
		let os = 'Unknown';
		let browser = 'Unknown';

		// OS detection
		if (userAgent.includes('Win')) {
			os = 'Windows';
		} else if (userAgent.includes('Mac')) {
			os = 'MacOS';
		} else if (userAgent.includes('X11') || userAgent.includes('Linux')) {
			os = 'Linux';
		}

		// Browser detection
		if (userAgent.includes('Firefox/')) {
			browser = 'Firefox';
		} else if (userAgent.includes('Chrome/')) {
			browser = 'Chrome';
		} else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) {
			browser = 'Safari';
		} else if (userAgent.includes('Edge/') || userAgent.includes('Edg/')) {
			browser = 'Edge';
		} else if (userAgent.includes('Opera/') || userAgent.includes('OPR/')) {
			browser = 'Opera';
		}

		return browser;
	}

	function fetchPages(events) {
		let uniquePages = new Map();

		events.forEach((event) => {
			// console.log(event);
			let ref = event.user_agent;

			if (ref) {
				let user_agent = parseUserAgent(event.user_agent);
				if (!uniquePages.has(user_agent)) {
					uniquePages.set(user_agent, 1);
				} else {
					uniquePages.set(user_agent, uniquePages.get(user_agent) + 1);
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
		<p>Browser</p>
		<p>Views</p>
	</div>

	<div class="flex h-full flex-col gap-1">
		{#each trunaced_pages as page (page[0])}
			<div animate:flip={{ duration: 150 }} class="w-full">
				<PageItem on:filter type="browser" path={page[0]} views={page[1]} />
			</div>
		{:else}
			<EmptyValues />
		{/each}

		{#if trunaced_pages.length >= max_page_item_count}
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
						<PageItem on:filter type="browser" path={page[0]} views={page[1]} />
					{:else}
						<p>Nothing yet!</p>
					{/each}
				</div>
			</BottomDrawer>
		{/if}
	</div>
</div>
