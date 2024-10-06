<script>
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	let isVisible = false;

	const techStack = [
		{
			name: 'SvelteKit',
			svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" class="w-12 h-12">
          <path d="M26.47,5.7A9.26,9.26,0,0,0,14.82,2.5,8.46,8.46,0,0,0,5.6,11.54a7.62,7.62,0,0,0,3.93,14.22h13a9.11,9.11,0,0,0,3.91-17.33ZM22.91,23H9.53a4.85,4.85,0,0,1-1.13-9.55l.79-.18-.09-.81a5.69,5.69,0,0,1,6.19-6.11,6.49,6.49,0,0,1,8.06,2.49l.46.7.81-.27a6.29,6.29,0,0,1,2,.15,6.34,6.34,0,0,1-3.71,11.58Z"/>
        </svg>`
		},
		{
			name: 'Bun.js',
			svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" class="w-12 h-12">
          <path d="M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2Zm2,21.5a1.5,1.5,0,0,1-3,0v-9a1.5,1.5,0,0,1,3,0Zm4.25-9.75a1.5,1.5,0,0,1,0,2.12L19,19.12a1.5,1.5,0,0,1-2.12-2.12l3.25-3.25A1.5,1.5,0,0,1,22.25,13.75ZM9.75,15.87a1.5,1.5,0,0,1,0-2.12l3.25-3.25a1.5,1.5,0,0,1,2.12,2.12L11.87,15.87A1.5,1.5,0,0,1,9.75,15.87Z"/>
        </svg>`
		},
		{
			name: 'SQLite',
			svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" class="w-12 h-12">
          <path d="M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2ZM12,23.5a1.5,1.5,0,0,1-3,0v-15a1.5,1.5,0,0,1,3,0Zm5.5,0a1.5,1.5,0,0,1-3,0v-15a1.5,1.5,0,0,1,3,0Zm5.5,0a1.5,1.5,0,0,1-3,0v-15a1.5,1.5,0,0,1,3,0Z"/>
        </svg>`
		},
		{
			name: 'Tailwind CSS',
			svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" class="w-12 h-12">
          <path d="M9,13.7q1.4-5.6,7-5.6c5.6,0,6.3,4.2,9.1,4.9q2.8.7,4.9-2.1-1.4,5.6-7,5.6c-5.6,0-6.3-4.2-9.1-4.9Q11.1,10.9,9,13.7ZM2,22.1q1.4-5.6,7-5.6c5.6,0,6.3,4.2,9.1,4.9q2.8.7,4.9-2.1-1.4,5.6-7,5.6c-5.6,0-6.3-4.2-9.1-4.9Q4.1,19.3,2,22.1Z"/>
        </svg>`
		}
	];

	onMount(() => {
		isVisible = true;
	});
</script>

<section class="relative z-10 bg-emerald-500 px-4 py-32 md:px-6">
	<div class="custom-shape-divider-top-1726721763">
		<svg
			data-name="Layer 1"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 1200 120"
			preserveAspectRatio="none"
		>
			<path
				d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
				class="shape-fill"
			></path>
		</svg>
	</div>
	<div class="container mx-auto text-center">
		<h2 class="mb-16 text-5xl font-bold text-white">Sweet, Modern Stack</h2>
		<div class="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
			{#each techStack as tech, i}
				{#if isVisible}
					<div
						class="flex transform flex-col items-center transition-all duration-300 hover:scale-110"
						in:fly={{ y: 50, duration: 800, delay: i * 150 }}
						aria-label={tech.name}
					>
						<div class="mb-6 rounded-full bg-gray-800 p-6 shadow-lg">
							{@html tech.svg}
						</div>
						<span class="text-2xl font-semibold text-gray-800">{tech.name}</span>
						<!-- <p class="mt-4 text-gray-400">
							Lorem ipsum dolor sit amet, consectetur adipiscing elit.
						</p> -->
					</div>
				{/if}
			{/each}
		</div>
	</div>
</section>

<style>
	section {
		min-height: 100vh;
		display: flex;
		align-items: center;
	}

	.custom-shape-divider-top-1726721763 {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		overflow: hidden;
		line-height: 0;
	}

	.custom-shape-divider-top-1726721763 svg {
		position: relative;
		display: block;
		width: calc(300% + 1.3px);
		height: 149px;
	}

	.custom-shape-divider-top-1726721763 .shape-fill {
		fill: #111827;
	}
</style>
