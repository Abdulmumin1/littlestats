<script>
	import { color } from '$lib/colors/mixer.js';
	import { MessageSquare } from 'lucide-svelte';
	import Seo from '$lib/components/generals/seo.svelte';
	import CodeBlock from '$lib/components/docs/CodeBlock.svelte';

	const browserExample = `await fetch("https://stats.littlestats.click/api/v2/feedback/YOUR_DOMAIN_KEY", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    content: "The user's message",
    rating: 5,
    category: "bug",
    email: "user@example.com",
    metadata: { plan: "pro" }
  })
});`;

	const curlExample = `curl -X POST https://stats.littlestats.click/api/v2/feedback/YOUR_DOMAIN_KEY -H "Content-Type: application/json" -d '{"content":"The user message","category":"general"}'`;
</script>

<svelte:head>
	<Seo title="Feedback API - Documentation - Littlestats" />
</svelte:head>

<h1 class="mt-0 mb-6 flex items-center gap-3 text-3xl font-extrabold">
	<MessageSquare class="h-8 w-8 text-{$color}-500" />
	Feedback API
</h1>

<p class="mb-8 text-lg leading-relaxed text-stone-600 dark:text-stone-400">
	LittleStats keeps the feedback inbox and API, but it does not inject a feedback button or modal into your website. Build the interface that suits your app and send submissions to the public endpoint.
</p>

<section class="mb-12">
	<h2 class="mb-4 text-xl font-bold">Submit from your own interface</h2>
	<p>Use your site's domain key in the public endpoint. No dashboard authentication is required for submissions.</p>
	<CodeBlock code={browserExample} lang="javascript" title="Browser JavaScript" />
	<CodeBlock code={curlExample} lang="bash" title="cURL" />
</section>

<section class="mb-12">
	<h2 class="mb-4 text-xl font-bold">Submission fields</h2>
	<div class="not-prose grid grid-cols-1 gap-4 sm:grid-cols-2">
		{#each [
			{ name: 'content', note: 'Required message text' },
			{ name: 'rating', note: 'Optional number from 1 to 5' },
			{ name: 'category', note: 'general, bug, feature, or other' },
			{ name: 'email', note: 'Optional reply address' },
			{ name: 'metadata', note: 'Optional JSON context from your app' },
			{ name: 'visitorId / sessionId', note: 'Optional analytics identifiers' }
		] as field (field.name)}
			<div class="border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-900">
				<code class="text-sm font-bold text-{$color}-600 dark:text-{$color}-400">{field.name}</code>
				<p class="mt-1 text-xs text-stone-500">{field.note}</p>
			</div>
		{/each}
	</div>
</section>

<section class="mb-12">
	<h2 class="mb-4 text-xl font-bold">Endpoints</h2>
	<ul class="space-y-5">
		<li>
			<code>POST /api/v2/feedback/:siteKey</code>
			<p class="mt-1 text-sm text-stone-500">Public submission endpoint with CORS support.</p>
		</li>
		<li>
			<code>GET /api/v2/sites/:siteId/feedback</code>
			<p class="mt-1 text-sm text-stone-500">List feedback in an authenticated integration.</p>
		</li>
		<li>
			<code>PATCH /api/v2/sites/:siteId/feedback/:feedbackId</code>
			<p class="mt-1 text-sm text-stone-500">Update workflow status.</p>
		</li>
		<li>
			<code>DELETE /api/v2/sites/:siteId/feedback/:feedbackId</code>
			<p class="mt-1 text-sm text-stone-500">Delete a feedback entry.</p>
		</li>
	</ul>
</section>

<section>
	<h2 class="mb-4 text-xl font-bold">Dashboard inbox</h2>
	<p>
		Submissions still appear on the Feedback page for the site, where they can be reviewed, resolved, archived, or deleted.
	</p>
</section>
