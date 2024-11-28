<script>
	import { run } from 'svelte/legacy';

	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	// import { sortViews, transformViewDataForGraph } from './viewDataUtils.js';
	import { color } from '$lib/colors/mixer.js';
	import { ChevronDown, ChevronUp } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	const colorList = {
    stone: {
        primary: '#44403c',    // stone-700
        secondary: '#78716c',  // stone-500
        complement: '#e7e5e4'  // stone-200
    },
    red: {
        primary: '#b91c1c',    // red-700
        secondary: '#ef4444',  // red-500
        complement: '#fecaca'  // red-200
    },
    orange: {
        primary: '#c2410c',    // orange-700
        secondary: '#f97316',  // orange-500
        complement: '#fed7aa'  // orange-200
    },
    amber: {
        primary: '#b45309',    // amber-700
        secondary: '#f59e0b',  // amber-500
        complement: '#fde68a'  // amber-200
    },
    yellow: {
        primary: '#a16207',    // yellow-700
        secondary: '#eab308',  // yellow-500
        complement: '#fef08a'  // yellow-200
    },
    lime: {
        primary: '#4d7c0f',    // lime-700
        secondary: '#84cc16',  // lime-500
        complement: '#d9f99d'  // lime-200
    },
    green: {
        primary: '#15803d',    // green-700
        secondary: '#22c55e',  // green-500
        complement: '#bbf7d0'  // green-200
    },
    emerald: {
        primary: '#047857',    // emerald-700
        secondary: '#10b981',  // emerald-500
        complement: '#a7f3d0'  // emerald-200
    },
    teal: {
        primary: '#0f766e',    // teal-700
        secondary: '#14b8a6',  // teal-500
        complement: '#99f6e4'  // teal-200
    },
    cyan: {
        primary: '#0e7490',    // cyan-700
        secondary: '#06b6d4',  // cyan-500
        complement: '#a5f3fc'  // cyan-200
    },
    sky: {
        primary: '#0369a1',    // sky-700
        secondary: '#0ea5e9',  // sky-500
        complement: '#bae6fd'  // sky-200
    },
    blue: {
        primary: '#1d4ed8',    // blue-700
        secondary: '#3b82f6',  // blue-500
        complement: '#bfdbfe'  // blue-200
    },
    indigo: {
        primary: '#4338ca',    // indigo-700
        secondary: '#6366f1',  // indigo-500
        complement: '#c7d2fe'  // indigo-200
    },
    violet: {
        primary: '#6d28d9',    // violet-700
        secondary: '#8b5cf6',  // violet-500
        complement: '#ddd6fe'  // violet-200
    },
    purple: {
        primary: '#7e22ce',    // purple-700
        secondary: '#a855f7',  // purple-500
        complement: '#e9d5ff'  // purple-200
    },
    fuchsia: {
        primary: '#a21caf',    // fuchsia-700
        secondary: '#d946ef',  // fuchsia-500
        complement: '#f5d0fe'  // fuchsia-200
    },
    pink: {
        primary: '#be185d',    // pink-700
        secondary: '#ec4899',  // pink-500
        complement: '#fbcfe8'  // pink-200
    },
    rose: {
        primary: '#be123c',    // rose-700
        secondary: '#f43f5e',  // rose-500
        complement: '#fecdd3'  // rose-200
    }
};


	/**
	 * @typedef {Object} Props
	 * @property {any} [chartD]
	 * @property {number} [sortInterval]
	 */

	/** @type {Props} */
	let { chartD = { data: [], label: 'Views' }, sortInterval = 1 } = $props();

	let chartCanvas = $state();
	let chart = $state();

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
		counts.set('Today', 1);

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
					counts.set('Today', 1);
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
	let chartType = $state('line'); // NEW state for chart type

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
						borderColor:usedColor.primary,
						tension: 0.3,
						fill: 'origin',
						borderWidth: 2,
						borderRadius: 5,
						spacing: 20,
						...(chartType == 'bar' ? { backgroundColor:usedColor.primary } : {})
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
		if (showChart) {
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
			if (chart) {
				chart.destroy();
			}
		};
	});


	let showChart = $state(false);
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
	let chartData = $derived(transformViewDataForGraph(
		sortInterval <= 1 ? sortViewsByHour(viewRecords) : sortViewsByDays(viewRecords, sortInterval)
	));
	let c = $derived(chartData.map((d) => d.myX));
	run(() => {
		if (chart && chartData) {
			chart.data.labels = chartData.map((d) => d.myX);
			chart.data.datasets[0].data = chartData.map((d) => d.myY);
			chart.data.datasets[0].label = chartD.label;
			chart.update();
		}
	});
	run(() => {
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
					? `bg-${$color}-700 text-gray-100 `
					: `bg-${$color}-100 dark:bg-stone-600 dark:bg-stone-700/50 dark:text-gray-100`}  rounded rounded-l-full px-2 ">Line</button
			>
			<button
				onclick={() => toggleChartType('bar')}
				class=" {chartType == 'bar'
					? `bg-${$color}-700 text-gray-100 `
					: `bg-${$color}-100 dark:bg-stone-600 dark:bg-stone-700/50 dark:text-gray-100`}  rounded rounded-r-full px-2 ">Bar</button
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
