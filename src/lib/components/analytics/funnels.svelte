<script>
	import { onDestroy, onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import { executeInWorker } from '$lib/utils';
	import { calculateFunnel } from '$lib/funnels/helpers.js';
	import { DivideCircle } from 'lucide-svelte';

	let { data, funnelStepsContext, funnelCounts } = $props();

	// let funnelCounts = $state({});
	let chart = $state(null);

	let funnelSteps = $derived($funnelStepsContext.steps.map((step) => step.value));
	// Cleanup chart when component is destroyed
	onDestroy(() => {
		if (chart) {
			chart.destroy();
			chart = null;
		}
	});

	// Reactive block to handle data changes

	// Corrected funnel calculation logic

	function calculateFunneld(data, funnelSteps) {
		// 1. Group events by user_id and sort chronologically
		const userJourneys = {};

		data.forEach((event) => {
			if (!userJourneys[event.user_id]) {
				userJourneys[event.user_id] = [];
			}
			userJourneys[event.user_id].push(event);
		});

		// 2. Track each user's maximum completed step sequence
		const userMaxSteps = {};

		Object.entries(userJourneys).forEach(([userId, events]) => {
			// Sort all user events by timestamp across sessions
			events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

			let currentStep = 0;
			const stepsCompleted = [];

			events.forEach((event) => {
				if (currentStep >= funnelSteps.length) return;

				const targetStep = funnelSteps[currentStep];
				const isMatch =
					(targetStep.type === 'url' && event.url === targetStep.value) ||
					(targetStep.type === 'event' && event.event_name === targetStep.value);

				if (isMatch) {
					stepsCompleted.push(currentStep);
					currentStep++;
				}
			});

			userMaxSteps[userId] = stepsCompleted;
		});

		// 3. Calculate funnel counts
		const funnelResults = {};
		// console.log(userJourneys)
		funnelSteps.forEach((step, index) => {
			funnelResults[step.value] = Object.values(userMaxSteps).filter((steps) =>
				steps.includes(index)
			).length;
		});

		return funnelResults;
	}
	function createChart(funnelCounts, funnelSteps) {
		const canvas = document.getElementById('funnelChart');
		// console.log(canvas);
		if (chart) chart.destroy(); // Cleanup existing chart
		let data_ = funnelSteps.map((step) => funnelCounts[step]);
		return new Chart(canvas, {
			type: 'bar',
			data: {
				labels: $funnelStepsContext.steps.map((step) => step.name),
				// 'rgba(54, 162, 235, 0.2)'
				datasets: [
					{
						label: $funnelStepsContext.name ?? 'Funnel Steps',
						data: data_,
						backgroundColor: $funnelStepsContext.steps.map((step) => step.color),
						borderColor: $funnelStepsContext.steps.map((step) => step.color),
						borderWidth: 1,
						borderRadius: 10,
						color:'#000'

					}
				]
			},
			options: {
				indexAxis: 'y',
				scales: {
					y: { beginAtZero: true, title: { display: true, text: 'Number of Users' } },
					x: { title: { display: true, text: 'Funnel Steps' } }
				},
				responsive: true
			}
		});
	}

	async function updateChart() {
		if (!chart) return;
		chart.data.labels = $funnelStepsContext.steps.map((step) => step.name);
		let data_ = funnelSteps.map((step) => funnelCounts[step]);
		chart.data.datasets[0].label = $funnelStepsContext.name;
		chart.data.datasets[0].data = data_;
		(chart.data.datasets[0].backgroundColor = $funnelStepsContext.steps.map((step) => step.color)),
			chart.update();
	}

	onMount(async () => {
		// if (!chart) {
		// 	let objs = $state.snapshot(data);

		// 	funnelCounts = await executeInWorker(calculateFunnel, objs, $funnelStepsContext.steps);
		// 	// $inspect(funnelCounts);
		// 	console.log(funnelSteps.map((step) => funnelCounts[step]));
		// }
		chart = createChart(funnelCounts, funnelSteps);

		let unsubscribe = funnelStepsContext.subscribe(async (_) => {
			// console.log(_)
			await updateChart();
		});

		return () => {
			unsubscribe();
		};
	});

	let funnelEntries = $derived(Object.entries(funnelCounts));
	$effect(() => {
		$inspect(funnelEntries);
	});
</script>

<canvas id="funnelChart" class="w-full"></canvas>
{#if funnelCounts && funnelSteps}
	<h2 class="text-xl  py-4">Funnel Analysis</h2>
	<!-- <div class="flex w-full">
		<p>Steps</p>
		<p>Counts</p>
	</div>

	<div class="flex gap-2 flex-col">
		{#each $funnelStepsContext.steps as step, index}
			<div >
				<div   style="background-color: {step.color}; width:{((funnelCounts[step.value]/funnelEntries?.[0]?.[1] ?? funnelCounts[step.value] ) * 100).toFixed(0)}%;" class="flex justify-between rounded-xl items-center">
					<span  class="m-3 bg-white/50 rounded-xl px-2 py-1">{step.name}</span>
					<span  class="m-3 bg-white/50 rounded-xl px-2 py-1">{funnelCounts[step.value]} {(( funnelCounts[step.value] / funnelEntries?.[0]?.[1] ?? funnelCounts[step.value]) * 100).toFixed(0)}%</span>
				</div>
			</div>
		{/each}


	</div> -->
	<table class="w-full text-black dark:text-white">
		<thead
			><tr
				><th class="border-2 border-stone-300 dark:border-stone-700">
					<div class="flex items-center gap-2">
						Step
						<div class="flex">
							{#each $funnelStepsContext.steps as step}
								<div class="-m-1 h-4 w-4 rounded-xl" style="background:{step.color};"></div>
							{/each}
						</div>
					</div>
				</th><th class="border-2 border-stone-300 dark:border-stone-700"
					>Users</th
				> <th class="border-2 border-stone-300 dark:border-stone-700">Percentage</th></tr
			></thead
		>
		<tbody>
			{#each $funnelStepsContext.steps as step}
				<tr>
					<td class="border-2 border-stone-300 dark:border-stone-700">
						<div class="flex items-center gap-2">
							<div class="h-4 w-4 rounded-full" style="background-color: {step.color}; "></div>
							{step.name}
						</div>
					</td>
					<td class="border-2 border-stone-300 dark:border-stone-700">{funnelCounts[step.value]} </td>
					<td class="border-2 border-stone-300 dark:border-stone-700">
						{(
							(funnelCounts[step.value] / funnelEntries?.[0]?.[1] ?? funnelCounts[step.value]) * 100
						).toFixed(0)}%
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{:else}
	<p>Waiting for data and funnel steps...</p>
{/if}

<style>
	canvas {
		max-height: 500px;
	}
	table {
		border-collapse: collapse;
	}
	th,
	td {
		padding: 10px;
		/* border: 5px solid #cdcecc; */
		/* border-radius: 100px; */
	}
</style>
