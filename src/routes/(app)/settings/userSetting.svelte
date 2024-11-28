<script>
	import { preventDefault } from 'svelte/legacy';

	import { User, Mail, Phone } from 'lucide-svelte';

	let name = $state('John Doe');
	let email = $state('john.doe@example.com');
	let phone = $state('+1 (555) 123-4567');

	function updateAccount() {
		// Implement the logic to update the account details
		// This could involve an API call to your backend
		alert('Account details updated!');
	}
</script>

<div class="mt-4 rounded-md bg-[#3db33925] p-4">
	<form onsubmit={preventDefault(updateAccount)} class="flex flex-col gap-4">
		<div class="flex items-center gap-2">
			<User size={20} />
			<input
				type="text"
				bind:value={name}
				placeholder="Full Name"
				class="flex-grow rounded-md border border-gray-600 bg-black px-3 py-2"
			/>
		</div>
		<div class="flex items-center gap-2">
			<Mail size={20} />
			<input
				type="email"
				bind:value={email}
				placeholder="Email"
				class="flex-grow rounded-md border border-gray-600 bg-black px-3 py-2"
			/>
		</div>
		<div class="flex items-center gap-2">
			<Phone size={20} />
			<input
				type="tel"
				bind:value={phone}
				placeholder="Phone"
				class="flex-grow rounded-md border border-gray-600 bg-black px-3 py-2"
			/>
		</div>
		<button
			type="submit"
			class="self-start rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-600 dark:bg-blue-700"
		>
			Update Account
		</button>
	</form>
</div>
