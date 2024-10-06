<script>
	import { Link } from 'lucide-svelte';
	import { color } from '$lib/colors/mixer.js';

	export let data;

	let domains = data.domains;

	function filterView(ob) {
		let views = ob.filter((e) => e.event_type != 'pageExit');
		return views.length;
	}
</script>

<div class="container mx-auto">
	<h1 class=" mb-4 text-2xl font-bold">Sites</h1>
	<div class=" flex flex-col gap-2">
		{#each domains as domain}
			<a
				href="/site/{domain.id}"
				class="flex items-center justify-between gap-1 rounded-lg bg-{$color}-200 p-4 font-semibold text-{$color}-700 hover:bg-{$color}-300"
			>
				<div class="flex items-center gap-2">
					<Link size={16} />{domain.name}
				</div>

				{#if domain?.expand}
					<div
						class="flex items-center gap-2 rounded-full border-2 border-black bg-{$color}-400 px-3 py-1"
					>
						<p class="font-bold text-{$color}-900">Lifetime Views:</p>
						<p class="text-{$color}-900">
							{filterView(domain.expand.events_via_domain_id)}
						</p>
					</div>
				{/if}
				<!-- {data.records.length} -->
			</a>
		{/each}
	</div>
</div>
