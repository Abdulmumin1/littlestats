<script>
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { Loader, User, Info, ChevronUp, Lock, Mail, CreditCard } from 'lucide-svelte';
	import { color } from '$lib/colors/mixer.js';
	// import { invalidateAll, goto } from '$app/navigation';
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

	onMount(async () => {
		// Simulating fetching user data from an API
		user = {
			name: data.user.name,
			email: data.user.email
		};
	});
</script>

<div class="" style="max-width:486px; padding:20px; margin-inline:auto;">
	<div class=" flex flex-1 flex-col gap-6">
		<h1 class="px-2 text-2xl font-bold dark:text-gray-100">Welcome to Littlestats</h1>

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
							disabled
							bind:value={user.email}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-{$color}-500 focus:ring-{$color}-500"
						/>
					</div>
				</div>
			</div>

			{#if data.user.sub_id}
				<div class="rounded-md bg-{$color}-200 p-4">
					<h2 class="mb-4 flex items-center text-xl font-semibold">
						<CreditCard class="mr-2" /> Subscripiton Information
					</h2>
					<p class="mb-2 text-sm text-gray-600">Currenly on <strong>Free Trial</strong></p>
					<p class="mb-2 text-sm text-gray-600">
						Choosen plan: <strong>{data.user.variant_name}</strong>
					</p>
				</div>
			{:else}
				<div class="rounded-md bg-{$color}-100 dark:bg-stone-800/50 p-4">
					<h2 class="mb-4 flex items-center text-xl font-semibold dark:text-gray-100">
						<Info class="mr-2" /> About Trial
					</h2>
					<!-- <p class="mb-2 text-sm text-gray-600">Currenly on <strong>Free Trial</strong></p> -->
					<p class="mb-2 text-sm text-gray-900 dark:text-gray-200">
						- Your trial is valid for <strong>a month</strong>.
					</p>
					<p class="mb-2 text-sm text-gray-900 dark:text-gray-200">
						- After your trial ends, we'll continue collecting analytics data from your website for
						an additional <strong>7 days</strong>.
					</p>
					<p class="mb-2 text-sm text-gray-900 dark:text-gray-200">
						- During this 7-day grace period, you can still update your billing details to continue
						using our service without loss of any analytics data.
					</p>
				</div>
			{/if}

			<div class="flex justify-end">
				<button
					type="submit"
					disabled={loading || !user.name}
					class="flex items-center justify-center gap-1 rounded-full border-2 border-black text-white bg-{$color}-500 px-6 py-2 font-bold text-black hover:bg-{$color}-600 dark:bg-{$color}-700"
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
