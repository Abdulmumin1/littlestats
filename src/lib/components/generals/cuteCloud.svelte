<script>
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
	let usedColor = $derived(colorList[$color] ?? greenColors);
	// Props for customizable colors
	let fillWhite = $derived(usedColor?.complement ?? 'rgb(255,255,255)');
	let fillTransparent = 'transparent';
	let fillBrown = 'rgb(211,141,95)';
	let strokeGray = $derived(usedColor?.primary ?? 'rgb(128,128,128)');
	let fillBlack = 'rgb(0,0,0)';
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	xmlns:xlink="http://www.w3.org/1999/xlink"
	version="1.1"
	width="300"
	height="300"
	viewBox="0 0 300 300"
	xml:space="preserve"
>
	<desc>Created with Fabric.js 5.2.4</desc>
	<defs> </defs>
	<rect x="0" y="0" width="100%" height="100%" fill={fillTransparent} />
	<g transform="matrix(1 0 0 1 540 540)" id="c08c32d0-10ff-4a02-8acc-566e611b58ad"> </g>
	<g transform="matrix(1 0 0 1 540 540)" id="a258b7b6-a5d2-4f31-aa42-2ee055de99e3">
		<rect
			style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: {fillWhite}; fill-rule: nonzero; opacity: 1; visibility: hidden;"
			vector-effect="non-scaling-stroke"
			x="-540"
			y="-540"
			rx="0"
			ry="0"
			width="1080"
			height="1080"
		/>
	</g>
	<g transform="matrix(0.38 0 0 0.38 258.93 162.98)" style="" id="text3900-6">
		<text
			xml:space="preserve"
			font-family="Sans"
			font-size="13.47513103"
			font-style="normal"
			font-weight="normal"
			style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: {fillBlack}; fill-rule: nonzero; opacity: 1; white-space: pre;"
			><tspan x="-11.27" y="4.23">x=0</tspan></text
		>
	</g>
	<g transform="matrix(4.49 0 0 4.49 1228.2 2300.84)" style="" id="text3900-6-9">
		<text
			xml:space="preserve"
			font-family="Sans"
			font-size="13.47513103"
			font-style="normal"
			font-weight="normal"
			style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: {fillBlack}; fill-rule: nonzero; opacity: 1; white-space: pre;"
			><tspan x="-18.85" y="4.23">y=120</tspan></text
		>
	</g>
	<g transform="matrix(4.49 0 0 4.49 1228.2 1777.24)" style="" id="text3900-6-9-7">
		<text
			xml:space="preserve"
			font-family="Sans"
			font-size="13.47513103"
			font-style="normal"
			font-weight="normal"
			style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: {fillBlack}; fill-rule: nonzero; opacity: 1; white-space: pre;"
			><tspan x="-18.85" y="4.23">y=240</tspan></text
		>
	</g>
	<g transform="matrix(-2.11 0 0 1.87 150 150)" id="rect4259">
		<rect
			style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: {fillBrown}; fill-rule: nonzero; opacity: 0.01;"
			vector-effect="non-scaling-stroke"
			x="-65"
			y="-55"
			rx="0"
			ry="0"
			width="130"
			height="110"
		/>
	</g>
	<g transform="matrix(-2.11 0 0 1.94 149.77 139.98)">
		<path
			style="stroke: {strokeGray}; stroke-width: 5.17; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: {fillWhite}; fill-rule: nonzero; opacity: 1;"
			vector-effect="non-scaling-stroke"
			transform=" translate(-61.16, -44.1)"
			d="M 46.84375 -0.46875 L 46.84375 -0.4375 C 30.273123 -0.29592961 15.964538 12.998392 15.25 29.75 C 14.909088 31.298531 14.833075 32.590858 14.90625 33.5625 C -3.7794314 43.612574 -6.1716777 72.981794 12.875 84.25 C 12.887283 84.257872 12.893963 84.273404 12.90625 84.28125 C 12.992974 84.332368 13.068641 84.387138 13.15625 84.4375 L 13.1875 84.40625 C 19.369399 88.246203 26.055986 88.787411 31.78125 88.6875 C 37.601491 88.585931 42.813513 88.00829 46.8125 88.4375 C 47.09284330417824 88.46520562776192 47.37462530227274 88.47564199806172 47.65625 88.46875 C 64.466204 88.15488 81.933449 89.100176 99.5 87.96875 C 100.02995191613616 87.93569615245181 100.55428529720002 87.84131614386031 101.0625 87.6875 C 115.68975 83.243715 126.25538 67.67202 121.46875 51.9375 C 121.46629 51.928241 121.47122 51.915508 121.46875 51.90625 C 121.44291 51.82164 121.43299 51.740866 121.40625 51.65625 L 121.375 51.65625 C 119.32903 44.241499 114.4327 37.165721 107.03125 33.5 C 105.9432 19.197794 92.305945 7.5676194 77.59375 10.71875 L 77.59375 10.6875 C 76.372937 10.725708 75.367579 10.889318 74.5 11.125 C 67.730016 2.9842368 57.241033 -0.81098311 47.1875 -0.46875 C 47.177142 -0.46839742 47.166607 -0.46911132 47.15625 -0.46875 C 47.052683 -0.46513676 46.947219 -0.47323695 46.84375 -0.46875 z"
			stroke-linecap="round"
		/>
	</g>
	<g transform="matrix(-1.12 0 0 1.12 45.39 -421.65)">
		<path
			style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: {fillWhite}; fill-rule: nonzero; opacity: 1;"
			vector-effect="non-scaling-stroke"
			transform=" translate(-229.91, -80.24)"
			d="M 250.35781 80.237755 C 250.35781 90.600181 241.20512 99.000587 229.91472 99.000587 C 218.62431 99.000587 209.47163 90.600181 209.47163 80.237755 C 209.47163 69.875328 218.62431 61.474922 229.91472 61.474922 C 241.20512 61.474922 250.35781 69.875328 250.35781 80.237755 z"
			stroke-linecap="round"
		/>
	</g>
	<g transform="matrix(-0.58 0 0 0.58 68.82 -388.48)">
		<path
			style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: {fillWhite}; fill-rule: nonzero; opacity: 1;"
			vector-effect="non-scaling-stroke"
			transform=" translate(-229.91, -80.24)"
			d="M 250.35781 80.237755 C 250.35781 90.600181 241.20512 99.000587 229.91472 99.000587 C 218.62431 99.000587 209.47163 90.600181 209.47163 80.237755 C 209.47163 69.875328 218.62431 61.474922 229.91472 61.474922 C 241.20512 61.474922 250.35781 69.875328 250.35781 80.237755 z"
			stroke-linecap="round"
		/>
	</g>
	<g transform="matrix(-0.58 0 0 0.58 88.13 -420.86)">
		<path
			style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: {fillWhite}; fill-rule: nonzero; opacity: 0.5;"
			vector-effect="non-scaling-stroke"
			transform=" translate(-229.91, -80.24)"
			d="M 250.35781 80.237755 C 250.35781 90.600181 241.20512 99.000587 229.91472 99.000587 C 218.62431 99.000587 209.47163 90.600181 209.47163 80.237755 C 209.47163 69.875328 218.62431 61.474922 229.91472 61.474922 C 241.20512 61.474922 250.35781 69.875328 250.35781 80.237755 z"
			stroke-linecap="round"
		/>
	</g>
	<g transform="matrix(-1.12 0 0 1.12 -128.87 -421.65)">
		<path
			style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: {fillWhite}; fill-rule: nonzero; opacity: 1;"
			vector-effect="non-scaling-stroke"
			transform=" translate(-229.91, -80.24)"
			d="M 250.35781 80.237755 C 250.35781 90.600181 241.20512 99.000587 229.91472 99.000587 C 218.62431 99.000587 209.47163 90.600181 209.47163 80.237755 C 209.47163 69.875328 218.62431 61.474922 229.91472 61.474922 C 241.20512 61.474922 250.35781 69.875328 250.35781 80.237755 z"
			stroke-linecap="round"
		/>
	</g>
	<g transform="matrix(-0.58 0 0 0.58 -105.43 -388.48)">
		<path
			style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: {fillWhite}; fill-rule: nonzero; opacity: 1;"
			vector-effect="non-scaling-stroke"
			transform=" translate(-229.91, -80.24)"
			d="M 250.35781 80.237755 C 250.35781 90.600181 241.20512 99.000587 229.91472 99.000587 C 218.62431 99.000587 209.47163 90.600181 209.47163 80.237755 C 209.47163 69.875328 218.62431 61.474922 229.91472 61.474922 C 241.20512 61.474922 250.35781 69.875328 250.35781 80.237755 z"
			stroke-linecap="round"
		/>
	</g>
	<g transform="matrix(-0.58 0 0 0.58 -86.13 -420.86)">
		<path
			style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: {fillWhite}; fill-rule: nonzero; opacity: 0.5;"
			vector-effect="non-scaling-stroke"
			transform=" translate(-229.91, -80.24)"
			d="M 250.35781 80.237755 C 250.35781 90.600181 241.20512 99.000587 229.91472 99.000587 C 218.62431 99.000587 209.47163 90.600181 209.47163 80.237755 C 209.47163 69.875328 218.62431 61.474922 229.91472 61.474922 C 241.20512 61.474922 250.35781 69.875328 250.35781 80.237755 z"
			stroke-linecap="round"
		/>
	</g>
	<g transform="matrix(-0.58 0 0 0.58 822.27 849.14)">
		<path
			style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: {fillWhite}; fill-rule: nonzero; opacity: 0.5;"
			vector-effect="non-scaling-stroke"
			transform=" translate(-229.91, -80.24)"
			d="M 250.35781 80.237755 C 250.35781 90.600181 241.20512 99.000587 229.91472 99.000587 C 218.62431 99.000587 209.47163 90.600181 209.47163 80.237755 C 209.47163 69.875328 218.62431 61.474922 229.91472 61.474922 C 241.20512 61.474922 250.35781 69.875328 250.35781 80.237755 z"
			stroke-linecap="round"
		/>
	</g>
	<g transform="matrix(-0.46 0 0 0.46 120.6 166.03)">
		<path
			style="stroke: rgb(0,0,0); stroke-width: 3; stroke-dasharray: none; stroke-linecap: round; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: none; fill-rule: nonzero; opacity: 1;"
			vector-effect="non-scaling-stroke"
			transform=" translate(-320.09, -170.84)"
			d="M 285.08305 161.73006 C 295.11893 187.19634 342.45465 188.20507 355.09362 160.60989"
			stroke-linecap="round"
		/>
	</g>
	<g transform="matrix(-0.98 0 0 0.98 157.25 131.12)">
		<path
			style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: {fillBlack}; fill-rule: nonzero; opacity: 1;"
			vector-effect="non-scaling-stroke"
			transform=" translate(-229.91, -80.24)"
			d="M 250.35781 80.237755 C 250.35781 90.600181 241.20512 99.000587 229.91472 99.000587 C 218.62431 99.000587 209.47163 90.600181 209.47163 80.237755 C 209.47163 69.875328 218.62431 61.474922 229.91472 61.474922 C 241.20512 61.474922 250.35781 69.875328 250.35781 80.237755 z"
			stroke-linecap="round"
		/>
	</g>
	<g transform="matrix(-0.43 0 0 0.43 150.32 125.79)">
		<path
			style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: {fillWhite}; fill-rule: nonzero; opacity: 1;"
			vector-effect="non-scaling-stroke"
			transform=" translate(-229.91, -80.24)"
			d="M 250.35781 80.237755 C 250.35781 90.600181 241.20512 99.000587 229.91472 99.000587 C 218.62431 99.000587 209.47163 90.600181 209.47163 80.237755 C 209.47163 69.875328 218.62431 61.474922 229.91472 61.474922 C 241.20512 61.474922 250.35781 69.875328 250.35781 80.237755 z"
			stroke-linecap="round"
		/>
	</g>
	<g transform="matrix(-0.22 0 0 0.22 159.35 138.54)">
		<path
			style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: {fillWhite}; fill-rule: nonzero; opacity: 1;"
			vector-effect="non-scaling-stroke"
			transform=" translate(-229.91, -80.24)"
			d="M 250.35781 80.237755 C 250.35781 90.600181 241.20512 99.000587 229.91472 99.000587 C 218.62431 99.000587 209.47163 90.600181 209.47163 80.237755 C 209.47163 69.875328 218.62431 61.474922 229.91472 61.474922 C 241.20512 61.474922 250.35781 69.875328 250.35781 80.237755 z"
			stroke-linecap="round"
		/>
	</g>
	<g transform="matrix(-0.22 0 0 0.22 166.74 126.16)">
		<path
			style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: {fillWhite}; fill-rule: nonzero; opacity: 0.5;"
			vector-effect="non-scaling-stroke"
			transform=" translate(-229.91, -80.24)"
			d="M 250.35781 80.237755 C 250.35781 90.600181 241.20512 99.000587 229.91472 99.000587 C 218.62431 99.000587 209.47163 90.600181 209.47163 80.237755 C 209.47163 69.875328 218.62431 61.474922 229.91472 61.474922 C 241.20512 61.474922 250.35781 69.875328 250.35781 80.237755 z"
			stroke-linecap="round"
		/>
	</g>
	<g transform="matrix(-0.98 0 0 0.98 90.62 131.12)">
		<path
			style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: {fillBlack}; fill-rule: nonzero; opacity: 1;"
			vector-effect="non-scaling-stroke"
			transform=" translate(-229.91, -80.24)"
			d="M 250.35781 80.237755 C 250.35781 90.600181 241.20512 99.000587 229.91472 99.000587 C 218.62431 99.000587 209.47163 90.600181 209.47163 80.237755 C 209.47163 69.875328 218.62431 61.474922 229.91472 61.474922 C 241.20512 61.474922 250.35781 69.875328 250.35781 80.237755 z"
			stroke-linecap="round"
		/>
	</g>
	<g transform="matrix(-0.43 0 0 0.43 83.67 125.79)">
		<path
			style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: {fillWhite}; fill-rule: nonzero; opacity: 1;"
			vector-effect="non-scaling-stroke"
			transform=" translate(-229.91, -80.24)"
			d="M 250.35781 80.237755 C 250.35781 90.600181 241.20512 99.000587 229.91472 99.000587 C 218.62431 99.000587 209.47163 90.600181 209.47163 80.237755 C 209.47163 69.875328 218.62431 61.474922 229.91472 61.474922 C 241.20512 61.474922 250.35781 69.875328 250.35781 80.237755 z"
			stroke-linecap="round"
		/>
	</g>
	<g transform="matrix(-0.22 0 0 0.22 92.71 138.54)">
		<path
			style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: {fillWhite}; fill-rule: nonzero; opacity: 1;"
			vector-effect="non-scaling-stroke"
			transform=" translate(-229.91, -80.24)"
			d="M 250.35781 80.237755 C 250.35781 90.600181 241.20512 99.000587 229.91472 99.000587 C 218.62431 99.000587 209.47163 90.600181 209.47163 80.237755 C 209.47163 69.875328 218.62431 61.474922 229.91472 61.474922 C 241.20512 61.474922 250.35781 69.875328 250.35781 80.237755 z"
			stroke-linecap="round"
		/>
	</g>
	<g transform="matrix(-0.22 0 0 0.22 40.09 101.89)">
		<path
			style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: {fillWhite}; fill-rule: nonzero; opacity: 0.5;"
			vector-effect="non-scaling-stroke"
			transform=" translate(-229.91, -80.24)"
			d="M 250.35781 80.237755 C 250.35781 90.600181 241.20512 99.000587 229.91472 99.000587 C 218.62431 99.000587 209.47163 90.600181 209.47163 80.237755 C 209.47163 69.875328 218.62431 61.474922 229.91472 61.474922 C 241.20512 61.474922 250.35781 69.875328 250.35781 80.237755 z"
			stroke-linecap="round"
		/>
	</g>
</svg>
