<script>
	import { color } from '$lib/colors/mixer.js';
	import { Code2 } from 'lucide-svelte';
	import Seo from '$lib/components/generals/seo.svelte';
	import CodeBlock from '$lib/components/docs/CodeBlock.svelte';

	const trackExample = `// Track a page view (automatic on load)
// Or track custom events:
track('button click');

// Track event with spaces in the name
track('form submitted', {
  form: 'contact',
  success: true
});

// Track a purchase with data
track('purchase', {
  product: 'Pro Plan',
  price: 29.99,
  currency: 'USD'
});`;

	const identifyExample = `// Identify user by email (recommended)
identify('john@example.com');

// Identify with additional user properties
identify('john@example.com', {
  name: 'John Doe',
  plan: 'pro',
  company: 'Acme Corp'
});`;

	const feedbackApiExample = `// Show the feedback modal programmatically
window.littlestats.showFeedback();

// Hide the feedback modal
window.littlestats.hideFeedback();

// Submit feedback manually (when using custom UI)
window.littlestats.submit('The website is great!', {
  rating: 5,
  category: 'feature',
  email: 'user@example.com',
  metadata: {
    page: 'dashboard',
    source: 'header-button'
  }
});`;

	const spaExample = `// In a React/Svelte/Vue router navigation handler
// Page changes are tracked automatically!
// No additional code needed.

// But you can manually track specific actions:
function handlePurchase(product) {
  // Track the purchase event
  track('purchase', {
    product: product.name,
    price: product.price,
    sku: product.sku
  });
  
  // Continue with checkout...
}`;

	const customEventPayload = `{ type: 'event', name: 'purchase', data: { ... } }`;
	const identifyPayload = `{ type: 'identify', id: 'john@example.com', data: { ... } }`;
</script>

<svelte:head>
	<Seo title="Tracker API - Documentation - Littlestats" />
</svelte:head>

<h1 class="text-3xl font-extrabold mb-6 mt-0 flex items-center gap-3">
	<Code2 class="h-8 w-8 text-{$color}-500" />
	Tracker API
</h1>

<p class="mb-8">
	The Littlestats tracker exposes a simple JavaScript API for tracking custom events, identifying users, and controlling the feedback widget. All functions are available globally on the <code>window</code> object after the script loads.
</p>

<section class="mb-12">
	<h2 class="text-xl font-bold mb-4">Global Functions</h2>
	<p class="mb-4">After the tracker script loads, these functions are automatically available:</p>

	<div class="space-y-8">
		<div class="p-6 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
			<div class="flex items-center gap-2 mb-4">
				<code class="text-lg font-bold text-{$color}-600 dark:text-{$color}-400">track(name, data?)</code>
			</div>
			<p class="text-stone-600 dark:text-stone-400 mb-4">Track a custom event with optional metadata. The event is sent immediately using the Beacon API for reliability.</p>
			
			<h4 class="font-bold text-sm mb-2">Parameters</h4>
			<ul class="text-sm text-stone-500 space-y-1 mb-4 ml-4">
				<li><strong>name</strong> (string): Event name (e.g., 'signup', 'purchase', 'button_click')</li>
				<li><strong>data</strong> (object, optional): Additional event properties</li>
			</ul>
			
			<h4 class="font-bold text-sm mb-2">Example</h4>
			<CodeBlock code={trackExample} lang="javascript" title="JavaScript" />
		</div>

		<div class="p-6 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
			<div class="flex items-center gap-2 mb-4">
				<code class="text-lg font-bold text-{$color}-600 dark:text-{$color}-400">identify(userId, userData?)</code>
			</div>
			<p class="text-stone-600 dark:text-stone-400 mb-4">Associate the current visitor with a user ID. This is useful for tracking registered users across devices and sessions. Replaces the anonymous visitor ID.</p>
			
			<h4 class="font-bold text-sm mb-2">Parameters</h4>
			<ul class="text-sm text-stone-500 space-y-1 mb-4 ml-4">
				<li><strong>userId</strong> (string): Unique identifier for the user</li>
				<li><strong>userData</strong> (object, optional): Additional user properties</li>
			</ul>
			
			<h4 class="font-bold text-sm mb-2">Example</h4>
			<CodeBlock code={identifyExample} lang="javascript" title="JavaScript" />
		</div>
	</div>
