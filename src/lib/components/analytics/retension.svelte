<script>
	import Chart from 'chart.js/auto';
	import { color } from '$lib/colors/mixer.js';

	// --- Utility Functions ---
	function getISOWeekNumber(date) {
		const target = new Date(date.valueOf());
		const dayNr = (date.getDay() + 6) % 7;
		target.setDate(target.getDate() - dayNr + 3);
		const firstThursday = target.valueOf();
		target.setMonth(0, 1);
		if (target.getDay() !== 4) {
			target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
		}
		return 1 + Math.ceil((firstThursday - target) / 604800000);
	}
	function generateDummyEvents(
		numEvents = 10000,
		startDate = '2025-10-10',
		endDate = '2025-12-31'
	) {
		const events = [];
		const userIds = Array.from({ length: numEvents / 10 }, (_, i) => `user${i + 1}`);
		const start = new Date(startDate).getTime();
		const end = new Date(endDate).getTime();

		for (let i = 0; i < numEvents; i++) {
			const randomTimestamp = new Date(start + Math.random() * (end - start)).toISOString();
			const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
			events.push({ timestamp: randomTimestamp, user_id: randomUser });
		}

		return events;
	}

	function getWeekDateRangeFormatted(isoWeekString) {
		const [year, week] = isoWeekString.split('-W').map(Number);
		const firstDay = new Date(year, 0, 1 + (week - 1) * 7);
		while (firstDay.getDay() !== 1) firstDay.setDate(firstDay.getDate() + 1);
		const lastDay = new Date(firstDay);
		lastDay.setDate(lastDay.getDate() + 6);
		return `${firstDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${lastDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
	}

	if (!Set.prototype.intersection) {
		Set.prototype.intersection = function (setB) {
			const intersection = new Set();
			for (const elem of setB) this.has(elem) && intersection.add(elem);
			return intersection;
		};
	}

	// --- Data Calculations ---
	export function calculateWeeklyUsersRaw(events) {
		const weeklyUsers = {};
		events.forEach((event) => {
			if (!event.timestamp || !event.user_id) return;
			const date = new Date(event.timestamp);
			const weekKey = `${date.getFullYear()}-W${getISOWeekNumber(date)}`;
			(weeklyUsers[weekKey] ||= new Set()).add(event.user_id);
		});
		return weeklyUsers;
	}

	export function calculateRetention(raw) {
	    const keys = Object.keys(raw).sort();
	    const weeklyCounts = {};

	    keys.forEach((baseKey, i) => {
	        weeklyCounts[baseKey] = {};
	        keys.slice(i).forEach(otherKey => {
	            weeklyCounts[baseKey][otherKey] = raw[baseKey].intersection(raw[otherKey]).size;
	        });
	    });
	    return weeklyCounts;
	}

	// export function calculateRetention(raw) {
	// 	const keys = Object.keys(raw).sort(); // sort weeks chronologically
	// 	let weeklyComebacks = {};

	// 	for (let i = 0; i < keys.length; i++) {
	// 		const baseKey = keys[i];
	// 		const baseWeek = raw[baseKey];
	// 		if (!weeklyComebacks[baseKey]) {
	// 			weeklyComebacks[baseKey] = {};
	// 		}
	// 		// Calculate retention for each week from the base week forward
	// 		for (let j = i; j < keys.length; j++) {
	// 			const otherKey = keys[j];
	// 			const weekUsers = raw[otherKey];
	// 			const comebacks = baseWeek.intersection(weekUsers);
	// 			weeklyComebacks[baseKey][otherKey] = comebacks;
	// 		}
	// 	}

	// 	// Convert Sets to counts
	// 	const weeklyCounts = {};
	// 	for (const baseKey in weeklyComebacks) {
	// 		weeklyCounts[baseKey] = {};
	// 		for (const otherKey in weeklyComebacks[baseKey]) {
	// 			weeklyCounts[baseKey][otherKey] = weeklyComebacks[baseKey][otherKey].size;
	// 		}
	// 	}
	// 	return weeklyCounts;
	// }

	// --- Component Code ---

	let chartInstance = null;

	function getColor(percentage) {
		return `hsl(${percentage * 1.2}, 70%, 85%)`;
	}

	let lastColor = null;

	function getRandomColor() {
		let hue;
		do {
			hue = Math.floor(Math.random() * 360);
		} while (hue === lastColor);

		lastColor = hue;
		return `hsl(${hue}, 100%, 30%)`; // Higher saturation & lower lightness for better contrast
	}

	let {
		events = [
			{ timestamp: '2025-02-03T10:00:00Z', user_id: 'user1' },
			{ timestamp: '2025-02-03T12:00:00Z', user_id: 'user2' },
			{ timestamp: '2025-02-10T09:00:00Z', user_id: 'user1' },
			{ timestamp: '2025-02-10T11:00:00Z', user_id: 'user3' }
		]
	} = $props();

	const weeklyUsersRaw = calculateWeeklyUsersRaw(events);
	const retention = calculateRetention(weeklyUsersRaw);
	const sortedWeeks = Object.keys(retention);

	let randomColors = $state({});
	// Generate chart when data changes
	$effect(() => {
		if (sortedWeeks.length) {
			if (chartInstance) chartInstance.destroy();

			const datasets = sortedWeeks.map((baseWeek, i) => {
				const baseTotal = weeklyUsersRaw[baseWeek].size;
				let randomColor = getRandomColor();
				randomColors[baseWeek] = randomColor;
				return {
					label: getWeekDateRangeFormatted(baseWeek),
					data: sortedWeeks.slice(i).map((w) => (retention[baseWeek][w] / baseTotal) * 100),
					borderColor: randomColor,
					tension: 0.2
				};
			});

			const ctx = document.getElementById('retentionChart').getContext('2d');
			chartInstance = new Chart(ctx, {
				type: 'line',
				data: {
					labels: Array.from({ length: sortedWeeks.length }, (_, i) => `Week ${i}`),
					datasets: datasets
				},
				options: {
					responsive: true,
					plugins: {
						title: { display: true, text: 'Weekly Retention Rate' },
						tooltip: {
							callbacks: {
								label: (ctx) => `${ctx.dataset.label}: ${ctx.raw.toFixed(1)}%`
							}
						}
					},
					scales: {
						y: {
							title: { display: true, text: 'Retention %' },
							min: 0,
							max: 100
						},
						x: { title: { display: true, text: 'Weeks Since First Visit' } }
					}
				}
			});
		}
	});
</script>

{#if sortedWeeks.length}
	<h2 class="mt-5 text-xl">Weekly Retention Analysis Chart</h2>
	<div class="chart-container w-full *:w-full">
		<canvas id="retentionChart" class="max-h-[500px]"></canvas>
	</div>

	<h2 class="text-xl font-inter">Weekly Retention</h2>

	<table class="text-white">
		<thead class="z-10">
			<tr class="">
				<th class="z-40 rounded-xl" style="padding:0px !important;">
					<div class="relative h-full w-full py-2">
						<div
							class="absolute inset-0 -z-0 m-auto bg-{$color}-600 h-full w-full rounded-lg"
						></div>
						<span class="relative">Cohort</span>
					</div>
				</th>
				{#each sortedWeeks as week, index}
					<th class=" relative z-40" style="padding:0px !important;">
						<div class="relative h-full w-full py-2">
							<div
								class="absolute inset-0 -z-0 m-auto bg-{$color}-600 h-full w-full rounded-lg"
							></div>
							<span class="relative">Week {index}</span>
						</div>
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			<!--             
                                                    {#each sortedWeeks as baseWeek, i}
                                                    <tr>
                                                        <td>{getWeekDateRangeFormatted(baseWeek)}</td>
                                                        {#each sortedWeeks as _, j}
                                                            {#if j >= i}
                                                                
                                                                        <td style="background-color: {getColor((retention[baseWeek][sortedWeeks[j]] / weeklyUsersRaw[baseWeek].size * 100))}">
                                                                            {retention[baseWeek][sortedWeeks[j]]}<br>({(retention[baseWeek][sortedWeeks[j]] / weeklyUsersRaw[baseWeek].size * 100).toFixed(0)}%)
                                                                        </td>
                                                                
                                                                {:else}
                                                                    <td></td>
                                                                {/if}
                                                            {/each}
                                                    </tr>
                                                {/each} -->
			{#each Object.entries(retention) as [baseWeek, retentionData]}
				<tr>
					<td class="relative">
						<div
							class="absolute inset-0 -z-0 m-auto h-full w-full rounded-lg bg-{$color}-600"
						></div>
						<span class="relative"> {getWeekDateRangeFormatted(baseWeek)}</span>
					</td>

					{#each Object.entries(retentionData) as [otherWeek, count], index}
						<td class="relative" title="{count}">
							<div
								class="absolute inset-0 bg-{$color}-600 -z-0 m-auto h-full w-full rounded-lg"
								style="opacity: {((count / weeklyUsersRaw[baseWeek].size) * 100).toFixed(
									0
								)}%; b"
							></div>
							<div
								class="bg-{$color}-600 absolute inset-0 -z-0 my-auto h-full rounded-lg"
								style=" width:{(
									(count / weeklyUsersRaw[baseWeek].size) *
									100
								).toFixed(0)}%;"
							></div>
							<!-- style="background-color: {getColor()}" -->
							<!-- {JSON.stringify()} -->
							<span class="relative">
								{((count / weeklyUsersRaw[baseWeek].size) * 100).toFixed(0)}%</span
							>
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
{:else}
	<p>No retention data available</p>
{/if}

<style>
	.chart-container {
		margin: 2rem 0;
		position: relative;
	}

	table {
		border-collapse: collapse;
		width: 100%;
		/* box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); */
	}

	th,
	td {
		padding: 7px;
		text-align: center;
		border: 5px solid #11111100;
		/* min-width: 00px; */
		border-radius: 0px;
		/* margin:20px; */
		/* max-width:20px !important; */
	}

	th {
		position: sticky;
		top: 0;
	}

	td {
		font-size: 0.8rem;
	}
</style>
