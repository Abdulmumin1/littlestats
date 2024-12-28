<script>
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import {
		Loader,
		User,
		ChevronDown,
		ChevronUp,
		Lock,
		Mail,
		CreditCard,
		DollarSign
	} from 'lucide-svelte';
	import { color } from '$lib/colors/mixer.js';
	import { invalidateAll, goto } from '$app/navigation';
	let user = $state({
		name: '',
		email: ''
	});

	import { browser } from '$app/environment';

	const windowWithLemonSqueezy = browser ? window : undefined;

	async function getLemonSqueezy() {
		if (!windowWithLemonSqueezy?.LemonSqueezy) {
			await loadAndInitialize();
		}
		return windowWithLemonSqueezy?.LemonSqueezy;
	}

	function loadAndInitialize() {
		return new Promise((resolve) => {
			const script = document.createElement('script');
			script.onload = function () {
				windowWithLemonSqueezy?.createLemonSqueezy();
				resolve();
			};
			script.src = 'https://assets.lemonsqueezy.com/lemon.js';

			document.head.appendChild(script);
		});
	}

	let { data = $bindable() } = $props();

	let loading = $state(false);

	let message = $state({ text: '', type: '' });

	function setMessage(text, type) {
		message = { text, type };
		setTimeout(() => {
			message = { text: '', type: '' };
		}, 3000);
	}

	const handleUpdate = ({ cancel }) => {
		loading = true;
		return async ({ result }) => {
			if (result.type === 'error') {
				setMessage(result.message, 'error');
			} else {
				data.user.name = user.name;
				setMessage('Account updated successfully!', 'success');
				window.location.href = '/sites';
			}
			loading = false;
		};
	};

	async function OpenOverlay() {
		// https://abdulmuminyqn.lemonsqueezy.com/buy/e299bea9-5573-46ea-a97b-6609a22fe7d5?embed=1
		let prod = 'e299bea9-5573-46ea-a97b-6609a22fe7d5';
		let test = 'e8c27e01-e735-44ae-aba9-95624f1c9acc';
		const checkoutUrl =
			`https://abdulmuminyqn.lemonsqueezy.com/buy/${prod}?embed=1&` +
			new URLSearchParams({
				embed: '1',
				'checkout[email]': user.email,
				'checkout[name]': user.name,
				'checkout[custom][user_id]': data.user.id
			}).toString();

		// console.log();
		const LemonSqueezy = await getLemonSqueezy();
		LemonSqueezy.Url.Open(new URL(checkoutUrl).href);
	}

	let setupComplete = false;

	let checkoutUrl = $state(data.checkout[0]);

	onMount(async () => {
		// Simulating fetching user data from an API
		console.log(data.user);
		user = {
			name: data.user.name,
			email: data.user.email
		};
		const LemonSqueezy = await getLemonSqueezy();
		LemonSqueezy.Setup({
			eventHandler: (event) => {
				// console.log(event);
				if (event.event == 'Checkout.Success') {
					setupComplete = true;
					invalidateAll();
				} else if (event == 'close' && setupComplete) {
					window.location.reload();
				}
			}
		});
	});
</script>

