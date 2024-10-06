<!--
	@component
	Generates an SVG line shape.
 -->
<script>
	import { getContext } from 'svelte';

	const { data, xGet, yGet } = getContext('LayerCake');

	/** @type {String} [stroke='#ab00d6'] – The shape's fill color. This is technically optional because it comes with a default value but you'll likely want to replace it with your own color. */

	import { color } from '$lib/colors/mixer.js';

	let greenColors = {
		primary: '#16a34a',
		secondary: '#4ade80',
		complement: '#bbf7d0'
	};

	let stoneColor = {
		primary: '#57534e',
		secondary: '#d6d3d1',
		complement: '#e7e5e4'
	};

	let redColors = {
		primary: '#dc2626',
		secondary: '#f87171',
		complement: '#fecaca'
	};

	let orangeColors = {
		primary: '#ea580c',
		secondary: '#fb923c',
		complement: '#fed7aa'
	};

	let amberColors = {
		primary: ' 	#d97706',
		secondary: '#fbbf24',
		complement: '#fde68a'
	};

	let yellowColors = {
		primary: '#ca8a04',
		secondary: '#facc15',
		complement: ' #fef08a'
	};

	let limeColors = {
		primary: '#65a30d',
		secondary: '#a3e635',
		complement: '#d9f99d'
	};

	let emeraldColors = {
		primary: '#059669',
		secondary: '#34d399',
		complement: '#a7f3d0'
	};

	let tealColors = {
		primary: '#0d9488',
		secondary: ' #2dd4bf',
		complement: '#99f6e4'
	};

	let cyanColors = {
		primary: '#0891b2',
		secondary: '#22d3ee',
		complement: '#a5f3fc'
	};

	let skyColors = {
		primary: '#0284c7',
		secondary: '#38bdf8',
		complement: '#bae6fd'
	};

	let blueColors = {
		primary: '#2563eb',
		secondary: '#60a5fa',
		complement: '#bfdbfe'
	};

	let indigoColors = {
		primary: '#4f46e5',
		secondary: '#818cf8',
		complement: '#c7d2fe'
	};

	let violetColors = {
		primary: '#7c3aed',
		secondary: '#a78bfa',
		complement: '#ddd6fe'
	};

	let purpleColors = {
		primary: '#9333ea',
		secondary: '#c084fc',
		complement: '#e9d5ff'
	};

	let fuchsiaColors = {
		primary: '	#c026d3',
		secondary: '#e879f9',
		complement: '#f5d0fe'
	};

	let pinkColors = {
		primary: '#db2777',
		secondary: '#f472b6',
		complement: ' #fbcfe8'
	};

	let roseColors = {
		primary: '#e11d48',
		secondary: '#fb7185',
		complement: '#fecdd3'
	};
	let xColors = {
		primary: '',
		secondary: '',
		complement: ''
	};

	// let greenColors = {
	// 	primary: '#059669',
	// 	secondary: '#10b981',
	// 	complement: '#22c55e'
	// };

	const colorList = {
		stone: stoneColor,
		red: redColors,
		orange: orangeColors,
		amber: amberColors,
		yellow: yellowColors,
		lime: limeColors,
		green: greenColors,
		cyan: cyanColors,
		sky: skyColors,
		blue: blueColors,
		indigo: indigoColors,
		violet: violetColors,
		purple: purpleColors,
		fuchsia: fuchsiaColors,
		pink: pinkColors,
		rose: roseColors,
		green: greenColors,
		emerald: emeraldColors,
		teal: tealColors
	};
	$: usedColor = colorList[$color] ?? greenColors;

	$: stroke = usedColor.primary ?? '#333';

	$: path =
		'M' +
		$data
			.map((d) => {
				return $xGet(d) + ',' + $yGet(d);
			})
			.join('L');
</script>

<path class="path-line" d={path} {stroke}></path>

<style>
	.path-line {
		fill: none;
		stroke-linejoin: round;
		stroke-linecap: round;
		stroke-width: 2;
	}
</style>
