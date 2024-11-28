<script>
	import { run } from 'svelte/legacy';

	import { onMount } from 'svelte';
	import { flip } from 'svelte/animate';
	import { show_toast } from '$lib/toast.js';
	import { Code, Link, Trash, Loader, ArrowRight } from 'lucide-svelte';
	import DomainCard from './domainCard.svelte';
	import UserSetting from './userSetting.svelte';
	import { enhance } from '$app/forms';
	import { fly, slide } from 'svelte/transition';
	import { color } from '$lib/colors/mixer.js';

	let domains = $state([]);

	let newDomainName = $state('');

	function removeDomain(domainToRemove) {
		domains = domains.filter((domain) => domain.name !== domainToRemove);
	}

	let errMessage = $state();

	function setError(message) {
		errMessage = message;
		setTimeout(() => {
			errMessage = '';
		}, 3000);
	}

	let loading = $state(false);

	function verifyURL(url) {
		let c_url = url;
		if (!url.startsWith('https://') || !url.startsWith('http://')) {
			c_url = 'https://' + url;
		}
		try {
			let x_url = new URL(c_url);
			return x_url.host;
		} catch {
			return false;
		}
	}

	const handleAdd = ({ cancel }) => {
		if (!newDomainName) {
			setError('Domain name required');
			cancel();
			return;
		}
		let domainc = verifyURL(newDomainName);
		if (!domainc) {
			setError('Invalid domain name');
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

	let { data = $bindable() } = $props();
	run(() => {
		data = data;
	});
	run(() => {
		domains = [...data.records];
	});

	onMount(() => {});
</script>

<div in:fly={{ y: 13, duration: 100 }} class="flex flex-1 flex-col gap-4">
	<div class=" rounded-md bg-{$color}-100 p-4 dark:bg-stone-800/50 dark:text-gray-100">
		<h2 class="mb-4 text-xl font-semibold">Add New Domain</h2>
		<form
			use:enhance={handleAdd}
			action="?/updateDomain"
			method="post"
			class="mb-4 flex flex-wrap gap-2"
		>
			<input
				type="url"
				bind:value={newDomainName}
				placeholder="Enter new domain"
				required
				name="name"
				class="flex-grow rounded-full border border-gray-600 bg-{$color}-50 p-2 text-black md:px-3 md:py-2 dark:bg-stone-600 dark:bg-stone-700/50 dark:text-gray-100"
			/>
			<button
				aria-busy={loading}
				disabled={loading}
				class="flex items-center justify-center gap-1 rounded-full border-2 border-black text-gray-100 bg-{$color}-600 dark:bg-{$color}-700 px-4 py-2 font-bold hover:bg-{$color}-600 dark:bg-{$color}-700"
			>
				Add Domain {#if loading}
					<Loader class="animate-spin" size={16} />
				{/if}
			</button>
		</form>
		{#if errMessage}
			<p transition:slide>{errMessage}</p>
		{/if}
	</div>

	<div class="b] rounded-md">
		<h2 class="mb-4 text-xl font-semibold dark:text-white">Managed Domains</h2>
		{#if domains.length === 0}
			<p class="dark:text-gray-100">No domains added yet.</p>
		{:else}
			<div class="flex flex-col gap-2">
				{#each domains as domain (domain)}
					<div
						animate:flip={{ duration: 300 }}
						class="flex flex-col rounded-md bg-{$color}-100 p-3 dark:bg-stone-800/50 dark:text-gray-100"
					>
						<DomainCard {domain} hide={domain?.hide ?? true} {removeDomain} />
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<div class="mt-12 inline-flex items-center gap-2 dark:text-white">
		<ArrowRight /> Read
		<a href="/docs" class="text-{$color}-700 dark:bg-gray-50"> Littlestats docs</a> for interation guide
	</div>
</div>
