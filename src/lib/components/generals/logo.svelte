<script>
	import { color, colorList } from '$lib/colors/mixer.js';
	import { MousePointerClick } from 'lucide-svelte';
	/**
	 * @typedef {Object} Props
	 * @property {number} [size]
	 */

	/** @type {Props} */
	let { size = 90 } = $props();
	const height = size / 2;
	const scaleFactor = size / 200;

	let usedColor = $derived(colorList?.[$color]);
</script>

<!-- <svg xmlns="http://www.w3.org/2000/svg" width={size} {height} viewBox="0 0 200 100">

	<path
		d="M20 80 Q50 20, 100 50 T180 30"
		class="stroke-black dark:stroke-white"
		strokeWidth={8 * scaleFactor}
		fill="none"
	/>

	<circle cx="20" cy="80" r={6 * scaleFactor} fill={usedColor.complement} />
	<circle cx="100" cy="50" r={6 * scaleFactor} fill={usedColor.secondary} />
	<circle cx="180" cy="30" r={6 * scaleFactor} fill={usedColor.primary} />

	<circle cx="40" cy="40" r={3 * scaleFactor} fill={usedColor.complement} opacity="0.7" />
	<circle cx="160" cy="70" r={3 * scaleFactor} fill={usedColor.primary} opacity="0.7" />
	<circle cx="70" cy="20" r={2 * scaleFactor} fill={usedColor.secondary} opacity="0.7" />
	<circle cx="130" cy="60" r={2 * scaleFactor} fill={usedColor.secondary} opacity="0.7" />
</svg> -->
<MousePointerClick class="text-stone-800 dark:text-stone-300" fill={usedColor.primary} {size} strokeWidth={.4}/>

<!-- <style>

</style> -->
