<script>
	import { Link, Activity, Clock, Eye, ArrowUpRight } from 'lucide-svelte';
	import { color } from '$lib/colors/mixer.js';
	import CuteCloud from '../../../lib/components/generals/cuteCloud.svelte';
	import { formatNumber } from '$lib/slug/helpers.js';
	import MiniChart from '../../../lib/components/analytics/graphStuff/miniChart.svelte';
	import Sitecard from './sitecard.svelte';
	import Seo from '../../../lib/components/generals/seo.svelte';
	import { onMount } from 'svelte';
	import InsideNav from '../../../lib/components/generals/insideNav.svelte';

	let { data } = $props();
	let domains = data.domains;

	// function last24hours(ob) {
	// 	let views = ob.filter((e) => e.event_type != 'pageExit');
	// 	const now = new Date();
	// 	return views.filter((element) => {
	// 		const recordDate = new Date(element.created_at).getTime();
	// 		const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000).getTime();
	// 		return recordDate <= last24Hours;
	// 	}).length;
	// }

	// function filterView(ob) {
	// 	let views = ob.filter((e) => e.event_type != 'pageExit');
	// 	return views.length;
	// }

	// function getActivityRate(events) {
	// 	return Math.round(last24hours(events) / 24);
	// }

	

	
</script>

<svelte:head>
	<Seo title="Dashboard - Littlestats" />
</svelte:head>

<InsideNav/>
<div class="container max-w-7xl mx-auto p-6">
	<div class="mb-6 flex items-center justify-between dark:text-gray-200">
		<h1 class="text-2xl font-bold">Sites</h1>
		<a href="/settings"> + Add Domain </a>
	</div>

	{#if domains.length > 0}
		<div id="grid" class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each domains as domain, index}
				<Sitecard {domain} {index} length={domains.length}/>
			{/each}
		</div>
	{:else}
		<div
			class="mx-auto h-64 w-full flex-col rounded-xl border-2 border-dashed border-{$color}-700 flex items-center justify-center"
		>
			<div class="flex h-28 items-center justify-center">
				<div class="scale-50 opacity-20">
					<CuteCloud />
				</div>
			</div>
			<p class="dark:text-gray-100">No domains yet</p>

			<a
				href="/settings"
				class="my-4 bg-{$color}-600 dark:bg-{$color}-700 rounded-2xl p-2 px-3 text-white"
			>
				+ Add Domain
			</a>
		</div>
	{/if}
</div>
