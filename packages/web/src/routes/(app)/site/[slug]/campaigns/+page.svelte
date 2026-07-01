<script>
	import Campaigns from '$lib/components/pages/campaigns.svelte';
	import SitePageShell from '$lib/components/layout/site-page-shell.svelte';

	let { data } = $props();
	let siteId = $derived(data.siteId);
</script>


<SitePageShell>
	<Campaigns {siteId} />
</SitePageShell>
