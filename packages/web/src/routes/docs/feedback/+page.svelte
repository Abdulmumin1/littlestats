<script>
	import { color } from '$lib/colors/mixer.js';
	import { MessageSquare, Send, CheckCircle2, Heart } from 'lucide-svelte';
	import Seo from '$lib/components/generals/seo.svelte';
	import CodeBlock from '$lib/components/docs/CodeBlock.svelte';

	let submitted = $state(false);
	let loading = $state(false);

	async function handleSubmit(event) {
		event.preventDefault();
		loading = true;
		// Simulate submission
		await new Promise(r => setTimeout(r, 1000));
		submitted = true;
		loading = false;
	}

	const basicUsageCode = `<script 
  src="https://stats.littlestats.click/tracker.js" 
  data-site-id="YOUR_DOMAIN_KEY"
><\/script>`;

	const manualSubmissionCode = `window.littlestats.submit("The user's message", {
  rating: 5,        // Optional: 1-5
  category: "bug",  // Optional: "general", "bug", "feature", "other"
  email: "user@example.com", // Optional
  metadata: {       // Optional: Any additional JSON data
    plan: "pro",
    source: "header-link"
  }
});`;
</script>

<svelte:head>
	<Seo title="Feedback System - Documentation - Littlestats" />
</svelte:head>

<h1 class="text-3xl font-extrabold mb-6 mt-0 flex items-center gap-3">
	<MessageSquare class="h-8 w-8 text-{$color}-500" />
	Feedback System
</h1>

<p class="text-lg text-stone-600 dark:text-stone-400 leading-relaxed mb-8">
	The LittleStats Feedback System allows you to collect, manage, and analyze user feedback directly from your website.
</p>

<section class="mb-12">
	<h2 class="text-xl font-bold mb-4">1. Tracker Integration</h2>
	<p>The feedback widget is included by default in the standard tracker script. No extra installation is required.</p>
	
	<h3 class="text-base font-bold mt-6 mb-2">Basic Usage</h3>
	<CodeBlock code={basicUsageCode} lang="markup" title="HTML" />

	<h3 class="text-base font-bold mt-6 mb-2">Configuration Attributes</h3>
	<ul class="space-y-4">
		<li>
			<code class="text-{$color}-600 dark:text-{$color}-400 font-bold">data-feedback="false"</code>
			<p class="text-sm text-stone-500 mt-1">Completely disables the feedback system (no API, no UI).</p>
		</li>
		<li>
			<code class="text-{$color}-600 dark:text-{$color}-400 font-bold">data-feedback-ui="false"</code>
			<p class="text-sm text-stone-500 mt-1">Enables the feedback API but hides the default floating widget. Use this if you want to build your own custom feedback form.</p>
		</li>
	</ul>
</section>

<section class="mb-12">
	<h2 class="text-xl font-bold mb-4">2. Public JavaScript API</h2>
	<p>When the tracker is loaded, it exposes a public API via <code>window.littlestats</code>.</p>

	<h3 class="text-base font-bold mt-6 mb-2">Programmatic Control</h3>
	<ul class="space-y-4 mb-6">
		<li>
			<code class="text-{$color}-600 dark:text-{$color}-400 font-bold">window.littlestats.showFeedback()</code>
			<p class="text-sm text-stone-500 mt-1">Opens the default feedback modal.</p>
		</li>
		<li>
			<code class="text-{$color}-600 dark:text-{$color}-400 font-bold">window.littlestats.hideFeedback()</code>
			<p class="text-sm text-stone-500 mt-1">Closes the default feedback modal.</p>
		</li>
	</ul>

	<h3 class="text-base font-bold mt-6 mb-2">Manual Submission (Custom UI)</h3>
	<p>If you've disabled the default UI, you can still submit feedback using:</p>
	<CodeBlock code={manualSubmissionCode} lang="javascript" title="JavaScript" />
</section>

<section class="mb-12">
	<h2 class="text-xl font-bold mb-4">3. Backend API (Internal)</h2>
	<p>For those building deeper integrations, the following endpoints are available:</p>
	<ul class="space-y-4">
		<li>
			<span class="text-[10px] font-bold uppercase tracking-widest bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded mr-2">Public</span>
			<code>POST /api/v2/feedback/:siteKey</code>
			<p class="text-sm text-stone-500 mt-1">Submit feedback (handles CORS, used by tracker).</p>
		</li>
		<li>
			<span class="text-[10px] font-bold uppercase tracking-widest bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded mr-2">Protected</span>
			<code>GET /api/v2/sites/:siteId/feedback</code>
			<p class="text-sm text-stone-500 mt-1">List feedback with pagination and filters.</p>
		</li>
	</ul>
