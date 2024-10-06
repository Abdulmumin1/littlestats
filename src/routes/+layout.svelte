<script>
	import '../app.css';
	import { show_toast } from '$lib/toast.js';
	import Toast from '$lib/components/generals/toast.svelte';
	import { color } from '$lib/colors/mixer.js';
	import { onMount } from 'svelte';

	onMount(() => {
		const c = localStorage.getItem('little_stat_color');
		color.set(c ?? 'green');
	});
</script>

<div class="bg-{$color}-100 min-h-screen">
	<slot></slot>
</div>
{#if $show_toast}
	<Toast />
{/if}
