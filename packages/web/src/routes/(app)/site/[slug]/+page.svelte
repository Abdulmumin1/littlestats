<script>
	import Traffic from '$lib/components/pages/traffic.svelte';
	import Seo from '$lib/components/generals/seo.svelte';
	import SitePageShell from '$lib/components/layout/site-page-shell.svelte';
	let { data } = $props();
</script>

<svelte:head>
	<Seo title={`${data.site?.name || 'Site'} - Analytics Dashboard`} />
</svelte:head>

<SitePageShell>
	<Traffic 
		page_data={null} 
		current_domain={data.site} 
		domain_id={data.siteId} 
	/>
</SitePageShell>
