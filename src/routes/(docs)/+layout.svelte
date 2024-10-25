<script>
	import { color } from '$lib/colors/mixer.js';
	import Footer from '../footer.svelte';
	import Nav from '../nav.svelte';
</script>

<div class="bg-{$color}-100 min-h-screen">
	<div
		class="container mx-auto min-h-screen max-w-[1000px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16"
	>
		<Nav />
		<slot></slot>
	</div>
	<Footer />
</div>
