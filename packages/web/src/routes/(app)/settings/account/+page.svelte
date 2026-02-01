<script>
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { User, Mail, CreditCard } from 'lucide-svelte';
	import { color } from '$lib/colors/mixer.js';
	import Seo from '../../../../lib/components/generals/seo.svelte';

	let user = $state({
		name: '',
		email: '',
		weekly_report_setting: false
	});

	let { data } = $props();

	onMount(() => {
		user = {
			name: data.user?.name || '',
			email: data.user?.email || '',
			weekly_report_setting: data.user?.weekly_report_setting || false
		};
	});
</script>

<svelte:head>
	<Seo title="Account Settings - Littlestats" />
</svelte:head>

<div in:fly={{ y: 13, duration: 100 }} class="flex flex-1 flex-col gap-8 rounded-none">
	<header class="px-2 rounded-none">
		<h1 class="text-xl font-bold text-stone-900 dark:text-white tracking-tight rounded-none">Account Management</h1>
		<p class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mt-1 rounded-none">Manage your profile & settings</p>
	</header>

	<div class="rounded-none bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-6 shadow-none">
		<h2 class="mb-6 flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-white uppercase tracking-tight rounded-none">
			<User size={16} class="text-stone-400" />
			User Profile
		</h2>
		<div class="space-y-4 rounded-none">
			<div class="rounded-none">
				<label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 rounded-none">
					Name
				</label>
				<input
					type="text"
					id="name"
					bind:value={user.name}
					placeholder="Enter your name"
					class="mt-1 text-black dark:text-white block w-full rounded-none bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-500 transition-all shadow-none"
				/>
			</div>
			<div class="rounded-none">
				<label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 rounded-none">
					Email
				</label>
				<input
					type="email"
					id="email"
					disabled
					bind:value={user.email}
					class="mt-1 text-black dark:text-white block w-full rounded-none bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-800 text-sm px-3 py-2 opacity-60 cursor-not-allowed shadow-none"
				/>
			</div>
		</div>
		<p class="mt-4 text-sm text-gray-500 dark:text-gray-400 rounded-none">
			Profile updates are managed through your authentication provider.
		</p>
	</div>

	
</div>

<style>
	input {
		padding: 0.4rem;
	}
</style>
