<script>
	import { Link, Activity, Clock, Eye, ArrowUpRight } from 'lucide-svelte';
	import { color } from '$lib/colors/mixer.js';
	import CuteCloud from '../../../lib/components/generals/cuteCloud.svelte';
	import { formatNumber } from '$lib/slug/helpers.js';

	export let data;
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

	function last24hours(events) {
		if (!events || !Array.isArray(events)) return 0;

		// Filter out pageExit events first
		const validEvents = events.filter((e) => e.event_type !== 'pageExit');

		const now = Date.now(); // Current timestamp in milliseconds
		const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).getTime();

		return formatNumber(
			validEvents.filter((event) => {
				const eventTime = new Date(event.timestamp).getTime();
				return eventTime >= twentyFourHoursAgo && eventTime <= now.getTime();
			}).length
		);
	}

	function filterView(events) {
		if (!events || !Array.isArray(events)) return 0;
		return formatNumber(events.filter((e) => e.event_type !== 'pageExit').length);
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
</script>

<div class="container mx-auto p-6">
	<div class="flex items-center justify-between">
		<h1 class="mb-6 text-2xl font-bold text-black">Sites</h1>
		<a href="/settings"> + Add Domain </a>
	</div>

	<div class="flex flex-col gap-4">
		{#each domains as domain}
			<div class="w-full rounded-lg border border-{$color}-400 bg-{$color}-200">
				<!-- Card Header -->
				<div class="px-4 pt-4">
					<div class="flex items-center justify-between gap-3">
						<div class="flex items-center gap-2">
							<Link class="h-4 w-4 text-{$color}-700" />
							<h3 class="text-lg font-semibold text-black">{domain.name}</h3>
						</div>
						<!-- <div
							class="w-fit rounded-full px-2 py-1 text-[9px] md:text-xs bg-{$color}-100 text-{$color}-700"
						>
							ID: {domain.id}
						</div> -->
					</div>
				</div>

				{#if domain?.expand}
					<!-- Card Content -->
					<div class="p-4">
						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div class="flex items-center gap-2">
								<Eye class="h-4 w-4 text-{$color}-800" />
								<div>
									<p class="text-sm text-gray-900">Lifetime Views</p>
									<p class="font-semibold text-black">
										{filterView(domain.expand.events_via_domain_id).toLocaleString()}
									</p>
								</div>
							</div>

							<div class="flex items-center gap-2">
								<Clock class="h-4 w-4 text-{$color}-800" />
								<div>
									<p class="text-sm text-gray-900">Last 24 Hours</p>
									<p class="font-semibold text-black">
										{last24hours(domain.expand.events_via_domain_id).toLocaleString()}
									</p>
								</div>
							</div>

							<div class="flex items-center gap-2">
								<Activity class="h-4 w-4 text-{$color}-800" />
								<div>
									<p class="text-sm text-gray-900">Activity Rate</p>
									<p class="font-semibold text-black">
										{getActivityRate(domain.expand.events_via_domain_id)} /hr
									</p>
								</div>
							</div>
						</div>
					</div>
				{/if}

				<!-- Card Footer -->
				<div class=" px-4 pb-4">
					<a
						href="/site/{domain.id}"
						class="flex items-center gap-1 text-sm text-{$color}-600 hover:text-{$color}-800"
					>
						View Details
						<ArrowUpRight class="h-3 w-3" />
					</a>
				</div>
			</div>
		{/each}
	</div>
</div>
<div class="flex h-28 items-center justify-center">
	<div class="scale-50 opacity-20">
		<CuteCloud />
	</div>
</div>
