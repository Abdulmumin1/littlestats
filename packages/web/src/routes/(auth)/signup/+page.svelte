<script>
	import { goto } from '$app/navigation';
	import { Loader } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import Logo from '../../../lib/components/generals/logo.svelte';
	import { color } from '$lib/colors/mixer.js';
	import Seo from '../../../lib/components/generals/seo.svelte';
	import { signUp, signIn, getCallbackURL } from '$lib/auth.ts';

	let loading = $state(false);
	let password = $state('');
	let password2 = $state('');
	let email = $state('');
	let name = $state('');
	let errMessage = $state('');
	let successMessage = $state('');

	function setError(message) {
		errMessage = message;
		setTimeout(() => {
			errMessage = '';
		}, 3000);
	}

	async function handleEmailSignUp(event) {
		event.preventDefault();
		
		if (!email || !password) {
			setError('Please enter both email and password');
			return;
		}
		if (password !== password2) {
			setError('Passwords do not match');
			return;
		}
		if (password.length < 8) {
			setError('Password must be at least 8 characters');
			return;
		}

		loading = true;
		errMessage = '';

		try {
			const result = await signUp.email({
				email,
				password,
				name: name || email.split('@')[0],
				callbackURL: '/setup'
			});

			if (result.error) {
				setError(result.error.message || 'Registration failed');
			} else {
				successMessage = 'Account created successfully! Please check your email to verify your account.';
				// Optionally redirect to setup after a delay
				setTimeout(() => {
					goto('/setup');
				}, 2000);
			}
		} catch (error) {
			console.error('Sign up error:', error);
			setError(error.message || 'An error occurred during registration');
		} finally {
			loading = false;
		}
	}

	async function handleGoogleSignUp() {
		loading = true;
		
		try {
			const callbackURL = getCallbackURL('/setup');
			await signIn.social({
				provider: 'google',
				callbackURL
			});
		} catch (error) {
			console.error('Google sign up error:', error);
			setError(error.message || 'Failed to sign up with Google');
			loading = false;
		}
	}
</script>

<svelte:head>
	<Seo title="Signup" />
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
			onclick={handleGoogleSignUp}
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

		<form
			onsubmit={handleEmailSignUp}
			class="flex flex-col gap-4"
		>
			<div class="space-y-1">
				<label for="name" class="text-xs font-bold uppercase tracking-wider text-black/60 dark:text-white/60">Your Name</label>
				<input
					id="name"
					type="text"
					bind:value={name}
					placeholder="John Doe (optional)"
					class="w-full border border-black/10 bg-white/50 px-4 py-2 text-black outline-hidden focus:border-{$color}-500 dark:border-white/10 dark:bg-stone-800/50 dark:text-white dark:focus:border-{$color}-500"
				/>
			</div>
			
			<div class="space-y-1">
				<label for="email" class="text-xs font-bold uppercase tracking-wider text-black/60 dark:text-white/60">Email Address</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					placeholder="email@example.com"
					required
					class="w-full border border-black/10 bg-white/50 px-4 py-2 text-black outline-hidden focus:border-{$color}-500 dark:border-white/10 dark:bg-stone-800/50 dark:text-white dark:focus:border-{$color}-500"
				/>
			</div>
			
			<div class="space-y-1">
				<label for="password" class="text-xs font-bold uppercase tracking-wider text-black/60 dark:text-white/60">Password</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					placeholder="••••••••"
					required
					class="w-full border border-black/10 bg-white/50 px-4 py-2 text-black outline-hidden focus:border-{$color}-500 dark:border-white/10 dark:bg-stone-800/50 dark:text-white dark:focus:border-{$color}-500"
				/>
			</div>
			
			<div class="space-y-1">
				<label for="password-confirm" class="text-xs font-bold uppercase tracking-wider text-black/60 dark:text-white/60">Confirm Password</label>
				<input
					id="password-confirm"
					type="password"
					bind:value={password2}
					placeholder="••••••••"
					required
					class="w-full border border-black/10 bg-white/50 px-4 py-2 text-black outline-hidden focus:border-{$color}-500 dark:border-white/10 dark:bg-stone-800/50 dark:text-white dark:focus:border-{$color}-500"
				/>
			</div>
			
			<button
				type="submit"
				disabled={loading}
				class="mt-2 flex items-center justify-center gap-3 border border-black/10 bg-black px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-stone-800 dark:border-white/10 dark:bg-white dark:text-black dark:hover:bg-stone-200 disabled:opacity-50"
			>
				Create Account
				{#if loading}
					<Loader class="animate-spin" size={16} />
				{/if}
			</button>
		</form>
		-->

		<div class="mt-8 text-center text-sm text-black/60 dark:text-white/60">
			Already have an account?
			<a href="/signin" class="font-bold text-{$color}-600 hover:underline">Sign in</a>
		</div>

		{#if errMessage}
			<div
				transition:slide
				class="mt-6 border border-red-500/20 bg-red-500/10 p-4 text-center text-sm font-medium text-red-600 dark:text-red-400"
			>
				{errMessage}
			</div>
		{/if}
		
		{#if successMessage}
			<div
				transition:slide
				class="mt-6 border border-{$color}-500/20 bg-{$color}-500/10 p-4 text-center text-sm font-medium text-{$color}-600 dark:text-{$color}-400"
			>
				{successMessage}
			</div>
		{/if}
	</div>
</div>

<style>
	.background {
		background-color: #010f0c;
	}
</style>
