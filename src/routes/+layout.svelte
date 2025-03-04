<script>
	import '../app.css';
	import { show_toast } from '$lib/toast.js';
	import Toast from '$lib/components/generals/toast.svelte';
	import { color, colorList } from '$lib/colors/mixer.js';
	import { onMount } from 'svelte';
	import LoadProgress from '../lib/components/generals/loadProgress.svelte';
	import ColorVar from '../lib/colors/colorVar.svelte';
	
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { children } = $props();

	
	let usedColor = $derived(colorList?.[$color]);

	let loaded = $state(false);

	function removeBgClassesFromElement(element) {
		if (!element?.classList) return;
		[...element.classList].forEach((cls) => {
			if (cls.startsWith('bg-') || cls.startsWith('dark:bg-')) {
				element.classList.remove(cls);
			}
		});
	}
	onMount(() => {
		const c = localStorage.getItem('little_stat_color');
		color.set(c ?? 'purple');
		loaded = true;

		let htmlEl = document.querySelector('html');
		let bodyEl = document.querySelector('body');
		try {
			removeBgClassesFromElement(htmlEl);
			removeBgClassesFromElement(bodyEl);
			htmlEl.classList.add(`bg-${c}-50`, `dark:bg-stone-900`);
			bodyEl.classList.add(`bg-${c}-50`, `dark:bg-stone-900`);
		} catch (error) {}

		const unsubscribe = color.subscribe((da) => {
			try {
				removeBgClassesFromElement(htmlEl);
				removeBgClassesFromElement(bodyEl);
				htmlEl.classList.add(`bg-${da}-50`, `dark:bg-stone-900`);
				bodyEl.classList.add(`bg-${da}-50`, `dark:bg-stone-900`);
			} catch (error) {}
		});
		return () => {
			unsubscribe();
		};
	});
</script>

<svelte:head>
	<meta name="theme-color" content={usedColor.primary} />
</svelte:head>

<LoadProgress />
<ColorVar/>
{#if loaded}
	<div class="min-h-screen bg-stone-50 dark:bg-stone-900 prose-headings:font-inter">
		{@render children?.()}
	</div>
{/if}

{#if $show_toast}
	<Toast />
{/if}
