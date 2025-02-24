<script>
	import { generateRandomEvents } from '$lib/mockData.js';
	import Funnels from './../analytics/funnels.svelte';
	import { color } from '$lib/colors/mixer.js';
	import {
		ArrowRight,
		LineChart,
		MousePointer2,
		Shield,
		Logs,
		Construction,
		RotateCcw,
		Filter
	} from 'lucide-svelte';
	import { fly, fade, slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import DemoComponent from './demoComponent.svelte';
	import PerfomanceDemo from './perfomanceDemo.svelte';
	import DemoLogComponent from './demoLogComponent.svelte';
	import Retension from '../analytics/retension.svelte';
	import Dropdown from '../generals/dropdown.svelte';
	import { defaultRange as globalRange, optis, datacache } from '$lib/globalstate.svelte.js';
	import { writable } from 'svelte/store';

	let funnelStepsContext = writable({
		name: 'Demo Funnel',
		type: 'user',
		steps: [
			{ id: 1, name: 'Visit Homepage', value: 'Page View', color: '#60A5FA', type: 'event' },
			{ id: 2, name: 'Sign Up', value: 'Sign Up', color: '#34D399', type: 'event' },
			{
				id: 3,
				name: 'Start Free Trial',
				value: 'Start Free Trial',
				color: '#FBBF24',
				type: 'event'
			},
			{ id: 4, name: 'Use Core Feature', value: 'Feature Used', color: '#A855F7', type: 'event' },
			{
				id: 5,
				name: 'Integrate Tool',
				value: 'Integration Connected',
				color: '#E879F9',
				type: 'event'
			},
			{
				id: 6,
				name: 'Upgrade to Paid Plan',
				value: 'Upgrade Plan',
				color: '#16A34A',
				type: 'event'
			},
			{
				id: 7,
				name: 'Complete Payment',
				value: 'Payment Completed',
				color: '#F472B6',
				type: 'event'
			},
			{ id: 8, name: 'Download Report', value: 'Download Report', color: '#6366F1', type: 'event' },
			{
				id: 9,
				name: 'Invite Team Members',
				value: 'Invite Team Member',
				color: '#D946EF',
				type: 'event'
			},
			{
				id: 10,
				name: 'Subscription Renewal',
				value: 'Subscription Renewal',
				color: '#FACC15',
				type: 'event'
			}
		]
	});

	let data = $state({ records: generateRandomEvents(2000)});

	const features = [
		{
			id: 'retension',
			title: 'Retension',
			description:
				'Real-time traffic analysis with advanced pattern recognition and performance optimization insights.',
			icon: RotateCcw
		},
		{
			id: 'funnels',
			title: 'Funnels',
			description:
				'Real-time traffic analysis with advanced pattern recognition and performance optimization insights.',
			icon: Filter
		},
		{
			id: 'traffic',
			title: 'Traffic',
			description:
				'Real-time traffic analysis with advanced pattern recognition and performance optimization insights.',
			icon: LineChart
		},
		{
			id: 'events',
			title: 'Custom Event Tracking',
			description:
				'Seamlessly track user interactions with powerful customizable event parameters and triggers.',
			icon: MousePointer2
		},
		{
			id: 'performance',
			title: 'Performance Analytics',
			description:
				'Privacy-first performance metrics with comprehensive analysis and actionable insights.',
			icon: Shield
		},
		{
			id: 'logs',
			title: 'Logs',
			description:
				'Collect and analyze your application logs with powerful filtering and search capabilities.',
			icon: Logs
		}
	];

	let activeTab = $state(features[0].id);
	let indicatorWidth = $state(null);
	let indicatorLeft = $state(null);
	let tabsContainer = $state(null);

	$effect(() => {
		if (tabsContainer) {
			const activeTabElement = tabsContainer.querySelector(`[data-tab="${activeTab}"]`);
			if (activeTabElement) {
				indicatorWidth = activeTabElement.offsetWidth;
				indicatorLeft = activeTabElement.offsetLeft;
			}
		}
	});

	let sortInterval = $state(globalRange.getRange());

	async function handleDateChange(event) {
		const date = event.detail.value;

		sortInterval = parseInt(date);
		globalRange.setRange(sortInterval);
	}
</script>

<div class="space-y-12 bg-{$color}-600 px-4 py-6 md:px-0 md:py-12">
	<h2
		class="mt-9 text-center text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl"
	>
		Handy Features for
		<span class="text-{$color}-300 italic">Modern Analytics</span>
	</h2>

	<!-- Tabs Navigation -->
	<div class="relative mx-auto max-w-4xl">
		<div class="relative flex flex-wrap justify-center gap-2 md:gap-4" bind:this={tabsContainer}>
			{#each features as feature}
				<button
					data-tab={feature.id}
					class="group relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 md:text-base
						{activeTab === feature.id
						? `bg-${$color}-100 text-${$color}-700 dark:bg-${$color}-900/30 dark:text-${$color}-300`
						: 'text-gray-100 hover:text-gray-200'}"
					on:click={() => (activeTab = feature.id)}
				>
					<svelte:component
						this={feature.icon}
						class="h-4 w-4 md:h-5 md:w-5"
						strokeWidth={activeTab === feature.id ? 2.5 : 2}
					/>
					{feature.title}
				</button>
			{/each}

			<!-- Animated Indicator
			<div
				class="absolute bottom-0 h-0.5 bg-{$color}-600 transition-all duration-300 ease-out"
				style="width: {indicatorWidth}px; left: {indicatorLeft}px;"
			/> -->
		</div>
	</div>

	<!-- Tab Content -->
	<div class="relative mx-auto max-w-7xl">
		{#each features as feature}
			<!-- {#if activeTab === feature.id} -->
				<div class:hidden={activeTab !== feature.id} class="relative" in:fly={{ y: 30, duration: 300 }}>
					<div class="space-y-8">
						<!-- Feature Description -->
						<div class="">
							<p class="text-lg text-gray-100">
								{feature.description}
							</p>
						</div>

						<!-- Demo Component -->
						<div
							class="relative rounded-xl border-2 border-{$color}-200 bg-stone-50 p-6 shadow-lg dark:border-{$color}-800 dark:bg-stone-900"
						>
							<p class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
								<ArrowRight class="h-4 w-4 text-{$color}-600" />
								Click any entity to filter
							</p>
							<div
								class=" mt-4
							"
							>
								{#if feature.id == 'traffic'}
									<DemoComponent {data} />
								{:else if feature.id == 'performance'}
									<PerfomanceDemo {data} />
								{:else if feature.id == 'retension'}
									<nav class="flex flex-wrap justify-between gap-4 py-2">
										<div class="flex flex-wrap items-center gap-4 md:gap-5">yaqeen.me</div>
										<Dropdown
											on:change={handleDateChange}
											title="Filter"
											options={optis}
											value={90}
										></Dropdown>
									</nav>
									<!-- {#key sortInterval} -->
									<Retension events={data.records} />
									<!-- {/key} -->
								{:else if feature.id == 'funnels'}
									<nav class="flex flex-wrap justify-between gap-4 py-2">
										<div class="flex flex-wrap items-center gap-4 md:gap-5">yaqeen.me</div>
										<Dropdown
											on:change={handleDateChange}
											title="Filter"
											options={optis}
											value={sortInterval}
										></Dropdown>
									</nav>
									<Funnels data={data?.records ?? []} {funnelStepsContext} />
								{:else}
									<div class="text- flex w-full flex-col items-center justify-center text-white">
										<Construction size={100} class="rotate-2" />
										Demo Incoming...
									</div>
									<!-- <DemoLogComponent data={[]}/> -->
								{/if}
							</div>
						</div>
					</div>
				</div>
			<!-- {/if} -->
		{/each}
	</div>
</div>

<style>
	button {
		-webkit-tap-highlight-color: transparent;
	}
</style>
