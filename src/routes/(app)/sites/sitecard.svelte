<script>
	import { color } from '$lib/colors/mixer.js';
	import { formatNumber } from '$lib/slug/helpers.js';
	import MiniChart from '../../../lib/components/analytics/graphStuff/miniChart.svelte';
	import { Link, Activity, Clock, Eye, ArrowUpRight } from 'lucide-svelte';

	let { domain = {} } = $props();

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

	// let views = filterView(domain.expand.events_via_domain_id)
	// let viewCount = formatNumber(views.length)
</script>

<a
	href="/site/{domain.id}"
	class="flex w-full items-center justify-between rounded-lg py-4 dark:border-none border-{$color}-400 bg-{$color}-100 dark:bg-stone-800/50 dark:text-black dark:text-gray-200"
>
	<!-- Card Header -->
	<div class="px-4">
		<div class="flex items-center justify-between gap-3">
			<div class="flex items-center gap-2">
				<Link class="h-4 w-4 text-black dark:text-gray-200" />
				<h3 class="text-lg font-semibold text-black dark:text-black dark:text-gray-200">
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
	<!-- <div class="flex gap-2 items-end pr-3 md:pr-5">

    <MiniChart chartD={{data:views, label:"label"}} sortInterval={30}/>
    {viewCount}
</div> -->
	<!-- Card Footer -->
	<!-- <div class=" px-4">
    <a href="/site/{domain.id}" class="flex items-center gap-1 text-sm text-{$color}-700">
        Goto Dashboard
        <ArrowUpRight class="h-3 w-3" />
    </a>
</div> -->
</a>
