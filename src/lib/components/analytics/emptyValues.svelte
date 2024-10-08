<script>
	import { CircleOff } from 'lucide-svelte';

	import { color } from '$lib/colors/mixer.js';
</script>

<div class="flex h-full flex-col items-center justify-center bg-{$color}-200 rounded-2xl">
	<CircleOff size={50} class="text-{$color}-400" />
	<p class="text-{$color}-950">Nothing yet!</p>
</div>