<div class="" style="max-width:1400px; padding:20px; margin-inline:auto;">
	<div class=" flex flex-1 flex-col gap-6">
		<h1 class="px-2 text-2xl font-bold dark:text-gray-100">
			{!data.user.sub_id ? 'Free trial expired! Update Billing' : 'Billing Info'}
		</h1>

		<form use:enhance={handleUpdate} action="?/updateUser" method="POST" class="space-y-6">
			<div class="rounded-md bg-{$color}-100/50 p-4 dark:bg-stone-800/50">
				<h2 class="mb-4 flex items-center text-xl font-semibold dark:text-gray-100">
					<User class="mr-2 " /> Account
				</h2>
				<div class="space-y-4">
					<div>
						<label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-100"
							>Name</label
						>
						<input
							type="text"
							disabled
							id="name"
							name="name"
							bind:value={user.name}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-{$color}-500 focus:ring-{$color}-500"
						/>
					</div>
					<div>
						<label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-100"
							>Email</label
						>
						<input
							type="email"
							id="email"
							disabled
							bind:value={user.email}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-{$color}-500 focus:ring-{$color}-500"
						/>
					</div>
					{#if !data.user.sub_id}
						<h1 class="flex items-center gap-1 text-2xl font-bold dark:text-gray-100">
							<DollarSign size={24} /> Prices
						</h1>
						<div class="flex gap-2">
							{#each data.checkout as checkout}
								<button
									class:border={checkoutUrl[3] == checkout[3]}
									type="button"
									class="flex bg-{$color}-300 w-fit flex-col border-{$color}-700 rounded-xl px-5 py-4 text-3xl dark:bg-stone-700/50 dark:text-gray-100"
									onclick={() => {
										checkoutUrl = checkout;
									}}
								>
									<span class="font-bold uppercase"
										>{parseInt(checkout[0]) / 100} {checkout[1]}</span
									>
									<span class="text-sm">/{checkout[2] || 'Lifetime'}</span>
								</button>
							{/each}
						</div>

						<!-- <div>
							<button
								disabled={!user.name}
								type="button"
								class="lemonsqueezy-button flex w-full items-center justify-center gap-1 rounded-full border-2 border-black text-white bg-{$color}-500 px-6 py-2 font-bold text-black hover:bg-{$color}-600 dark:bg-{$color}-700"
								onclick={OpenOverlay}>Enter Billing Details</button
							>
						</div> -->
						<div>
							<!-- <button
								disabled={!user.name}
								type="button"
								class="flex w-full items-center justify-center gap-1 rounded-full border-2 border-black text-white bg-{$color}-500 px-6 py-2 font-bold text-black hover:bg-{$color}-600 dark:bg-{$color}-700"
								onclick={OpenOverlay}>Checkout</button
							> -->
							<a
								disabled={!user.name}
								href={checkoutUrl[3]}
								class="flex w-full items-center justify-center gap-1 rounded-full border-2 border-black text-white bg-{$color}-500 px-6 py-2 font-bold text-black hover:bg-{$color}-600 dark:bg-{$color}-700"
								>Checkout - Pay {parseInt(checkoutUrl[0]) / 100}
								<span class="uppercase"> {checkoutUrl[1]}</span>
							</a>
						</div>
					{:else}
						<p class="mt-4 text-xl dark:text-gray-100">
							Looks like you already have a subscription. would you like to give us more money 🤑??
						</p>
					{/if}
				</div>
			</div>

			{#if data.user.sub_id}
				<div class="rounded-md bg-{$color}-100/50 p-4 dark:bg-stone-800/50">
					<h2 class="mb-4 flex items-center text-xl font-semibold dark:text-gray-100">
						<CreditCard class="mr-2" /> Subscripiton Information
					</h2>
					<p class="mb-2 text-sm text-gray-800 dark:text-gray-100">
						Choosen plan: <strong class="capitalize">{data.user.variant_name}</strong>
					</p>
					<p class="mb-2 text-sm text-gray-800 dark:text-gray-100">
						Renews: <strong>{data.user.renews_at}</strong>
					</p>
				</div>
				<div class="flex justify-end">
					<a
						href="/sites"
						class="flex items-center justify-center gap-1 rounded-full border-2 border-black text-white bg-{$color}-500 px-6 py-2 font-bold text-black hover:bg-{$color}-600 dark:bg-{$color}-700"
					>
						Goto To Account
					</a>
				</div>
			{:else}
				<div class="rounded-md bg-{$color}-100/50 p-4 dark:bg-stone-800/50">
					<h2 class="mb-4 flex items-center text-xl font-semibold dark:text-gray-100">
						<CreditCard class="mr-2" /> Information
					</h2>
					<p class="mb-2 text-sm text-gray-800 dark:text-gray-100">
						Feeling like you deserve a discount? email me <strong>abdulmuminyqn@gmail.com</strong>
					</p>
				</div>
			{/if}
		</form>

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
