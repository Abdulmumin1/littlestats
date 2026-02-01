<script>
	import { deserialize } from '$app/forms';
	import { derived } from 'svelte/store';
	import { defaultRange as globalRange, optis, datacache } from '$lib/globalstate.svelte.js';
	import { fetchUpdates } from '$lib/slug/liveFetch.js';
	import Traffic from '$lib/components/pages/traffic.svelte';
	import DemoLoadingState from '../analytics/graphStuff/demoLoadingState.svelte';

	
	let empty = {
		views: 0,
		bounce_rate: {
			bounceRate: '0.00',
			totalVisits: 0,
			bounceCount: 0
		},
		uniqueUserAgents: 0,
		averageVisitDuration: 0,
		sortedURls: [],
		sortedReferrers: [],
		sortedContries: [],
		sortedBrowsers: [],
		sortedOS: [],
		graph: {},
		visitorgraph: {},
		interval: '30',
		domain_id: ''
	};

	let { data } = $props();
	let sortInterval = $derived(globalRange.getSingle());

	let page_data = $state(empty);
	let lastEvent = $derived(data.records?.[data.records.length - 1]);

	$effect(() => {
		page_data = data.records;
		// console.log(data.records)
	});

	let fetchUpdatesInterval = null;
	async function fetchUpdateFunction() {
		if (!lastEvent?.timestamp) return;
		let updates = await fetchUpdates(data.domain_id, lastEvent.timestamp);

		if (updates.length) {
			page_data = [...page_data, ...updates];
			data.records = page_data;
			datacache.setCach(`traffic-${sortInterval}-${data.domain_id}`, page_data);
		}
	}

	async function fetchFromDefaultDates(date, isRange, start = null, end = null) {
		try {
			if (!isRange) {
				const form = new FormData();
				form.append('defaultRange', date);
				form.append('domain_id', data.domain_id);

				const response = await fetch('?/fetchTraffic', { method: 'POST', body: form });
				if (response.ok) {
					const result = deserialize(await response.text());
					if (result.data?.error) {
						page_data = empty;
						return;
					}
					page_data = result.data.records;
					data.records = page_data;
				}
			} else {
				const form = new FormData();
				form.append('start', new Date(start).toISOString());
				form.append('end', new Date(end).toISOString());
				form.append('domain_id', data.domain_id);

				const response = await fetch('?/fetchTrafficRange', { method: 'POST', body: form });
				if (response.ok) {
					const result = deserialize(await response.text());
					if (result.data?.error) {
						page_data = empty;
						return;
					}
					page_data = result.data.records;
				}
			}
		} catch (error) {
			// console.log(error);
			page_data = empty;
		} finally {
		}
	}

	let [selectedStartDate, selectedEndDate] = $derived(globalRange.getRange());
	let isCustom = $derived(globalRange.getCustom());
	let loading = $state(false);

	$effect(async () => {
		$inspect.trace();
		loading = true;
		await fetchFromDefaultDates(sortInterval, isCustom, selectedStartDate, selectedEndDate);
		loading = false;
		// await fetchSpikes();
	});
</script>

{#if loading}
	<DemoLoadingState />
{/if}

<Traffic {page_data} current_domain={'yaqeen.me'} domain_id={data.domain_id} />
