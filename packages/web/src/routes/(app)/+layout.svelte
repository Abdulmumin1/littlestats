<script>
	import { onMount } from 'svelte';
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { children } = $props();
</script>

<div class="ls-shell min-h-screen dark:bg-stone-900 rounded-none">
	<div class="mx-auto max-w-[100rem] px-4 sm:px-6 lg:px-8 py-6 rounded-none">
		{@render children?.()}
	</div>
</div>
