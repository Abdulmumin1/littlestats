<script>
	import { onMount } from 'svelte';
	import { flip } from 'svelte/animate';
	import { show_toast } from '$lib/toast.js';
	import { CreditCard, Settings, Calendar, Clock, Receipt, ExternalLink, BarChart2, Globe } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { fly } from 'svelte/transition';
	import { color } from '$lib/colors/mixer.js';
	import { formatDate } from '$lib/utils.js';
	import Seo from '$lib/components/generals/seo.svelte';
	
	let subscriptions = $state([]);
	let usage = $state(null);
	let loadingPortal = $state(false);
	let errMessage = $state();

	function setError(message) {
		errMessage = message;
		setTimeout(() => {
			errMessage = '';
		}, 3000);
	}

	let { data, form } = $props();
	
	// Format subscription data for display
	function formatSubscriptionData(userData) {
		if (!userData.sub_id) {
			return [{
				name: 'Free Plan',
				status: 'Standard',
				type: 'free'
			}];
		}

		const details = userData.subscriptionDetails;
		const dodo = details?.dodoDetails;

		return [{
			name: userData.variant_name,
			status: userData.sub_status,
			renewalDate: userData.renews_at,
			type: 'paid',
			provider: userData.provider,
			// Additional details
			periodStart: details?.periodStart,
			periodEnd: details?.periodEnd,
			createdAt: details?.createdAt,
			cancelAtPeriodEnd: details?.cancelAtPeriodEnd,
			// Dodo-specific
			billingInterval: dodo?.billingInterval,
			nextPaymentDate: dodo?.nextPaymentDate,
			totalPayments: dodo?.totalPayments,
			trialEnd: dodo?.trialEnd,
			paymentMethod: dodo?.paymentMethod
		}];
	}

	onMount(() => {
		subscriptions = formatSubscriptionData(data.user);
		usage = data.usage;
	});

	// Handle form errors
	$effect(() => {
		if (form?.error) {
			setError(form.error);
		}
	});
</script>

<svelte:head>
	<Seo title="Subscription - Littlestats" />
</svelte:head>

