<script>
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { fly, slide } from 'svelte/transition';
	import { Loader, User, ChevronDown, ChevronUp, Lock, Mail, CreditCard } from 'lucide-svelte';
	import { color } from '$lib/colors/mixer.js';
	import { page } from '$app/stores';

	let user = {
		name: '',
		email: '',
		password: '',
		newPassword: '',
		confirmPassword: ''
	};

	export let data;

	let password_slide = false;
	let loading = false;
	let license_key = $page.url.searchParams.get('key');

	let message = { text: '', type: '' };

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
			}
			loading = false;
		};
	};

	function OpenOverlay() {
		// https://abdulmuminyqn.lemonsqueezy.com/buy/e299bea9-5573-46ea-a97b-6609a22fe7d5?embed=1

		const checkoutUrl =
			'https://abdulmuminyqn.lemonsqueezy.com/buy/e299bea9-5573-46ea-a97b-6609a22fe7d5?embed=1&' +
			new URLSearchParams({
				embed: '1',
				'checkout[email]': user.email,
				'checkout[name]': user.name,
				'checkout[custom][user_id]': data.user.id
			}).toString();

		// console.log();
		LemonSqueezy.Url.Open(new URL(checkoutUrl).href);
	}

	onMount(() => {
		// Simulating fetching user data from an API
		console.log(data.user);
		user = {
			name: data.user.name,
			email: data.user.email,
			password: '********',
			newPassword: '',
			confirmPassword: ''
		};
		LemonSqueezy.Setup({
			eventHandler: (event) => {
				console.log(event);
				if (event.event == 'Checkout.Success') {
				}
			}
		});
	});
</script>

<svelte:head>
	<script src="https://assets.lemonsqueezy.com/lemon.js" defer></script>
</svelte:head>
<div class="" style="max-width:486px; padding:20px; margin-inline:auto;">
	<div class=" flex flex-1 flex-col gap-6">
		<h1 class="px-2 text-2xl font-bold">Welcome to Littlestats</h1>

		<form use:enhance={handleUpdate} action="?/updateUser" method="POST" class="space-y-6">
			<div class="rounded-md bg-{$color}-200 p-4">
				<h2 class="mb-4 flex items-center text-xl font-semibold">
					<User class="mr-2" /> Account
				</h2>
				<div class="space-y-4">
					<div>
						<label for="name" class="block text-sm font-medium text-gray-700">Name</label>
						<input
							type="text"
							id="name"
							name="name"
							bind:value={user.name}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-{$color}-500 focus:ring-{$color}-500"
						/>
					</div>
					<div>
						<label for="email" class="block text-sm font-medium text-gray-700">Email</label>
						<input
							type="email"
							id="email"
							name="email"
							bind:value={user.email}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-{$color}-500 focus:ring-{$color}-500"
						/>
					</div>

					<div>
						<button
							class="lemonsqueezy-button flex w-full items-center justify-center gap-1 rounded-full border-2 border-black text-white bg-{$color}-500 px-6 py-2 font-bold text-black hover:bg-{$color}-700"
							on:click={OpenOverlay}>Enter Billing Details</button
						>
					</div>
				</div>
			</div>

			<div class="rounded-md bg-{$color}-200 p-4">
				<h2 class="mb-4 flex items-center text-xl font-semibold">
					<CreditCard class="mr-2" /> Subscripiton Information
				</h2>
				<p class="mb-2 text-sm text-gray-600">Currenly on <strong>Free Trial</strong></p>
				<p class="mb-2 text-sm text-gray-600">Choosen plan: <strong>Montly Plan</strong></p>
			</div>

			<div class="flex justify-end">
				<button
					type="submit"
					disabled={loading}
					class="flex items-center justify-center gap-1 rounded-full border-2 border-black text-white bg-{$color}-500 px-6 py-2 font-bold text-black hover:bg-{$color}-700"
				>
					Activate Account
					{#if loading}
						<Loader class="animate-spin" size={16} />
					{/if}
				</button>
			</div>
		</form>

		{#if message.text}
			<div
				class={`rounded-md p-4 ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-{$color}-100 text-{$color}-700'}`}
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
