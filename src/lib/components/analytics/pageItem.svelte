<script>
	import { color } from '$lib/colors/mixer.js';
	import { formatNumber } from '$lib/slug/helpers.js';

	export let path, views, type;
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function sendFilter() {
		dispatch('filter', {
			type,
			query: path
		});
	}
</script>

<!-- [#3db33925] -->
<button
	title="Click to filter"
	on:click={sendFilter}
	class="flex justify-between rounded-md text-left bg-{$color}-200 px-[9px] py-[3px]"
>
	<p class="max-w-[420px] truncate">{path}</p>
	<p class="text-sm">{formatNumber(views)}</p>
</button>
