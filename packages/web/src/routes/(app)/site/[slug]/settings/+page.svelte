<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { color } from '$lib/colors/mixer.js';
	import { show_toast } from '$lib/toast.js';
	import { Shield, CheckCircle, AlertTriangle, Copy, Trash2, Loader, RefreshCw } from 'lucide-svelte';
	import Seo from '$lib/components/generals/seo.svelte';
	import { verifySite, deleteSite } from './data.remote.js';

	let { data } = $props();
	let site = $derived(data.site);
	
	let verifying = $state(false);
	let deleting = $state(false);
	let isVerified = $state(data.site.verifiedAt);
	
	// If the verification action returned a new token (legacy case), update it locally
	let currentToken = $state(data.site.verificationToken);
	
	async function handleVerify() {
		verifying = true;
		try {
			const result = await verifySite({ siteId: site.id });
			if (result.success && result.verified) {
				isVerified = true;
				show_toast.set({ message: 'Domain verified successfully!', type: 'success' });
			} else {
				if (result.token) currentToken = result.token;
				show_toast.set({ message: result.error || 'Verification failed', type: 'error' });
			}
		} catch (err) {
			show_toast.set({ message: err.message || 'Verification failed', type: 'error' });
		} finally {
			verifying = false;
		}
	}

	async function handleDelete() {
		if (!confirm(`Are you sure you want to delete ${site.domain}? This cannot be undone.`)) {
			return;
		}
		deleting = true;
		try {
			const result = await deleteSite({ siteId: site.id });
			if (result.success && result.deleted) {
				show_toast.set({ message: 'Site deleted successfully', type: 'success' });
				goto('/sites');
			} else {
				show_toast.set({ message: result.error || 'Failed to delete site', type: 'error' });
			}
		} catch (err) {
			show_toast.set({ message: err.message || 'Failed to delete site', type: 'error' });
		} finally {
			deleting = false;
		}
	}

	function copyToken() {
		navigator.clipboard.writeText(currentToken || '');
		show_toast.set({ message: 'Token copied to clipboard', type: 'success' });
	}
</script>

<svelte:head>
	<Seo title="Site Settings - Littlestats" />
</svelte:head>

<div class="space-y-8 max-w-4xl rounded-none">
	<header class="px-2 rounded-none">
		<h1 class="text-xl font-bold text-stone-900 dark:text-white tracking-tight">Site Settings</h1>
		<p class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mt-1">Manage domain configuration</p>
	</header>

	<!-- Domain Verification -->
	<div class="rounded-none bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-8 shadow-none">
		<div class="flex items-start justify-between mb-6 rounded-none">
			<div>
				<h2 class="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-white uppercase tracking-tight">
					<Shield size={16} class="text-stone-400" />
					Domain Verification
				</h2>
				<p class="text-xs text-stone-500 mt-1">Verify ownership of <strong>{site.domain}</strong> to unlock full features.</p>
			</div>
			
			{#if isVerified}
				<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800 uppercase tracking-widest">
					<CheckCircle size={12} /> Verified
				</span>
			{:else}
				<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800 uppercase tracking-widest">
					<AlertTriangle size={12} /> Unverified
				</span>
			{/if}
		</div>

		{#if !isVerified}
			<div class="space-y-6 rounded-none">
				<div class="p-4 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-none">
					<p class="text-xs font-medium text-stone-900 dark:text-white mb-3">1. Add a TXT record to your DNS configuration:</p>
					
					<div class="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-4 text-xs font-mono rounded-none">
						<div class="space-y-1 rounded-none">
							<span class="text-[10px] font-black uppercase tracking-widest text-stone-400">Type</span>
							<div class="p-2 bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-none">TXT</div>
						</div>
						<div class="space-y-1 rounded-none">
							<span class="text-[10px] font-black uppercase tracking-widest text-stone-400">Name / Host</span>
							<div class="p-2 bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-none">@</div>
						</div>
					</div>
					
					<div class="mt-4 space-y-1 rounded-none">
						<span class="text-[10px] font-black uppercase tracking-widest text-stone-400">Value / Content</span>
						<button 
							onclick={copyToken}
							class="flex items-center justify-between w-full p-3 bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-none hover:border-stone-300 dark:hover:border-stone-600 transition-colors group text-left"
						>
							<code class="text-xs text-stone-600 dark:text-stone-300 break-all">{currentToken || 'Loading...'}</code>
							<Copy size={14} class="text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-200" />
						</button>
					</div>
				</div>

				<div>
					<p class="text-xs font-medium text-stone-900 dark:text-white mb-3">2. Verify configuration:</p>
					<button
						type="button"
						onclick={handleVerify}
						disabled={verifying}
						class={`inline-flex items-center gap-2 px-6 py-2.5 rounded-none bg-${$color}-600 text-white text-xs font-bold hover:bg-${$color}-700 transition-all shadow-none disabled:opacity-50`}
					>
						{#if verifying}
							<Loader size={14} class="animate-spin" />
							Verifying DNS...
						{:else}
							<RefreshCw size={14} />
							Verify Domain
						{/if}
					</button>
					<p class="text-[10px] text-stone-400 mt-2 italic">DNS changes may take a few minutes to propagate.</p>
				</div>
			</div>
		{:else}
			<div class="p-6 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 rounded-none">
				<div class="flex gap-3 rounded-none">
					<div class="mt-0.5 rounded-none">
						<CheckCircle size={16} class="text-green-600 dark:text-green-400" />
					</div>
					<div>
						<h3 class="text-sm font-bold text-green-900 dark:text-green-100">Domain is verified</h3>
						<p class="text-xs text-green-700 dark:text-green-300 mt-1">
							Your domain ownership has been confirmed. You can now access all features available on your plan.
						</p>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Danger Zone -->
	<div class="rounded-none bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-8 shadow-none">
		<h2 class="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-white uppercase tracking-tight mb-4 opacity-50">
			<Trash2 size={16} class="text-stone-400" />
			Danger Zone
		</h2>
		<p class="text-xs text-stone-500 mb-6">
			Deleting your site is irreversible. All analytics data, settings, and events will be permanently removed.
		</p>
		
		<button
			type="button"
			onclick={handleDelete}
			disabled={deleting}
			class="inline-flex items-center gap-2 px-6 py-2.5 rounded-none bg-stone-100 dark:bg-stone-800 text-red-600 dark:text-red-400 text-xs font-bold border border-stone-200 dark:border-stone-700 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all shadow-none disabled:opacity-50"
		>
			{#if deleting}
				<Loader size={14} class="animate-spin" />
				Deleting...
			{:else}
				Delete Site
			{/if}
		</button>
	</div>
</div>
