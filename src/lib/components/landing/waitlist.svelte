<script>
	import { enhance } from '$app/forms';
	import { Loader } from 'lucide-svelte';
	import { color } from '$lib/colors/mixer.js';

	let email;

	let loading = false;
	let completed = false;
	const handleAdd = ({ cancel }) => {
		if (!email) {
			setError('Domain name required');
			cancel();
			return;
		}

		loading = true;
		return async ({ update, result }) => {
			if (result.status >= 400) {
				loading = false;
				//cool
				// console.log(result.data);
			} else {
				// addDomain(result.data);
				completed = true;
				loading = false;
			}
			await update();
		};
	};

	import { confetti } from '@neoconfetti/svelte';
	let pop = true;
</script>

<div
	id="waitlist"
	class="bg-{$color}-100 flex flex-col gap-4 rounded-2xl border-4 p-4 py-6 border-{$color}-300 w-full"
>
	<h3 class="text-2xl font-bold">Get Early Access</h3>
	<h3 class="text-{$color}-900">
		Join our internal testing and get <span
			class="text-{$color}-100 rounded-full px-1 bg-{$color}-500 font-extrabold">20%</span
		> off yearly subscription when we launch
	</h3>
	{#if !completed}
		<form class="flex gap-1" use:enhance={handleAdd} action="?/waitlist" method="post">
			<input
				class="w-full bg-{$color}-200 rounded-full p-2"
				required
				type="email"
				bind:value={email}
				name="email"
				placeholder="email@example.com"
				id=""
			/>
			<button
				class="rounded-full border-2 border-{$color}-300 px-12 py-2 bg-{$color}-500 flex items-center gap-1"
				type="submit"
			>
				Join
				{#if loading}
					<Loader size={16} class="animate-spin" />
				{/if}
			</button>
		</form>
	{:else}
		<div class="mx-auto" use:confetti />
		<p>Thank you for joining 🩷! we will reach out soon</p>
	{/if}
</div>
