<script>
	import { color } from '$lib/colors/mixer.js';
	let { title, children } = $props();
</script>

<div
	class="min-h-24 min-w-[230px] flex-1 rounded-md bg-white/30 p-3 md:min-h-[240px] dark:bg-stone-800/50"
>
	<div
		class="mb-2 flex justify-between border-b border-gray-100 pb-3 pt-2 text-black/80 dark:border-stone-950/50 dark:text-white/80"
	>
		<p>{title}</p>
		<p>Views</p>
	</div>
	{@render children?.()}
</div>
