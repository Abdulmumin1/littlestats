<script>
	import { color } from '$lib/colors/mixer.js';
	import Footer from '../footer.svelte';
	import Nav from '../nav.svelte';
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { children } = $props();
</script>

<div class=" min-h-screen">
	<div class="pt-12">

		<Nav />
	</div>
	<div
		class="container  mx-auto min-h-screen max-w-[1000px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16"
	>
		<section class="font-inter">

			{@render children?.()}
		</section>
	</div>
	<Footer />
</div>
