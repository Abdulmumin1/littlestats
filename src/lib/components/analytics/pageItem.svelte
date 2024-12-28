<script>
	import { color } from '$lib/colors/mixer.js';
	import { formatNumber } from '$lib/slug/helpers.js';
	import { ExternalLink } from 'lucide-svelte';

	import { createEventDispatcher } from 'svelte';
	let { path, views, type, jump = true } = $props();
	// import { fade } from 'svelte/transition';

	const dispatch = createEventDispatcher();

	function sendFilter() {
		dispatch('filter', {
			type,
			query: path
		});
		jump && window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<!-- [#3db33925] -->
<button
	title="Click to filter"
	onclick={sendFilter}
	class="flex w-full justify-between group rounded-md text-left bg-{$color}-100/50 dark:border-x-[13px] border-{$color}-700 px-[9px] py-[3px] dark:bg-stone-800/50 dark:text-gray-100"
>
	<p class="max-w-[420px] truncate">{path}</p>
	<div class="flex gap-1">
		<p class="text-sm">{formatNumber(views)}</p>
		<!-- <a href="{path}" target="_blank" class="z-50 hidden group-hover:block"><ExternalLink size={16}/></a> -->
	</div>
</button>
