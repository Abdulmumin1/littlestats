<!-- src/lib/DeviceUsage.svelte -->
<script>
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';

	let { deviceTypes, browsers } = $props();

	let deviceCanvas = $state();
	let browserCanvas = $state();
	let deviceChart = $state();
	let browserChart = $state();

	onMount(() => {
		deviceChart = new Chart(deviceCanvas, {
			type: 'pie',
			data: {
				labels: Object.keys(deviceTypes),
				datasets: [{ data: Object.values(deviceTypes), backgroundColor: ['#FF6384', '#36A2EB'] }]
			},
			options: { responsive: true, maintainAspectRatio: false }
		});
		browserChart = new Chart(browserCanvas, {
			type: 'pie',
			data: {
				labels: Object.keys(browsers),
				datasets: [
					{ data: Object.values(browsers), backgroundColor: ['#FFCE56', '#4BC0C0', '#9966FF'] }
				]
			},
			options: { responsive: true, maintainAspectRatio: false }
		});
	});

	$effect(() => {
		if (deviceChart) {
			deviceChart.data.labels = Object.keys(deviceTypes);
			deviceChart.data.datasets[0].data = Object.values(deviceTypes);
			deviceChart.update();
		}
		if (browserChart) {
			browserChart.data.labels = Object.keys(browsers);
			browserChart.data.datasets[0].data = Object.values(browsers);
			browserChart.update();
		}
	});
</script>

<div class="flex flex-col gap-4 md:flex-row">
	<div class="h-64 flex-1">
		<h3 class="text-lg font-medium">Devices</h3>
		<canvas bind:this={deviceCanvas}></canvas>
	</div>
	<div class="h-64 flex-1">
		<h3 class="text-lg font-medium">Browsers</h3>
		<canvas bind:this={browserCanvas}></canvas>
	</div>
</div>
