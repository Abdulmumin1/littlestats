<script>
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';

	let { 
		points = [],
		segments = [],
		colors = new Map(),
		chartType = 'bar',
		metric = 'conversions'
	} = $props();

	let canvas;
	let chart;

	function buildChartData() {
		const labels = points.map(p => {
			if (p.label) return p.label;
			const ts = String(p.timestamp || '').slice(0, 10);
			const d = new Date(ts);
			if (isNaN(d.getTime())) return ts;
			return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
		});

		const datasets = segments.map((seg) => {
			const style = colors.get(seg.key);
			const color = style?.fill || '#94a3b8';
			const data = points.map(p => Number(p.segments?.[seg.key] ?? 0));
			
			return {
				label: seg.key,
				data,
				backgroundColor: color,
				borderColor: color,
				borderWidth: chartType === 'line' ? 2 : 0,
				fill: chartType === 'line' ? 'origin' : undefined,
				tension: 0.3,
				pointRadius: chartType === 'line' ? 0.5 : 0,
				pointHoverRadius: chartType === 'line' ? 4 : 0,
			};
		});

		return { labels, datasets };
	}

	function createChart() {
		if (!canvas) return;
		if (chart) chart.destroy();

		const ctx = canvas.getContext('2d');
		const data = buildChartData();

		chart = new Chart(ctx, {
			type: chartType === 'line' ? 'line' : 'bar',
			data,
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: {
					mode: 'index',
					intersect: false,
				},
				scales: {
					x: {
						stacked: true,
						ticks: {
							display: true,
							autoSkip: true,
							maxRotation: 0,
							minRotation: 0,
							padding: 8,
							color: 'rgb(121, 113, 107)',
							font: { size: 10 }
						},
						grid: {
							display: false,
							color: 'rgb(121, 113, 107)'
						}
					},
					y: {
						stacked: true,
						beginAtZero: true,
						ticks: {
							padding: 8,
							color: 'rgb(121, 113, 107)',
							font: { size: 10 }
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
					},
					tooltip: {
						backgroundColor: 'rgb(121, 113, 107)',
						titleColor: '#fff',
						bodyColor: '#d6d3d1',
						borderColor: 'rgb(121, 113, 107)',
						borderWidth: 1,
						padding: 12,
						displayColors: true,
						callbacks: {
							title: (items) => items[0]?.label || '',
							label: (item) => ` ${item.dataset.label}: ${item.raw.toLocaleString()}`
						}
					}
				}
			}
		});
	}

	onMount(() => {
		createChart();
		return () => {
			if (chart) chart.destroy();
		};
	});

	$effect(() => {
		if (chart && points && segments && colors) {
			const data = buildChartData();
			chart.data = data;
			
			if ((chartType === 'line' && chart.config.type !== 'line') ||
			    (chartType === 'bar' && chart.config.type !== 'bar')) {
				createChart();
			} else {
				chart.update();
			}
		}
	});
</script>

<div class="w-full h-48">
	<canvas bind:this={canvas}></canvas>
</div>
