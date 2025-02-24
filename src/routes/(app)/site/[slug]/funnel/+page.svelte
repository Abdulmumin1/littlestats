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
	import {executeInWorker} from '$lib/utils'
	import { generateRandomEvents } from '$lib/mockData.js';
	import { bucketEventsByName } from '$lib/funnels/helpers.js';
    import {calctypeoptions} from '$lib/funnels/helpers.js'

	let { data } = $props();
	// let data = {
	// 	records: [
	// 		// User 1: Perfect funnel completion (all steps in order)
	// 		{
	// 			user_id: 'user_1',
	// 			session_id: 'session_1',
	// 			timestamp: '2025-02-01 09:00:00',
	// 			url: '/contact',
	// 			event_name: null
	// 		},
	// 		{
	// 			user_id: 'user_1',
	// 			session_id: 'session_1',
	// 			timestamp: '2025-02-01 09:05:00',
	// 			url: '/dashboard',
	// 			event_name: 'Sign Up'
	// 		},
	// 		{
	// 			user_id: 'user_1',
	// 			session_id: 'session_2',
	// 			timestamp: '2025-02-02 10:00:00',
	// 			url: '/checkout',
	// 			event_name: 'Purchase'
	// 		},
	// 		{
	// 			user_id: 'user_1',
	// 			session_id: 'session_3',
	// 			timestamp: '2025-02-03 11:00:00',
	// 			url: '/product/123',
	// 			event_name: 'Review'
	// 		},

	// 		// User 2: Cross-session completion (sign up + purchase in different sessions)
	// 		{
	// 			user_id: 'user_2',
	// 			session_id: 'session_a',
	// 			timestamp: '2025-02-01 12:00:00',
	// 			url: '/contact',
	// 			event_name: null
	// 		},
	// 		{
	// 			user_id: 'user_2',
	// 			session_id: 'session_a',
	// 			timestamp: '2025-02-01 12:05:00',
	// 			url: '/signup',
	// 			event_name: 'Sign Up'
	// 		},
	// 		{
	// 			user_id: 'user_2',
	// 			session_id: 'session_b',
	// 			timestamp: '2025-02-05 14:00:00',
	// 			url: '/checkout',
	// 			event_name: 'Purchase'
	// 		},

	// 		// User 3: Skips sign up (should only count for first step)
	// 		{
	// 			user_id: 'user_3',
	// 			session_id: 'session_x',
	// 			timestamp: '2025-02-01 15:00:00',
	// 			url: '/contact',
	// 			event_name: null
	// 		},
	// 		{
	// 			user_id: 'user_3',
	// 			session_id: 'session_x',
	// 			timestamp: '2025-02-01 15:05:00',
	// 			url: '/checkout',
	// 			event_name: 'Purchase'
	// 		},

	// 		// User 4: Out-of-order completion (sign up → review → purchase → review)
	// 		{
	// 			user_id: 'user_4',
	// 			session_id: 'session_alpha',
	// 			timestamp: '2025-02-01 16:00:00',
	// 			url: '/contact',
	// 			event_name: null
	// 		},
	// 		{
	// 			user_id: 'user_4',
	// 			session_id: 'session_alpha',
	// 			timestamp: '2025-02-01 16:05:00',
	// 			url: '/profile',
	// 			event_name: 'Sign Up'
	// 		},
	// 		{
	// 			user_id: 'user_4',
	// 			session_id: 'session_beta',
	// 			timestamp: '2025-02-02 10:00:00',
	// 			url: '/product/456',
	// 			event_name: 'Review'
	// 		},
	// 		{
	// 			user_id: 'user_4',
	// 			session_id: 'session_gamma',
	// 			timestamp: '2025-02-03 11:00:00',
	// 			url: '/checkout',
	// 			event_name: 'Purchase'
	// 		},
	// 		{
	// 			user_id: 'user_4',
	// 			session_id: 'session_gamma',
	// 			timestamp: '2025-02-03 11:05:00',
	// 			url: '/product/456',
	// 			event_name: 'Review'
	// 		},

	// 		// User 5: Multiple sign ups (should only count once)
	// 		{
	// 			user_id: 'user_5',
	// 			session_id: 'session_foo',
	// 			timestamp: '2025-02-01 17:00:00',
	// 			url: '/contact',
	// 			event_name: null
	// 		},
	// 		{
	// 			user_id: 'user_5',
	// 			session_id: 'session_foo',
	// 			timestamp: '2025-02-01 17:05:00',
	// 			url: '/signup',
	// 			event_name: 'Sign Up'
	// 		},
	// 		{
	// 			user_id: 'user_5',
	// 			session_id: 'session_foo',
	// 			timestamp: '2025-02-01 17:10:00',
	// 			url: '/signup',
	// 			event_name: 'Sign Up' // Duplicate
	// 		},
	// 		{
	// 			user_id: 'user_5',
	// 			session_id: 'session_bar',
	// 			timestamp: '2025-02-02 12:00:00',
	// 			url: '/checkout',
	// 			event_name: 'Purchase'
	// 		},

	// 		// User 6: Only first step
	// 		{
	// 			user_id: 'user_6',
	// 			session_id: 'session_z',
	// 			timestamp: '2025-02-01 18:00:00',
	// 			url: '/contact',
	// 			event_name: null
	// 		}
	// 	]
	// };

	let page_data = $state(data.records);
	let lastEvent = $derived(data.records?.[data.records.length - 1]);
	let sortInterval = $state(globalRange.getRange());
	const funnelSteps = $state([
		'/sites',
		'/site/3v2khqo10tkiu9r',
		'/site/mwn1qyxs2n8ha58/events',
		'/settings/subscription'
	]);

	$effect(() => {
		page_data = data.records;
		// console.log(page_data)
	});

	
	let loading = $state();
	setContext(
		'funnelSteps',
		writable({
			name: 'Demo Funnel',
			type:'user',
			steps: [
				{ id: 4, name: 'Contact', value: '/contact', color: '#F472B6', type: 'url' },
				{ id: 1, name: 'Sign Up', value: 'Sign Up', color: '#60A5FA', type:'event' },
				{ id: 2, name: 'Purchase', value: 'Purchase', color: '#34D399', type:'event' },
				{ id: 3, name: 'Review', value: 'Review', color: '#FBBF24', type:'event' }
			]
		})
	);

	let funnelStepsContext = getContext('funnelSteps');
	// console.log(funnelStepsContext)
	function fetchPages(events) {
		let uniquePages = new Set();

		events.forEach((event) => {
			uniquePages.add(event.url)
		});

		return Array.from(uniquePages).sort((a, b) => b[1] - a[1]);
	}

	function add(a, b) { return a + b; }
	
	let urls_page = $state([])
	let steps_events = $state([])
	let lastColor = null;

