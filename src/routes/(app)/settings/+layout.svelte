<script>
	import { page } from '$app/stores';
	import { fly } from 'svelte/transition';
	import { color } from '$lib/colors/mixer.js';

	$: path = $page.url.pathname;
</script>

<div class="min-h-screen p-2 text-black">
	<div class="container mx-auto flex gap-4 pt-6">
		<div class="flex w-[300px] flex-col gap-1 px-4">
			<a
				class="rounded-full {path === '/settings' || path === '/settings/'
					? `border-${$color}-800 bg-${$color}-500 border-2`
					: `bg-${$color}-100`} px-4 py-2"
				href="/settings">Manage Domain</a
			>
			<a
				class="rounded-full {path.endsWith('/settings/subscription')
					? `border-${$color}-800 bg-${$color}-500 border-2`
					: `bg-${$color}-100`} px-4 py-2"
				href="/settings/subscription">Subscription</a
			>
			<a
				class="rounded-full {path.endsWith('/settings/account')
					? `border-${$color}-800 bg-${$color}-500 border-2`
					: `bg-${$color}-100`} px-4 py-2"
				href="/settings/account">Account</a
			>
		</div>
		<div class="w-full">
			<slot />
		</div>
	</div>
</div>
