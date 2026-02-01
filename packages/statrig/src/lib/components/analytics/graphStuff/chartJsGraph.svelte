<script>
	import { formatDate } from '$lib/utils.js';
	import { run } from 'svelte/legacy';

	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	// import { sortViews, transformViewDataForGraph } from './viewDataUtils.js';
	import { color, colorList } from '$lib/colors/mixer.js';
	import { ChevronDown, ChevronUp } from 'lucide-svelte';
	import { slide } from 'svelte/transition';

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

	function isToday(dateString) {
		if (!dateString) return false;
		const d = new Date(dateString);
		const today = new Date();
		return d.getDate() === today.getDate() &&
			d.getMonth() === today.getMonth() &&
			d.getFullYear() === today.getFullYear();
	}

	function sortViewsByHour(viewRecords) {
		const now = new Date();
		const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

		const intervals = [
			{ label: 'a while ago', min: 0, max: 1 },
			{ label: '1 - 4hr ago', min: 1, max: 4 },
			{ label: '4 - 8hr ago', min: 4, max: 8 },
			{ label: '8 - 12hr ago', min: 8, max: 12 },
			{ label: '12 - 16hr ago', min: 12, max: 16 },
			{ label: '16 - 20hr ago', min: 16, max: 20 },
			{ label: '20 - 24hr ago', min: 20, max: 24 }
		];

		const counts = {};
		intervals.forEach((interval) => {
			counts[interval.label] = 0;
		});

		viewRecords.forEach((record) => {
			const recordDate = new Date(record.timestamp);
			if (isNaN(recordDate.getTime())) {
				console.warn(`Invalid date encountered: ${record.timestamp}`);
				return;
			}
			if (recordDate < twentyFourHoursAgo) return;

			const hoursAgo = (now.getTime() - recordDate.getTime()) / (1000 * 60 * 60);
			const incrementBy = typeof record?.views === 'number' ? record.views : 1;

			for (const interval of intervals) {
				if (hoursAgo >= interval.min && hoursAgo < interval.max) {
					counts[interval.label] += incrementBy;
					break;
				}
			}
		});
		
		const reversedIntervals = [...intervals].reverse();
		const sortedCounts = {};
		reversedIntervals.forEach(interval => {
			sortedCounts[interval.label] = counts[interval.label];
		});

		return sortedCounts;
	}

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

	function sortViewsByHours(viewRecords, rangeStartDate, rangeEndDate) {
		const counts = new Map();
		for (const record of viewRecords) {
			const time = new Date(record.timestamp).getTime();
			if (isNaN(time)) continue;
			const d = new Date(time);
			d.setMinutes(0, 0, 0);
			const key = d.toISOString();
			const incrementBy = typeof record?.views === 'number' ? record.views : 1;
			counts.set(key, (counts.get(key) || 0) + incrementBy);
		}

		const start = rangeStartDate ? new Date(rangeStartDate) : null;
		const end = rangeEndDate ? new Date(rangeEndDate) : null;
		let startHour = start && !isNaN(start.getTime()) ? start : null;
		let endHour = end && !isNaN(end.getTime()) ? end : null;

		if (!startHour || !endHour) {
			const keys = Array.from(counts.keys()).sort();
			if (!keys.length) return {};
			startHour = new Date(keys[0]);
			endHour = new Date(keys[keys.length - 1]);
		}

		startHour.setMinutes(0, 0, 0);
		endHour.setMinutes(0, 0, 0);

		if (startHour.getTime() === endHour.getTime()) {
			endHour.setHours(endHour.getHours() + 23);
		}

		const results = {};
		const cur = new Date(startHour);
		while (cur <= endHour) {
			const key = cur.toISOString();
			results[key] = counts.get(key) || 0;
			cur.setHours(cur.getHours() + 1);
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
	let chartType = $state(bar ? 'bar' : line ? 'line' : 'line'); // NEW state for chart type

	// $: console.log(c);
	const MountChart = () => {
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
						pointRadius: 0.5, // Removes the circle markers
						pointHoverRadius: 2
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				layout: {
					padding: {
						bottom: 20,
						left: 10,
						right: 10
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
							padding: 10,
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

	let usedColor = $derived(colorList[$color] ?? greenColors);
	let viewRecords = $derived(chartD.data);
	let chartData = $derived(
		transformViewDataForGraph(
			sorted
				? viewRecords
				: sortInterval <= 1
					? (rangeEnd && isToday(rangeEnd) ? sortViewsByHour(viewRecords) : sortViewsByHours(viewRecords, rangeStart, rangeEnd))
					: sortViewsByDays(viewRecords, rangeStart, rangeEnd)
		)
	);
	let c = $derived(chartData.map((d) => d.myX));
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
		<div class="mt-2 h-75 w-full rounded-none border border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 p-4">
			<canvas bind:this={chartCanvas}></canvas>
		</div>
	{/if}
</div>
