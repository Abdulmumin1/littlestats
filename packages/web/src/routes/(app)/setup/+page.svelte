<script>
	import { onMount } from 'svelte';
	import { Loader, User, CreditCard, Globe } from 'lucide-svelte';
	import { color } from '$lib/colors/mixer.js';
	import { show_toast } from '$lib/toast.js';
	import { goto } from '$app/navigation';
	import { onboard } from './data.remote.js';

	let user = $state({
		name: '',
		email: ''
	});

	let selectedPlan = $state('free');

	const plans = {
		free: {
			name: 'Free',
			price: 0,
			features: [
				'2 Websites',
				'500k events/month',
				'3 months data retention',
			]
		},
		pro: {
			name: 'Pro',
			priceMonthly: 4,
			features: [
				'10 Websites',
				'5M events/month',
				'6 months data retention',
			]
		}
	};

	let { data } = $props();
	let loading = $state(false);
	let message = $state({ text: '', type: '' });

	function setMessage(text, type) {
		message = { text, type };
		setTimeout(() => {
			message = { text: '', type: '' };
		}, 3000);
	}

	let domainName = $state('');

	onMount(() => {
		user = {
			name: data.user?.name || '',
			email: data.user?.email || ''
		};
	});

	async function handleSubmit() {
		if (!user.name || !domainName) {
			setMessage('Name and domain are required', 'error');
			return;
		}

		loading = true;
		try {
			const result = await onboard({
				name: user.name,
				domain: domainName,
				plan: selectedPlan,
				email: user.email
			});

			if (result.success && result.redirect) {
				show_toast.set({ 
					message: `Welcome to Littlestats, ${user.name}!`, 
					type: 'success' 
				});
				goto(result.redirect);
			} else {
				setMessage(result.error || 'Something went wrong', 'error');
			}
		} catch (err) {
			setMessage(err.message || 'Something went wrong', 'error');
		} finally {
			loading = false;
		}
	}
</script>

<div class="max-w-xl mx-auto p-6 md:p-8 space-y-8 pb-24 rounded-none">
	<header class="px-2 rounded-none">
		<h1 class="text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight rounded-none">Welcome to Littlestats</h1>
		<p class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mt-1 rounded-none">Let's set up your first domain</p>
	</header>

	<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-8 rounded-none">
		<input type="hidden" name="name" value={user.name} />
		<input type="hidden" name="email" value={user.email} />
		<input type="hidden" name="plan" value={selectedPlan} />
		
		<!-- Account -->
		<!-- <div class="rounded-none bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-6 shadow-none">
			<h2 class="mb-6 flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-white uppercase tracking-tight rounded-none">
				<User size={16} class="text-stone-400" />
				Account Details
			</h2>
			<div class="space-y-4 rounded-none">
				<div class="rounded-none">
					<label for="name" class="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1.5 ml-1 rounded-none">Name</label>
					<input
						type="text"
						id="name"
						bind:value={user.name}
						placeholder="Enter your name"
						class="w-full px-4 py-2.5 rounded-none bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-stone-500 transition-all shadow-none"
					/>
				</div>
				<div class="rounded-none">
					<label for="email" class="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1.5 ml-1 rounded-none">Email</label>
					<input
						type="email"
						id="email"
						disabled
						value={user.email}
						class="w-full px-4 py-2.5 rounded-none bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm opacity-60 cursor-not-allowed shadow-none"
					/>
				</div>
			</div>
		</div> -->

		<!-- First Domain -->
		<div class="rounded-none bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-6 shadow-none">
			<h2 class="mb-6 flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-white uppercase tracking-tight rounded-none">
				<Globe size={16} class="text-stone-400" />
				First Domain
			</h2>
			<div class="space-y-4 rounded-none">
				<div class="rounded-none">
					<label for="domain" class="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1.5 ml-1 rounded-none">Domain</label>
				<input
					type="text"
					id="domain"
					name="domain"
					bind:value={domainName}
					placeholder="example.com"
					class="w-full px-4 py-2.5 text-black dark:text-white rounded-none bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-{$color}-500 transition-all shadow-none"
				/>
					<p class="mt-2 text-[10px] text-stone-400 italic font-serif ml-1 rounded-none">You can add more domains later in settings.</p>
				</div>
			</div>
		</div>

		<!-- Plan Selection -->
		<div class="rounded-none bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-6 shadow-none">
			<h2 class="mb-6 flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-white uppercase tracking-tight rounded-none">
				<CreditCard size={16} class="text-stone-400" />
				Choose Your Plan
			</h2>

			<div class="grid grid-cols-2 gap-4 rounded-none">
				<button
					type="button"
					class="flex flex-col items-start gap-1 p-5 rounded-none border transition-all text-left group shadow-none {selectedPlan === 'free' ? `bg-${$color}-600 border-${$color}-600` : 'bg-white dark:bg-stone-950 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'}"
					onclick={() => (selectedPlan = 'free')}
				>
					<span class="text-[10px] font-black uppercase tracking-widest rounded-none {selectedPlan === 'free' ? 'text-white opacity-70' : 'text-stone-400'}">Free</span>
					<span class="text-lg font-serif italic rounded-none {selectedPlan === 'free' ? 'text-white' : 'text-stone-900 dark:text-white'}">Forever</span>
				</button>

				<button
					type="button"
					class="flex flex-col items-start gap-1 p-5 rounded-none border transition-all text-left group shadow-none {selectedPlan === 'pro' ? `bg-${$color}-600 border-${$color}-600` : 'bg-white dark:bg-stone-950 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'}"
					onclick={() => (selectedPlan = 'pro')}
				>
					<span class="text-[10px] font-black uppercase tracking-widest rounded-none {selectedPlan === 'pro' ? 'text-white opacity-70' : 'text-stone-400'}">Pro</span>
					<span class="text-lg font-serif italic rounded-none {selectedPlan === 'pro' ? 'text-white' : 'text-stone-900 dark:text-white'}">$4 / month</span>
				</button>
			</div>

			<!-- Plan Features -->
			<div class="mt-6 p-4 rounded-none bg-white dark:bg-stone-950 border border-stone-100 dark:border-stone-800 shadow-none">
				<h3 class="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3 ml-1 rounded-none">
					{plans[selectedPlan].name} Plan Features
				</h3>
				<ul class="space-y-2 rounded-none">
					{#each plans[selectedPlan].features as feature}
						<li class="flex items-center gap-2.5 text-xs font-medium text-stone-600 dark:text-stone-400 rounded-none">
							<span class="h-1 w-1 rounded-none bg-stone-400"></span>
							{feature}
						</li>
					{/each}
				</ul>
			</div>
		</div>

		<div class="flex justify-end pt-4 rounded-none">
			<button
				type="submit"
				disabled={loading || !user.name}
				class={`px-8 py-3 rounded-none  bg-${$color}-600 text-white text-xs font-bold hover:bg-${$color}-700 transition-all shadow-none disabled:opacity-50 flex items-center gap-2`}
			>
				{selectedPlan === 'free' ? 'Continue with Free' : 'Proceed to Payment'}
				{#if loading}
					<Loader class="animate-spin" size={14} />
				{/if}
			</button>
		</div>
	</form>

	{#if message.text}
		<div
			class="p-4 rounded-none text-xs font-bold uppercase tracking-widest text-center shadow-none {message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30' : 'bg-stone-100 text-stone-600 border border-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700'}"
			role="alert"
		>
			{message.text}
		</div>
	{/if}
</div>

<style>
	input {
		padding: 0.4rem;
	}
</style>
