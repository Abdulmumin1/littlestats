<script>
	import { goto } from '$app/navigation';
	import { Loader } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import Logo from '../../../lib/components/generals/logo.svelte';
	import { color } from '$lib/colors/mixer.js';
	import Seo from '../../../lib/components/generals/seo.svelte';
	import { signIn, getCallbackURL } from '$lib/auth.ts';

	let { data } = $props();

	let loading = $state(false);
	let password = $state('');
	let email = $state('');
	let errMessage = $state('');

	function setError(message) {
		errMessage = message;
		setTimeout(() => {
			errMessage = '';
		}, 3000);
	}

	async function handleEmailSignIn(event) {
		event.preventDefault();
		
		if (!email || !password) {
			setError('Please enter both email and password');
			return;
		}

		loading = true;
		errMessage = '';

		try {
			const callbackURL = getCallbackURL(data.redirectTo || '/sites');
			const result = await signIn.email({
				email,
				password,
				callbackURL
			});

			if (result.error) {
				setError(result.error.message || 'Login failed');
			} else {
				// Successful login - better-auth handles the redirect
				goto(data.redirectTo || '/sites');
			}
		} catch (error) {
			console.error('Sign in error:', error);
			setError(error.message || 'An error occurred during sign in');
		} finally {
			loading = false;
		}
	}

	async function handleGoogleSignIn() {
		loading = true;
		
		try {
			const callbackURL = getCallbackURL(data.redirectTo || '/sites');
			await signIn.social({
				provider: 'google',
				callbackURL
			});
		} catch (error) {
			console.error('Google sign in error:', error);
			setError(error.message || 'Failed to sign in with Google');
			loading = false;
		}
	}
</script>

<svelte:head>
	<Seo title="Signin" />
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center px-4">
	<div
		class="w-full max-w-md border border-black/10 bg-white/80 p-8 backdrop-blur-md dark:border-white/10 dark:bg-stone-900/80"
	>
		<a href="/" class="mb-8 flex flex-col items-center gap-2">
			<Logo />
			<div class="text-2xl font-black tracking-tight text-black dark:text-white">
				Littlestats.click
			</div>
		</a>

		<button
			onclick={handleGoogleSignIn}
			disabled={loading}
			class="group relative flex w-full items-center justify-center gap-2 border border-black/10 bg-{$color}-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 dark:border-white/20 disabled:opacity-50"
		>
			<img width="20" src="/google-auth.svg" alt="" class="brightness-0 invert" />
			Continue with Google
		</button>

		<!-- Email/Password Auth commented out for now -->
		<!--
		<div class="my-6 flex items-center gap-4 text-xs font-medium uppercase tracking-widest text-black/40 dark:text-white/40">
			<div class="h-px flex-1 bg-black/10 dark:bg-white/10"></div>
			OR
			<div class="h-px flex-1 bg-black/10 dark:bg-white/10"></div>
		</div>

		<form onsubmit={handleEmailSignIn} class="flex flex-col gap-4">
			<div class="space-y-1">
				<label for="email" class="text-xs font-bold uppercase tracking-wider text-black/60 dark:text-white/60">Email Address</label>
				<input
					id="email"
					type="email"
					placeholder="email@example.com"
					bind:value={email}
					class="w-full border border-black/10 bg-white/50 px-4 py-2 text-black outline-hidden focus:border-{$color}-500 dark:border-white/10 dark:bg-stone-800/50 dark:text-white dark:focus:border-{$color}-500"
				/>
			</div>
			<div class="space-y-1">
				<label for="password" class="text-xs font-bold uppercase tracking-wider text-black/60 dark:text-white/60">Password</label>
				<input
					id="password"
					type="password"
					placeholder="••••••••"
					bind:value={password}
					class="w-full border border-black/10 bg-white/50 px-4 py-2 text-black outline-hidden focus:border-{$color}-500 dark:border-white/10 dark:bg-stone-800/50 dark:text-white dark:focus:border-{$color}-500"
				/>
			</div>
			<button
				type="submit"
				disabled={loading}
				class="mt-2 flex items-center justify-center gap-3 border border-black/10 bg-black px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-stone-800 dark:border-white/10 dark:bg-white dark:text-black dark:hover:bg-stone-200 disabled:opacity-50"
			>
				Sign In
				{#if loading}
					<Loader class="animate-spin" size={16} />
				{/if}
			</button>
		</form>
		-->

		<div class="mt-8 text-center text-sm text-black/60 dark:text-white/60">
			Don't have an account?
			<a href="/signup" class="font-bold text-{$color}-600 hover:underline">Sign up</a>
		</div>

		{#if errMessage}
			<div
				transition:slide
				class="mt-6 border border-red-500/20 bg-red-500/10 p-4 text-center text-sm font-medium text-red-600 dark:text-red-400"
			>
				{errMessage}
			</div>
		{/if}
	</div>
</div>

<style>
	.background {
		background-color: #010f0c;
	}
</style>
