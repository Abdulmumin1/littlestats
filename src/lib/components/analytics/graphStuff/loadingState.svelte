<script>
	import { LoaderPinwheel } from 'lucide-svelte';
	import { fade } from 'svelte/transition';
</script>

<div
	transition:fade
	class="fixed bottom-0 left-0 right-0 top-0 m-auto grid h-screen w-screen place-content-center backdrop-blur-sm backdrop-brightness-50"
>
	<LoaderPinwheel size={53} class="m-auto animate-spin" />
</div>
