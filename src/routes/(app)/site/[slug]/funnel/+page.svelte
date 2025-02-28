<script>
	import { getContext, onMount, setContext } from 'svelte';
	import { color } from '$lib/colors/mixer.js';
	import { defaultRange as globalRange, optis, datacache } from '$lib/globalstate.svelte.js';
	import { deserialize } from '$app/forms';
	import Dropdown from '../../../../../lib/components/generals/dropdown.svelte';
	import LoadingState from '$lib/components/analytics/graphStuff/loadingState.svelte';
	import Funnels from '../../../../../lib/components/analytics/funnels.svelte';
	import FunEl from '../../../../../lib/components/analytics/funEl.svelte';
	import { writable } from 'svelte/store';
	import { executeInWorker } from '$lib/utils';
	import { generateRandomEvents } from '$lib/mockData.js';
	import { bucketEventsByName } from '$lib/funnels/helpers.js';
	import { calctypeoptions } from '$lib/funnels/helpers.js';

	let { data } = $props();

	let page_data = $state({});

	let sortInterval = $derived(globalRange.getSingle());
	
	
	let loading = $state();
	setContext(
		'funnelSteps',
		writable({
			name: 'Demo Funnel',
			type: 'session',
			steps: [
				
			]
		})
	);

	let funnelStepsContext = getContext('funnelSteps');

	let unique_urls = $state([]);
	let urls_page = $derived(
		unique_urls.map((e, index) => {
			return { id: index, name: e, value: e, color: getRandomColor(), type: 'url' };
		})
	);

	let unique_events = $state([]);
	let steps_events = $derived(
		unique_events.map((e, index) => {
			return { id: index, name: e, value: e, color: getRandomColor(), type: 'event' };
		})
	);
	let lastColor = null;

	function getRandomColor() {
		let hue;
		do {
			hue = Math.floor(Math.random() * 360);
		} while (hue === lastColor);

		lastColor = hue;
		return `hsl(${hue}, 90%, 40%)`; // Higher saturation & lower lightness for better contrast
	}

	let funnelCounts = $state({});

	$effect(() => {
		funnelCounts = Object.fromEntries($funnelStepsContext.steps.map((e) => [e.value, 0]));
	});

	let [selectedStartDate, selectedEndDate] = $derived(globalRange.getRange());
	let isCustom = $derived(globalRange.getCustom());

	let fsteps = $derived($funnelStepsContext);
	let funnelType = $derived($funnelStepsContext.type);
	const funnelSteps = $derived($funnelStepsContext.steps);


	async function fetchFromDefaultDates(date, isRange, start = null, end = null, type, funnel) {
		console.log('calling')
		try {
			if (!isRange) {
				// let cache = datacache.getCache(`traffic-${date}-${data.domain_id}`);
				// if (cache) {
				// 	page_data = cache;
				// 	data.records = cache;
				// 	return;
				// }
				const form = new FormData();
				form.append('funnel', JSON.stringify({type, funnel}));
				form.append('date', date);
				form.append('domain_id', data.domain_id);

				const response = await fetch('?/fetchData', { method: 'POST', body: form });
				if (response.ok) {
					const result = deserialize(await response.text());
					if (result.data?.error) {
						page_data = {};
						return;
					}
					page_data = result.data.funnelResult;
					funnelCounts = page_data;
					unique_urls = result.data.pages
					unique_events = result.data.events
					// datacache.setCach(`traffic-${date}-${data.domain_id}`, result.data.funnelResult);
				}
			} else {
				const form = new FormData();
				form.append('start', new Date(start).toISOString());
				form.append('end', new Date(end).toISOString());
				form.append('domain_id', data.domain_id);
				form.append('funnel', JSON.stringify({type, funnel}));
				
				const response = await fetch('?/fetchRange', { method: 'POST', body: form });
				if (response.ok) {
					const result = deserialize(await response.text());
					if (result.data?.error) {
						page_data = {};
						return;
					}
					page_data = result.data.funnelResult;
					funnelCounts = page_data;
					unique_urls = result.data.pages
					unique_events = result.data.events
				}
			}
		} catch (error) {
			console.log(error);
			page_data = {};
		} finally {
		}
	}


	// onMount(async () => {
	
	// 	let unsubscribe = funnelStepsContext.subscribe(async (_) => {
	// 		// console.log(_)
	// 		await fetchFromDefaultDates(sortInterval, isCustom, selectedStartDate. selectedEndDate);
	// 	});

	// 	return () => {
	// 		unsubscribe();
	// 	};
	// });

	
	$effect(async () => {
		$inspect.trace()
		loading = true;
		await fetchFromDefaultDates(sortInterval, isCustom, selectedStartDate, selectedEndDate,	funnelType, funnelSteps);
		loading = false;
	});


	const domain_options = data.domains.map((e) => ({ value: e.id, label: e.name }));
	const current_domain = data.domains.find((e) => e.id === data.domain_id);
</script>

<div>
	{#if loading}
		<LoadingState />
	{/if}
</div>

<section class="flex flex-col gap-3">
	
	<section class="flex flex-wrap items-center justify-between gap-3">
		<!-- {fsteps.name} -->
		<div class="flex items-center gap-3 px-4">
			<div class="flex">
				{#each fsteps.steps as step}
					<div class="-m-1 h-4 w-4 rounded-xl" style="background:{step.color};"></div>
				{/each}
			</div>
			{fsteps.name}
		</div>
		<div class="flex flex-wrap gap-2">
			<Dropdown
				on:change={(e) => {
					funnelStepsContext.update((cur) => {
						return { ...cur, type: e.detail.value };
					});
				}}
				title="Sorting Type"
				value={funnelType}
				options={calctypeoptions}
			></Dropdown>
			<FunEl uniquePages={urls_page} availableSteps={steps_events} />
		</div>
	</section>
</section>
{#key funnelCounts || funnelSteps}
	<Funnels {funnelCounts} {funnelStepsContext} />
{/key}
