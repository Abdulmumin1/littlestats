<script>
	import { LayerCake, Svg } from 'layercake';

	import Line from './Line.svelte';
	import Area from './Area.svelte';
	import AxisX from './AxisX.svelte';
	import AxisY from './AxisY.svelte';

	// In your local project, you will more likely be loading this as a csv and converting it to json using @rollup/plugin-dsv
	// import data from './points.js';
	import { onMount } from 'svelte';

	export let viewRecords;

	const xKey = 'myX';
	const yKey = 'myY';

	function sortViews(viewRecords) {
		const now = new Date(new Date().toUTCString());
		const intervals = [1, 4, 8, 12, 16, 20, 24];
		const counts = new Map(intervals.map((hr) => [hr, 0]));

		viewRecords.forEach((record) => {
			console.log(record);
			const recordDate = new Date(record.timestamp);
			if (isNaN(recordDate.getTime())) {
				console.log(`Invalid date encountered: ${record.timestamp}`);
				return; // Skip this record
			}
			const hoursAgo = (now - recordDate) / (60 * 60 * 1000);

			console.log(hoursAgo, recordDate);
			for (let i = 0; i < intervals.length; i++) {
				if (hoursAgo <= intervals[i]) {
					counts.set(intervals[i], counts.get(intervals[i]) + 1);
					break;
				}
			}
		});

		return Object.fromEntries(counts);
	}

	function transformViewDataForGraph(viewData) {
		return Object.entries(viewData).map(([key, value]) => ({
			myX: key,
			myY: value
		}));
	}

	$: sortedViews = sortViews(viewRecords);
	$: data = transformViewDataForGraph(sortedViews);
	// $: {
	// 	if (data) {
	// 		data.forEach((d) => {
	// 			d[yKey] = +d[yKey];
	// 		});
	// 		console.log(data);
	// 	}
	// }

	$: console.log(data);

	onMount(() => {
		console.log(data);
	});
</script>

<div class="chart-container rounded-full">
	<LayerCake
		padding={{ top: 8, right: 5, bottom: 20, left: 0 }}
		x={xKey}
		y={yKey}
		yDomain={[0, null]}
		{data}
	>
		<Svg>
			<AxisX />
			<AxisY ticks={4} />
			<Line />
			<Area />
		</Svg>
	</LayerCake>
</div>

<style>
	/*
      The wrapper div needs to have an explicit width and height in CSS.
      It can also be a flexbox child or CSS grid element.
      The point being it needs dimensions since the <LayerCake> element will
      expand to fill it.
    */
	.chart-container {
		width: 100%;
		height: 250px;
	}
</style>
