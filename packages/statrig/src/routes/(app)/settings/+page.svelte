<script>
	import { flip } from 'svelte/animate';
	import { show_toast } from '$lib/toast.js';
	import { Loader, ArrowRight, Plus } from 'lucide-svelte';
	import DomainCard from './domainCard.svelte';
	import { fly, slide } from 'svelte/transition';
	import { color } from '$lib/colors/mixer.js';
	import Seo from '../../../lib/components/generals/seo.svelte';
	import { api } from '$lib/api/analytics.ts';

	let domains = $state([]);
	let newDomainName = $state('');
	let errMessage = $state('');
	let loading = $state(false);

	function removeDomain(domainToRemove) {
		domains = domains.filter((domain) => domain.name !== domainToRemove);
	}

	function setError(message) {
		errMessage = message;
		setTimeout(() => {
			errMessage = '';
		}, 3000);
	}

	function verifyURL(url) {
		let c_url = url;
		if (!url.startsWith('https://') && !url.startsWith('http://')) {
			c_url = 'https://' + url;
		}
		try {
			let x_url = new URL(c_url);
			return x_url.host;
		} catch {
			return false;
		}
	}

	async function handleAddDomain(event) {
		event.preventDefault();
		
		if (!newDomainName) {
			setError('Domain name required');
			return;
		}
		
		const domainName = verifyURL(newDomainName);
		if (!domainName) {
			setError('Invalid domain name');
			return;
		}

	

		loading = true;
		errMessage = '';
		
		try {
			const result = await api.createSite({
				domain: domainName,
				name: domainName
			});
			
			// Add new domain to list
			domains = [...domains, {
				id: result.id,
				name: result.domain,
				domain: result.domain,
				unique_key: result.domainKey,
				hide: true
			}];
			
			newDomainName = '';
			show_toast.set({ message: `Domain ${result.domain} added successfully!`, type: 'success' });
		} catch (error) {
			console.error('Failed to add domain:', error);
			setError(error.message || 'Failed to add domain');
			show_toast.set({ message: error.message || 'Failed to add domain', type: 'error' });
		} finally {
			loading = false;
		}
	}

	let { data } = $props();
	
	$effect(() => {
		domains = [...data.records];
	});
</script>

<svelte:head>
	<Seo title="Domain Setting - Littlestats" />
</svelte:head>

<div in:fly={{ y: 13, duration: 100 }} class="flex flex-1 flex-col gap-8">
	<header class="px-2">
		<h1 class="text-xl font-bold text-stone-900 dark:text-white tracking-tight">Domain Management</h1>
		<p class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mt-1">Add and manage your tracked websites</p>
	</header>

	<div class=" bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-6">
		<h2 class="mb-6 flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-white uppercase tracking-tight">
			<Plus size={16} class="text-stone-400" />
			Add New Domain
		</h2>
		<form
			onsubmit={handleAddDomain}
			class="mb-4 flex flex-wrap gap-3"
		>
			<input
				type="url"
				bind:value={newDomainName}
				placeholder="https://example.com"
				required
				name="name"
				class="flex-grow  border text-black dark:text-white border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-500 transition-all"
			/>
			<button
				type="submit"
				disabled={loading}
				class="flex items-center justify-center gap-2  bg-{$color}-600 text-white px-6 py-2.5 text-sm font-bold hover:bg-${$color}-700 transition-all disabled:opacity-50"
			>
				Add Domain {#if loading}
					<Loader class="animate-spin" size={14} />
				{/if}
			</button>
		</form>
		{#if errMessage}
			<p transition:slide class="text-xs font-bold text-red-600 dark:text-red-400 ml-4">{errMessage}</p>
		{/if}
	</div>

	<div class="space-y-4">
		<h2 class="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Managed Domains ({domains.length}/5)</h2>
		{#if domains.length === 0}
			<p class="px-4 text-sm text-stone-500 italic font-serif">No domains added yet.</p>
		{:else}
			<div class="space-y-3">
				{#each domains as domain (domain)}
					<div
						animate:flip={{ duration: 300 }}
						class="flex flex-col bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 px-3 py-3"
					>
						<DomainCard {domain} hide={domain?.hide ?? true} {removeDomain} />
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<div class="mt-12 inline-flex items-center gap-2 text-stone-900 dark:text-white">
		<ArrowRight /> Read
		<a href="/docs" class={`text-${$color}-600 dark:text-white hover:underline underline-offset-4 font-bold`}> Littlestats docs</a> for integration guide
	</div>
</div>
