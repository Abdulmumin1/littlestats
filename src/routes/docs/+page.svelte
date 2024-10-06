<script>
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import Nav from '../nav.svelte';
	import Footer from '../footer.svelte';

	let isVisible = false;
	let currentSection = 'getting-started';

	const sections = [
		{ id: 'getting-started', title: 'Getting Started' },
		{ id: 'installation', title: 'Installation' },
		{ id: 'configuration', title: 'Configuration' },
		{ id: 'api-reference', title: 'API Reference' },
		{ id: 'faq', title: 'FAQ' }
	];

	onMount(() => {
		isVisible = true;
	});

	function setCurrentSection(sectionId) {
		currentSection = sectionId;
	}
</script>

<main
	class="relative min-h-screen bg-gradient-to-bl from-emerald-950 to-black font-sans text-white"
>
	<div
		class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjMDAwMDAwIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDVMNSAwWk02IDRMNCA2Wk0tMSAxTDEgLTFaIiBzdHJva2U9IiMyMjIiIHN0cm9rZS13aWR0aD0iMSI+PC9wYXRoPgo8L3N2Zz4=')] opacity-10"
	></div>

	<Nav title="AnalyticsRig Docs" />

	<div class="container relative mx-auto flex flex-col md:flex-row">
		<!-- Sidebar -->
		<aside class="w-full p-4 md:w-1/4">
			<nav>
				<ul>
					{#each sections as section}
						<li class="mb-2">
							<button
								on:click={() => setCurrentSection(section.id)}
								class="{currentSection === section.id
									? 'text-emerald-400'
									: 'text-gray-300'} transition-colors duration-200 hover:text-emerald-400"
							>
								{section.title}
							</button>
						</li>
					{/each}
				</ul>
			</nav>
		</aside>

		<!-- Main content -->
		<main class="min-h-screen w-full p-4 md:w-3/4">
			{#if isVisible}
				<div in:fade={{ duration: 300 }}>
					{#if currentSection === 'getting-started'}
						<h1 class="mb-4 text-4xl font-bold">Getting Started</h1>
						<p class="mb-4 text-gray-300">
							Welcome to StatRig! This guide will help you get started with our self-hosted
							analytics solution.
						</p>
						<!-- Add more content for the Getting Started section -->
					{:else if currentSection === 'installation'}
						<h1 class="mb-4 text-4xl font-bold">Installation</h1>
						<p class="mb-4 text-gray-300">Follow these steps to install StatRig on your server:</p>
						<!-- Add installation instructions -->
					{:else if currentSection === 'configuration'}
						<h1 class="mb-4 text-4xl font-bold">Configuration</h1>
						<p class="mb-4 text-gray-300">Learn how to configure StatRig to fit your needs:</p>
						<!-- Add configuration instructions -->
					{:else if currentSection === 'api-reference'}
						<h1 class="mb-4 text-4xl font-bold">API Reference</h1>
						<p class="mb-4 text-gray-300">Explore the StatRig API endpoints and their usage:</p>
						<!-- Add API documentation -->
					{:else if currentSection === 'faq'}
						<h1 class="mb-4 text-4xl font-bold">Frequently Asked Questions</h1>
						<p class="mb-4 text-gray-300">Find answers to common questions about StatRig:</p>
						<!-- Add FAQ content -->
					{/if}
				</div>
			{/if}
		</main>
	</div>

	<Footer />
</main>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

	:global(body) {
		font-family: 'Inter', sans-serif;
		background-color: black;
		color: white;
	}
</style>
