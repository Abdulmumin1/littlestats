<script>
	import { onMount } from 'svelte';
	import { fade, fly, draw } from 'svelte/transition';
	import { elasticOut } from 'svelte/easing';

	let isVisible = false;
	let isHovered = false;

	onMount(() => {
		isVisible = true;
	});

	function handleMouseEnter() {
		isHovered = true;
	}

	function handleMouseLeave() {
		isHovered = false;
	}
</script>

<section id="pricing" class="relative z-10 bg-gray-900 px-4 py-32 md:px-6">
	<div class="custom-shape-divider-top-1726721915">
		<svg
			data-name="Layer 1"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 1200 120"
			preserveAspectRatio="none"
		>
			<rect x="1200" height="3.6"></rect>
			<rect height="3.6"></rect>
			<path
				d="M0,0V3.6H580.08c11,0,19.92,5.09,19.92,13.2,0-8.14,8.88-13.2,19.92-13.2H1200V0Z"
				class="shape-fill"
			></path>
		</svg>
	</div>
	<div class="container mx-auto text-center">
		<h2 class="mb-16 text-5xl font-bold text-white">Simple, Sweet Pricing</h2>
		{#if isVisible}
			<div
				class="mx-auto max-w-md transform rounded-lg border-2 border-emerald-500 bg-black p-8 shadow-2xl transition-all duration-300 hover:scale-105"
				in:fly={{ y: 50, duration: 1000, easing: elasticOut }}
				on:mouseenter={handleMouseEnter}
				on:mouseleave={handleMouseLeave}
			>
				<div class="mb-4 text-7xl font-bold text-emerald-400">$37</div>
				<div class="mb-8 text-3xl text-gray-400">/year</div>
				<ul class="mb-8 space-y-4 text-left text-lg">
					{#each ['Up to 6 websites', 'Privacy-focused', 'Access to future updates', '24/7 Support'] as feature, i}
						<li class="flex items-center" in:fly={{ y: 20, duration: 300, delay: i * 100 }}>
							<svg
								class="mr-3 h-6 w-6 text-emerald-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								></path>
							</svg>
							{feature}
						</li>
					{/each}
				</ul>
				<a
					href="#"
					class="block rounded-full bg-emerald-500 px-8 py-4 text-xl font-semibold text-black transition duration-300 hover:bg-emerald-400 hover:shadow-lg"
				>
					Buy Now
					<svg
						class="ml-2 inline-block h-6 w-6 transition-transform duration-300"
						class:translate-x-2={isHovered}
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17 8l4 4m0 0l-4 4m4-4H3"
						></path>
					</svg>
				</a>
			</div>
		{/if}
	</div>
</section>

<style>
	.custom-shape-divider-top-1726721915 {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		overflow: hidden;
		line-height: 0;
	}

	.custom-shape-divider-top-1726721915 svg {
		position: relative;
		display: block;
		width: calc(142% + 1.3px);
		height: 500px;
	}

	.custom-shape-divider-top-1726721915 .shape-fill {
		fill: #10b981;
	}

	section {
		/* background-image: radial-gradient(circle at center, #1f2937 0%, #111827 100%); */
	}
</style>
