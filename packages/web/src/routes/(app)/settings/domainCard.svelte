<script>
	import { Code, Link, Trash, ChevronDown, ChevronUp, ExternalLink, Loader, Globe } from 'lucide-svelte';
	import { show_toast } from '$lib/toast.js';
	import { slide } from 'svelte/transition';
	import { color } from '$lib/colors/mixer.js';
	import { api } from '$lib/api/analytics.ts';

	function copyToClipboard(text) {
		navigator.clipboard.writeText(text).then(() => {
			show_toast.set({ message: 'Copied to clipboard', type: 'success' });
		});
	}

	/**
	 * @typedef {Object} Props
	 * @property {any} domain
	 * @property {any} removeDomain
	 * @property {boolean} [hide]
	 */

	/** @type {Props} */
	let { domain, removeDomain, hide = $bindable(true) } = $props();

	let deleteModal = $state();
	let loading = $state(false);

	function showModal() {
		deleteModal.show();
	}

	function closeModal() {
		deleteModal.close();
	}

	function toggleDropdown() {
		hide = !hide;
	}

	async function handleDelete(event) {
		event.preventDefault();
		
		if (!domain?.id) {
			show_toast.set({ message: 'Invalid domain', type: 'error' });
			return;
		}

		loading = true;
		
		try {
			await api.deleteSite(domain.id);
			removeDomain(domain.name);
			show_toast.set({ message: `Domain ${domain.name} deleted!`, type: 'success' });
			closeModal();
		} catch (error) {
			console.error('Failed to delete domain:', error);
			show_toast.set({ message: error.message || 'Failed to delete domain', type: 'error' });
		} finally {
			loading = false;
		}
	}

	function generateScriptUrl(domain) {
		console.log(domain)
		return `<script src="https://stats.littlestats.click/tracker.js" data-site-id="${domain.id}"><\/script>`;
	}
</script>

<div class="flex items-center justify-between">
	<a
		href="https://{domain.name}"
		target="_blank"
		class="flex items-center gap-2 font-semibold text-stone-900 dark:text-white lowercase"
	>
		<Globe size={16} />{domain.name}
	</a>
	<button
		onclick={toggleDropdown}
		class="px-3 py-1 text-sm font-bold text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
	>
		{#if hide}
			<ChevronDown />
		{:else}
			<ChevronUp />
		{/if}
	</button>
</div>
{#if !hide}
	<div transition:slide>
		<div class="mb-2 mt-3  bg-black p-2">
			<code class="text-xs text-gray-300">{generateScriptUrl(domain)}</code>
		</div>
		<div class="flex items-center justify-end gap-2">
			<button
				onclick={() => copyToClipboard(generateScriptUrl(domain))}
				class="flex items-center gap-1 self-end bg-{$color}-600 dark:bg-{$color}-700 px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 transition-all rounded-none"
			>
				Copy Snippet <Code size={16} />
			</button>
			<a
				href="site/{domain.id}"
				class="flex items-center gap-1 self-end bg-{$color}-600 dark:bg-{$color}-700 px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 transition-all rounded-none"
			>
				Go to Dashboard <ExternalLink size={16} />
			</a>
			<button onclick={showModal} class="rounded px-3 py-1 text-sm font-bold text-stone-400">
				<Trash class="hover:text-red-500 transition-colors" size={17} />
			</button>
		</div>
	</div>
{/if}

<dialog bind:this={deleteModal} class="rounded-none border border-stone-200 dark:border-stone-800 p-0 bg-white dark:bg-stone-900 shadow-2xl">
	<form
		onsubmit={handleDelete}
		class="bg-white dark:bg-stone-950 p-8 space-y-6"
	>
		<div class="space-y-2">
			<h3 class="text-lg font-serif italic text-stone-900 dark:text-white">Remove domain</h3>
			<p class="text-sm text-stone-500 dark:text-stone-400 font-mono text-xs">{domain.name}</p>
		</div>
		
		<p class="text-sm text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-900/20 p-4 border border-red-100 dark:border-red-900/30">
			This action is irreversible! All data collected will be gone.
		</p>

		<div class="flex justify-end gap-3">
			<button 
				type="button" 
				onclick={closeModal} 
				class="px-6 py-2 text-xs font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
			>
				Cancel
			</button>
			<button
				type="submit"
				disabled={loading}
				class="flex items-center gap-2 bg-red-600 px-6 py-2 text-xs font-bold text-white hover:bg-red-700 transition-all disabled:opacity-50"
			>
				Delete Domain
				{#if loading}
					<Loader class="animate-spin" size={14} />
				{/if}
			</button>
		</div>
	</form>
</dialog>

<style>
	/* dialog::backdrop {
		filter: blur(12px);
		background-color: orange;
	} */
</style>
