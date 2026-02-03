<script>
	import { color } from '$lib/colors/mixer.js';
	import { Download, Check } from 'lucide-svelte';
	import Seo from '$lib/components/generals/seo.svelte';
	import CodeBlock from '$lib/components/docs/CodeBlock.svelte';

	const basicInstallation = `<script 
  defer 
  data-site-id="YOUR_SITE_ID" 
  src="https://stats.littlestats.click/tracker.js"
><\/script>`;

	const customHost = `<script 
  defer 
  data-site-id="YOUR_SITE_ID"
  data-host="https://your-custom-domain.com"
  src="https://stats.littlestats.click/tracker.js"
><\/script>`;

	const disableFeedback = `<script 
  defer 
  data-site-id="YOUR_SITE_ID"
  data-feedback="false"
  src="https://stats.littlestats.click/tracker.js"
><\/script>`;
</script>

<svelte:head>
	<Seo title="Installation - Documentation - Littlestats" />
</svelte:head>

<h1 class="text-3xl font-extrabold mb-6 mt-0 flex items-center gap-3">
	<Download class="h-8 w-8 text-{$color}-500" />
	Installation
</h1>

<p class="mb-8">
	Add the Littlestats tracker to your website to start collecting analytics. The script is lightweight (&lt;1KB gzipped), respects user privacy, and works with both traditional websites and Single Page Applications (SPAs).
</p>

<h2 class="text-xl font-bold mb-4">Basic Installation</h2>
<p class="mb-4">
	Copy and paste this snippet into the <code class="text-{$color}-600 dark:text-{$color}-400">{'<head>'}</code> of your HTML. Replace <code>YOUR_SITE_ID</code> with your actual site identifier.
</p>

<CodeBlock code={basicInstallation} lang="markup" title="HTML" />

<h2 class="text-xl font-bold mt-12 mb-4">Configuration Attributes</h2>
<p class="mb-4">Customize the tracker behavior with data attributes on the script tag:</p>

<div class="space-y-6">
	<div>
		<h3 class="text-base font-bold mb-2">data-host</h3>
		<p class="text-sm text-stone-500 mb-2">Use a custom analytics server instead of the default cloud-hosted one.</p>
		<CodeBlock code={customHost} lang="markup" title="Custom Host" />
	</div>

	<div>
		<h3 class="text-base font-bold mb-2">data-feedback</h3>
		<p class="text-sm text-stone-500 mb-2">Set to <code>false</code> to completely disable the feedback collection system (both API and UI).</p>
		<CodeBlock code={disableFeedback} lang="markup" title="Disable Feedback" />
	</div>

	<div>
		<h3 class="text-base font-bold mb-2">data-feedback-ui</h3>
		<p class="text-sm text-stone-500 mb-2">Set to <code>false</code> to hide the default floating feedback widget while keeping the feedback API enabled. Use this when building a custom feedback form.</p>
		<div class="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4">
			<pre class="text-sm text-stone-600 dark:text-stone-400"><code>&lt;script defer data-site-id="SITE_ID" data-feedback-ui="false" src="..."&gt;&lt;/script&gt;</code></pre>
		</div>
	</div>
</div>

<h2 class="text-xl font-bold mt-12 mb-4">What Gets Tracked</h2>
<div class="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
	<div class="p-6 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-100 dark:border-stone-800">
		<div class="w-8 h-8 rounded-lg bg-{$color}-100 dark:bg-{$color}-900/30 text-{$color}-600 dark:text-{$color}-400 flex items-center justify-center mb-4">
			<Check class="h-5 w-5" />
		</div>
		<h4 class="text-sm font-bold text-stone-900 dark:text-white mb-2">Page Views</h4>
		<p class="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">Automatically tracks page views with URL, referrer, page title, and timezone.</p>
	</div>
	<div class="p-6 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-100 dark:border-stone-800">
		<div class="w-8 h-8 rounded-lg bg-{$color}-100 dark:bg-{$color}-900/30 text-{$color}-600 dark:text-{$color}-400 flex items-center justify-center mb-4">
			<Check class="h-5 w-5" />
		</div>
		<h4 class="text-sm font-bold text-stone-900 dark:text-white mb-2">SPA Navigation</h4>
		<p class="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">Works with React Router, Vue Router, SvelteKit, or any SPA using History API.</p>
	</div>
	<div class="p-6 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-100 dark:border-stone-800">
		<div class="w-8 h-8 rounded-lg bg-{$color}-100 dark:bg-{$color}-900/30 text-{$color}-600 dark:text-{$color}-400 flex items-center justify-center mb-4">
			<Check class="h-5 w-5" />
		</div>
		<h4 class="text-sm font-bold text-stone-900 dark:text-white mb-2">Session Management</h4>
		<p class="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">Tracks sessions with 30-minute timeout. Survives page refreshes and navigation.</p>
	</div>
	<div class="p-6 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-100 dark:border-stone-800">
		<div class="w-8 h-8 rounded-lg bg-{$color}-100 dark:bg-{$color}-900/30 text-{$color}-600 dark:text-{$color}-400 flex items-center justify-center mb-4">
			<Check class="h-5 w-5" />
		</div>
		<h4 class="text-sm font-bold text-stone-900 dark:text-white mb-2">Device Info</h4>
		<p class="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">Captures screen resolution, language, user agent, and timezone.</p>
	</div>
</div>

<h2 class="text-xl font-bold mt-12 mb-4">Privacy & Performance</h2>
<ul class="space-y-2">
	<li><strong>Privacy-First:</strong> No cookies, no cross-site tracking, no fingerprinting.</li>
	<li><strong>GDPR/CCPA Compliant:</strong> Does not collect PII by default.</li>
	<li><strong>Lightweight:</strong> Script is under 1KB when gzipped.</li>
	<li><strong>Reliable:</strong> Uses <code>navigator.sendBeacon</code> API with fetch fallback for guaranteed delivery.</li>
	<li><strong>Session Storage:</strong> Uses localStorage only for session/visitor IDs, not tracking cookies.</li>
</ul>
