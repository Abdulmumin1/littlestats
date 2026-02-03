<script>
	import MixerComp from '../lib/colors/mixerComp.svelte';
	import { color } from '$lib/colors/mixer.js';
	import DarkMode from '../lib/components/generals/darkMode.svelte';
	import Logo from '../lib/components/generals/logo.svelte';

	const navItems = [
		{ href: '/#pricing', label: 'Pricing' },
		{ href: '/docs', label: 'Docs' },
		{ href: 'http://github.com/abdulmumin1/littlestats', label: 'GitHub', external: true }
	];
</script>

<div class="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
	<nav class="flex items-center gap-2 rounded-full border border-stone-200/50 bg-white/80 p-1.5  backdrop-blur-xl dark:border-stone-800/50 dark:bg-stone-900/80 dark:shadow-black/20">
		<!-- Logo -->
		<a
			href="/"
			class="flex items-center gap-2 rounded-full bg-stone-100 px-3 py-2 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700"
		>
			<Logo size={20} />
			<span class="text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-white">Littlestats</span>
		</a>

		<!-- Links -->
		<div class="hidden items-center sm:flex">
			{#each navItems as item}
				<a
					href={item.href}
					target={item.external ? '_blank' : ''}
					class="px-4 py-2 text-xs font-medium text-stone-600 transition-colors hover:text-black dark:text-stone-400 dark:hover:text-white"
				>
					{item.label}
				</a>
			{/each}
		</div>

		<!-- Controls -->
		<div class="flex items-center gap-1 border-l border-stone-200 pl-2 dark:border-stone-800">
			<MixerComp hide={true} />
			<DarkMode />
		</div>

		<!-- CTA -->
		<a
			href="/signup"
			class="ml-1 rounded-full bg-{$color}-600 px-5 py-2 text-xs font-bold text-white transition-all hover:bg-{$color}-700 hover:shadow-lg hover:shadow-{$color}-500/20"
		>
			Get Started
		</a>
	</nav>
</div>

<style>
</style>
