<script>
	import Seo from '$lib/components/generals/seo.svelte';
	import { dashboardStore } from '$lib/stores/dashboard.svelte.js';
	import Feedback from '$lib/components/pages/feedback.svelte';

	let { data } = $props();
	let siteId = $derived(data.siteId);
	let current_domain = $derived(data.site);
</script>

<svelte:head>
	<Seo title={`${current_domain?.name || 'Site'} - Feedback`} />
</svelte:head>

<Feedback {siteId} {current_domain} />