</section>

<section class="mb-12">
	<h2 class="text-xl font-bold mb-4">Feedback Widget API</h2>
	<p class="mb-4">Control the feedback widget programmatically via <code>window.littlestats</code>:</p>

	<div class="space-y-6">
		<div class="flex items-start gap-4">
			<div class="flex-1">
				<code class="text-{$color}-600 dark:text-{$color}-400 font-bold">window.littlestats.showFeedback()</code>
				<p class="text-sm text-stone-500 mt-1">Opens the feedback modal programmatically.</p>
			</div>
		</div>
		<div class="flex items-start gap-4">
			<div class="flex-1">
				<code class="text-{$color}-600 dark:text-{$color}-400 font-bold">window.littlestats.hideFeedback()</code>
				<p class="text-sm text-stone-500 mt-1">Closes the feedback modal.</p>
			</div>
		</div>
		<div class="flex items-start gap-4">
			<div class="flex-1">
				<code class="text-{$color}-600 dark:text-{$color}-400 font-bold">window.littlestats.submit(content, options?)</code>
				<p class="text-sm text-stone-500 mt-1">Submit feedback programmatically (useful for custom UI implementations).</p>
			</div>
		</div>
	</div>

	<h3 class="text-base font-bold mt-8 mb-2">Example Usage</h3>
	<CodeBlock code={feedbackApiExample} lang="javascript" title="Feedback API" />
</section>

<section class="mb-12">
	<h2 class="text-xl font-bold mb-4">SPA Integration</h2>
	<p class="mb-4">Littlestats automatically tracks SPA navigation by intercepting <code>history.pushState</code> and listening to <code>popstate</code> events. No extra code is needed for React Router, Vue Router, SvelteKit, or Next.js!</p>
	
	<h3 class="text-base font-bold mt-6 mb-2">Manual Event Tracking in SPAs</h3>
	<CodeBlock code={spaExample} lang="javascript" title="SPA Example" />
</section>

<section class="mb-12">
	<h2 class="text-xl font-bold mb-4">Collected Data</h2>
	<p class="mb-4">Each tracking request includes the following automatically-collected data:</p>
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose">
		{#each [
			{ field: 'website', desc: 'Your site ID' },
			{ field: 'url', desc: 'Current page path + query string' },
			{ field: 'referrer', desc: 'Referrer URL (if any)' },
			{ field: 'screen', desc: 'Screen resolution (e.g., 1920x1080)' },
			{ field: 'language', desc: 'Browser language' },
			{ field: 'title', desc: 'Page title' },
			{ field: 'timezone', desc: 'User timezone' },
			{ field: 'visitorId', desc: 'Unique visitor identifier' },
			{ field: 'cache.visitId', desc: 'Session identifier' },
			{ field: 'userAgent', desc: 'Browser user agent' }
		] as item}
			<div class="p-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-sm">
				<code class="text-{$color}-600 dark:text-{$color}-400 font-bold">{item.field}</code>
				<p class="text-stone-500 text-xs mt-1">{item.desc}</p>
			</div>
		{/each}
	</div>
</section>

<section class="mb-12">
	<h2 class="text-xl font-bold mb-4">Event Types</h2>
	<p class="mb-4">The tracker sends different event types:</p>
	<div class="space-y-4">
		<div class="p-4 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl">
			<h4 class="font-bold text-sm mb-1">Page View (default)</h4>
			<p class="text-xs text-stone-500">Sent automatically on page load and SPA navigation. No type field.</p>
		</div>
		<div class="p-4 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl">
			<h4 class="font-bold text-sm mb-1">Custom Event</h4>
			<p class="text-xs text-stone-500 mb-2">Sent when calling <code>track()</code> with a name:</p>
			<CodeBlock code={customEventPayload} lang="json" />
		</div>
		<div class="p-4 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl">
			<h4 class="font-bold text-sm mb-1">Identify</h4>
			<p class="text-xs text-stone-500 mb-2">Sent when calling <code>identify()</code>:</p>
			<CodeBlock code={identifyPayload} lang="json" />
		</div>
	</div>
</section>
