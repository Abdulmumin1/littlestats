<script>
	import Seo from '$lib/components/generals/seo.svelte';
	import Traffic from '$lib/components/pages/traffic.svelte';

	let { data } = $props();
	let siteId = $derived(data.siteId);
	let current_domain = $derived(data.site);
</script>

<svelte:head>
	<Seo title={`${current_domain?.name || 'Site'} - Traffic Analytics`} />
</svelte:head>

<Traffic {current_domain} domain_id={siteId} />
