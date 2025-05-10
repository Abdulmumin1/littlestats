<script>
	import { spring } from 'svelte/motion';
	import { derived } from 'svelte/store';
	import { color } from '$lib/colors/mixer.js';

	const plans = [
		{
			name: 'Monthly',
			priceMonthly: 4,
			priceYearly: 40,
			features: [
				'Full Analytics Suite',
				'Custom Events',
				'Geographical data',
				'Up to 5 Website',
				'Unlimited hits per month',
				'6 months of data retension',
				'Support'
			]
		},
		{
			name: 'Lifetime',
			price: 89,
			features: [
				'Everything in Monthly plan',
				'Lifetime Updates',
				'VIP Support',
				'Early Access to Features',
				'No Monthly/Annual Fees Ever',
				'Priority Support',
				'Extended Data Retention'
			]
		}
	];

	let isYearly = $state(false);

	let yearlyPrice = $derived(isYearly ? plans[0].priceYearly : plans[0].priceMonthly * 12);
	let savings = $derived((plans[0].priceMonthly * 12 - yearlyPrice).toFixed(2));

	function calculateDiscountPercentage() {
		const monthlyPriceTotal = plans[0].priceMonthly * 12; // Total of monthly plan for one year
		const yearlyPrice = plans[0].priceYearly; // Price of yearly plan

		const savings = monthlyPriceTotal - yearlyPrice; // Savings amount
		const discountPercentage = (savings / monthlyPriceTotal) * 100; // Discount percentage calculation

		return discountPercentage.toFixed(); // Return the discount percentage rounded to two decimal places
	}
	function toggleSubscription(v) {
		isYearly = v;
	}
</script>

<div id="pricing"></div>
<div class="relative">
	<div
		class="absolute  font-inter font-extrabold inset-0 flex z-50  h-full flex-col w-full items-center justify-center bg-black/70 text-balance px-4 text-5xl md:text-7xl text-white"
	>
		Free until 200 users
		<button 
		class="rounded-full text-base mt-6  text-white bg-{$color}-600  px-4 py-2 text-center font-semibold text-black transition duration-300 hover:bg-{$color}-500"
		
		>Get started for free</button>
	</div>
<div class="mt-16 *:line-through sm:mt-20 lg:mt-24 font-inter relative py-12">

	<div
		class="border-w mx-auto mb-5 h-4 w-11 outline outline-[7px] outline-white bg-{$color}-600  rounded-full dark:text-white"
	></div>
	<h2 class="text-center text-2xl font-bold sm:text-3xl dark:text-white">
		Simple, Affordable Pricing
	</h2>
	<p
		class="mx-auto mb-6 mt-3 max-w-xl text-center text-lg font-semibold text-black/70 sm:mb-8 sm:max-w-2xl sm:text-xl dark:text-white/80"
	>
		Start with a free month - <span
			class="text-{$color}-100 rounded-full px-2 bg-{$color}-600  font-extrabold"
			>30</span
		> day trial
	</p>

	<div class="mb-8 flex justify-center">
		<div class="flex items-center rounded-full bg-${$color}-300 border-{$color}-300">
			<button
				class="rounded-l-full px-3 py-2 font-medium {!isYearly
					? `bg-${$color}-600  text-white`
					: `bg-${$color}-50/50 dark:bg-stone-100`}"
				onclick={() => toggleSubscription(false)}>Monthly</button
				>
				<!-- class:text-{$color}-600={isYearly < 0.5} -->

			<button
				class="relative rounded-r-full px-3 py-2 font-medium {isYearly
					? `bg-${$color}-600  text-white`
					: `bg-${$color}-50/50 dark:bg-stone-100`}"
				onclick={() => toggleSubscription(true)}
				>
				<!-- class:text-{$color}-600={isYearly > 0.5} -->
				Yearly
				<span
					class="absolute -top-4 border-{$color}-300 left-10 text-gray-100 bg-{$color}-600  flex w-16 items-center justify-center rounded-full p-1 text-xs"
					>{calculateDiscountPercentage()}% off</span
				>
			</button>
		</div>
	</div>

	<div class="flex flex-col justify-center gap-8 px-4 md:flex-row">
		<!-- Monthly/Yearly Plan -->
		<div
			class="flex w-full max-w-md flex-col rounded-2xl bg-{$color}-50 border p-6 shadow-inner border-{$color}-300 shadow-{$color}-700"
		>
			<h3 class="mb-4 text-xl font-semibold">{isYearly ? 'Yearly' : 'Monthly'}</h3>
			<div class="mb-4 text-4xl font-bold">
				${isYearly ? plans[0].priceYearly : plans[0].priceMonthly}<span class="text-xl font-normal"
					>/{isYearly ? 'year' : 'month'}</span
				>
			</div>
			{#if isYearly}
				<div class="mb-4 text-lg text-{$color}-600 font-semibold">
					Save ${savings} per year
				</div>
			{/if}
			<ul class="mb-6 flex-grow">
				{#each plans[0].features as feature}
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
				class="rounded-full text-white bg-{$color}-600  px-4 py-2 text-center font-semibold text-black transition duration-300 hover:bg-{$color}-500"
			>
				Start for free
			</a>
			<p class="mt-1 text-center">
				<em> <span class="text-xl text-{$color}-800">*</span>No credit card required</em>
			</p>
		</div>

		<!-- Lifetime Plan -->
		<div
			class="flex w-full max-w-md flex-col rounded-2xl bg-{$color}-50 border p-6 shadow-inner border-{$color}-300 shadow-{$color}-700 relative"
		>
			<!-- <div
				class="absolute right-4 top-4 bg-{$color}-600  rounded-full px-3 py-1 text-sm text-white"
			>
				Best Deal
			</div> -->
			<h3 class="mb-4 text-xl font-semibold">{plans[1].name}</h3>
			<div class="mb-4 text-4xl font-bold">
				${plans[1].price}<span class="text-xl font-normal">/lifetime</span>
			</div>
			<div class="mb-4 text-lg text-{$color}-600 font-semibold">
				One-time payment, lifetime access
			</div>
			<ul class="mb-6 flex-grow">
				{#each plans[1].features as feature}
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
				class="rounded-full text-white bg-{$color}-600  px-4 py-2 text-center font-semibold text-black transition duration-300 hover:bg-{$color}-500"
			>
				Get lifetime access
			</a>
			<p class="mt-1 text-center">
				<em> <span class="text-xl text-{$color}-800">*</span>One-time payment</em>
			</p>
		</div>
	</div>
</div>

</div>

<style>
	
</style>