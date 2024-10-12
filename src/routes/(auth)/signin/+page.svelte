<script>
	import { enhance } from '$app/forms';
	import { Loader } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import Logo from '../../../lib/components/generals/logo.svelte';
	import { color } from '$lib/colors/mixer.js';

	export let form;

	let loading = false;
	let completed = false;
	let password;
	let email;
	let Invalid;
	let errMessage;

	function setError(message) {
		errMessage = message;
		setTimeout(() => {
			errMessage = '';
		}, 3000);
	}

	const handleSubmit = ({ cancel }) => {
		if (!password) {
			setError('Enter password first');
			cancel();
			return;
		}
		loading = true;
		return async ({ update, result }) => {
			if (result.status == 400) {
				loading = false;
				errMessage = result?.data;
				setTimeout(() => {
					errMessage = '';
				}, 3000);
			} else {
				completed = true;
			}
			await update();
		};
	};
</script>

<div class=" flex min-h-screen flex-col items-center justify-center px-4">
	<a href="/" class="flex flex-col items-center">
		<Logo />
		<div class="pb-6 text-2xl font-bold text-{$color}-600 sm:mb-0 sm:text-3xl">
			Littlestats.click
		</div>
	</a>
	<form
		method="post"
		use:enhance={handleSubmit}
		action="?/login"
		class="container flex max-w-[28rem] flex-col rounded-xl bg-{$color}-200 p-2 px-3 md:p-5"
	>
		<p class=" mb-3 mt-2 text-3xl font-semibold text-gray-800">Welcome Back</p>
		<input
			type="email"
			placeholder="email@example.com"
			name="email"
			bind:value={email}
			class="rounded-t-md bg-gray-100 px-2 py-3 text-black"
		/>
		<input
			type="password"
			placeholder="password"
			name="password"
			bind:value={password}
			class="border-t-2 border-{$color}-500 bg-gray-100 px-2 py-3 text-black"
		/>
		<button
			aria-busy={loading}
			disabled={loading}
			class="flex items-center justify-center gap-3 rounded-b-md bg-{$color}-500 px-4 py-3 text-black transition-colors duration-200 hover:bg-{$color}-400"
			>Login
			{#if loading}
				<Loader class="animate-spin" size={16} />
			{/if}
		</button>
		<p class="mt-3 text-gray-800">
			Don't have an account? <a class="text-{$color}-500" href="/signup">Signup</a>
		</p>
	</form>
	{#if errMessage}
		<p transition:slide class="mt-3 w-full max-w-[30rem] rounded bg-red-200 p-6 text-red-500">
			{errMessage?.message ?? errMessage}
		</p>
	{/if}
</div>

<style>
	.background {
		background-color: #010f0c;
	}
</style>
