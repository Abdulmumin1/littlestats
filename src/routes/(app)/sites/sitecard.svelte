<script>
	import { color } from '$lib/colors/mixer.js';
	import { formatNumber } from '$lib/slug/helpers.js';
	import { onMount } from 'svelte';
	import MiniChart from '../../../lib/components/analytics/graphStuff/miniChart.svelte';
	import { Link, Activity, Clock, Eye, ArrowUpRight } from 'lucide-svelte';
	import { deserialize } from '$app/forms';
	import { dashboardInterval as globalRange } from '$lib/globalstate.svelte.js';
	import {
		calculateActiveUsersLastXDays,
		calculateDailyActiveUsers,
		calculateWeeklyActiveUsers,
		calculateAverageValue,
		calculateRetension
	} from '$lib/slug/activeUsersUtils.js';
	let { domain = {}, index, length } = $props();

	function last24hours(events) {
		if (!events || !Array.isArray(events)) return 0;

		// Filter out pageExit events first
		const validEvents = events.filter((e) => e.event_type !== 'pageExit');

		const now = new Date();
		const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).getTime();

		return formatNumber(
			validEvents.filter((event) => {
				const eventTime = new Date(event.timestamp).getTime();
				return eventTime >= twentyFourHoursAgo;
			}).length
		);
	}

	function filterView(events) {
		if (!events || !Array.isArray(events)) return 0;
		return events.filter((e) => e.event_type !== 'pageExit');
	}

	function getActivityRate(events) {
		if (!events || !Array.isArray(events)) return 0;

		const now = Date.now();
		const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

		// Filter events in the last 24 hours
		const recentEvents = events.filter((event) => {
			if (event.event_type === 'pageExit') return false;
			const eventTime = new Date(event.timestamp).getTime();
			return eventTime >= twentyFourHoursAgo && eventTime <= now;
		});

		// If no events, return 0
		if (recentEvents.length === 0) return 0;

		// Find the time range of the events
		const eventTimes = recentEvents.map((e) => new Date(e.timestamp).getTime());
		const oldestEventTime = Math.min(...eventTimes);
		const newestEventTime = Math.max(...eventTimes);

		// Calculate the actual time span in hours (minimum 1 hour to avoid division by zero)
		const timeSpanHours = Math.max(1, (newestEventTime - oldestEventTime) / (1000 * 60 * 60));

		// Calculate rate
		return Math.round(recentEvents.length / timeSpanHours);
	}

	let views = $state({
		dau: {},
		wau: {},
		viewCount: 0,
		graph: {}
	});
	let viewCount = $derived(views.viewCount);
	let loading = $state(false);

	onMount(async () => {
		await fetchFromDefaultDates();
	});

	async function fetchFromDefaultDates() {
		loading = true;
		const form = new FormData();
		form.append('domain_id', domain.id);

		const response = await fetch('?/getData', { method: 'POST', body: form });
		if (response.ok) {
			const result = deserialize(await response.text());
			// console.log(result)
			views = result.data.data;
		}
		loading = false;
	}

	let dau = $derived(views.dau);
	let wau = $derived(views.wau);
</script>

<div class=" rounded-xl border-{$color}-900 {index == length - 1 && length % 2 != 0 ? '' : ''}">
	<a
		href="/site/{domain.id}"
		class="flex w-full flex-col justify-between rounded-lg p-6 py-4 bg-{$color}-200 bg-opacity-35 dark:bg-stone-800/50 dark:text-gray-200"
	>
		<!-- Card Header -->
		<div class="">
			<div class="flex items-center justify-between gap-3 pb-4">
				<div class="flex items-center gap-2">
					<Link class="h-4 w-4 text-black dark:text-gray-200" />
					<h3 class="text-lg font-semibold text-black dark:text-gray-200">
						{domain.name}
					</h3>
				</div>
				<!-- <div
			class="w-fit rounded-full px-2 py-1 text-[9px] md:text-xs bg-{$color}-100 text-black dark:text-gray-200"
		>
			ID: {domain.id}
		</div> -->
			</div>
		</div>

		<!-- {#if domain?.expand}
		<div class="p-4">
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="flex items-center gap-2">
					<Eye class="h-4 w-4 text-black dark:text-gray-200" />
					<div>
						<p class="text-sm text-gray-900 dark:text-gray-300">Lifetime Views</p>
						<p class="font-semibold text-black dark:text-black dark:text-gray-200">
							{filterView(domain.expand.events_via_domain_id).toLocaleString()}
						</p>
					</div>
				</div>
	
				<div class="flex items-center gap-2">
					<Clock class="h-4 w-4 text-black dark:text-gray-200" />
					<div>
						<p class="text-sm text-gray-900 dark:text-gray-300">Last 24 Hours</p>
						<p class="font-semibold text-black dark:text-black dark:text-gray-200">
							{last24hours(domain.expand.events_via_domain_id).toLocaleString()}
						</p>
					</div>
				</div>
	
				<div class="flex items-center gap-2">
					<Activity class="h-4 w-4 text-black dark:text-gray-200" />
					<div>
						<p class="text-sm text-gray-900 dark:text-gray-300">Activity Rate</p>
						<p class="font-semibold text-black dark:text-gray-200">
							{getActivityRate(domain.expand.events_via_domain_id)} /hr
						</p>
					</div>
				</div>
			</div>
		</div>
	{/if} -->
		<div class="flex flex-col gap-2 pr-3 text-sm md:pr-5">
			<MiniChart
				sorted={true}
				chartD={{ data: views.graph, label: 'label' }}
				sortInterval={globalRange}
				type={'line'}
			/>
			<p>
				Last {globalRange} days: <span class="font-bold text-{$color}-500">{viewCount}</span> views
			</p>

			<section class="flex w-full gap-4">
				<section class=" flex flex-1 flex-col rounded-lg bg-{$color}-50 py-4 dark:bg-stone-800/90">
					<MiniChart
						chartD={{ data: dau, label: 'label' }}
						sorted={true}
						type={'bar'}
						sortInterval={7}
					/>
					<p class="px-2">
						Average Daily Visitors:
						<span class="font-bold text-{$color}-500">{calculateAverageValue(dau)}</span>
					</p>
				</section>
				<section class=" flex flex-1 flex-col rounded-lg bg-{$color}-50 py-4 dark:bg-stone-800/90">
					<MiniChart
						chartD={{ data: wau, label: 'label' }}
						sorted={true}
						type={'line'}
						sortInterval={30}
					/>

					<p class="px-2">
						Average Weekly Visitors:
						<span class="font-bold text-{$color}-500">{calculateAverageValue(wau)}</span>
					</p>
				</section>
			</section>
		</div>
		<!-- Card Footer -->
		<!-- <div class=" px-4">
		<a href="/site/{domain.id}" class="flex items-center gap-1 text-sm text-{$color}-700">
			Goto Dashboard
			<ArrowUpRight class="h-3 w-3" />
		</a>
	</div> -->
	</a>
</div>
