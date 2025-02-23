<script>
	import { onDestroy, onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import { executeInWorker } from '$lib/utils';
	import { calculateFunnel } from '$lib/funnels/helpers.js';

	let { data, funnelStepsContext } = $props();

	let funnelCounts = $state({});
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
	function calculateFunnelx(data, funnelSteps) {
		// 1. Group events by session
		const sessions = {};
		data.forEach((event) => {
			if (!sessions[event.session_id]) {
				sessions[event.session_id] = [];
			}
			sessions[event.session_id].push(event);
		});

		// 2. Process each session's events in chronological order
		const sessionProgress = {};

		Object.entries(sessions).forEach(([sessionId, events]) => {
			// Sort events by timestamp
			events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

			let currentStep = 0; // Track which step the user is trying to complete next

			// 3. Check events against funnel steps in order
			events.forEach((event) => {
				if (currentStep >= funnelSteps.length) return; // Funnel completed

				const targetStep = funnelSteps[currentStep];
				const isMatch =
					(targetStep.type === 'url' && event.url === targetStep.value) ||
					(targetStep.type === 'event' && event.event_name === targetStep.value);

				if (isMatch) {
					currentStep++; // Move to next step in funnel
				}
			});

			// Store the highest completed step index
			sessionProgress[sessionId] = currentStep - 1;
		});

		// 4. Calculate counts for each step
		const funnelResults = {};
		funnelSteps.forEach((step, index) => {
			funnelResults[step.value] = Object.values(sessionProgress).filter(
				(completedStep) => completedStep >= index
			).length;
		});

		return funnelResults;
	}

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
				labels: funnelSteps,
				// 'rgba(54, 162, 235, 0.2)'
				datasets: [
					{
						label: $funnelStepsContext.name ?? 'Funnel Steps',
						data: data_,
						backgroundColor: $funnelStepsContext.steps.map((step) => step.color),
						borderColor: 'rgba(54, 162, 235, 1)',
						borderWidth: 1
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
		let objs = structuredClone($state.snapshot(data));
		let steps = structuredClone($state.snapshot($funnelStepsContext.steps))
		// console.log(objs)
		funnelCounts = await executeInWorker(calculateFunnel, objs, steps);
		chart.data.labels = funnelSteps;
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
			console.log(_)
			await updateChart();
		});

		return () => {
			unsubscribe();
		};
	});
</script>

<canvas id="funnelChart" class="w-full"></canvas>
{#if funnelCounts && funnelSteps}
	<h2>Funnel Analysis</h2>
	<table class="w-full">
		<thead><tr><th>Step</th><th>Count</th></tr></thead>
		<tbody>
			{#each $funnelStepsContext.steps as step}
				<tr
					><td style="background-color: {step.color}; " class="m-3 rounded-xl">{step.name}</td><td
						>{funnelCounts[step.value]}</td
					></tr
				>
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

	th,
	td {
		padding: 10px;
	}
</style>
