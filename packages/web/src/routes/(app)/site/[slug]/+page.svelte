<script>
	import Traffic from '$lib/components/pages/traffic.svelte';
	import Seo from '$lib/components/generals/seo.svelte';
	let { data } = $props();
</script>

<svelte:head>
	<Seo title={`${data.site?.name || 'Site'} - Analytics Dashboard`} />
</svelte:head>

<div class="min-h-screen p-6 text-stone-900 dark:text-stone-100 space-y-8 max-w-7xl mx-auto rounded-none">
	<Traffic 
		page_data={null} 
		current_domain={data.site} 
		domain_id={data.siteId} 
	/>
</div>