<div in:fly={{ y: 13, duration: 100 }} class="flex flex-1 flex-col gap-8 rounded-none">
	<header class="px-2 rounded-none">
		<h1 class="text-xl font-bold text-stone-900 dark:text-white tracking-tight rounded-none">Manage Your Subscription</h1>
		<p class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mt-1 rounded-none">View billing details and manage your plan</p>
	</header>

	<div class="space-y-6">
		{#if subscriptions.length === 0}
			<p class="px-4 text-sm text-stone-500 italic font-serif">Loading subscription data...</p>
		{:else}
			<div class="flex flex-col gap-8">
				{#each subscriptions as subscription (subscription.name)}
					<div
						animate:flip={{ duration: 300 }}
						class="flex flex-col bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-8 rounded-none shadow-none"
					>
						<div class="flex items-start justify-between mb-8">
							<div class="space-y-1">
								<h2 class="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-white uppercase tracking-tight rounded-none">
									<CreditCard size={16} class="text-stone-400" />
									Subscription Information
								</h2>
								<p class="text-[10px] font-black uppercase tracking-widest text-stone-400">Current Status</p>
							</div>
							<span class="px-3 py-1 text-[10px] font-black uppercase tracking-widest border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 text-stone-600 dark:text-stone-400">
								{subscription.status}
							</span>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
							<div class="space-y-1">
								<p class="text-[10px] font-black uppercase tracking-widest text-stone-400">Plan Type</p>
								<p class="text-2xl font-serif italic text-stone-900 dark:text-white capitalize">{subscription.name}</p>
							</div>
							
							{#if subscription.renewalDate}
								<div class="space-y-1">
									<p class="text-[10px] font-black uppercase tracking-widest text-stone-400">
										{subscription.cancelAtPeriodEnd ? 'Expires On' : 'Next Renewal'}
									</p>
									<p class="text-2xl font-serif italic text-stone-900 dark:text-white">
										{formatDate(subscription.renewalDate)}
									</p>
								</div>
							{/if}
						</div>

						<!-- Usage Stats -->
						{#if usage}
							<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 pt-8 border-t border-stone-100 dark:border-stone-800">
								<div class="space-y-3">
									<div class="flex justify-between items-end">
										<p class="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-1">
											<Globe size={12} /> Sites Used
										</p>
										<p class="text-xs font-bold text-stone-900 dark:text-white">
											{usage.usage.sites} / {usage.limits.sites}
										</p>
									</div>
									<div class="h-2 w-full bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
										<div 
											class={`h-full bg-${$color}-600 transition-all duration-500`}
											style={`width: ${Math.min((usage.usage.sites / usage.limits.sites) * 100, 100)}%`}
										></div>
									</div>
								</div>

								<div class="space-y-3">
									<div class="flex justify-between items-end">
										<p class="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-1">
											<BarChart2 size={12} /> Monthly Events
										</p>
										<p class="text-xs font-bold text-stone-900 dark:text-white">
											{new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(usage.usage.events)} / {new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(usage.limits.events)}
										</p>
									</div>
									<div class="h-2 w-full bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
										<div 
											class={`h-full bg-${$color}-600 transition-all duration-500`}
											style={`width: ${Math.min((usage.usage.events / usage.limits.events) * 100, 100)}%`}
										></div>
									</div>
								</div>
							</div>
						{/if}

						<!-- Additional Subscription Details -->
						{#if subscription.type === 'paid'}
							<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-white dark:bg-stone-950 border border-stone-100 dark:border-stone-800">
								{#if subscription.billingInterval}
									<div class="space-y-1">
										<p class="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-1">
											<Receipt size={12} /> Billing Interval
										</p>
										<p class="text-sm font-medium text-stone-900 dark:text-white capitalize">{subscription.billingInterval}</p>
									</div>
								{/if}
								
								{#if subscription.nextPaymentDate}
									<div class="space-y-1">
										<p class="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-1">
											<Calendar size={12} /> Next Payment
										</p>
										<p class="text-sm font-medium text-stone-900 dark:text-white">{formatDate(subscription.nextPaymentDate)}</p>
									</div>
								{/if}
								
								{#if subscription.totalPayments !== undefined}
									<div class="space-y-1">
										<p class="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-1">
											<Clock size={12} /> Total Payments
										</p>
										<p class="text-sm font-medium text-stone-900 dark:text-white">{subscription.totalPayments}</p>
									</div>
								{/if}
								
								{#if subscription.trialEnd}
									<div class="space-y-1">
										<p class="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-1">
											<Calendar size={12} /> Trial Ends
										</p>
										<p class="text-sm font-medium text-stone-900 dark:text-white">{formatDate(subscription.trialEnd)}</p>
									</div>
								{/if}
								
								{#if subscription.createdAt}
									<div class="space-y-1">
										<p class="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-1">
											<Calendar size={12} /> Subscribed On
										</p>
										<p class="text-sm font-medium text-stone-900 dark:text-white">{formatDate(subscription.createdAt)}</p>
									</div>
								{/if}
							</div>
						{/if}

						<div class="flex gap-3 pt-6 border-t border-stone-100 dark:border-stone-800">
							{#if subscription.type === 'free'}
								<a
									href="/billing"
									class={`inline-flex items-center gap-2 px-8 py-3 rounded-none bg-${$color}-600 text-white text-xs font-bold hover:bg-${$color}-700 transition-all shadow-none`}
								>
									Upgrade to Pro
								</a>
							{:else}
								<form method="POST" action="?/portal">
									<button
										type="submit"
										disabled={loadingPortal}
										class={`inline-flex items-center gap-2 px-8 py-3 rounded-none bg-${$color}-600 text-white text-xs font-bold hover:bg-${$color}-700 transition-all shadow-none disabled:opacity-50`}
									>
										<Settings size={14} />
										Manage Billing Portal
										<ExternalLink size={12} />
									</button>
								</form>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	{#if errMessage}
		<div
			class="p-4 rounded-none text-xs font-bold uppercase tracking-widest text-center bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30 shadow-none"
			role="alert"
		>
			{errMessage}
		</div>
	{/if}
</div>
