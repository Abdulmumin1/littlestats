<script>
	import { enhance } from '$app/forms';
	import { Loader } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import Logo from '../../../lib/components/generals/logo.svelte';
	import { color } from '$lib/colors/mixer.js';
	import Seo from '../../../lib/components/generals/seo.svelte';

	let { form } = $props();

	let loading = $state(false);
	let completed = false;
	let password = $state('');
	let email = $state('');
	let Invalid = $state('');
	let errMessage = $state('');

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

<svelte:head>
	<Seo title="Signin" />
</svelte:head>
<div class=" flex min-h-screen flex-col items-center justify-center px-4">
	<a href="/" class="flex flex-col items-center">
		<Logo />
		<div class="pb-6 text-2xl font-bold text-{$color}-600 sm:mb-0 sm:text-3xl">
			Littlestats.click
		</div>
	</a>
	<form action="?/oauth" method="post" class="w-fit max-w-[28rem]">
		<button
			type="submit"
			class="flex w-full items-center justify-center gap-2 bg-{$color}-200 bg-opacity-35 rounded-xl p-2 dark:bg-stone-800/50 dark:text-gray-100 border-{$color}-500"
		>
			<img width="20" src="/google-auth.svg" alt="" srcset="" />Continue with Google
		</button>
		<div class="my-4 text-center dark:text-white">OR</div>
	</form>
	<form
		method="post"
		use:enhance={handleSubmit}
		action="?/login"
		class="container flex max-w-[28rem] flex-col gap-2 rounded-xl bg-{$color}-200 bg-opacity-35 p-2 px-3 md:p-5 dark:bg-stone-800/50"
	>
		<p class=" mb-3 mt-2 text-3xl font-semibold text-gray-800 dark:text-gray-100">Welcome Back</p>
		<input
			type="email"
			placeholder="email@example.com"
			name="email"
			bind:value={email}
			class="rounded-lg border-b-2 dark:bg-stone-600 dark:bg-stone-700/50 dark:text-gray-100 border-{$color}-500 bg-gray-100 px-2 py-2 text-black"
		/>
		<input
			type="password"
			placeholder="password"
			name="password"
			bind:value={password}
			class="rounded-lg border-b-2 dark:bg-stone-600 dark:bg-stone-700/50 dark:text-gray-100 border-{$color}-500 bg-gray-100 px-2 py-2 text-black"
		/>
		<button
			aria-busy={loading}
			disabled={loading}
			class="flex items-center justify-center gap-3 rounded-lg text-black bg-{$color}-500 duration-210 px-4 py-2 text-black transition-colors hover:bg-{$color}-400"
			>Login
			{#if loading}
				<Loader class="animate-spin" size={16} />
			{/if}
		</button>
		<p class="mt-3 text-gray-800 dark:text-gray-100">
			Don't have an account? <a class="text-{$color}-500" href="/signup">Signup</a>
		</p>
	</form>

	{#if errMessage}
		<p transition:slide class="bg-red-210 mt-3 w-full max-w-[30rem] rounded p-6 text-red-500">
			{errMessage?.message ?? errMessage}
		</p>
	{/if}
</div>

<style>
	.background {
		background-color: #010f0c;
	}
</style>
