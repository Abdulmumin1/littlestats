<script>
	import { onMount } from 'svelte';
	import InsideNav from '../../lib/components/generals/insideNav.svelte';
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { children } = $props();
</script>

<!-- <InsideNav /> -->
<div class="xl:mx-auto">
	{@render children?.()}
</div>
