<script>
	import { enhance } from '$app/forms';
	import { Loader } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import Logo from '../../../lib/components/generals/logo.svelte';
	import { color } from '$lib/colors/mixer.js';
	import Seo from '../../../lib/components/generals/seo.svelte';

	let loading = false;
	let completed = false;
	let password;
	let password2;
	let email;
	let Invalid;
	let errMessage;
	let successMessage = false;

	function setError(message) {
		errMessage = message;
		setTimeout(() => {
			errMessage = '';
		}, 3000);
	}

	const handleSubmit = ({ cancel }) => {
		if (!email) {
			setError('Enter password first');
			cancel();
			return;
		}
		if (!password) {
			setError('Enter password first');
			cancel();
			return;
		}
		if (password !== password2) {
			setError('Password does not match');
			cancel();
			return;
		}
		loading = true;
		return async ({ update, result }) => {
			if (result.status == 400) {
				errMessage = result?.data;
				setTimeout(() => {
					errMessage = '';
				}, 3000);
			} else {
				completed = true;
				successMessage = result.data.message;
			}
			loading = false;
			await update();
		};
	};
</script>

<svelte:head>
	<Seo title="Signup" />
</svelte:head>
<div class=" flex min-h-screen flex-col items-center justify-center px-2">
	<a href="/" class="flex flex-col items-center">
		<Logo />
		<div class="pb-6 text-2xl font-bold text-{$color}-600 sm:mb-0 sm:text-3xl">
			Littlestats.click
		</div>
	</a>
	<form
		use:enhance={handleSubmit}
		method="post"
		action="?/register"
		class="container m-2 flex max-w-[28rem] flex-col gap-2 rounded-xl bg-{$color}-200 dark:bg-stone-800/50 p-2 px-3 md:p-5"
	>
		<p class=" mb-3 text-3xl font-semibold text-gray-800 dark:text-gray-100">Sign Up</p>
		<input
			type="email"
			bind:value={email}
			placeholder="email@example.com"
			id="email"
			name="email"
			required
			class="border-2 border-{$color}-500 rounded-xl bg-gray-100 px-2 py-3"
		/>
		<input
			type="password"
			id="password"
			bind:value={password}
			name="password"
			placeholder="password"
			required
			class="rounded-xl border-2 border-{$color}-500 bg-gray-100 px-2 py-3"
		/>
		<input
			type="password"
			id="password2"
			bind:value={password2}
			name="passwordConfirm"
			class="rounded-xl border-2 border-{$color}-500 bg-gray-100 px-2 py-3"
			placeholder="confirm password"
			required
		/>
		<button
			aria-busy={loading}
			disabled={loading}
			class="flex items-center justify-center gap-3 rounded-xl text-white bg-{$color}-500 px-4 py-3 text-black transition-colors duration-200 hover:bg-{$color}-400"
			>Signup
			{#if loading}
				<Loader class="animate-spin" size={16} />
			{/if}
		</button>
		<p class="mt-3 text-gray-800 dark:text-gray-100">
			Have an account already? <a class="text-{$color}-500" href="/signin">Signin</a>
		</p>
	</form>

	<form action="?/oauth" method="post" class="w-full max-w-[28rem]">
		<div class="my-2 text-center">OR</div>
		<button
			type="submit"
			class="flex w-full items-center justify-center gap-2 bg-{$color}-200 dark:text-gray-100 dark:bg-stone-800/50 rounded-xl border-2 p-2 border-{$color}-500"
		>
			<img width="20" src="/google-auth.svg" alt="" srcset="" />Continue with Google
		</button>
	</form>
	{#if errMessage}
		<p transition:slide class="w-full max-w-[30rem] rounded bg-red-100 p-6 text-red-500">
			{errMessage?.message ?? errMessage}
		</p>
	{/if}
	{#if successMessage}
		<p transition:slide class="w-full max-w-[30rem] rounded bg-{$color}-200 dark:bg-stone-800/50 p-6 text-{$color}-800">
			{successMessage}
		</p>
	{/if}
</div>

<style>
	.background {
		background-color: #010f0c;
	}
</style>
