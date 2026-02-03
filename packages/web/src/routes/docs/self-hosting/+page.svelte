<script>
	import { color } from '$lib/colors/mixer.js';
	import { Server, ExternalLink, Code2, Database, Globe } from 'lucide-svelte';
	import Seo from '$lib/components/generals/seo.svelte';
	import CodeBlock from '$lib/components/docs/CodeBlock.svelte';

	const dashboardEnvCode = `# packages/dashboard/.env
BETTER_AUTH_SECRET=your-secret
BETTER_AUTH_URL=https://stats.yourdomain.com
ANALYTICS_DOMAIN=stats.yourdomain.com
APP_URL=https://yourdomain.com
TRUSTED_ORIGINS=https://yourdomain.com
COOKIE_DOMAIN=.yourdomain.com`;

	const databaseSetupCode = `cd packages/dashboard
# Create database
npx wrangler d1 create littlestats-db

# Run migrations
pnpm run db:migrate:prod

npx wrangler deploy
`;

	const webDeployCode = `cd packages/web
# Build for production
pnpm run build

# Deploy to Cloudflare Workers
npx wrangler deploy`;
</script>

<svelte:head>
	<Seo title="Self-Hosting - Documentation - Littlestats" />
</svelte:head>

<h1 class="text-3xl font-extrabold mb-6 mt-0 flex items-center gap-3">
	<Server class="h-8 w-8 text-{$color}-500" />
	Self-Hosting
</h1>

<p class="text-lg text-stone-600 dark:text-stone-400 leading-relaxed mb-8">
	Littlestats is designed to run on **Cloudflare Workers**, utilizing **D1** for the database and **Durable Objects** for real-time analytics.
</p>

<div class="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl p-6 mb-12 not-prose">
	<h4 class="text-amber-800 dark:text-amber-400 font-bold mb-2">Requirements</h4>
	<ul class="text-amber-700 dark:text-amber-500 text-sm space-y-2">
		<li>• A Cloudflare account</li>
		<li>• <strong class="text-amber-600 dark:text-amber-400">Workers Paid Plan (Recommended)</strong>
	</ul>
</div>

<h2 class="text-xl font-bold mb-4">1. Dashboard (Backend)</h2>
<p>The dashboard handles data collection, authentication, and stats processing. It runs as a Cloudflare Worker.</p>

<h3 class="text-base font-bold mt-8 mb-2">Setup Environment</h3>
<CodeBlock code={dashboardEnvCode} lang="bash" title=".env" />

<h3 class="text-base font-bold mt-8 mb-2">Database Setup</h3>
<p>Create your D1 database and apply the initial schema migrations.</p>
<CodeBlock code={databaseSetupCode} lang="bash" title="Terminal" />

<h2 class="text-xl font-bold mt-12 mb-4">2. Web App (Frontend)</h2>
<p>The frontend is a SvelteKit application that provides the user interface for viewing your stats. It can be deployed to Cloudflare Pages.</p>

<CodeBlock code={webDeployCode} lang="bash" title="Terminal" />

<div class="mt-12 pt-8 border-t border-stone-100 dark:border-stone-900">
	<a 
		href="https://github.com/abdulmumin1/littlestats/blob/main/docs/self-hosting.md" 
		target="_blank"
		rel="noopener noreferrer"
		class="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-xl font-bold hover:opacity-90 transition-opacity not-prose"
	>
		View Detailed Guide on GitHub
		<ExternalLink class="h-4 w-4" />
	</a>
</div>