</section>

<section class="mb-12">
	<h2 class="text-xl font-bold mb-4">4. Database Schema</h2>
	<p>Feedback is stored with rich context to help you understand the user's situation:</p>
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 not-prose">
		{#each [
			{ t: 'Content', d: 'The message text' },
			{ t: 'Rating', d: '1-5 star rating' },
			{ t: 'Category', d: 'Feedback classification' },
			{ t: 'Context', d: 'Browser, OS, Device, Screen, Country' },
			{ t: 'Identity', d: 'Linked to visitor and session ID' },
			{ t: 'Status', d: 'new, reviewed, resolved, archived' }
		] as item}
			<div class="p-4 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl">
				<h4 class="font-bold text-sm mb-1">{item.t}</h4>
				<p class="text-xs text-stone-500 leading-relaxed">{item.d}</p>
			</div>
		{/each}
	</div>
</section>

<section class="mb-12">
	<h2 class="text-xl font-bold mb-4">5. Customization</h2>
	<p>You can customize the feedback widget to match your brand using these CSS variables:</p>
	<CodeBlock code={`:root {
  --ls-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --ls-bg: #18181b;
  --ls-text: #fafafa;
  --ls-primary: #fafafa;
  --ls-radius: 0;
}`} lang="css" title="CSS" />
	<div class="mt-4 p-4 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl">
		<ul class="space-y-2 text-sm">
			<li><code class="font-bold text-{$color}-600 dark:text-{$color}-400">--ls-font</code>: Font family for the widget.</li>
			<li><code class="font-bold text-{$color}-600 dark:text-{$color}-400">--ls-bg</code>: Main background color.</li>
			<li><code class="font-bold text-{$color}-600 dark:text-{$color}-400">--ls-text</code>: Main text color.</li>
			<li><code class="font-bold text-{$color}-600 dark:text-{$color}-400">--ls-primary</code>: Accent color for buttons and active states.</li>
			<li><code class="font-bold text-{$color}-600 dark:text-{$color}-400">--ls-radius</code>: Border radius for the modal and inputs.</li>
		</ul>
	</div>
</section>

<div class="my-20 border-t border-stone-100 dark:border-stone-900 pt-20">
	<div class="flex items-center gap-2 mb-6">
		<Heart class="h-5 w-5 text-red-500 fill-red-500" />
		<h2 class="text-2xl font-bold m-0">Send us your feedback</h2>
	</div>

	{#if !submitted}
		<form onsubmit={handleSubmit} class="space-y-6 not-prose bg-stone-50 dark:bg-stone-900 p-8 rounded-2xl border border-stone-200 dark:border-stone-800">
			<div>
				<label for="type" class="block text-sm font-bold mb-2">Feedback Type</label>
				<select id="type" class="w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-{$color}-500 outline-none transition-all">
					<option>General Feedback</option>
					<option>Bug Report</option>
					<option>Feature Request</option>
					<option>Question</option>
				</select>
			</div>
			<div>
				<label for="message" class="block text-sm font-bold mb-2">Message</label>
				<textarea 
					id="message" 
					rows="5" 
					required
					placeholder="Tell us what's on your mind..."
					class="w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-{$color}-500 outline-none transition-all resize-none"
				></textarea>
			</div>
			<button 
				disabled={loading}
				type="submit" 
				class="w-full bg-{$color}-600 hover:bg-{$color}-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
			>
				{#if loading}
					<div class="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
				{:else}
					<Send class="h-4 w-4" />
				{/if}
				{loading ? 'Sending...' : 'Send Feedback'}
			</button>
		</form>
	{:else}
		<div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-2xl p-12 text-center not-prose">
			<CheckCircle2 class="h-16 w-16 text-green-500 mx-auto mb-6" />
			<h3 class="text-2xl font-bold mb-2">Thank you!</h3>
			<p class="text-stone-600 dark:text-stone-400">Your feedback has been received. We appreciate your support!</p>
			<button 
				onclick={() => submitted = false}
				class="mt-8 text-sm font-bold text-{$color}-600 hover:underline"
			>
				Send another message
			</button>
		</div>
	{/if}
</div>
