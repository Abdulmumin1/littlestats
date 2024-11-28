<script>
	import { color } from '$lib/colors/mixer.js';
	let { title, children } = $props();
</script>
<div class="min-h-24 min-w-[230px] flex-1 md:min-h-[240px] d0   rounded-md">
    <div class="mb-3 flex justify-between text-gray-950 dark:text-gray-100">
		<p>{title}</p>
		<p>Views</p>
	</div>
{@render children?.()}
</div>