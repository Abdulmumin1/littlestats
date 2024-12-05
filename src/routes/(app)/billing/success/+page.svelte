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
		DollarSign,
		Heart
	} from 'lucide-svelte';
	import { color } from '$lib/colors/mixer.js';
	import { confetti } from '@neoconfetti/svelte';

	import { invalidateAll, goto } from '$app/navigation';
	let user = $state({
		name: '',
		email: ''
	});

	let { data = $bindable() } = $props();

	let loading = $state(false);

	let pop = $state(false);

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

	// async function OpenOverlay() {
	// 	// https://abdulmuminyqn.lemonsqueezy.com/buy/e299bea9-5573-46ea-a97b-6609a22fe7d5?embed=1
	// 	let prod = 'e299bea9-5573-46ea-a97b-6609a22fe7d5';
	// 	let test = 'e8c27e01-e735-44ae-aba9-95624f1c9acc';
	// 	const checkoutUrl =
	// 		`https://abdulmuminyqn.lemonsqueezy.com/buy/${prod}?embed=1&` +
	// 		new URLSearchParams({
	// 			embed: '1',
	// 			'checkout[email]': user.email,
	// 			'checkout[name]': user.name,
	// 			'checkout[custom][user_id]': data.user.id
	// 		}).toString();

	// 	// console.log();
	// 	const LemonSqueezy = await getLemonSqueezy();
	// 	LemonSqueezy.Url.Open(new URL(checkoutUrl).href);
	// }

	onMount(async () => {
		// setTimeout(() => {
		// 	pop = true;
		// }, 1000);
		// Simulating fetching user data from an API
		// console.log(data.user);
		// user = {
		// 	name: data.user.name,
		// 	email: data.user.email
		// };
		// const LemonSqueezy = await getLemonSqueezy();
		// LemonSqueezy.Setup({
		// 	eventHandler: (event) => {
		// 		// console.log(event);
		// 		if (event.event == 'Checkout.Success') {
		// 			setupComplete = true;
		// 			invalidateAll();
		// 		} else if (event == 'close' && setupComplete) {
		// 			window.location.reload();
		// 		}
		// 	}
		// });
	});
</script>

<div class="" style="max-width:1300px; padding:20px; margin-inline:auto;">
	{#key pop}
		<div class="mx-auto" use:confetti={{ duration: 3000 }}></div>
	{/key}
	<div class=" flex flex-1 flex-col gap-6">
		<h1 class="px-2 text-2xl font-bold dark:text-gray-100">Thanks for your purchase</h1>

		<form use:enhance={handleUpdate} action="?/updateUser" method="POST" class="space-y-6">
			{#if data.user.sub_id}
				<div class="rounded-xl bg-{$color}-100 p-4 dark:bg-stone-800/50">
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
						Goto To Account &nbsp;&nbsp;❤
					</a>
				</div>
			{/if}
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

<button
	onclick={() => {
		pop = !pop;
	}}
	class="fixed bottom-12 p-4 bg-{$color}-600 rounded-full text-gray-100 dark:bg-{$color}-700"
	><Heart /></button
>

<style>
	input {
		padding: 0.4rem;
	}
</style>
