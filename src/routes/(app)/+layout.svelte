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
<div class="xl:mx-auto max-w-[90rem] p-2">
	{@render children?.()}
</div>