function getRandomColor() {
	let hue;
	do {
		hue = Math.floor(Math.random() * 360);
	} while (hue === lastColor);

	lastColor = hue;
	return `hsl(${hue}, 90%, 40%)`; // Higher saturation & lower lightness for better contrast
}
	$effect(async ()=>{
		
		let xs = $state.snapshot(page_data)
		
		let urls = await executeInWorker(fetchPages, xs)
		let eventsteps = await executeInWorker(bucketEventsByName, xs)
		urls_page = urls.map((e, index)=>{
			return {id:index, name:e, value:e, color:getRandomColor(), type:'url'}
		})
		steps_events = eventsteps.map((e, index)=>{
			return {id:index, name:e, value:e, color:getRandomColor(), type:'event'}
		})
	})

	async function fetchFromDefaultDates(date) {
		loading = true;
		let cache = datacache.getCache(`funnel-${date}-${data.domain_id}`);
		if (cache?.length) {
			page_data = cache;
			data.records = cache;
			loading = false;
			return;
		}
		const form = new FormData();
		form.append('defaultRange', date);
		form.append('domain_id', data.domain_id);

		const response = await fetch('?/fetchData', { method: 'POST', body: form });
		if (response.ok) {
			const result = deserialize(await response.text());
			page_data = result.data.records;

			data.records = page_data;
			datacache.setCach(`funnel-${date}-${data.domain_id}`, result.data.records);
		}
		loading = false;
	}

	async function handleDateChange(event) {
		const date = event.detail.value;
		await fetchFromDefaultDates(date);
		sortInterval = parseInt(date);
		globalRange.setRange(sortInterval);
	}

	onMount(async () => {
		let date = globalRange.getRange();
		await fetchFromDefaultDates(date);
		sortInterval = parseInt(date);
		// await fetchSpikes(date);
	});

	let fsteps = $derived($funnelStepsContext);
	let funnelType = $derived($funnelStepsContext.type);
	const domain_options = data.domains.map((e) => ({ value: e.id, label: e.name }));
	const current_domain = data.domains.find((e) => e.id === data.domain_id);
</script>

<div>
	{#if loading}
		<LoadingState />
	{/if}
</div>

<section class='flex flex-col gap-3'>
	<nav class="flex flex-wrap justify-between gap-4 py-2">
		<div class="flex flex-wrap items-center gap-4 md:gap-5 ">
			<Dropdown
				on:change={(e) => (window.location.href = `/site/${e.detail.value}/funnel`)}
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
	<section class="flex items-center justify-between flex-wrap gap-3">
		<!-- {fsteps.name} -->
		<div class="flex items-center gap-3 px-4">
			<div class="flex">
				{#each fsteps.steps as step}
					<div class="-m-1 h-4 w-4 rounded-xl" style="background:{step.color};"></div>
				{/each}
			</div>
			{fsteps.name}
		</div>
		<div class="flex gap-2 flex-wrap">
			<Dropdown
			on:change={(e) => {
				funnelStepsContext.update((cur)=>{
					return {...cur, type:e.detail.value}
				})
			}}
			title="Sorting Type"
			value={funnelType}
			options={calctypeoptions}
		>
		</Dropdown>
			<FunEl uniquePages={urls_page} availableSteps={steps_events}/>
		</div>
	</section>
</section>
{#key page_data || funnelSteps}
	<Funnels data={page_data} {funnelStepsContext} />
{/key}
{JSON.stringify(page_data.length)}
