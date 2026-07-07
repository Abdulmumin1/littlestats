<script>
	import { formatDate } from '$lib/utils.js';
	import { isDateKey } from '$lib/utils/dateRange.js';
	import { onMount, untrack } from 'svelte';
	import Chart from 'chart.js/auto';
	// import { sortViews, transformViewDataForGraph } from './viewDataUtils.js';
	import { color, colorList } from '$lib/colors/mixer.js';
	import { ChevronDown, ChevronUp } from 'lucide-svelte';

	/**
	 * @typedef {Object} Props
	 * @property {any} [chartD]
	 * @property {number} [sortInterval]
	 */

	/** @type {Props} */
	let {
		chartD = { data: [], label: 'Views' },
		bar = false,
		line = false,
		showChart = false,
		sortInterval = 1,
		sorted = false,
		rangeStart = undefined,
		rangeEnd = undefined
	} = $props();

	let chartCanvas = $state(null);
	let chart = $state(null);

	function formatHourLabel(dateString) {
		const d = new Date(dateString);
		if (isNaN(d.getTime())) return dateString;
		return d.toLocaleString('en-US', {
			month: 'short',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function parseHourBoundary(value, endOfDay = false) {
		if (!value) return null;
		if (isDateKey(value)) {
			return new Date(`${value}T${endOfDay ? '23:00:00.000Z' : '00:00:00.000Z'}`);
		}

		const date = new Date(value);
		return Number.isNaN(date.getTime()) ? null : date;
	}

	function sortViewsByHours(viewRecords, rangeStartDate, rangeEndDate) {
		const counts = new Map();
		for (const record of viewRecords) {
			const time = new Date(record.timestamp).getTime();
			if (isNaN(time)) continue;
			const d = new Date(time);
			d.setUTCMinutes(0, 0, 0);
			const key = d.toISOString();
			const incrementBy = typeof record?.views === 'number' ? record.views : 1;
			counts.set(key, (counts.get(key) || 0) + incrementBy);
		}

		let startHour = parseHourBoundary(rangeStartDate);
		let endHour = parseHourBoundary(rangeEndDate, true);

		if (!startHour || !endHour) {
			const keys = Array.from(counts.keys()).sort();
			if (!keys.length) return {};
			startHour = new Date(keys[0]);
			endHour = new Date(keys[keys.length - 1]);
		}

		startHour.setUTCMinutes(0, 0, 0);
		endHour.setUTCMinutes(0, 0, 0);

		const results = {};
		const cur = new Date(startHour);
		while (cur <= endHour) {
			const key = cur.toISOString();
			results[key] = counts.get(key) || 0;
			cur.setUTCHours(cur.getUTCHours() + 1);
		}
		return results;
	}
	export function sortViewsByDays(viewRecords, rangeStartDate, rangeEndDate) {
		const dateCounts = new Map();
		let minTime = Infinity;
		let maxTime = -Infinity;

		// 1. First pass: map existing records and find date range
		for (const record of viewRecords) {
			const time = new Date(record.timestamp).getTime();
			if (isNaN(time)) continue;
			
			// Use local date string to avoid timezone shifts
			const d = new Date(time);
			const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
			
			const incrementBy = typeof record?.views === 'number' ? record.views : 1;
			dateCounts.set(dateKey, (dateCounts.get(dateKey) || 0) + incrementBy);
			
			minTime = Math.min(minTime, time);
			maxTime = Math.max(maxTime, time);
		}

		// 2. Determine display boundaries
		const start = rangeStartDate ? new Date(rangeStartDate) : (minTime === Infinity ? new Date() : new Date(minTime));
		const end = rangeEndDate ? new Date(rangeEndDate) : (maxTime === -Infinity ? new Date() : new Date(maxTime));
		
		// Normalize to start of local day
		start.setHours(0, 0, 0, 0);
		end.setHours(0, 0, 0, 0);

		// 3. Fill in results including zeros for all days in range
		const results = {};
		let current = new Date(start);
		
		// Ensure we loop through the entire range including the end date
		while (current <= end) {
			const dateKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
			results[dateKey] = dateCounts.get(dateKey) || 0;
			current.setDate(current.getDate() + 1);
		}

		return results;
	}

	function transformViewDataForGraph(viewData) {
		return Object.entries(viewData).map(([key, value]) => ({
			myX: sortInterval <= 1 ? formatHourLabel(key) : formatDate(key, false),
			myY: value
		}));
	}

	let unsubscribeColor = color.subscribe((c) => {
		if (chart && chartData) {
			// console.log(c);
			try {
				chart.data.labels = chartData.map((d) => d.myX);
				chart.data.datasets[0].data = chartData.map((d) => d.myY);
				// chart.update();
				chart.data.datasets[0].borderColor = colorList[c].primary;
				if (chartType == 'bar') {
					chart.data.datasets[0].backgroundColor = colorList[c].primary;
				}
				chart.update();
			} catch {}
		}
	});
	let chartType = $state(untrack(() => (bar ? 'bar' : line ? 'line' : 'line')));

	// $: console.log(c);
	const MountChart = () => {
		if (!chartCanvas || chart) return;
		const compact = window.matchMedia('(max-width: 767px)').matches;
		const ctx = chartCanvas.getContext('2d');
		chart = new Chart(ctx, {
			type: chartType,
			data: {
				labels: chartData.map((d) => d.myX),
				datasets: [
					{
						label: chartD.label,
						data: chartData.map((d) => d.myY),
						borderColor: usedColor.primary,
						tension: 0.05,
						fill: 'origin',
						borderWidth: 2,
						borderRadius: 0,
						spacing: 20,
						...(chartType == 'bar' ? { backgroundColor: usedColor.primary } : {}),
						pointRadius: 0,
						pointHoverRadius: compact ? 3 : 4
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				animation: false,
				layout: {
					padding: {
						bottom: compact ? 4 : 20,
						left: compact ? 0 : 10,
						right: compact ? 0 : 10
					}
				},
				scales: {
					x: {
						ticks: {
							display: true,
							autoSkip: true,
							maxRotation: 0,
							minRotation: 0,
							padding: 10,
							maxTicksLimit: compact ? 4 : 8,
							color: 'rgb(121, 113, 107)',
							font: {
								size: 10
							}
						},
						grid: {
							display: false,
							color: 'rgb(121, 113, 107)'
						}
					},
					y: {
						beginAtZero: true,
							ticks: {
							padding: compact ? 6 : 10,
							precision: 0,
							maxTicksLimit: compact ? 4 : 6,
							color: 'rgb(121, 113, 107)',
							font: {
								size: 10
							}
						},
						grid: {
							display: false,
							color: 'rgb(121, 113, 107)'
						}
					}
				},
				plugins: {
					legend: {
						display: false
					}
				}
			}
		});
	};

	onMount(() => {
		if (showChart && chartCanvas) {
			MountChart();
		}
		function handleResize() {
			if (chart) {
				chart.resize();
			}
			// console.log('Window resized to: ' + window.innerWidth + ' x ' + window.innerHeight);
			// You can add more logic here, like adjusting layouts or resizing elements
		}

		// Add event listener for window resize
		window.addEventListener('resize', handleResize);

		return () => {
			unsubscribeColor();
			window.removeEventListener('resize', handleResize);
		};
	});

	function toggleChart() {
		showChart = !showChart;
		if (showChart) {
			MountChart();
		}
	}

	function toggleChartType(type) {
		if (!showChart) {
			showChart = true;
		}
		if (chartType == type) return;
		chartType = type; // chartType = chartType === 'line' ? 'bar' : 'line'; // Toggle between line and bar
		chart.destroy(); // Destroy current chart instance
		MountChart(); // Mount the new chart with updated type
	}

	let usedColor = $derived(colorList[$color] ?? colorList.green);
	let viewRecords = $derived(chartD.data);
	let chartData = $derived(
		transformViewDataForGraph(
			sorted
				? viewRecords
				: sortInterval <= 1
					? sortViewsByHours(viewRecords, rangeStart, rangeEnd)
					: sortViewsByDays(viewRecords, rangeStart, rangeEnd)
		)
	);
	let c = $derived(chartData.map((d) => d.myX));
	let hasChartActivity = $derived(chartData.some((d) => Number(d.myY) > 0));

	$effect(() => {
		if (showChart && hasChartActivity && chartCanvas && !chart) {
			MountChart();
		}
	});

	$effect(() => {
		if (chart && chartData) {
			chart.data.labels = chartData.map((d) => d.myX);
			chart.data.datasets[0].data = chartData.map((d) => d.myY);
			chart.data.datasets[0].label = chartD.label;
			chart.update();
		}
	});
</script>

<div class="w-full rounded-none p-2">
	<div class="flex items-center justify-between text-sm mb-4">
		<div class="flex items-center gap-2">
			<button class="flex items-center gap-1 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors" onclick={toggleChart}>
				{#if showChart}
					<ChevronUp size={16} />
				{:else}
					<ChevronDown size={16} />
				{/if}
			</button>
			<span class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Traffic Overview</span>
		</div>
		
		<!-- Standardized Toggle -->
		{#if !(bar || line)}
			<div class="flex bg-stone-100/50 dark:bg-stone-800/40 p-1 border border-stone-200 dark:border-stone-800">
				<button
					onclick={() => toggleChartType('line')}
					class="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all border border-transparent {chartType == 'line'
						? `bg-white/70 dark:bg-stone-900/60 text-stone-900 dark:text-white border-stone-200 dark:border-stone-700`
						: 'text-stone-500 hover:text-stone-900 dark:hover:text-white'}"
				>
					Line
				</button>
				<button
					onclick={() => toggleChartType('bar')}
					class="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all border border-transparent {chartType == 'bar'
						? `bg-white/70 dark:bg-stone-900/60 text-stone-900 dark:text-white border-stone-200 dark:border-stone-700`
						: 'text-stone-500 hover:text-stone-900 dark:hover:text-white'}"
				>
					Bar
				</button>
			</div>
		{/if}
	</div>

	{#if showChart}
		{#if hasChartActivity}
			<div class="mt-2 h-52 w-full rounded-none border border-stone-100 bg-stone-50/50 p-2 dark:border-stone-800 dark:bg-stone-900/50 md:h-75 md:p-4">
				<canvas bind:this={chartCanvas}></canvas>
			</div>
		{:else}
			<div class="mt-2 flex h-36 w-full items-center justify-center border border-stone-100 bg-stone-50/50 dark:border-stone-800 dark:bg-stone-900/50 md:h-56">
				<div class="text-center">
					<p class="text-sm font-serif italic text-stone-400">No traffic in this period</p>
					<p class="mt-1 text-[9px] font-black uppercase tracking-[0.18em] text-stone-300 dark:text-stone-600">The chart will appear when data arrives</p>
				</div>
			</div>
		{/if}
	{/if}
</div>
