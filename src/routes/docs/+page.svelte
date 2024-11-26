<script>
	import { color } from '$lib/colors/mixer.js';
	import Nav from '$lib/components/generals/insideNav.svelte';
</script>

<div class="container mx-auto max-w-4xl px-4 py-8">
	<header class="mb-12">
		<Nav />
	</header>

	<nav class="mb-8 rounded-lg bg-{$color}-100 p-4 dark:bg-stone-800">
		<h2 class="mb-4 text-lg font-semibold text-black dark:text-white">Table of Contents</h2>
		<ul class="grid gap-2">
			{#each ['Overview', 'Installation', 'Configuration', 'Custom Events', 'Event Data Captured'] as section}
				<li>
					<a
						href="#{section.toLowerCase().replace(/\s+/g, '-')}"
						class="text-{$color}-700 hover:text-{$color}-800 dark:text-{$color}-700 dark:hover:text-{$color}-300 transition-colors"
					>
						{section}
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<main class="">
		<section id="overview" class="mb-12">
			<h2 class="mb-4 text-{$color}-700 pb-2 text-3xl font-semibold">Overview</h2>
			<p class="text-stone-700 dark:text-stone-300">
				This guide helps you understand everything you need to get started with Littlestats
			</p>
		</section>

		<!-- <section id="features" class="mb-12">
			<h2 class="mb-4 text-{$color}-700 pb-2 text-3xl font-semibold">Features</h2>
			<ul class="list-inside list-disc space-y-2 text-stone-700 dark:text-stone-300">
				<li>Automatic page view tracking</li>
				<li>Custom event tracking</li>
				<li>Page exit tracking with duration</li>
				<li>Support for single-page applications (SPAs)</li>
				<li>Development mode toggle</li>
				<li>Beacon-based tracking for page exit events</li>
			</ul>
		</section> -->

		<section id="installation" class="mb-12">
			<h2 class="mb-4 text-{$color}-700 pb-2 text-3xl font-semibold">Installation</h2>
			<p class="mb-4 text-stone-700 dark:text-stone-300">
				Include the script in your HTML file or integrate it into your project's bundled JavaScript:
			</p>
			<strong class="text-{$color}-700">Example</strong>
			<pre class="overflow-x-auto rounded-lg bg-{$color}-100 p-4 dark:bg-stone-800"><code
					class="text-stone-700 dark:text-stone-300"
					>&lt;script src="cdn.littlestats.click/embed/domainID"&gt;&lt;/script&gt;</code
				></pre>
		</section>

		<section id="custom-events" class="mb-12">
			<h2 class="mb-4 text-{$color}-700 pb-2 text-3xl font-semibold">Custom Events</h2>

			<div class="mb-6">
				<h3 class="mb-2 text-xl font-semibold text-stone-800 dark:text-stone-200">
					<code>window.trackEvent(eventName, eventData)</code>
				</h3>
				<p class="mb-4 text-stone-700 dark:text-stone-300">
					Track custom events with additional metadata.
				</p>
				<pre class="overflow-x-auto rounded-lg bg-{$color}-100 p-4 dark:bg-stone-800"><code
						class="text-stone-700 dark:text-stone-300"
						>{`window.trackEvent('button_click', { 
  buttonId: 'submit', 
  location: 'header' 
});`}</code
					></pre>
			</div>

			<div class="mb-6">
				<h3 class="mb-2 text-xl font-semibold text-stone-800 dark:text-stone-200">
					<code>window.setAnalyticsDevMode(isDevMode)</code>
				</h3>
				<p class="mb-4 text-stone-700 dark:text-stone-300">Manually toggle development mode.</p>
				<pre class="overflow-x-auto rounded-lg bg-{$color}-100 p-4 dark:bg-stone-800"><code
						class="text-stone-700 dark:text-stone-300"
						>window.setAnalyticsDevMode(true); // Enable dev mode</code
					></pre>
			</div>
		</section>

		<section id="event-data" class="mb-12">
			<h2 class="mb-4 text-{$color}-700 pb-2 text-3xl font-semibold">Event Data Captured</h2>
			<ul class="list-inside list-disc space-y-2 text-stone-700 dark:text-stone-300">
				<li><code>eventType</code>: Type of event (pageview, customEvent, pageExit)</li>
				<li><code>url</code>: Current page path</li>
				<li><code>referrer</code>: Previous page URL</li>
				<li><code>userAgent</code>: Browser and device information</li>
				<li><code>timestamp</code>: ISO 8601 formatted event time</li>
				<li><code>host</code>: Current website hostname</li>
				<li>Custom event-specific data</li>
			</ul>
		</section>

		<section id="privacy" class="mb-12">
			<h2 class="mb-4 text-{$color}-700 pb-2 text-3xl font-semibold">Privacy Considerations</h2>
			<ul class="list-inside list-disc space-y-2 text-stone-700 dark:text-stone-300">
				<li>No personally identifiable information (PII) is automatically collected</li>
				<li>
					Customize <code>sendAnalytics</code> function to add privacy-specific logic if needed
				</li>
			</ul>
		</section>
	</main>

	<footer class="mt-12 border-t pt-8 text-center text-stone-600 dark:text-stone-400">
		<p>© 2024 Analytics Tracking Library. All rights reserved.</p>
	</footer>
</div>
