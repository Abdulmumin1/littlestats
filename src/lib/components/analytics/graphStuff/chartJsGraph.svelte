<script>
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
		sortInterval = 1
	} = $props();

	let chartCanvas = $state(null);
	let chart = $state(null);

	function sortViewsByHour(viewRecords) {
		const now = new Date();
		const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

		// Define buckets for events within the last 24 hours.
		// Each bucket is defined as [min, max) except the last, which includes exactly 24 hours.
		const intervals = [
			{ label: 'a while ago', min: 0, max: 1 },
			{ label: '1 - 4hr ago', min: 1, max: 4 },
			{ label: '4 - 8hr ago', min: 4, max: 8 },
			{ label: '8 - 12hr ago', min: 8, max: 12 },
			{ label: '12 - 16hr ago', min: 12, max: 16 },
			{ label: '16 - 20hr ago', min: 16, max: 20 },
			{ label: '20 - 24hr ago', min: 20, max: 24 }
		];

		// Initialize counts for each interval.
		const counts = {};
		intervals.reverse().forEach((interval) => {
			counts[interval.label] = 0;
		});

		viewRecords.forEach((record) => {
			const recordDate = new Date(record.timestamp);
			if (isNaN(recordDate.getTime())) {
				console.warn(`Invalid date encountered: ${record.timestamp}`);
				return;
			}
			// Only process events from the last 24 hours.
			if (recordDate < twentyFourHoursAgo) return;

			const hoursAgo = (now - recordDate) / (60 * 60 * 1000);
			console.log(hoursAgo)

			// Find the matching interval.
			for (const interval of intervals) {
				// For all but the last bucket, use a half-open interval [min, max)
				// For the last bucket (max === 24), include events exactly 24 hours old.
				if (
					hoursAgo >= interval.min &&
					(hoursAgo < interval.max || (interval.max === 24 && hoursAgo <= 24))
				) {
					counts[interval.label]++;
					break;
				}
			}
		});

		return counts;
	}

	function sortViewsBy7Days(viewRecords) {
		return sortViewsByDays(viewRecords, 7);
	}

	function sortViewsBy14Days(viewRecords) {
		return sortViewsByDays(viewRecords, 14);
	}

	function sortViewsBy21Days(viewRecords) {
		return sortViewsByDays(viewRecords, 21);
	}

	function sortViewsBy30Days(viewRecords) {
		return sortViewsByDays(viewRecords, 30);
	}

	function sortViewsByDays(viewRecords, totalDays) {
		const now = new Date();
		const startDate = new Date(now - totalDays * 24 * 60 * 60 * 1000);
		const intervals = Array.from({ length: totalDays }, (_, i) => ({
			label: i === 0 ? 'Today' : `${i} days ago`,
			min: i,
			max: i + 1
		})).reverse(); // Reverse to check from oldest to newest

		const counts = new Map(intervals.map((i) => [i.label, 0]));

		viewRecords.forEach((record) => {
			const recordDate = new Date(record.timestamp);
			if (isNaN(recordDate.getTime())) {
				console.warn(`Invalid date encountered: ${record.timestamp}`);
				return;
			}

			if (recordDate < startDate) {
				return; // Skip records older than the start date
			}

			const daysAgo = Math.floor((now - recordDate) / (24 * 60 * 60 * 1000));

			for (const interval of intervals) {
				if (daysAgo >= interval.min && daysAgo < interval.max) {
					counts.set(interval.label, counts.get(interval.label) + 1);
					break;
				}
			}
		});

		return Object.fromEntries(intervals.map((i) => [i.label, counts.get(i.label)]));
	}

	function transformViewDataForGraph(viewData) {
		return Object.entries(viewData).map(([key, value]) => ({
			myX: key,
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
						borderRadius: 5,
						spacing: 20,
						...(chartType == 'bar' ? { backgroundColor: usedColor.primary } : {}),
						pointRadius: 1 // Removes the circle markers
					}
				]
			},
			options: {
				responsive: true,
				scales: {
					x: {
						ticks: {
							display: false,
							grid: {
								display: false
							}
						},
						grid: {
							display: false
						}
					},
					y: {
						beginAtZero: true,
						ticks: {
							stepSize: 1000,
							grid: {
								display: false
							}
						},
						grid: {
							display: false
						}
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
			sortInterval <= 1 ? sortViewsByHour(viewRecords) : sortViewsByDays(viewRecords, sortInterval)
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
	$effect(() => {
		if (chartCanvas) {
			try {
				MountChart();
			} catch {}
		}
	});
</script>

<div class=" w-full rounded-3xl p-2">
	<div class="flex items-center text-sm">
		<button class="flex items-center gap-1" onclick={toggleChart}
			>{#if showChart}
				<ChevronUp size={16} />
			{:else}
				<ChevronDown size={16} />
			{/if} Chart</button
		>
		<!-- Toggle between Line and Bar chart -->
		{#if !(bar || line)}
			<div class="ml-2 flex">
				<button
					onclick={() => toggleChartType('line')}
					class="{chartType == 'line'
						? `bg-${$color}-600 dark:bg-${$color}-700 text-gray-100 `
						: `bg-${$color}-100/50 dark:bg-stone-600 dark:bg-stone-700/50 dark:text-gray-100`}  rounded rounded-l-full px-2"
					>Line</button
				>
				<button
					onclick={() => toggleChartType('bar')}
					class=" {chartType == 'bar'
						? `bg-${$color}-600 dark:bg-${$color}-700 text-gray-100 `
						: `bg-${$color}-100/50 dark:bg-stone-600 dark:bg-stone-700/50 dark:text-gray-100`}  rounded rounded-r-full px-2"
					>Bar</button
				>
			</div>
		{/if}
	</div>

	{#if showChart}
		<div class="mt-6 flex flex-col items-center justify-center rounded-xl">
			<canvas bind:this={chartCanvas} class="max-h-[300px]"></canvas>
			<div class="flex w-full justify-between text-xs">
				<span>
					{c[0]}
				</span>
				<span>
					{c[c.length - 1]}
				</span>
			</div>
		</div>
	{/if}
</div>
