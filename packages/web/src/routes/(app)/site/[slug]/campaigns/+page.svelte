<script>
	import Campaigns from '$lib/components/pages/campaigns.svelte';

	let { data } = $props();
	let siteId = $derived(data.siteId);
</script>

<Campaigns {siteId} />
