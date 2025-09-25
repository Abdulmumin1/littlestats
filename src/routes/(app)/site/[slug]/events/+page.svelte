<script>
	import { onMount } from 'svelte';
	import { color } from '$lib/colors/mixer.js';
	import LoadingState from '$lib/components/analytics/graphStuff/loadingState.svelte';
	import { deserialize } from '$app/forms';
	import { defaultRange as globalRange, optis, datacache } from '$lib/globalstate.svelte.js';
	import { show_toast } from '$lib/toast.js';
	import Events from '../../../../../lib/components/pages/events.svelte';

	let { data } = $props();
	let page_data = $state([]);
	let sortInterval = $derived(globalRange.getSingle());

	let loading = $state(false);

	async function fetchFromDefaultDates(date, isCustom, selectedStartDate, selectedEndDate) {
		try {
			const tzOffset = -new Date().getTimezoneOffset() / 60;
			if (!isCustom) {
				let cache = datacache.getCache(`events-${date}-${data.domain_id}`);
				if (cache?.length) {
					page_data = cache;
					return;
				}
				const form = new FormData();
				form.append('defaultRange', date);
				form.append('domain_id', data.domain_id);
				form.append('tzOffset', tzOffset);

				const response = await fetch('?/fetchCustomEvents', { method: 'POST', body: form });
				if (!response.ok) {
					show_toast.set({ message: 'Failed to fetch data', type: 'error' });
					page_data = [];
					return;
				}
				const result = deserialize(await response.text());
				if (result.type === 'failure') {
					show_toast.set({
						message: result.data?.message || 'Failed to fetch data',
						type: 'error'
					});
					page_data = [];
					return;
				}
				page_data = result.data.records;

				// data.records = page_data;
				// datacache.setCach(`events-${date}-${data.domain_id}`, result.data.records);
			} else {
				const form = new FormData();
				form.append('start', new Date(selectedStartDate).toISOString());
				form.append('end', new Date(selectedEndDate).toISOString());
				form.append('domain_id', data.domain_id);
				form.append('tzOffset', tzOffset);

				const response = await fetch('?/fetchRange', { method: 'POST', body: form });
				if (!response.ok) {
					show_toast.set({ message: 'Failed to fetch data', type: 'error' });
					page_data = [];
					return;
				}
				const result = deserialize(await response.text());
				if (result.type === 'failure') {
					show_toast.set({
						message: result.data?.message || 'Failed to fetch data',
						type: 'error'
					});
					page_data = [];
					return;
				}
				page_data = result.data.records;

				// data.records = page_data;
			}
		} catch (error) {
			show_toast.set({ message: 'Network error', type: 'error' });
			page_data = [];
		}
	}

	let [selectedStartDate, selectedEndDate] = $derived(globalRange.getRange());
	let isCustom = $derived(globalRange.getCustom());

	$effect(async () => {
		$inspect.trace();
		loading = true;
		await fetchFromDefaultDates(sortInterval, isCustom, selectedStartDate, selectedEndDate);
		loading = false;
	});

	const current_domain = data.domains.find((e) => e.id === data.domain_id);
</script>

<svelte:head>
	<title>{current_domain.name} - Event Analytics</title>
</svelte:head>

{#if loading}
	<LoadingState />
{/if}

<Events {page_data} />
