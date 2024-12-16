<script>
	import { run } from 'svelte/legacy';

	import { Code, Link, Trash, ChevronDown, ChevronUp, ExternalLink, Loader } from 'lucide-svelte';
	import { show_toast } from '$lib/toast.js';
	import { slide } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import { color } from '$lib/colors/mixer.js';

	function getScriptSnippet(scriptUrl) {
		return `<script src="${scriptUrl}"></script` + `>`;
	}

	function generateScriptUrl(domain) {
		// In a real application, you'd generate a unique script URL,
		// possibly involving a backend call.
		return `<script src="https://cdn.littlestats.click/embed/${domain.id}">${'</'}script>`;
	}

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

	function showModal() {
		deleteModal.show();
	}

	function closeModal() {
		deleteModal.close();
	}
	run(() => {
		hide = hide;
	});
	function toggleDropdown() {
		hide = !hide;
	}

	let loading = $state(false);
	function handleSubmit({ cancel }) {
		if (!domain) {
			cancel();
			return;
		}
		loading = true;
		return async ({ update, result }) => {
			if (result.status != 200) {
				show_toast.set({ message: result?.data?.message, type: 'error' });
			} else {
				show_toast.set({ message: 'Domain ' + domain.name + ' deleted!', type: 'success' });
			}
			loading = false;

			closeModal();
			await update();
		};
	}
</script>

<div class=" flex items-center justify-between">
	<a
		href="https://{domain.name}"
		target="_blank"
		class="flex items-center gap-1 font-semibold text-{$color}-50"
	>
		<Link size={16} />{domain.name}
	</a>
	<button
		onclick={toggleDropdown}
		class="rounded px-3 py-1 text-sm font-bold text-black dark:text-gray-100"
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
		<div class="mb-2 mt-3 rounded-md bg-black p-2">
			<code class="text-xs text-gray-300">{generateScriptUrl(domain)}</code>
		</div>
		<div class="flex items-center justify-end gap-2">
			<button
				onclick={() => copyToClipboard(generateScriptUrl(domain))}
				class="flex items-center gap-1 self-end rounded-md text-white bg-{$color}-600 dark:bg-{$color}-700 px-2 py-1 text-xs font-bold text-gray-100 hover:bg-{$color}-600 dark:bg-{$color}-700"
			>
				Copy Snippet <Code size={16} />
			</button>
			<a
				href="site/{domain.id}"
				class="flex items-center gap-1 self-end rounded-md text-white bg-{$color}-600 dark:bg-{$color}-700 px-2 py-1 text-xs font-bold text-gray-100 hover:bg-{$color}-600 dark:bg-{$color}-700"
			>
				Go to Dashboard <ExternalLink size={16} />
			</a>
			<button onclick={showModal} class="rounded px-3 py-1 text-sm font-bold text-gray-100">
				<Trash class="hover:text-red-500" size={17} />
			</button>
		</div>
	</div>
{/if}

<dialog bind:this={deleteModal} class="rounded-2xl">
	<form
		use:enhance={handleSubmit}
		method="post"
		action="?/deleteDomain"
		class="rounded-2xl bg-{$color}-300 *:p-4"
	>
		<p>Remove domain - {domain.name}</p>
		<input type="text" class="hidden" name="id" value={domain.id} />
		<p class="bg-{$color}-100 py-2">This action is irreversible! All data collected will be gone</p>
		<div class="flex justify-end">
			<button type="button" onclick={closeModal} class="p-2">Cancel</button>
			<button
				aria-busy={loading}
				disabled={loading}
				type="submit"
				class="flex items-center gap-1 rounded-md bg-red-600 p-2"
				>Delete

				{#if loading}
					<Loader class="animate-spin" size={16} />
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
