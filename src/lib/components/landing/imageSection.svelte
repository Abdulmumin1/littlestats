<script>
	import { mockDataFunnel, mockDataFunnelSteps } from './../../mockData.js';
	import { calculateFunnel } from '$lib/funnels/helpers.js';
	import { generateRandomEvents } from '$lib/mockData.js';
	import Funnels from '../pages/funnels.svelte';
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
	import Events from '../pages/events.svelte';

	let funnelStepsContext = writable({
		name: 'Demo Funnel',
		type: 'session',
		steps: mockDataFunnelSteps
	});

	let { data = $bindable() } = $props();
	let dummyies = generateRandomEvents();
	let events_dummies = generateRandomEvents(1000);

	const features = [
		{
			id: 'retension',
			title: 'Retention Insights',
			description:
				'Boost user loyalty with actionable insights into retention trends and behavior patterns.',
			icon: RotateCcw
		},
		{
			id: 'funnels',
			title: 'Conversion Funnels',
			description:
				'Visualize and optimize your user journey to maximize conversions at every step.',
			icon: Filter
		},
		{
			id: 'traffic',
			title: 'Traffic Analytics',
			description: 'Understand your audience with real-time traffic data and actionable insights.',
			icon: LineChart
		},
		{
			id: 'events',
			title: 'Custom Event Tracking',
			description: 'Track and measure key user actions with fully customizable event parameters.',
			icon: MousePointer2
		},
		{
			id: 'performance',
			title: 'Performance Metrics',
			description: 'Monitor and improve your app’s performance with privacy-focused analytics.',
			icon: Shield
		},
		{
			id: 'logs',
			title: 'Log Management',
			description:
				'Easily collect, search, and analyze logs to troubleshoot and optimize your app.',
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

	let sortInterval = $derived(globalRange.getSingle());

	async function handleDateChange(event) {
		globalRange.setCustom(false);
		const date = event.detail.value;
		globalRange.setSingle(date);
	}
	function getISOWeekNumber(date) {
		const target = new Date(date.valueOf());
		const dayNr = (date.getDay() + 6) % 7;
		target.setDate(target.getDate() - dayNr + 3);
		const firstThursday = target.valueOf();
		target.setMonth(0, 1);
		if (target.getDay() !== 4) {
			target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
		}
		return 1 + Math.ceil((firstThursday - target) / 604800000);
	}

	export function calculateWeeklyUsersRaw(events) {
		const weeklyUsers = {};
		events.forEach((event) => {
			if (!event.timestamp || !event.user_id) return;
			const date = new Date(event.timestamp);
			const weekKey = `${date.getFullYear()}-W${getISOWeekNumber(date)}`;
			(weeklyUsers[weekKey] ||= new Set()).add(event.user_id);
		});
		return weeklyUsers;
	}

	export function calculateRetention(raw) {
		const keys = Object.keys(raw).sort();
		const weeklyCounts = {};

		keys.forEach((baseKey, i) => {
			weeklyCounts[baseKey] = {};
			keys.slice(i).forEach((otherKey) => {
				weeklyCounts[baseKey][otherKey] = raw[baseKey].intersection(raw[otherKey]).size;
			});
		});
		return weeklyCounts;
	}

	let retension = $derived(calculateRetention(calculateWeeklyUsersRaw(dummyies)));
	let funnelData = $derived(calculateFunnel(mockDataFunnel, mockDataFunnelSteps, 'user'));
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
					on:click={() => {
						activeTab = feature.id;
						window.trackEvent(`${feature.id} feature viewed`);
					}}
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
			<div
				class:hidden={activeTab !== feature.id}
				class="relative"
				in:fly={{ y: 30, duration: 300 }}
			>
				<div class="space-y-8">
					<!-- Feature Description -->
					<div class="">
						<p class="text-lg text-gray-100">
							{feature.description}
						</p>
					</div>

					<!-- Demo Component -->
					<div
						class="relative rounded-xl border-2 border-{$color}-200 bg-stone-50 p-6 shadow-lg dark:border-{$color}-800 dark:bg-stone-900 dark:text-white"
					>
						<p class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
							<ArrowRight class="h-4 w-4 text-{$color}-600" />
							Click any entity to filter
						</p>
						<div
							class=" mt-4
							"
						>
							<nav class="flex flex-wrap justify-between gap-4 py-2 dark:text-white">
								<div class="flex flex-wrap items-center gap-4 md:gap-5">yaqeen.me</div>
								<Dropdown
									on:change={handleDateChange}
									title="Filter"
									options={optis}
									value={sortInterval}
								></Dropdown>
							</nav>
							{#if feature.id == 'traffic'}
								<DemoComponent {data} />
								<!-- <PerfomanceDemo {data} /> -->
							{:else if feature.id == 'events'}
								<Events page_data={events_dummies} />
							{:else if feature.id == 'retension'}
								<!-- {#key sortInterval} -->
								<div class="dark:text-white">
									<Retension events={retension} />
								</div>
								<!-- {/key} -->
								<!-- <DemoLogComponent data={[]}/> -->
							{:else if feature.id == 'funnels'}
								<div class="dark:text-white">
									<Funnels funnelCounts={funnelData} {funnelStepsContext} />
								</div>
							{:else}
								<div class="text- flex w-full flex-col items-center justify-center dark:text-white">
									<Construction size={100} class="rotate-2" />
									Demo Incoming...
								</div>
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
