<script>
	import { color } from '$lib/colors/mixer.js';
	/**
	 * @typedef {Object} Props
	 * @property {number} [size]
	 */

	/** @type {Props} */
	let { size = 200 } = $props();
	const height = size / 2;
	const scaleFactor = size / 200;

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
	let usedColor = $derived(colorList[$color] ?? greenColors);
</script>

<svg xmlns="http://www.w3.org/2000/svg" width={size} {height} viewBox="0 0 200 100">
	<!-- <defs>
		<linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
			<stop offset="0%" style={{ stopColor: `${usedColor.primary}`, stopOpacity: 1 }} />
			<stop offset="50%" style={{ stopColor: `${usedColor.primary}`, stopOpacity: 1 }} />
			<stop offset="100%" style={{ stopColor: `${usedColor.primary}`, stopOpacity: 1 }} />
		</linearGradient>
	</defs> -->

	<path
		d="M20 80 Q50 20, 100 50 T180 30"
		class="stroke-black dark:stroke-white"
		strokeWidth={8 * scaleFactor}
		fill="none"
	/>

	<circle cx="20" cy="80" r={6 * scaleFactor} fill={usedColor.complement} />
	<circle cx="100" cy="50" r={6 * scaleFactor} fill={usedColor.secondary} />
	<circle cx="180" cy="30" r={6 * scaleFactor} fill={usedColor.primary} />

	<circle cx="40" cy="40" r={3 * scaleFactor} fill={usedColor.complement} opacity="0.7" />
	<circle cx="160" cy="70" r={3 * scaleFactor} fill={usedColor.primary} opacity="0.7" />
	<circle cx="70" cy="20" r={2 * scaleFactor} fill={usedColor.secondary} opacity="0.7" />
	<circle cx="130" cy="60" r={2 * scaleFactor} fill={usedColor.secondary} opacity="0.7" />
</svg>

<!-- <style>

</style> -->
