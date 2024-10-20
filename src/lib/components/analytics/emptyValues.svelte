<script>
	import { CircleOff } from 'lucide-svelte';

	import { color } from '$lib/colors/mixer.js';
	import CuteCloud from '../generals/cuteCloud.svelte';
</script>

<div class="flex h-full flex-col items-center justify-center rounded-2xl">
	<!-- <CircleOff size={50} class="text-{$color}-300" /> -->
	<div class="flex items-center justify-center opacity-30">
		<CuteCloud />
	</div>
	<p class="text-{$color}-400 mt-3">Nothing yet!</p>
</div>
