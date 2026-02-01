<script>
	import { onMount } from 'svelte';
	import {
		User,
		CreditCard,
		DollarSign
	} from 'lucide-svelte';
	import { color } from '$lib/colors/mixer.js';
	
	let user = $state({
		name: '',
		email: ''
	});

	let { data = $bindable() } = $props();

	let message = $state({ text: '', type: '' });
	let checkoutUrl = $state(data.checkout[0]);

	function setMessage(text, type) {
		message = { text, type };
		setTimeout(() => {
			message = { text: '', type: '' };
		}, 3000);
	}

	onMount(async () => {
		user = {
			name: data.user.name || '',
			email: data.user.email || ''
		};
	});
</script>

<div class="max-w-6xl mx-auto p-6 md:p-8">
	<div class="flex flex-1 flex-col gap-8">
		<header class="px-2">
			<h1 class="text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
				{!data.user.sub_id
					? 'Update Billing'
					: data.isCancelled
						? 'Subscription Cancelled'
						: 'Billing Info'}
			</h1>
			<p class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mt-1">Manage your subscription & payments</p>
		</header>

		<div class="space-y-8">
			<div class="rounded-none bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-6 shadow-none">
				<h2 class="mb-6 flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-tight rounded-none">
					<User size={16} class="text-stone-400" /> Account
				</h2>
				<div class="space-y-4 rounded-none shadow-none">
					<div class="rounded-none shadow-none">
						<label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-100 rounded-none"
							>Name</label
						>
						<input
							type="text"
							disabled
							id="name"
							name="name"
							value={user.name}
							class="mt-1 block w-full rounded-none border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-500 transition-all shadow-none"
						/>
					</div>
					<div class="rounded-none shadow-none">
						<label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-100 rounded-none"
							>Email</label
						>
						<input
							type="email"
							id="email"
							disabled
							value={user.email}
							class="mt-1 block w-full rounded-none border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-500 transition-all shadow-none"
						/>
					</div>
					
					{#if !data.user.sub_id}
						<h1 class="flex items-center gap-1 text-xl font-bold text-stone-900 dark:text-white uppercase tracking-tight pt-4 rounded-none shadow-none">
							<DollarSign size={20} class="text-stone-400" /> Prices
						</h1>
						
						{#if data.checkout && data.checkout.length > 0}
							<div class="flex gap-4 rounded-none shadow-none">
								{#each data.checkout as checkout}
									<button
										class:border-2={checkoutUrl[3] == checkout[3]}
										type="button"
										class={`flex flex-col items-start gap-1 p-6 rounded-none border transition-all text-left shadow-none ${checkoutUrl[3] == checkout[3] ? `bg-${$color}-600 border-${$color}-600 text-white` : 'bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 text-stone-900 dark:text-stone-100'}`}
										onclick={() => {
											checkoutUrl = checkout;
										}}
									>
										<span class={`text-[10px] font-black uppercase tracking-widest ${checkoutUrl[3] == checkout[3] ? 'text-white' : 'text-stone-400'}`}>
											{checkout[2] || 'Lifetime'}
										</span>
										<span class="text-2xl font-serif italic">
											${parseInt(checkout[0]) / 100} {checkout[1]}
										</span>
									</button>
								{/each}
							</div>

							<div class="pt-4 rounded-none shadow-none">
								<form method="POST" action="?/checkout">
									<input type="hidden" name="productId" value={checkoutUrl[3]} />
									<input type="hidden" name="email" value={user.email} />
									<input type="hidden" name="name" value={user.name} />
									
									<button
										type="submit"
										disabled={!user.email}
										class={`inline-flex items-center justify-center gap-2 px-8 py-3 rounded-none bg-${$color}-600 text-white text-xs font-bold hover:bg-${$color}-700 transition-all shadow-none disabled:opacity-50`}
									>
										Checkout - Pay ${parseInt(checkoutUrl[0]) / 100}
										<span class="uppercase">{checkoutUrl[1]}</span>
									</button>
								</form>
							</div>
						{:else}
							<p class="text-sm text-stone-600 dark:text-stone-400">Loading pricing options...</p>
						{/if}
					{:else if data.user.sub_status == 'active'}
						<p class="mt-4 text-sm text-stone-600 dark:text-stone-400 italic font-serif rounded-none shadow-none">
							You have an active subscription. Contact support for billing changes.
						</p>
					{:else}
						<p class="mt-4 text-sm text-red-600 dark:text-red-400 font-bold rounded-none shadow-none">
							Your subscription is cancelled. Renew below.
						</p>
						
						{#if data.checkout && data.checkout.length > 0}
							<h1 class="flex items-center gap-1 text-xl font-bold text-stone-900 dark:text-white uppercase tracking-tight pt-4 rounded-none shadow-none">
								<DollarSign size={20} class="text-stone-400" /> Prices
							</h1>
							<div class="flex gap-4 rounded-none shadow-none">
								{#each data.checkout as checkout}
									<button
										class:border-2={checkoutUrl[3] == checkout[3]}
										type="button"
										class={`flex flex-col items-start gap-1 p-6 rounded-none border transition-all text-left shadow-none ${checkoutUrl[3] == checkout[3] ? `bg-${$color}-600 border-${$color}-600 text-white` : 'bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 text-stone-900 dark:text-stone-100'}`}
										onclick={() => {
											checkoutUrl = checkout;
										}}
									>
										<span class={`text-[10px] font-black uppercase tracking-widest ${checkoutUrl[3] == checkout[3] ? 'text-white' : 'text-stone-400'}`}>
											{checkout[2] || 'Lifetime'}
										</span>
										<span class="text-2xl font-serif italic">
											${parseInt(checkout[0]) / 100} {checkout[1]}
										</span>
									</button>
								{/each}
							</div>
							<div class="pt-4 rounded-none shadow-none">
								<form method="POST" action="?/checkout">
									<input type="hidden" name="productId" value={checkoutUrl[3]} />
									<input type="hidden" name="email" value={user.email} />
									<input type="hidden" name="name" value={user.name} />
									
									<button
										type="submit"
										disabled={!user.email}
										class={`inline-flex items-center justify-center gap-2 px-8 py-3 rounded-none bg-${$color}-600 text-white text-xs font-bold hover:bg-${$color}-700 transition-all shadow-none disabled:opacity-50`}
									>
										Checkout - Pay ${parseInt(checkoutUrl[0]) / 100}
										<span class="uppercase">{checkoutUrl[1]}</span>
									</button>
								</form>
							</div>
						{/if}
					{/if}
				</div>
			</div>

			{#if data.user.sub_id}
				<div class="rounded-none bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-6 shadow-none">
					<h2 class="mb-6 flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-tight rounded-none shadow-none">
						<CreditCard size={16} class="text-stone-400" /> Subscription Information
					</h2>
					<div class="space-y-2 rounded-none text-sm shadow-none">
						{#if data.isCancelled}
							<p class="text-red-600 dark:text-red-400 font-bold rounded-none shadow-none">
								Subscription Cancelled
							</p>
						{/if}
						<p class="text-stone-600 dark:text-stone-400 rounded-none shadow-none">
							Chosen plan: <strong class="capitalize text-stone-900 dark:text-white">{data.user.variant_name}</strong>
						</p>
						{#if data.user.renews_at}
							<p class="text-stone-600 dark:text-stone-400 rounded-none shadow-none">
								Renews: <strong class="text-stone-900 dark:text-white">{new Date(data.user.renews_at).toLocaleDateString()}</strong>
							</p>
						{/if}
					</div>
				</div>
				<div class="flex justify-end rounded-none shadow-none">
					<a
						href="/sites"
						class={`px-8 py-3 rounded-none bg-${$color}-600 text-white text-xs font-bold hover:bg-${$color}-700 transition-all shadow-none`}
					>
						Go to Dashboard
					</a>
				</div>
			{:else}
				<!-- <div class="rounded-none bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-6 shadow-none">
					<h2 class="mb-6 flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-tight rounded-none shadow-none">
						<CreditCard size={16} class="text-stone-400" /> Support
					</h2>
					<p class="text-sm text-stone-600 dark:text-stone-400 rounded-none shadow-none">
						Feeling like you deserve a discount? Email us at <strong class="text-stone-900 dark:text-white underline">abdulmuminyqn@gmail.com</strong>
					</p>
				</div> -->
			{/if}
		</div>

		{#if message.text}
			<div
				class={`rounded-md p-4 ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-{$color}-100/50 text-{$color}-700'}`}
				role="alert"
			>
				<p class="font-medium">{message.text}</p>
			</div>
		{/if}
	</div>
</div>

<style>
	input {
		padding: 0.4rem;
	}
</style>
