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
	let { chartD = { data: [], label: 'Views' }, showChart = false, sortInterval = 1 } = $props();

	let chartCanvas = $state(null);
	let chart = $state(null);

	function sortViewsByHour(viewRecords) {
		const now = new Date();
		const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);
		const intervals = [24, 20, 16, 12, 8, 4, 1];
		const counts = new Map(intervals.map((hr) => [`${hr}hr ago`, 0]));
		let awhile = 0;

		viewRecords.forEach((record) => {
			const recordDate = new Date(record.timestamp);
			if (isNaN(recordDate.getTime())) {
				console.warn(`Invalid date encountered: ${record.timestamp}`);
				return; // Skip this record
			}

			// if (recordDate < twentyFourHoursAgo) {
			// 	return; // Skip records older than 24 hours
			// }

			const hoursAgo = (now - recordDate) / (60 * 60 * 1000);

			// Handle views less than an hour ago
			if (hoursAgo < 1) {
				awhile += 1;
				// counts.set('1hr ago', counts.get('1hr ago') + 1);
				return;
			}
			// console.log(intervals.length < 0);
			// Find the appropriate interval and increment its count
			for (let i = 0; i < intervals.length; i++) {
				let next = intervals[i + 1] ?? 0;
				if (hoursAgo >= next && hoursAgo <= intervals[i]) {
					// console.log(`Setting ${hoursAgo} to ${intervals[i]}hr ago basket`);
					counts.set(`${intervals[i]}hr ago`, counts.get(`${intervals[i]}hr ago`) + 1);
					break; // Stop after incrementing the count for the most appropriate interval
				}
				console.groupEnd();
			}
		});

		// Convert Map to Object and ensure all intervals are included
		const result = Object.fromEntries(
			intervals.map((hr) => [`${hr}hr ago`, counts.get(`${hr}hr ago`)])
		);

		result['a while ago'] = awhile;
		return result;
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
		const intervals = Array.from({ length: totalDays }, (_, i) => totalDays - i);
		const counts = new Map(intervals.map((day) => [`${day} days ago`, 0]));
		counts.set('Today', 0);

		viewRecords.forEach((record) => {
			// console.log(counts);
			const recordDate = new Date(record.timestamp);
			if (isNaN(recordDate.getTime())) {
				console.warn(`Invalid date encountered: ${record.timestamp}`);
				return; // Skip this record
			}

			if (recordDate < startDate) {
				return; // Skip records older than the specified number of days
			}

			const daysAgo = Math.floor((now - recordDate) / (24 * 60 * 60 * 1000));

			// console.log(daysAgo);
			// Handle views less than a day ago
			if (daysAgo < 1) {
				// console.log(daysAgo);

				if (counts.has('Today')) {
					counts.set('Today', counts.get('Today') + 1);
				} else {
					counts.set('Today', 0);
				}
				return;
			}

			// console.log(daysAgo);

			// Find the appropriate interval and increment its count
			for (let i = intervals.length; i > 0; i--) {
				// console.log(daysAgo, intervals[i], intervals[i + 1]);
				if (daysAgo <= intervals[i]) {
					// console.log(`Setting ${daysAgo} to ${intervals[i]} ago basket`);
					counts.set(`${intervals[i]} days ago`, counts.get(`${intervals[i]} days ago`) + 1);
					break; // Stop after incrementing the count for the most appropriate interval
				}
			}
		});

		// Convert Map to Object and ensure all intervals are included
		const days_ob = Object.fromEntries(
			intervals.map((day) => [`${day} days ago`, counts.get(`${day} days ago`)])
		);

		const result = { ...days_ob, Today: counts.get('Today') };
		// console.log(totalDays, intervals, result);
		return result;
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
	let chartType = $state('bar'); // NEW state for chart type

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
						tension: 0.3,
						fill: 'origin',
						borderWidth: 2,
						borderRadius: 5,
						spacing: 20,
						...(chartType == 'bar' ? { backgroundColor: usedColor.primary } : {})
					}
				]
			},
			options: {
				responsive: true,
				scales: {
					x: {
						ticks: {
							display: false
						}
					},
					y: {
						beginAtZero: true,
						ticks: {
							stepSize: 500
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
	<div class="flex items-center">
		<button class="flex items-center gap-1" onclick={toggleChart}
			>{#if showChart}
				<ChevronUp size={16} />
			{:else}
				<ChevronDown size={16} />
			{/if} Chart</button
		>
		<!-- Toggle between Line and Bar chart -->
		<div class="ml-2 flex">
			<button
				onclick={() => toggleChartType('line')}
				class="{chartType == 'line'
					? `bg-${$color}-600 dark:bg-${$color}-700 text-gray-100 `
					: `bg-${$color}-100 dark:bg-stone-600 dark:bg-stone-700/50 dark:text-gray-100`}  rounded rounded-l-full px-2"
				>Line</button
			>
			<button
				onclick={() => toggleChartType('bar')}
				class=" {chartType == 'bar'
					? `bg-${$color}-600 dark:bg-${$color}-700 text-gray-100 `
					: `bg-${$color}-100 dark:bg-stone-600 dark:bg-stone-700/50 dark:text-gray-100`}  rounded rounded-r-full px-2"
				>Bar</button
			>
		</div>
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
