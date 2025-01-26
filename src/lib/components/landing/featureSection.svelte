<script>
	import { color } from '$lib/colors/mixer.js';
	import {
		ArrowRight,
		LineChart,
		MousePointer2,
		Shield,
		Globe2,
		Workflow,
		Zap
	} from 'lucide-svelte';
	import { onMount } from 'svelte';

	const keyFeatures = [
		{
			title: 'Traffic Monitoring',
			description: 'Optimize performance with sweet traffic flow insights.',
			icon: LineChart
		},
		{
			title: 'Customizable Event Tracking',
			description: 'Monitor specific interactions tailored to your website needs.',
			icon: MousePointer2
		},
		{
			title: 'Privacy-Focused Analytics',
			description: 'Analyze without cookies or storing personal data, prioritizing user privacy.',
			icon: Shield
		},
		{
			title: 'Edge-Based First-Party Collection',
			description: "Gather data directly through your website's domain.",
			icon: Globe2
		},
		{
			title: 'Seamless Setup Process',
			description: 'Implement with minimal code. Compatible with all websites.',
			icon: Workflow
		},
		{
			title: 'Your site stays fast',
			description: 'Maintain website speed with our compact tracking script under 2kb.',
			icon: Zap
		}
	];
</script>

<div class="  bg-{$color}-100/50 dark:bg-{$color}-100">
	<div
		id="box"
		class="bg-{$color}-50 dark:bg-stone-900"
		style="--mask: radial-gradient(14.14px at 50% calc(100% - 20px),#000 99%,#0000 101%) calc(50% - 20px) 0/40px 100%,
radial-gradient(14.14px at 50% calc(100% + 10px),#0000 99%,#000 101%) 50% calc(100% - 10px)/40px 100% repeat-x;"
	></div>
	<div
		id="features"
		class="container px-4 z-50 mx-auto mt-12 max-w-[1000px] rounded-2xl p-4 py-12 dark:border-none border-{$color}-300"
	>
		<h3
			class="mb-3 flex items-center gap-1 px-2 text-xl font-bold bg-{$color}-600 w-fit rounded-full px-3 py-[.15rem] text-white"
		>
			<ArrowRight size={20} /> Features
		</h3>
		<div class="mt-8 grid grid-cols-1 gap-12 md:grid-cols-2">
			{#each keyFeatures as feature}
				<div class="rounded-xl">
					<div class="mb-2 flex items-center gap-2">
						<feature.icon size={24} class="text-{$color}-600" />
						<h4 class=" text-lg font-semibold">{feature.title}</h4>
					</div>
					<p class="text-{$color}-950">{feature.description}</p>
				</div>
			{/each}
		</div>
	</div>
</div>

<!-- <style> -->
<!-- </style> -->

<style>
	/* .skewed {
  position: absolute;
 right: 0;
  width: 100vw;
  height: 110%;
  z-index: 0;
  transform: skewY(2deg);
  transform-origin: top right;
} */
	#box {
		height: 40px;
		mask: var(--mask);
	}
</style>
