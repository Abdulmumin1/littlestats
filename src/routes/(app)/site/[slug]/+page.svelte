<script>
	import { formatDate } from '$lib/utils.js';
	import { color } from '$lib/colors/mixer.js';
	import { formatNumber } from '$lib/slug/helpers.js';
	import { onMount } from 'svelte';
	import DashboardChart from '$lib/components/analytics/graphStuff/dashboardChart.svelte';
	import { Link, Activity, Clock, Eye, ArrowUpRight, Calendar } from 'lucide-svelte';
	import { deserialize } from '$app/forms';
	import { defaultRange as globalRange, optis, datacache } from '$lib/globalstate.svelte.js';
	import {
		calculateActiveUsersLastXDays,
		calculateDailyActiveUsers,
		calculateWeeklyActiveUsers,
		calculateAverageValue,
		calculateRetension
	} from '$lib/slug/activeUsersUtils.js';
	import LoadingState from '$lib/components/analytics/graphStuff/loadingState.svelte';
	import Dropdown from '$lib/components/generals/dropdown.svelte';
	import Retension from '$lib/components/analytics/retension.svelte';
	import RetnsionOld from '$lib/components/analytics/retnsionOld.svelte';
	import Seo from '../../../../lib/components/generals/seo.svelte';
	import Funnels from '../../../../lib/components/analytics/funnels.svelte';
	import PickDate from '../../../../lib/components/generals/pickDate.svelte';
	import { defaultRange } from '../../../../lib/globalstate.svelte';

	let { data = { records: [] } } = $props();

	let page_data = $state(data.records);
	let loading = $state(false);

	let sortInterval = $derived(globalRange.getSingle());

	$effect(() => {
		page_data = data.records;
	});

	async function fetchFromDefaultDates(date, isRange, start = null, end = null) {
	
		try {
			if (!isRange) {
				console.log('not -range fdlfds.')
				let cache = datacache.getCache(`dashboard-${date}-${data.domain_id}`);
				if (cache) {
					page_data = cache;
					data.records = cache;
					return;
				}
				const form = new FormData();
				form.append('defaultRange', date);
				form.append('domain_id', data.domain_id);

				const response = await fetch('?/fetchDate', { method: 'POST', body: form });
				if (response.ok) {
					const result = deserialize(await response.text());
					console.log(result.date);
					page_data = result.data.records;
					data.records = page_data;
					datacache.setCach(`dashboard-${date}-${data.domain_id}`, result.data.records);
				}
			} else {
				const form = new FormData();
				form.append('start', new Date(start).toISOString());
				form.append('end', new Date(end).toISOString());
				form.append('domain_id', data.domain_id);

				const response = await fetch('?/fetchRange', { method: 'POST', body: form });
				if (response.ok) {
					const result = deserialize(await response.text());
					console.log(result.data);
					page_data = result.data.records;
					
				}
			}
		} catch (error) {
			console.log(error)
		} finally {
		
		}
		
	}

	let dau = $derived(page_data?.dau ?? {});
	let wau = $derived(page_data?.wau ?? {});
	let retension = $derived(page_data?.retension ?? {});
	let [selectedStartDate, selectedEndDate] = $derived(globalRange.getRange());
	let isCustom = $derived(globalRange.getCustom());

	const current_domain = data.domains.find((e) => e.id === data.domain_id);

	// $effect(() => {
	// 	console.log('Retension: ', retension);
	// });

	$effect(async () => {
		// $inspect.trace();
		// console.log((sortInterval, isCustom, selectedStartDate, selectedEndDate))
		loading = true
		await fetchFromDefaultDates(sortInterval, isCustom, selectedStartDate, selectedEndDate);
		loading = false
	});
</script>

<svelte:head>
	<Seo title={`${current_domain.name} - analytics dashboard`} />
</svelte:head>

<div class="min-h-screen p-2 text-black">
	{#if loading}
		<LoadingState />
	{/if}

	<div class="container mx-auto flex flex-col gap-4 dark:text-white">
		<section class="flex min-h-[300px] w-full flex-col gap-4 md:flex-row">
			<section class=" flex flex-1 flex-col rounded-lg py-4">
				<DashboardChart
					chartD={{ data: dau, label: 'label' }}
					sorted={true}
					type={'line'}
					sortInterval={7}
				/>
				<p
					class="mt-2 flex justify-between rounded-xl bg-{$color}-200 bg-opacity-35 px-4 py-2 dark:bg-stone-800"
				>
					Daily Active Visitors {sortInterval} days
					<span>
						Average
						<span class="font-bold text-{$color}-500">{calculateAverageValue(dau)}</span>
					</span>
				</p>
			</section>
			<section class=" flex flex-1 flex-col rounded-lg py-4">
				<DashboardChart
					chartD={{ data: wau, label: 'label' }}
					sorted={true}
					type={'line'}
					sortInterval={30}
				/>

				<p
					class="mt-2 flex justify-between rounded-xl bg-{$color}-200 bg-opacity-35 px-4 py-2 dark:bg-stone-800"
				>
					Weekly Active Visitors {sortInterval} days
					<span>
						Average
						<span class="font-bold text-{$color}-500">{calculateAverageValue(wau)}</span>
					</span>
				</p>
			</section>
		</section>

		{#key page_data}
			<Retension events={retension} />
			<!-- <RetnsionOld events={page_data}/> -->
		{/key}
	</div>
	<!-- <Funnels data={page_data} {funnelSteps}/> -->
</div>
