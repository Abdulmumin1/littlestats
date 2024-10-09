<script>
	import { CircleOff } from 'lucide-svelte';

	import { color } from '$lib/colors/mixer.js';
</script>

<div class="flex h-full flex-col items-center justify-center rounded-2xl">
	<CircleOff size={50} class="text-{$color}-300" />
	<p class="text-{$color}-400 mt-3">Nothing yet!</p>
</div>
