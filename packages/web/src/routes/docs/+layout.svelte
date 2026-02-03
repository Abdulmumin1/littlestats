<script>
	import { page } from '$app/state';
	import { color } from '$lib/colors/mixer.js';
	import Nav from '../nav.svelte';
	import { 
		BookOpen, 
		Download, 
		BarChart3, 
		Megaphone, 
		Target, 
		Code2, 
		Database, 
		Server,
		MessageSquare,
		ChevronRight,
		Mailbox
	} from 'lucide-svelte';

	let { children } = $props();

	const menuItems = [
		{ name: 'Overview', href: '/docs', icon: BookOpen },
		{ name: 'Installation', href: '/docs/installation', icon: Download },
		{ name: 'Self-Hosting', href: '/docs/self-hosting', icon: Server },
		{ name: 'Metrics & Charts', href: '/docs/metrics', icon: BarChart3 },
		{ name: 'Campaigns', href: '/docs/campaigns', icon: Megaphone },
		{ name: 'Goals & Events', href: '/docs/goals', icon: Target },
		{ name: 'Tracker API', href: '/docs/api', icon: Code2 },
		{ name: 'Captured Data', href: '/docs/data', icon: Database },
		{ name: 'Feedback', href: '/docs/feedback', icon: Mailbox }
	];

	function isActive(href) {
		return page.url.pathname === href;
	}
</script>

<div class="min-h-screen bg-white dark:bg-stone-950 text-black dark:text-white font-inter">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<header class="py-6 h-20 dark:border-stone-900 mb-8">
			<Nav />
		</header>

		<div class="flex flex-col lg:flex-row gap-12 pb-20">
			<!-- Sidebar -->
			<aside class="lg:w-64 flex-shrink-0">
				<nav class="sticky top-8 space-y-1">
					<p class="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-4 px-3">Documentation</p>
					{#each menuItems as item (item.href)}
						{@const Icon = item.icon}
						<a
							href={item.href}
							class="group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all {isActive(item.href) 
								? `bg-${$color}-50 dark:bg-stone-900/10 text-${$color}-600 dark:text-${$color}-400` 
								: 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900 hover:text-stone-900 dark:hover:text-white'}"
						>
							<Icon class="mr-3 h-4 w-4" />
							{item.name}
							{#if isActive(item.href)}
								<ChevronRight class="ml-auto h-3.5 w-3.5" />
							{/if}
						</a>
					{/each}
				</nav>
			</aside>

			<!-- Main Content -->
			<main class="flex-1 max-w-3xl min-w-0">
				<div class="prose prose-sm prose-stone dark:prose-invert prose-headings:tracking-tight prose-a:text-{$color}-600 dark:prose-a:text-{$color}-400 max-w-none">
					{@render children()}
				</div>

				<div class="mt-20 pt-8 border-t border-stone-100 dark:border-stone-900 flex justify-between">
					<p class="text-sm text-stone-500">
						Found an error? <a href="https://github.com/Abdulmumin1/littlestats" class="text-{$color}-500 hover:underline">Fix on github</a>
					</p>
				</div>
			</main>
		</div>
	</div>
</div>

<style>
	:global(html) {
		scroll-behavior: smooth;
	}
	
	/* Custom prose tweaks for docs */
	:global(.prose pre) {
		background-color: #0c0a09 !important;
		border: 1px solid #292524 !important;
		border-radius: 0.75rem !important;
	}
</style>
