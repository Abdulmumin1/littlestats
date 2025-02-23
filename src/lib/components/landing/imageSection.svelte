<script>
	import { color } from '$lib/colors/mixer.js';
	import { ArrowRight, LineChart, MousePointer2, Shield, Logs, Construction } from 'lucide-svelte';
	import { fly, fade, slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import DemoComponent from './demoComponent.svelte';
	import PerfomanceDemo from './perfomanceDemo.svelte';
	import DemoLogComponent from './demoLogComponent.svelte';

	let { data = $bindable() } = $props();

	const features = [
		{
			id: 'traffic',
			title: 'Traffic Monitoring',
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
</script>

<div class="space-y-12 bg-{$color}-600 px-4 md:px-0 py-6 md:py-12">
	<h2
		class="mt-9 text-center text-3xl font-extrabold leading-tight  sm:text-4xl lg:text-5xl text-white"
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
			{#if activeTab === feature.id}
				<div class="relative" in:fly={{ y:30, duration: 300 }}>
					<div class="space-y-8">
						<!-- Feature Description -->
						<div class="">
							<p class="text-lg text-gray-100">
								{feature.description}
							</p>
						</div>

						<!-- Demo Component -->
						<div
							class="rounded-xl relative border-2 border-{$color}-200  bg-{$color}-500 p-6 shadow-lg dark:border-{$color}-800 dark:bg-stone-900"
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
								{:else}
								<div class="text- text-white w-full flex flex-col items-center justify-center"><Construction size={100} class="rotate-2"/>
								Demo Incoming...
								</div>
								<!-- <DemoLogComponent data={[]}/> -->
								{/if}
							</div>
						</div>
					</div>
				</div>
			{/if}
		{/each}
	</div>
</div>

<style>
	button {
		-webkit-tap-highlight-color: transparent;
	}
</style>
