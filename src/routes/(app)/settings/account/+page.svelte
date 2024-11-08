<script>
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { fly, slide } from 'svelte/transition';
	import { Loader, User, ChevronDown, ChevronUp, Lock, Mail, CreditCard } from 'lucide-svelte';
	import { color } from '$lib/colors/mixer.js';
	import { show_toast } from '$lib/toast.js';

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
				show_toast.set({ message: 'Account updated successfully! ', type: 'success' });

				// setMessage('', 'success');
			}
			loading = false;
		};
	};

	onMount(() => {
		// Simulating fetching user data from an API
		// console.log(data.user);
		user = {
			name: data.user.name,
			email: data.user.email,
			password: '********',
			newPassword: '',
			confirmPassword: ''
		};
	});
</script>

<div in:fly={{ y: 13, duration: 100 }} class=" flex flex-1 flex-col gap-6">
	<h1 class="mb-4 text-2xl font-bold">Account Management</h1>

	<form use:enhance={handleUpdate} action="?/updateUser" method="POST" class="space-y-6">
		<div class="rounded-md bg-{$color}-200 p-4">
			<h2 class="mb-4 flex items-center text-xl font-semibold">
				<User class="mr-2" /> Personal Information
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

		<div class="rounded-md bg-{$color}-200 p-4">
			<h2 class=" flex items-center text-xl font-semibold">
				<button
					type="button"
					on:click={() => {
						password_slide = !password_slide;
					}}
					class="flex w-full items-center justify-between"
					><span class="flex gap-1"><Lock class="mr-2" /> Change Password</span>
					{#if password_slide}
						<ChevronUp />
					{:else}
						<ChevronDown />
					{/if}</button
				>
			</h2>
			{#if password_slide}
				<div transition:slide class="mt-4 space-y-4">
					<div>
						<label for="current-password" class="block text-sm font-medium text-gray-700"
							>Current Password</label
						>
						<input
							type="password"
							id="current-password"
							name="currentPassword"
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-{$color}-500 focus:ring-{$color}-500"
						/>
					</div>
					<div>
						<label for="new-password" class="block text-sm font-medium text-gray-700"
							>New Password</label
						>
						<input
							type="password"
							id="new-password"
							name="newPassword"
							bind:value={user.newPassword}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-{$color}-500 focus:ring-{$color}-500"
						/>
					</div>
					<div>
						<label for="confirm-password" class="block text-sm font-medium text-gray-700"
							>Confirm New Password</label
						>
						<input
							type="password"
							id="confirm-password"
							name="confirmPassword"
							bind:value={user.confirmPassword}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-{$color}-500 focus:ring-{$color}-500"
						/>
					</div>
				</div>
			{/if}
		</div>

		<div class="rounded-md bg-{$color}-200 p-4">
			<h2 class="mb-4 flex items-center text-xl font-semibold">
				<Mail class="mr-2" /> Notification Preferences
			</h2>
			<div class="space-y-2">
				<label class="flex items-center">
					<input type="checkbox" class="form-checkbox text-{$color}-600" />
					<span class="ml-2">Receive email notifications</span>
				</label>
				<label class="flex items-center">
					<input type="checkbox" class="form-checkbox text-{$color}-600" />
					<span class="ml-2">Receive promotional emails</span>
				</label>
			</div>
		</div>

		<div class="rounded-md bg-{$color}-200 p-4">
			<h2 class="mb-4 flex items-center text-xl font-semibold">
				<CreditCard class="mr-2" /> Billing Information
			</h2>
			<p class="mb-2 text-sm text-black">
				Your current plan: <strong
					>{data.user.variant_name.length > 0 ? data.user.variant_name : 'Free Trial'}</strong
				>
			</p>
		</div>

		<div class="flex justify-end">
			<button
				type="submit"
				disabled={loading}
				class="flex items-center justify-center gap-1 rounded-full border-2 border-black text-white bg-{$color}-500 px-6 py-2 font-bold text-black hover:bg-{$color}-700"
			>
				Save Changes
				{#if loading}
					<Loader class="animate-spin" size={16} />
				{/if}
			</button>
		</div>
	</form>

	<!-- {#if message.text}
		<div
			class={`rounded-md p-4 ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-{$color}-100 text-{$color}-700'}`}
			role="alert"
		>
			<p class="font-medium">{message.text}</p>
		</div>
	{/if} -->
</div>

<style>
	input {
		padding: 0.4rem;
	}
</style>
