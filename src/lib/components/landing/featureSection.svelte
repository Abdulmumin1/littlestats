<script>
	import { color } from '$lib/colors/mixer.js';
	import {
		ArrowRight,
		LineChart,
		MousePointer2,
		Shield,
		Globe2,
		Workflow,
		Zap,
		Logs
	} from 'lucide-svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { spring } from 'svelte/motion';

	const keyFeatures = [
		{
			title: 'Traffic Monitoring',
			description:
				'Real-time traffic analysis with advanced pattern recognition and performance optimization insights.',
			icon: LineChart,
			chartColor: 'blue'
		},
		{
			title: 'Custom Event Tracking',
			description:
				'Seamlessly track user interactions with powerful customizable event parameters and triggers.',
			icon: MousePointer2,
			chartColor: 'green'
		},
		{
			title: 'Performance Analytics',
			description:
				'Privacy-first performance metrics with comprehensive analysis and actionable insights.',
			icon: Shield,
			chartColor: 'purple'
		},
		{
			title: 'Logs',
			description: 'Collect and track logs on your website with ease',
			icon: Logs,
			chartColor: 'orange'
		}
	];

	let hoveredIndex = -1;
</script>

<div class="relative bg-{$color}-600 overflow-hidden pb-36 pt-24">
	<div class="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Header Section -->
		<div class=" mx-auto mb-20 max-w-3xl text-center">
			<div
				class="border-w border-[13px] border-{$color}-700 mx-auto mb-5 flex h-12 max-w-64 items-center justify-center text-xl outline outline-[8px] outline-white bg-stone-800 rounded-full"
			>
				<!-- Core  -->
			</div>
		</div>

		<!-- Features Grid -->
		<div class="grid gap-8 md:grid-cols-2 lg:gap-12">
			{#each keyFeatures as feature, i}
				<div
					transition:fade={{ delay: i * 150 }}
					class=" border-w border-[8px] border-{$color}-700 group relative flex flex-col gap-6 rounded-3xl bg-white/95 p-8 backdrop-blur-sm transition-all duration-300 dark:bg-stone-800/95"
				>
					<!-- Hover Gradient -->
					<div
						class="absolute inset-0 bg-gradient-to-br from-{$color}-50/80 to-transparent dark:from-{$color}-900/20 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
					/>

					<!-- Feature Content -->
					<div class="z-10 flex items-start gap-5 flex-col md:flex-row">
						<div
							class="bg-gradient-to-br p-4 from-{$color}-500 to-{$color}-600 rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-110"
						>
							<feature.icon size={32} class="text-white" />
						</div>
						<div>
							<h3
								class="mb-3 text-2xl font-bold text-stone-900 dark:text-white group-hover:text-{$color}-600 dark:group-hover:text-{$color}-400 transition-colors"
							>
								{feature.title}
							</h3>
							<p class="text-lg leading-relaxed text-stone-600 dark:text-stone-300">
								{feature.description}
							</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	@keyframes bounce-x {
		0%,
		100% {
			transform: translateX(0);
		}
		50% {
			transform: translateX(4px);
		}
	}

	.animate-bounce-x {
		animation: bounce-x 1s infinite;
	}

	:global(.dark) .from-stone-700 {
		--tw-gradient-from: rgb(68, 64, 60);
	}
</style>
