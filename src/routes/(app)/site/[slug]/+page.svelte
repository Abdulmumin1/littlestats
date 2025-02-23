<script>
	import { color } from '$lib/colors/mixer.js';
	import { formatNumber } from '$lib/slug/helpers.js';
	import { onMount } from 'svelte';
	import DashboardChart from '$lib/components/analytics/graphStuff/dashboardChart.svelte';
	import { Link, Activity, Clock, Eye, ArrowUpRight } from 'lucide-svelte';
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

	let { data = { records: [] } } = $props();

	let page_data = $state(data.records);
	let loading = $state(false);


	let sortInterval = $state(globalRange.getRange());

	$effect(() => {
		page_data = data.records;
	});

	async function handleDateChange(event) {
		const date = event.detail.value;
		await fetchFromDefaultDates(date);
		sortInterval = parseInt(date);
		globalRange.setRange(sortInterval);
		// if (filters.length > 0) applyFilter(filters);
		// await fetchSpikes(date);
	}

	async function fetchFromDefaultDates(date) {
		loading = true;
		let cache = datacache.getCache(`dashboard-${date}-${data.domain_id}`);
		if (cache) {
			page_data = cache;
			data.records = cache;
			loading = false
			return;
		}

		const form = new FormData();
		form.append('defaultRange', date);
		form.append('domain_id', data.domain_id);

		const response = await fetch('?/fetchDate', { method: 'POST', body: form });
		if (response.ok) {
			const result = deserialize(await response.text());
			page_data = result.data.records;
			data.records = page_data;
			datacache.setCach(`dashboard-${date}-${data.domain_id}`, result.data.records);
		}
		loading = false;
	}

	let dau = $derived(calculateDailyActiveUsers(page_data));
	let wau = $derived(calculateWeeklyActiveUsers(page_data));
	let retension = $derived(calculateRetension(page_data));

	const domain_options = data.domains.map((e) => ({ value: e.id, label: e.name }));
	const current_domain = data.domains.find((e) => e.id === data.domain_id);

	onMount(async () => {
		console.log(globalRange);
		let date = globalRange.getRange();
		await fetchFromDefaultDates(date);
		sortInterval = parseInt(date);
	});

	// $effect(() => {
	// 	console.log('Retension: ', retension);
	// });
</script>


<svelte:head>
	<Seo title={`${current_domain.name} - analytics dashboard`} />
</svelte:head>

<div class="min-h-screen p-2 text-black">
	{#if loading}
		<LoadingState />
	{/if}

	<div class="container mx-auto flex flex-col gap-4 dark:text-white">
		<nav class="flex flex-wrap justify-between gap-4 py-2">
			<div class="flex flex-wrap items-center gap-4 md:gap-5">
				<Dropdown
					on:change={(e) => (window.location.href = `/site/${e.detail.value}`)}
					title=""
					value={data.domain_id}
					options={domain_options}
				>
					<a href="/settings">+ add domain</a>
				</Dropdown>
			</div>
			<Dropdown on:change={handleDateChange} title="Filter" options={optis} value={sortInterval}>
				<button onclick={() => (isOpen = !isOpen)} class="flex items-center gap-1">
					<Calendar size={16} /> Custom Date
				</button>
			</Dropdown>
		</nav>

		<section class="flex min-h-[300px] w-full flex-col gap-4 md:flex-row">
			<section class=" flex flex-1 flex-col rounded-lg py-4">
				<DashboardChart
					chartD={{ data: dau, label: 'label' }}
					sorted={true}
					type={'line'}
					sortInterval={7}
				/>
				<p class="mt-2 flex justify-between rounded-xl bg-{$color}-200 bg-opacity-35 dark:bg-stone-800 px-4 py-2">
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

				<p class="mt-2 flex justify-between rounded-xl bg-{$color}-200 bg-opacity-35 dark:bg-stone-800 px-4 py-2">
					Weekly Active Visitors {sortInterval} days
					<span>
						Average
						<span class="font-bold text-{$color}-500">{calculateAverageValue(wau)}</span>
					</span>
				</p>
			</section>
		</section>

		{#key page_data}
			<Retension events={page_data} />
			<!-- <RetnsionOld events={page_data}/> -->
			{/key}
		</div>
		<!-- <Funnels data={page_data} {funnelSteps}/> -->
</div>
