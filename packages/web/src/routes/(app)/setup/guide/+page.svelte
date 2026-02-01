<script>
	import { Code, Check, ArrowRight, Copy, ExternalLink, Globe, Shield, AlertTriangle, Loader, RefreshCw, CheckCircle } from 'lucide-svelte';
	import { color } from '$lib/colors/mixer.js';
	import { show_toast } from '$lib/toast.js';
	import { goto } from '$app/navigation';
	import { verifySite } from './data.remote.js';

	let { data } = $props();
	let site = $derived(data.site);
	let copied = $state(false);
	let verifying = $state(false);
	let verificationResult = $state(null);

	let isVerified = $derived(site.verifiedAt || verificationResult?.verified);

	function generateScriptUrl(site) {
		return `<script src="https://littlestats.click/tracker.js" data-site-id="${site.domainKey}"><\/script>`;
	}

	function copyToClipboard() {
		const text = generateScriptUrl(site);
		navigator.clipboard.writeText(text).then(() => {
			show_toast.set({ message: 'Copied to clipboard', type: 'success' });
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		});
	}

	function copyToken() {
		navigator.clipboard.writeText(site.verificationToken || '');
		show_toast.set({ message: 'Token copied to clipboard', type: 'success' });
	}

	async function handleVerify() {
		verifying = true;
		try {
			const result = await verifySite({ siteId: site.id, domain: site.domain });
			verificationResult = result;
			
			if (result.verified) {
				show_toast.set({ message: 'Domain verified successfully!', type: 'success' });
			} else if (result.error) {
				show_toast.set({ message: result.error, type: 'error' });
			}
		} catch (err) {
			show_toast.set({ message: err.message || 'Verification failed', type: 'error' });
		} finally {
			verifying = false;
		}
	}

	function finishSetup() {
		if (!isVerified) {
			show_toast.set({ message: 'Please verify your domain first', type: 'error' });
			return;
		}
		goto(`/site/${site.id}`);
	}
</script>

<svelte:head>
	<title>Setup Guide - Littlestats</title>
</svelte:head>

<div class="max-w-2xl mx-auto p-6 md:p-8 space-y-8 pb-24">
	<header class="text-center space-y-2">
		<h1 class="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Setup your domain</h1>
		<p class="text-stone-500 dark:text-stone-400">
			Prove ownership of <span class="font-semibold text-stone-900 dark:text-white">{site.domain}</span> to start collecting analytics.
		</p>
	</header>

	<div class="space-y-6">
		<!-- Step 1: Domain Verification -->
		<div class="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-8 rounded-none space-y-6">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div class={`flex items-center justify-center w-8 h-8 rounded-full ${isVerified ? 'bg-green-100 text-green-700' : 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white'} font-bold text-sm transition-colors`}>
						{#if isVerified}
							<Check size={16} />
						{:else}
							1
						{/if}
					</div>
					<h3 class="font-bold text-stone-900 dark:text-white flex items-center gap-2">
						Verify Ownership
						{#if isVerified}
							<span class="text-[10px] font-black uppercase tracking-widest text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 border border-green-100 dark:border-green-800">Verified</span>
						{/if}
					</h3>
				</div>
			</div>
			
			{#if !isVerified}
				<div class="space-y-6 pl-11">
					<p class="text-sm text-stone-600 dark:text-stone-400">
						Add this TXT record to your DNS settings at your domain registrar (like Namecheap, Cloudflare, etc).
					</p>

					<div class="bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 p-4 space-y-4 rounded-none">
						<div class="grid grid-cols-[80px_1fr] gap-4 text-[11px]">
							<span class="font-black uppercase tracking-widest text-stone-400">Type</span>
							<span class="font-mono text-stone-900 dark:text-stone-100">TXT</span>
							
							<span class="font-black uppercase tracking-widest text-stone-400">Host</span>
							<span class="font-mono text-stone-900 dark:text-stone-100">@</span>
							
							<span class="font-black uppercase tracking-widest text-stone-400 self-center">Value</span>
							<div class="flex items-center justify-between gap-2 p-2 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-none group">
								<code class="font-mono text-stone-600 dark:text-stone-300 break-all">{site.verificationToken}</code>
								<button onclick={copyToken} class="text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors p-1">
									<Copy size={14} />
								</button>
							</div>
						</div>
					</div>

					<button
						onclick={handleVerify}
						disabled={verifying}
						class={`inline-flex items-center gap-2 px-8 py-3 rounded-none bg-${$color}-600 text-white text-xs font-bold hover:bg-${$color}-700 transition-all shadow-none disabled:opacity-50`}
					>
						{#if verifying}
							<Loader size={14} class="animate-spin" />
							Verifying DNS...
						{:else}
							<RefreshCw size={14} />
							Verify Domain
						{/if}
					</button>
					<p class="text-[10px] text-stone-400 italic">It may take a few minutes for DNS changes to propagate.</p>
				</div>
			{:else}
				<div class="pl-11 py-2">
					<div class="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 p-4 flex gap-3 rounded-none">
						<CheckCircle size={16} class="text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
						<div>
							<p class="text-sm font-bold text-green-900 dark:text-green-100">Success!</p>
							<p class="text-xs text-green-700 dark:text-green-300">Your domain has been verified. Now you can add the script.</p>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Step 2: Tracking Script (only enabled if verified) -->
		<div class={`bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-8 rounded-none space-y-6 transition-opacity ${!isVerified ? 'opacity-50 grayscale' : ''}`}>
			<div class="flex items-center gap-3">
				<div class="flex items-center justify-center w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white font-bold text-sm">
					2
				</div>
				<h3 class="font-bold text-stone-900 dark:text-white">Add Tracking Script</h3>
			</div>
			
			<div class="space-y-4 pl-11">
				<p class="text-sm text-stone-600 dark:text-stone-400">
					Copy and paste this snippet into the <code class="bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded text-xs">&lt;head&gt;</code> of your website.
				</p>

				<div class="relative group">
					<div class="bg-stone-950 text-stone-300 p-4 rounded-none font-mono text-xs overflow-x-auto border border-stone-800 leading-relaxed">
						{generateScriptUrl(site)}
					</div>
					<button
						onclick={copyToClipboard}
						disabled={!isVerified}
						class="absolute top-2 right-2 p-2 rounded-none bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:hidden"
						title="Copy to clipboard"
					>
						{#if copied}
							<Check size={14} class="text-green-400" />
						{:else}
							<Copy size={14} />
						{/if}
					</button>
				</div>
				
				<p class="text-[10px] text-stone-500 italic">Once added, visit your site to trigger the first event.</p>
			</div>
		</div>
	</div>

	<div class="flex justify-between items-center pt-8 border-t border-stone-100 dark:border-stone-800">
		<button 
			onclick={() => goto('/sites')}
			class="text-xs font-bold text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
		>
			Do this later
		</button>

		<button
			onclick={finishSetup}
			disabled={!isVerified}
			class={`px-10 py-4 rounded-none bg-${$color}-600 text-white text-xs font-bold hover:bg-${$color}-700 transition-all shadow-xl disabled:opacity-50 disabled:grayscale flex items-center gap-3`}
		>
			Go to Dashboard
			<ArrowRight size={16} />
		</button>
	</div>
</div>
