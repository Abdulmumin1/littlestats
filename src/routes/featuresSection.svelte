<script>
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	let isVisible = false;

	const features = [
		{
			svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-12 h-12 text-emerald-400">
          <path fill-rule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clip-rule="evenodd" />
        </svg>`,
			title: 'Full Control',
			desc: 'Your data, your servers. Maintain complete ownership and privacy.'
		},
		{
			svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-12 h-12 text-emerald-400">
          <path fill-rule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z" clip-rule="evenodd" />
          <path fill-rule="evenodd" d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z" clip-rule="evenodd" />
        </svg>`,
			title: 'Deep Insights',
			desc: 'Powerful analytics to understand your audience like never before.'
		},
		{
			svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-12 h-12 text-emerald-400">
          <path d="M12.378 1.602a.75.75 0 00-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03zM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 00.372-.648V7.93zM11.25 22.18v-9l-9-5.25v8.57a.75.75 0 00.372.648l8.628 5.033z" />
        </svg>`,
			title: 'Lightning Fast',
			desc: "Optimized for speed, with minimal impact on your site's performance."
		}
	];

	onMount(() => {
		isVisible = true;
	});
</script>

<section id="features" class="relative z-10 bg-emerald-500 px-4 py-24 md:px-6">
	<!-- <div class="custom-shape-divider-top-1726704783">
		<svg
			data-name="Layer 1"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 1200 120"
			preserveAspectRatio="none"
		>
			<defs>
				<linearGradient id="grad1" x1="1" y1="0" x2="0" y2="1">
					<stop offset="0%" style="stop-color:#022c22;stop-opacity:1" />
					<stop offset="100%" style="stop-color:black;stop-opacity:1" />
				</linearGradient>
			</defs>
			<path
				d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
				class=" bg-gradient-to-bl from-emerald-950 to-black"
				fill="url(#grad1)"
			></path>
		</svg>
	</div> -->
	<div class="container mx-auto">
		<h2 class="mb-16 text-center text-4xl font-bold text-white">Benefits</h2>
		<div class="grid gap-12 md:grid-cols-3">
			{#if isVisible}
				{#each features as feature, i}
					<div
						class="transform rounded-lg bg-gray-900 p-6 shadow-xl transition duration-500 hover:-translate-y-2 hover:shadow-emerald-500/40"
						in:fly={{ y: 50, duration: 1000, delay: i * 200 }}
					>
						<div class="mb-4" aria-label={feature.title}>
							{@html feature.svg}
						</div>
						<h3 class="mb-4 text-2xl font-semibold text-emerald-400">{feature.title}</h3>
						<p class="text-gray-300">{feature.desc}</p>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</section>

<style>
	:global(.section) {
		padding-top: 2rem;
		padding-bottom: 2rem;
	}
	.custom-shape-divider-top-1726704783 {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		overflow: hidden;
		line-height: 0;
	}
	.custom-shape-divider-top-1726704783 svg {
		position: relative;
		display: block;
		width: calc(140% + 1.3px);
		height: 109px;
	}
	.custom-shape-divider-top-1726704783 .shape-fill {
		fill: var(--background-color, black);
	}
</style>
