<script>
	import { spring } from 'svelte/motion';
	import { derived } from 'svelte/store';
	import { color } from '$lib/colors/mixer.js';

	const plan = {
		name: 'Pro',
		priceMonthly: 3.99,
		priceYearly: 45,
		features: [
			'Full Analytics Suite',
			'Real-time Data',
			'Custom Events',
			'Geographical data',
			'Up to 9 Website',
			'3 month of viewable history',
			'Support'
		]
	};

	let isYearly = false;

	$: yearlyPrice = isYearly ? plan.priceYearly : plan.priceMonthly * 12;

	$: savings = (plan.priceMonthly * 12 - yearlyPrice).toFixed(2);

	function toggleSubscription(v) {
		isYearly = v;
	}
</script>

<div id="pricing" class="mt-16 sm:mt-20 lg:mt-24">
	<h2 class="text-center text-2xl font-bold sm:text-3xl">Choose Your Plan</h2>
	<p
		class="mx-auto mb-6 mt-2 max-w-xl text-center text-lg font-bold text-{$color}-800 sm:mb-8 sm:max-w-2xl sm:text-xl"
	>
		Free <span class="text-{$color}-100 rounded-full px-2 bg-{$color}-500 font-extrabold">14</span> day
		trial
	</p>

	<div class="mb-8 flex justify-center">
		<div class="flex items-center rounded-full bg-${$color}-300 p-1">
			<button
				class=" rounded-l-full px-2 py-1 font-medium {!isYearly
					? `bg-${$color}-500`
					: `bg-${$color}-100`} "
				class:text-{$color}-600={isYearly < 0.5}
				on:click={() => toggleSubscription(false)}>Monthly</button
			>

			<button
				class="rounded-r-full px-2 py-1 font-medium {isYearly
					? `bg-${$color}-500`
					: `bg-${$color}-100`} "
				on:click={() => toggleSubscription(true)}
				class:text-{$color}-600={isYearly > 0.5}>Yearly</button
			>
		</div>
	</div>

	<div class="flex justify-center">
		<div
			class="flex w-full max-w-md flex-col rounded-2xl bg-{$color}-100 border-4 p-6 shadow-inner border-{$color}-300 shadow-{$color}-700"
		>
			<h3 class="mb-4 text-xl font-semibold">{plan.name}</h3>
			<div class="mb-4 text-4xl font-bold">
				${isYearly ? plan.priceYearly : plan.priceMonthly}<span class="text-xl font-normal"
					>/{isYearly ? 'year' : 'month'}</span
				>
			</div>
			{#if isYearly}
				<div class="mb-4 text-lg text-{$color}-600 font-semibold">
					Save ${savings} per year
				</div>
			{/if}
			<ul class="mb-6 flex-grow">
				{#each plan.features as feature}
					<li class="mb-2 flex items-center">
						<svg
							class="mr-2 h-4 w-4 text-{$color}-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 13l4 4L19 7"
							></path>
						</svg>
						{feature}
					</li>
				{/each}
			</ul>
			<a
				href="/signup"
				class="rounded-full bg-{$color}-500 px-4 py-2 text-center font-semibold text-black transition duration-300 hover:bg-{$color}-400"
			>
				Start free trial
			</a>
		</div>
	</div>
</div>
