<script>
	import { Link, Activity, Clock, Eye, ArrowUpRight } from 'lucide-svelte';
	import { color } from '$lib/colors/mixer.js';
	import CuteCloud from '../../../lib/components/generals/cuteCloud.svelte';

	export let data;
	let domains = data.domains;

	function last24hours(ob) {
		let views = ob.filter((e) => e.event_type != 'pageExit');
		const now = new Date();
		return views.filter((element) => {
			const recordDate = new Date(element.timestamp).getTime();
			const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000).getTime();
			return recordDate >= last24Hours;
		}).length;
	}

	function filterView(ob) {
		let views = ob.filter((e) => e.event_type != 'pageExit');
		return views.length;
	}

	function getActivityRate(events) {
		return Math.round(last24hours(events) / 24);
	}
</script>

<div class="container mx-auto p-6">
	<h1 class="mb-6 text-2xl font-bold text-slate-900">Sites</h1>

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each domains as domain}
			<div
				class=" rounded-lg border border-{$color}-400 bg-{$color}-200 shadow-sm transition-shadow hover:shadow-md"
			>
				<!-- Card Header -->
				<div class="border-b border-{$color}-500 p-4">
					<div class="flex items-center justify-between gap-3">
						<div class="flex items-center gap-2">
							<Link class="h-4 w-4 text-{$color}-500" />
							<h3 class="text-lg font-semibold text-slate-900">{domain.name}</h3>
						</div>
						<span class="rounded-full px-2 py-1 text-[9px] bg-{$color}-50 text-{$color}-700 w-full">
							ID: {domain.id}
						</span>
					</div>
				</div>

				{#if domain?.expand}
					<!-- Card Content -->
					<div class="p-4">
						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div class="flex items-center gap-2">
								<Eye class="h-4 w-4 text-{$color}-500" />
								<div>
									<p class="text-sm text-slate-500">Lifetime Views</p>
									<p class="font-semibold text-slate-900">
										{filterView(domain.expand.events_via_domain_id).toLocaleString()}
									</p>
								</div>
							</div>

							<div class="flex items-center gap-2">
								<Clock class="h-4 w-4 text-{$color}-500" />
								<div>
									<p class="text-sm text-slate-500">Last 24 Hours</p>
									<p class="font-semibold text-slate-900">
										{last24hours(domain.expand.events_via_domain_id).toLocaleString()}
									</p>
								</div>
							</div>

							<div class="flex items-center gap-2">
								<Activity class="h-4 w-4 text-{$color}-500" />
								<div>
									<p class="text-sm text-slate-500">Activity Rate</p>
									<p class="font-semibold text-slate-900">
										{getActivityRate(domain.expand.events_via_domain_id)} /hr
									</p>
								</div>
							</div>
						</div>
					</div>
				{/if}

				<!-- Card Footer -->
				<div class="{domain.expand ? `border-${$color}-500 border-t` : ''} p-4">
					<a
						href="/site/{domain.id}"
						class="flex items-center gap-1 text-sm text-{$color}-500 hover:text-{$color}-700"
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
