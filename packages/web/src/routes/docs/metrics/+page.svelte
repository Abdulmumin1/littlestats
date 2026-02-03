<script>
	import { color } from '$lib/colors/mixer.js';
	import { BarChart3 } from 'lucide-svelte';
	import Seo from '$lib/components/generals/seo.svelte';
</script>

<svelte:head>
	<Seo title="Metrics & Charts - Documentation - Littlestats" />
</svelte:head>

<h1 class="text-3xl font-extrabold mb-6 mt-0 flex items-center gap-3">
	<BarChart3 class="h-8 w-8 text-{$color}-500" />
	Metrics & Charts
</h1>

<p>
	Littlestats focuses on a small set of metrics that are easy to interpret. 
	Charts always reflect your selected date range and are designed to stay readable even when there are gaps in data.
</p>

<div class="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-8 mt-8 not-prose">
	<ul class="space-y-6 list-none pl-0">
		<li class="flex gap-4">
			<div class="mt-1.5 flex-shrink-0 h-2 w-2 rounded-full bg-{$color}-500"></div>
			<div>
				<h4 class="text-sm font-bold text-stone-900 dark:text-white m-0">Date range behavior</h4>
				<p class="text-stone-600 dark:text-stone-400 text-sm mt-1">
					When you change the date range selector, charts and tables refetch data for that window.
					Missing days/hours are filled with <code class="text-xs">0</code> so the x-axis stays continuous.
				</p>
			</div>
		</li>
		<li class="flex gap-4">
			<div class="mt-1.5 flex-shrink-0 h-2 w-2 rounded-full bg-{$color}-500"></div>
			<div>
				<h4 class="text-sm font-bold text-stone-900 dark:text-white m-0">Bar / Line toggle</h4>
				<p class="text-stone-600 dark:text-stone-400 text-sm mt-1">
					Some charts can be viewed as a stacked bar chart or a line chart.
					Use this to see either totals per day (bar) or trends over time (line).
				</p>
			</div>
		</li>
		<li class="flex gap-4">
			<div class="mt-1.5 flex-shrink-0 h-2 w-2 rounded-full bg-{$color}-500"></div>
			<div>
				<h4 class="text-sm font-bold text-stone-900 dark:text-white m-0">Segment colors</h4>
				<p class="text-stone-600 dark:text-stone-400 text-sm mt-1">
					Segmented charts use a high-contrast palette so you can clearly distinguish sources and groups.
				</p>
			</div>
		</li>
	</ul>
</div>
