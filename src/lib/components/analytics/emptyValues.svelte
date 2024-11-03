<script>
	import { CircleOff } from 'lucide-svelte';

	import { color } from '$lib/colors/mixer.js';
	import CuteCloud from '../generals/cuteCloud.svelte';
</script>

<div class="flex h-full flex-col items-center justify-center rounded-2xl">
	<!-- <CircleOff size={50} class="text-{$color}-300" /> -->
	<div class="flex h-28 items-center justify-center opacity-30">
		<div class="scale-50" style="scale: 0.5;">
			<CuteCloud />
		</div>
	</div>
	<p class="text-{$color}-500 mt-3 font-extrabold opacity-75">Nothing yet, keep grinding!</p>
</div>
