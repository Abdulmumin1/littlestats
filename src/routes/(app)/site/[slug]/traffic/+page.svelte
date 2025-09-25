<script>
	import { onMount } from 'svelte';
	import { color } from '$lib/colors/mixer.js';
	import { deserialize } from '$app/forms';
	import Seo from '$lib/components/generals/seo.svelte';
	import LoadingState from '$lib/components/analytics/graphStuff/loadingState.svelte';
	import { derived } from 'svelte/store';
	import { defaultRange as globalRange, optis, datacache } from '$lib/globalstate.svelte.js';
	import { fetchUpdates } from '$lib/slug/liveFetch.js';
	import { show_toast } from '$lib/toast.js';
	import Traffic from '../../../../../lib/components/pages/traffic.svelte';

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
			const tzOffset = -new Date().getTimezoneOffset() / 60;
			if (!isRange) {
				let cache = datacache.getCache(`traffic-${date}-${data.domain_id}`);
				if (cache) {
					page_data = cache;
					data.records = cache;
					return;
				}
				const form = new FormData();
				form.append('defaultRange', date);
				form.append('domain_id', data.domain_id);
				form.append('tzOffset', tzOffset);

				const response = await fetch('?/fetchDate', { method: 'POST', body: form });
				if (!response.ok) {
					show_toast.set({ message: 'Failed to fetch data', type: 'error' });
					page_data = empty;
					return;
				}
				const result = deserialize(await response.text());
				if (result.type === 'failure') {
					show_toast.set({
						message: result.data?.message || 'Failed to fetch data',
						type: 'error'
					});
					page_data = empty;
					return;
				}
				page_data = result.data.records;
				data.records = page_data;
				datacache.setCach(`traffic-${date}-${data.domain_id}`, result.data.records);
			} else {
				const form = new FormData();
				form.append('start', new Date(start).toISOString());
				form.append('end', new Date(end).toISOString());
				form.append('domain_id', data.domain_id);
				form.append('tzOffset', tzOffset);

				const response = await fetch('?/fetchRange', { method: 'POST', body: form });
				if (!response.ok) {
					show_toast.set({ message: 'Failed to fetch data', type: 'error' });
					page_data = empty;
					return;
				}
				const result = deserialize(await response.text());
				if (result.type === 'failure') {
					show_toast.set({
						message: result.data?.message || 'Failed to fetch data',
						type: 'error'
					});
					page_data = empty;
					return;
				}
				page_data = result.data.records;
			}
		} catch (error) {
			show_toast.set({ message: 'Network error', type: 'error' });
			page_data = empty;
		} finally {
		}
	}

	let [selectedStartDate, selectedEndDate] = $derived(globalRange.getRange());
	let isCustom = $derived(globalRange.getCustom());
	let loading = $state(false);
	$effect(async () => {
		loading = true;
		await fetchFromDefaultDates(sortInterval, isCustom, selectedStartDate, selectedEndDate);
		loading = false;
		// await fetchSpikes();
	});

	const domain_options = data.domains.map((e) => ({ value: e.id, label: e.name }));
	const current_domain = data.domains.find((e) => e.id === data.domain_id);
</script>

<svelte:head>
	<Seo title={`${current_domain.name} - littlestats`} />
</svelte:head>

{#if loading}
	<LoadingState />
{/if}

<Traffic {page_data} {current_domain} domain_id={data.domain_id} />
