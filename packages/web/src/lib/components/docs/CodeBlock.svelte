<script>
	import { onMount } from 'svelte';
	import { color } from '$lib/colors/mixer.js';
	import { Copy, Check } from 'lucide-svelte';
	import Prism from 'prismjs';

	// Import languages
	import 'prismjs/components/prism-javascript';
	import 'prismjs/components/prism-typescript';
	import 'prismjs/components/prism-bash';
	import 'prismjs/components/prism-json';
	import 'prismjs/components/prism-markup'; // HTML

	let { code, lang = 'javascript', title = '' } = $props();

	let copied = $state(false);
	let codeElement = $state();

	async function copyToClipboard() {
		await navigator.clipboard.writeText(code);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	onMount(() => {
		if (codeElement) {
			Prism.highlightElement(codeElement);
		}
	});

	$effect(() => {
		if (code && codeElement) {
			Prism.highlightElement(codeElement);
		}
	});
</script>

<div class="relative group my-6 not-prose">
	<div class="flex items-center justify-between px-4 py-2 bg-stone-900 border-x border-t border-stone-800 rounded-t-xl">
		<div class="flex items-center gap-2">
			{#if title}
				<span class="text-[10px] font-bold uppercase tracking-widest text-stone-500">{title}</span>
			{:else}
				<span class="text-[10px] font-bold uppercase tracking-widest text-stone-500">{lang === 'markup' ? 'HTML' : lang}</span>
			{/if}
		</div>
		<button 
			onclick={copyToClipboard}
			class="p-1.5 rounded-md hover:bg-stone-800 text-stone-400 transition-colors"
			title="Copy code"
		>
			{#if copied}
				<Check class="h-3.5 w-3.5 text-green-500" />
			{:else}
				<Copy class="h-3.5 w-3.5" />
			{/if}
		</button>
	</div>
	<div class="relative">
		<pre class="m-0! rounded-t-none! rounded-b-xl! border-stone-800! bg-stone-950! px-3 py-3 text-xs overflow-x-auto"><code bind:this={codeElement} class="language-{lang} text-sm">{code}</code></pre>
	</div>
</div>

<style>
	/* Inline Prism theme to avoid separate CSS file issues */
	:global(code[class*="language-"]),
	:global(pre[class*="language-"]) {
		color: #ccc;
		background: none;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
		font-size: 0.875rem;
		text-align: left;
		white-space: pre;
		word-spacing: normal;
		word-break: normal;
		word-wrap: normal;
		line-height: 1.5;
		tab-size: 4;
		hyphens: none;
	}

	:global(.token.comment),
	:global(.token.prolog),
	:global(.token.doctype),
	:global(.token.cdata) {
		color: #78716c;
	}

	:global(.token.punctuation) {
		color: #a8a29e;
	}

	:global(.token.namespace) {
		opacity: .7;
	}

	:global(.token.property),
	:global(.token.tag),
	:global(.token.boolean),
	:global(.token.number),
	:global(.token.constant),
	:global(.token.symbol),
	:global(.token.deleted) {
		color: #fb923c;
	}

	:global(.token.selector),
	:global(.token.attr-name),
	:global(.token.string),
	:global(.token.char),
	:global(.token.builtin),
	:global(.token.inserted) {
		color: #4ade80;
	}

	:global(.token.operator),
	:global(.token.entity),
	:global(.token.url),
	:global(.language-css .token.string),
	:global(.style .token.string) {
		color: #d6d3d1;
	}

	:global(.token.atrule),
	:global(.token.attr-value),
	:global(.token.keyword) {
		color: #60a5fa;
	}

	:global(.token.function),
	:global(.token.class-name) {
		color: #facc15;
	}

	:global(.token.regex),
	:global(.token.important),
	:global(.token.variable) {
		color: #c084fc;
	}

	:global(.token.important),
	:global(.token.bold) {
		font-weight: bold;
	}
	:global(.token.italic) {
		font-style: italic;
	}

	:global(.token.entity) {
		cursor: help;
	}
</style>
