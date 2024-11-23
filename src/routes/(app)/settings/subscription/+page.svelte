<script>
	import { onMount } from 'svelte';
	import { flip } from 'svelte/animate';
	import { show_toast } from '$lib/toast.js';
	import { CreditCard, Settings } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { fly } from 'svelte/transition';
	import { color } from '$lib/colors/mixer.js';
	import {calculateTrialDaysLeft} from '$lib/utils.js'
	let subscriptions = [];
	let newSubscriptionName = '';
	let errMessage;
	let loading = false;

	function setError(message) {
		errMessage = message;
		setTimeout(() => {
			errMessage = '';
		}, 3000);
	}

	function removeSubscription(subscriptionToRemove) {
		subscriptions = subscriptions.filter((sub) => sub.name !== subscriptionToRemove);
	}

	const handleAdd = ({ cancel }) => {
		if (!newSubscriptionName) {
			setError('License key required');
			cancel();
			return;
		}
		loading = true;
		return async ({ update, result }) => {
			if (result.status == 400) {
				loading = false;
				show_toast.set({ message: result?.data?.message, type: 'error' });
			} else {
				loading = false;
			}
			await update();
		};
	};

	export let data;
	onMount(() => {
		// Simulating fetching subscriptions from an API
		if (!data.user.sub_id) {
			
			subscriptions = [
				{
					name: 'Free Trial',
					status: `Ends in ${parseInt(calculateTrialDaysLeft(data.user.date_activated))} days`,
					renewalDate: '2024-11-01'
				}
			];
		} else {
			subscriptions = [
				{
					name: data.user?.variant_name,
					status: data.user.sub_status,
					renewalDate: '2024-11-01'
				}
			];
		}
	});
</script>

<div in:fly={{ y: 13, duration: 100 }} class="flex flex-1 flex-col gap-4">
	<!-- <div class="rounded-md">
		<h2 class="mb-4 text-xl font-semibold">Subscripiton</h2>
		<form
			use:enhance={handleAdd}
			action="?/updateSubscription"
			method="post"
			class="mb-4 flex flex-wrap gap-2"
		>
			<input
				type="text"
				bind:value={newSubscriptionName}
				placeholder="Enter license key"
				required
				name="name"
				class="flex-grow rounded-full border border-gray-600 bg-{$color}-100 p-2 text-black dark:text-gray-100 md:px-3 md:py-2"
			/>
			<button
				aria-busy={loading}
				disabled={loading}
				class="flex items-center justify-center gap-1 rounded-full border-2 border-black text-white bg-{$color}-700 px-4 py-2 font-bold text-black dark:text-gray-100 hover:bg-{$color}-700"
			>
				Activate License
				{#if loading}
					<Loader class="animate-spin" size={16} />
				{/if}
			</button>
		</form>
	</div> -->

	<div class="rounded-md">
		<h2 class="mb-4 text-xl font-semibold dark:text-gray-100">Managed Subscriptions</h2>
		{#if subscriptions.length === 0}
			<p>No subscriptions added yet.</p>
		{:else}
			<div class="flex flex-col gap-2">
				{#each subscriptions as subscription (subscription.name)}
					<div
						animate:flip={{ duration: 300 }}
						class="flex flex-col rounded-md bg-{$color}-100 dark:bg-stone-800/50 p-3 dark:text-gray-100"
					>
						<h2 class="mb-4 flex items-center text-xl font-semibold">
							<CreditCard class="mr-2" /> Subscripiton Information
						</h2>
						<div class="mb-2 flex flex-col gap-2">
							<div>
								Currently on: <span class="font-semibold">{subscription.name}</span><span></span>
							</div>
							<div class=" text-black dark:text-gray-100">
								Subscription Status: <span class="font-extrabold text-black dark:text-gray-100">
									{subscription.status}</span
								>
							</div>
						</div>
						{#if data.user.sub_id}
							<div class="flex gap-2">
								<a
									href="https://abdulmuminyqn.lemonsqueezy.com/billing"
									class="mt-2 flex gap-2 self-end rounded-full border border-black bg-{$color}-700 p-2 text-sm text-white hover:bg-{$color}-800"
								>
									<Settings size={20} />
									Manage Subscripiton
								</a>
								<button
									class="mt-2 self-end rounded-full bg-{$color}-50 p-2 text-sm text-{$color}-600 hover:text-{$color}-800"
								>
									Change Plan
								</button>
							</div>
						{/if}
						<!-- <div class="text-sm text-gray-600">Renewal: {subscription.renewalDate}</div> -->
					</div>
				{/each}
			</div>
		{/if}
	</div>

	{#if errMessage}
		<div
			class="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
			role="alert"
		>
			<span class="block sm:inline">{errMessage}</span>
		</div>
	{/if}
</div>
