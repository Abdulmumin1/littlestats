<!-- src/lib/EventsOverTime.svelte -->
<script>
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';

	let { hourlyCounts } = $props();

	let chartCanvas = $state();
	let chart = $state();

	onMount(() => {
		chart = new Chart(chartCanvas, {
			type: 'line',
			data: {
				labels: Array.from({ length: 24 }, (_, i) => i),
				datasets: [
					{
						label: 'Events',
						data: hourlyCounts,
						borderColor: '#36A2EB',
						fill: false
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				scales: {
					x: { title: { display: true, text: 'Hour of Day' } },
					y: { title: { display: true, text: 'Event Count' } }
				}
			}
		});
	});

	$effect(() => {
		if (chart) {
			chart.data.datasets[0].data = hourlyCounts;
			chart.update();
		}
	});
</script>

<div class="h-64">
	<canvas bind:this={chartCanvas}></canvas>
</div>
