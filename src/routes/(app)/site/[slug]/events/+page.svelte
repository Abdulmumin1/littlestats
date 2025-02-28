<script>
	import { onMount } from 'svelte';
	import ViewCard from '$lib/components/analytics/viewCard.svelte';
	import { color } from '$lib/colors/mixer.js';
	import ReferrerSection from '$lib/components/analytics/referrerSection.svelte';
	import TinyChat from '../../../../../lib/components/analytics/graphStuff/tinyChat.svelte';
	import { flip } from 'svelte/animate';
	import { getCountry } from '$lib/slug/helpers.js';
	import EmptyValues from '../../../../../lib/components/analytics/emptyValues.svelte';
	import Dropdown from '../../../../../lib/components/generals/dropdown.svelte';
	import LoadingState from '$lib/components/analytics/graphStuff/loadingState.svelte';
	import { deserialize } from '$app/forms';
	import ChartJsGraph from '$lib/components/analytics/graphStuff/chartJsGraph.svelte';
	import { defaultRange as globalRange, optis, datacache } from '$lib/globalstate.svelte.js';
	import Drawer from '../../../../../lib/components/generals/drawer.svelte';
	import BottomDrawer from '../../../../../lib/components/generals/bottomDrawer.svelte';
	import { MoreVertical } from 'lucide-svelte';
	import PageItem from '../../../../../lib/components/analytics/pageItem.svelte';
	import {
		bucketEventsByName,
		mergeEventData,
		sortReferals,
		sortCountryData,
		sumData
	} from '$lib/events/helpers.js';
	import { generateRandomEvents } from '$lib/mockData.js';
	import { executeInWorker } from '$lib/utils';
	import Events from '../../../../../lib/components/analytics/events.svelte';

	let { data } = $props();
	let page_data = $state([]);
	let sortInterval = $derived(globalRange.getSingle());

	// Use the provided records

	
	let loading = $state(false);
	

	async function fetchFromDefaultDates(date, isCustom, selectedStartDate, selectedEndDate) {
		try {
			if (!isCustom) {
				let cache = datacache.getCache(`events-${date}-${data.domain_id}`);
				if (cache?.length) {
					page_data = cache;
					return;
				}
				const form = new FormData();
				form.append('defaultRange', date);
				form.append('domain_id', data.domain_id);

				const response = await fetch('?/fetchCustomEvents', { method: 'POST', body: form });
				if (response.ok) {
					const result = deserialize(await response.text());
					page_data = result.data.records;

					// data.records = page_data;
					// datacache.setCach(`events-${date}-${data.domain_id}`, result.data.records);
				}
			} else {
				const form = new FormData();
				form.append('start', new Date(selectedStartDate).toISOString());
				form.append('end', new Date(selectedEndDate).toISOString());
				form.append('domain_id', data.domain_id);

				const response = await fetch('?/fetchRange', { method: 'POST', body: form });
				if (response.ok) {
					const result = deserialize(await response.text());
					page_data = result.data.records;

					// data.records = page_data;
				}
			}
		} catch (error) {
			page_data = []
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

	// onMount(async () => {
	// 	let date = globalRange.getRange();
	// 	await fetchFromDefaultDates(date);
	// 	sortInterval = parseInt(date);
	// 	// await fetchSpikes(date);
	// });

	const domain_options = data.domains.map((e) => ({ value: e.id, label: e.name }));
	const current_domain = data.domains.find((e) => e.id === data.domain_id);
	
</script>

<svelte:head>
	<title>{current_domain.name} - Event Analytics</title>
</svelte:head>

{#if loading}
	<LoadingState />
{/if}

<Events {page_data}/>