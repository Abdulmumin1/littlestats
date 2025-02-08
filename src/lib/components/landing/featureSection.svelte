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
			description: 'Real-time traffic analysis with advanced pattern recognition and performance optimization insights.',
			icon: LineChart,
			chartColor: 'blue'
		},
		{
			title: 'Custom Event Tracking',
			description: 'Seamlessly track user interactions with powerful customizable event parameters and triggers.',
			icon: MousePointer2,
			chartColor: 'green'
		},
		{
			title: 'Performance Analytics',
			description: 'Privacy-first performance metrics with comprehensive analysis and actionable insights.',
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

<div class="relative bg-{$color}-600 pt-24 pb-36 overflow-hidden">
	<!-- Background Pattern -->
	<!-- <div class="absolute inset-0 opacity-10">
		<div class="absolute inset-0" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 32px 32px;"></div>
	</div> -->
	
	<div class="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
		<!-- Header Section -->
		<div class=" max-w-3xl mx-auto text-center mb-20" in:fly={{ y: 50, duration: 500, delay: 200 }}>
			<div
		class="border-w border-[13px] border-{$color}-200  mx-auto mb-5 max-w-64 h-12 flex items-center justify-center text-xl    outline outline-[8px] outline-white bg-{$color}-700  rounded-full "
	>
<!-- Core  -->
</div>
			<!-- <h3 class="inline-flex items-center gap-2 bg-white/90 dark:bg-stone-800 text-{$color}-400 dark:text-{$color}-400 px-5 py-2 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm">
				<ArrowRight size={18} /> Core Features
			</h3> -->
			<!-- <h2 class="text-5xl font-bold text-white dark:text-white mb-6 tracking-tight">
				Powerful Analytics Suite
			</h2>
			<p class="text-xl text-white/90 dark:text-stone-300 leading-relaxed">
				Transform your data into actionable insights with our comprehensive monitoring platform
			</p> -->
		</div>

		<!-- Features Grid -->
		<div class="grid gap-8 md:grid-cols-2 lg:gap-12">
			{#each keyFeatures as feature, i}
				<div 
				
					transition:fade={{ delay: i * 150 }}
					class="group relative flex flex-col gap-6 p-8 bg-white/95 dark:bg-stone-800/95 rounded-3xl transition-all duration-300 backdrop-blur-sm"
				>
					<!-- Hover Gradient -->
					<div class="absolute inset-0 bg-gradient-to-br from-{$color}-50/80 to-transparent dark:from-{$color}-900/20 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500"/>
					
					<!-- Feature Content -->
					<div class="flex gap-5 items-start z-10">
						<div class="p-4 bg-gradient-to-br from-{$color}-500 to-{$color}-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
							<feature.icon size={32} class="text-white" />
						</div>
						<div>
							<h3 class="text-2xl font-bold text-stone-900 dark:text-white mb-3 group-hover:text-{$color}-600 dark:group-hover:text-{$color}-400 transition-colors">
								{feature.title}
							</h3>
							<p class="text-stone-600 dark:text-stone-300 leading-relaxed text-lg">
								{feature.description}
							</p>
						</div>
					</div>
					
					<!-- Chart/Visual Area -->
					<div 
						class="mt-6 h-56 bg-{$color}-300 rounded-2xl overflow-hidden p-4 transition-all duration-500 group-hover:transform group-hover:scale-[1.02]"
					>
						<div class="w-full h-full flex items-center justify-center relative">
							<feature.icon 
								size={64} 
								class="text-{$color}-500/30 transform transition-all duration-500 group-hover:scale-105 group-hover:rotate-45"
							/>
						</div>
					</div>

					<!-- Action Button
					<button class="mt-2 text-{$color}-600 dark:text-{$color}-400 font-medium flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
						Learn more <ArrowRight size={16} class="group-hover:translate-x-1 transition-transform" />
					</button> -->
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	@keyframes bounce-x {
		0%, 100% { transform: translateX(0); }
		50% { transform: translateX(4px); }
	}

	.animate-bounce-x {
		animation: bounce-x 1s infinite;
	}

	:global(.dark) .from-stone-700 {
		--tw-gradient-from: rgb(68, 64, 60);
	}
</style>