<script>
	import { flip } from 'svelte/animate';
	import BottomDrawer from '../generals/bottomDrawer.svelte';
	import EmptyValues from './emptyValues.svelte';
	import PageItem from './pageItem.svelte';
	import { color } from '$lib/colors/mixer.js';
	import MiniSectionWrapper from './miniSectionWrapper.svelte';
	import { Maximize } from 'lucide-svelte';

	let { views, domain, jump = true, sorted = false } = $props();
	let max_page_item_count = 6;

	function parseUserAgent(userAgent) {
		let os = 'Unknown';

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

	let pages = $derived(sorted ? views : fetchPages(views));
	let fullPages = $state([...pages]);
	let trunaced_pages = $derived([...pages].splice(0, max_page_item_count));

	let trottle;
	function searchQuery(event) {
		clearTimeout(trottle);
		trottle = setTimeout(() => {
			let query = event.target.value;
			fullPages = pages.filter((e) => e[0].toLowerCase().search(query.toLowerCase()) !== -1);
		});
	}
</script>

<MiniSectionWrapper title="Operating System">
	<div class="flex h-full flex-col gap-1">
		{#each trunaced_pages as page (page[0])}
			<div animate:flip={{ duration: 150 }} class="w-full">
				<PageItem {jump} on:filter type="os" path={page[0]} views={page[1]} />
			</div>
		{:else}
			<EmptyValues />
		{/each}

		{#if trunaced_pages.length < views.length}
			<BottomDrawer {searchQuery} let:handle let:header let:content>
				<div slot="handle">
					<button class="no-bg mx-auto flex items-center justify-center gap-2 text-right">
						more <Maximize size={15} />
					</button>
				</div>
				<div slot="header" style="padding: 0 20px;" class="sticky top-0 mb-3 flex justify-between text-gray-950 dark:text-gray-100">
					<p>Operating System</p>
					<p>Views</p>
				</div>
				<div slot="content" class="no-scrollbar relative flex flex-col gap-1 overflow-y-auto px-[20px] py-2">
					{#each fullPages as page (page[0])}
						<div animate:flip={{ duration: 100 }}>
							<PageItem {jump} on:filter type="os" path={page[0]} views={page[1]} />
						</div>
					{:else}
						<p>Nothing yet!</p>
					{/each}
				</div>
			</BottomDrawer>
		{/if}
	</div>
</MiniSectionWrapper>
