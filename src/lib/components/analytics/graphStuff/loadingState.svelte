<script>
	import { LoaderPinwheel } from 'lucide-svelte';
	import { fade } from 'svelte/transition';
	import { color } from '$lib/colors/mixer.js';
</script>

<div
	transition:fade
	class="fixed bottom-0 left-0 right-0 top-0 m-auto grid h-screen w-screen place-content-center backdrop-blur-md backdrop-brightness-50"
>
	<LoaderPinwheel size={53} class="m-auto text-{$color}-200 animate-spin" />
</div>
