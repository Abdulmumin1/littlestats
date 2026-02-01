<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { CheckCircle, ArrowRight } from 'lucide-svelte';
	import { color } from '$lib/colors/mixer.js';
	import { show_toast } from '$lib/toast.js';

	let { data } = $props();
	let siteId = $derived(data.siteId);
	let loading = $state(true);

	onMount(async () => {
		// Show success toast
		show_toast.set({
			message: 'Payment successful! Welcome to Pro.',
			type: 'success'
		});

		// Wait a moment then allow interaction
		setTimeout(() => {
			loading = false;
		}, 1500);
	});

	function goToDashboard() {
		if (siteId) {
			goto(`/setup/guide?siteId=${siteId}`);
		} else {
			goto('/sites');
		}
	}
</script>

<div class="max-w-xl mx-auto p-6 md:p-8">
	<div class="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
		{#if loading}
			<div class="animate-pulse">
				<div class="w-16 h-16 rounded-full bg-stone-200 dark:bg-stone-800 mb-4"></div>
				<div class="h-4 bg-stone-200 dark:bg-stone-800 rounded w-48 mb-2"></div>
				<div class="h-4 bg-stone-200 dark:bg-stone-800 rounded w-32"></div>
			</div>
		{:else}
			<div class="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
				<CheckCircle size={40} class="text-green-600 dark:text-green-400" />
			</div>
			
			<h1 class="text-2xl font-bold text-stone-900 dark:text-white tracking-tight">
				Payment Successful!
			</h1>
			
			<p class="text-stone-600 dark:text-stone-400 max-w-sm">
				Thank you for upgrading to Pro. Your subscription is now active and you have access to all premium features.
			</p>
			
			<div class="pt-4">
				<button
					onclick={goToDashboard}
					class={`inline-flex items-center gap-2 px-8 py-3 rounded-none bg-${$color}-600 text-white text-xs font-bold hover:bg-${$color}-700 transition-all shadow-none`}
				>
					{siteId ? 'Continue Setup' : 'Go to Dashboard'}
					<ArrowRight size={14} />
				</button>
			</div>
		{/if}
	</div>
</div>
