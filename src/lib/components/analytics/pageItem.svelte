<script>
	import { color } from '$lib/colors/mixer.js';
	import { formatNumber } from '$lib/slug/helpers.js';

	export let path, views, type;
	import { createEventDispatcher } from 'svelte';
	// import { fade } from 'svelte/transition';

	const dispatch = createEventDispatcher();

	function sendFilter() {
		dispatch('filter', {
			type,
			query: path
		});
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<!-- [#3db33925] -->
<button
	title="Click to filter"
	on:click={sendFilter}
	class="flex w-full justify-between rounded-md  text-left bg-{$color}-100 dark:border-x-[13px] border-{$color}-700 dark:bg-stone-800/50 dark:text-gray-100 px-[9px] py-[3px]"
>
	<p class="max-w-[420px] truncate">{path}</p>
	<p class="text-sm">{formatNumber(views)}</p>
</button>
