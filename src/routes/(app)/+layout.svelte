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

<InsideNav />
<div class="mx-auto max-w-7xl p-2">
	{@render children?.()}
</div>
