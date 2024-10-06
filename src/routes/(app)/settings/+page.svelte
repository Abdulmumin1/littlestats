<script>
	import { onMount } from 'svelte';
	import { flip } from 'svelte/animate';
	import { show_toast } from '$lib/toast.js';
	import { Code, Link, Trash, Loader } from 'lucide-svelte';
	import DomainCard from './domainCard.svelte';
	import UserSetting from './userSetting.svelte';
	import { enhance } from '$app/forms';
	import { fly } from 'svelte/transition';
	import { color } from '$lib/colors/mixer.js';

	let domains = [];

	let newDomainName = '';

	function removeDomain(domainToRemove) {
		domains = domains.filter((domain) => domain.name !== domainToRemove);
	}

	let errMessage;

	function setError(message) {
		errMessage = message;
		setTimeout(() => {
			errMessage = '';
		}, 3000);
	}

	let loading = false;

	const handleAdd = ({ cancel }) => {
		if (!newDomainName) {
			setError('Domain name required');
			cancel();
			return;
		}

		loading = true;
		return async ({ update, result }) => {
			if (result.status == 400) {
				loading = false;
				show_toast.set({ message: result?.data?.message, type: 'error' });

				// console.log(result.data);
			} else {
				// addDomain(result.data);
				loading = false;
			}
			await update();
		};
	};

	export let data;
	$: data = data;
	$: domains = [...data.records];

	onMount(() => {});
</script>

<div in:fly={{ y: 13, duration: 100 }} class="flex flex-1 flex-col gap-4">
	<div class=" rounded-md">
		<h2 class="mb-4 text-xl font-semibold">Add New Domain</h2>
		<form
			use:enhance={handleAdd}
			action="?/updateDomain"
			method="post"
			class="mb-4 flex flex-wrap gap-2"
		>
			<input
				type="text"
				bind:value={newDomainName}
				placeholder="Enter new domain"
				required
				name="name"
				class="flex-grow rounded-full border border-gray-600 bg-{$color}-100 p-2 text-black md:px-3 md:py-2"
			/>
			<button
				aria-busy={loading}
				disabled={loading}
				class="flex items-center justify-center gap-1 rounded-full border-2 border-black bg-{$color}-500 px-4 py-2 font-bold text-black hover:bg-{$color}-700"
			>
				Add Domain {#if loading}
					<Loader class="animate-spin" size={16} />
				{/if}
			</button>
		</form>
	</div>

	<div class="b] rounded-md">
		<h2 class="mb-4 text-xl font-semibold">Managed Domains</h2>
		{#if domains.length === 0}
			<p>No domains added yet.</p>
		{:else}
			<div class="flex flex-col gap-2">
				{#each domains as domain (domain)}
					<div
						animate:flip={{ duration: 300 }}
						class="flex flex-col rounded-md bg-{$color}-200 p-3"
					>
						<DomainCard {domain} hide={domain?.hide ?? true} {removeDomain} />
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
