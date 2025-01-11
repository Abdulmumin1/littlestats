<!-- @migration-task Error while migrating Svelte code: can't migrate `$: yearlyPrice = isYearly ? plans[0].priceYearly : plans[0].priceMonthly * 12;` to `$derived` because there's a variable named derived.
     Rename the variable and try again or migrate by hand. -->
<!-- <script>
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
			'Up to 5 Website',
			'Less than 30k pageview a month',
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

<div id="pricing"></div>
<div class="mt-16 sm:mt-20 lg:mt-24">
	<div
		class="border-w mx-auto mb-5 h-4 w-11 outline outline-[7px] outline-white bg-{$color}-600 dark:bg-{$color}-700 rounded-full dark:text-white"
	></div>
	<h2 class="text-center text-2xl font-bold sm:text-3xl dark:text-white">Super Affordable Pricing</h2>
	<p
		class="mx-auto mb-6 mt-3 max-w-xl text-center text-lg font-semibold text-{$color}-600  sm:mb-8 sm:max-w-2xl sm:text-xl"
	>
		Use Littlestats for free for a whole month - <span
			class="text-{$color}-100 rounded-full px-2 bg-{$color}-600 dark:bg-{$color}-700 font-extrabold">30</span
		> day trial
	</p>

	<div class="mb-8 flex justify-center">
		<div class="flex items-center rounded-full bg-${$color}-300 border-2 border-{$color}-500 p-1">
			<button
				class=" rounded-l-full px-2 py-1 font-medium  {!isYearly
					? `bg-${$color}-700 text-white`
					: `bg-white`} "
				class:text-{$color}-600={isYearly < 0.5}
				on:click={() => toggleSubscription(false)}>Monthly</button
			>

			<button
				class="rounded-r-full px-2 py-1 font-medium {isYearly
					? `bg-${$color}-700 text-white`
					: `bg-${$color}-50`} "
				on:click={() => toggleSubscription(true)}
				class:text-{$color}-600={isYearly > 0.5}>Yearly</button
			>
		</div>
	</div>

	<div class="flex justify-center">
		<div
			class="flex w-full max-w-md flex-col rounded-2xl bg-{$color}-50 border-4 p-6 shadow-inner border-{$color}-300 shadow-{$color}-700"
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
				class="rounded-full text-white bg-{$color}-600 dark:bg-{$color}-700 px-4 py-2 text-center font-semibold text-black transition duration-300 hover:bg-{$color}-400"
			>
				Start for free
			</a>
			<p class="mt-1 text-center">
				<em> <span class="text-xl text-{$color}-800">*</span>No credit card required</em>
			</p>
		</div>
	</div>
</div> -->

<!-- <script>
	import { spring } from 'svelte/motion';
	import { derived } from 'svelte/store';
	import { color } from '$lib/colors/mixer.js';
	import { Check, Zap } from 'lucide-svelte';
  
	const plan = {
	  name: 'Pro',
	  priceMonthly: 3.99,
	  priceYearly: 45,
	  features: [
		{
		  title: 'Complete Analytics Dashboard',
		  description: 'Everything you need to understand your traffic'
		},
		{
		  title: 'Track Up to 5 Websites',
		  description: 'Perfect for your growing portfolio'
		},
		{
		  title: '30,000 Monthly Pageviews',
		  description: 'Ideal for small to medium websites'
		},
		{
		  title: 'Real-time Data & Custom Events',
		  description: "See what's happening as it happens"
		},
		{
		  title: 'Visitor Geography',
		  description: 'Know where your audience comes from'
		},
		{
		  title: 'Email Support',
		  description: 'Get help when you need it'
		}
	  ]
	};
  
	let isYearly = false;
	$: yearlyPrice = isYearly ? plan.priceYearly : plan.priceMonthly * 12;
	$: savings = (plan.priceMonthly * 12 - yearlyPrice).toFixed(2);
	$: monthlyEquivalent = (plan.priceYearly / 12).toFixed(2);
	
	function toggleSubscription(v) {
	  isYearly = v;
	}
  </script>
  
  <div id="pricing" class="mt-16 sm:mt-20 lg:mt-24">
	<h2 class="text-center text-2xl font-bold sm:text-3xl">Simple, Affordable Pricing</h2>
	<p
	  class="mx-auto mb-6 mt-2 max-w-xl text-center text-lg text-{$color}-600 sm:mb-8 sm:max-w-2xl"
	>
	  Try everything free for 30 days, no credit card needed
	</p>
  
	<div class="mb-8 flex justify-center">
	  <div class="flex items-center rounded-full bg-${$color}-300 p-1">
		<button
		  class="rounded-l-full px-4 py-2 font-medium {!isYearly
			? `bg-${$color}-700 text-white`
			: `bg-${$color}-100`}"
		  on:click={() => toggleSubscription(false)}
		>
		  Monthly
		</button>
		<button
		  class="rounded-r-full px-4 py-2 font-medium {isYearly
			? `bg-${$color}-700 text-white`
			: `bg-${$color}-100`}"
		  on:click={() => toggleSubscription(true)}
		 
		>
		  Yearly
		  <span class="ml-1 text-sm">(-17%)</span>
		</button>
	  </div>
	</div>
  
	<div class="flex justify-center">
	  <div
		class="flex w-full max-w-md flex-col rounded-2xl bg-{$color}-100 border-4 p-8 shadow-inner border-{$color}-300 shadow-{$color}-700"
	  >
		<div class="flex items-center justify-between mb-4">
		  <h3 class="text-2xl font-bold">{plan.name}</h3>
		  {#if isYearly}
			<span class="bg-{$color}-200 text-{$color}-700 px-3 py-1 rounded-full text-sm font-medium">
			  Save ${savings}/year
			</span>
		  {/if}
		</div>
  
		<div class="mb-2">
		  <div class="flex items-baseline">
			<span class="text-4xl font-bold">
			  ${isYearly ? plan.priceYearly : plan.priceMonthly}
			</span>
			<span class="ml-1 text-lg text-{$color}-600">
			  /{isYearly ? 'year' : 'month'}
			</span>
		  </div>
		  {#if isYearly}
			<p class="text-{$color}-600 text-sm">
			  Just ${monthlyEquivalent}/month when billed yearly
			</p>
		  {/if}
		</div>
  
		<div class="my-8">
		  <div class="space-y-4">
			{#each plan.features as feature}
			  <div class="flex items-start gap-3">
				<div class="mt-1">
				  <Check size={16} class="text-{$color}-500" />
				</div>
				<div>
				  <div class="font-medium">{feature.title}</div>
				  <div class="text-sm text-{$color}-600">{feature.description}</div>
				</div>
			  </div>
			{/each}
		  </div>
		</div>
  
		<a
		  href="/signup"
		  class="rounded-full bg-{$color}-600 dark:bg-{$color}-700 px-6 py-3 text-center font-semibold text-white transition duration-300 hover:bg-{$color}-400"
		>
		  Start 30-day free trial
		</a>
		
		<p class="mt-3 text-center text-sm text-{$color}-600">
		  No credit card required
		</p>
	  </div>
	</div>
  </div> -->

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
			price: 125,
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
<div class="mt-16 sm:mt-20 lg:mt-24">
	<div
		class="border-w mx-auto mb-5 h-4 w-11 outline outline-[7px] outline-white bg-{$color}-600 dark:bg-{$color}-700 rounded-full dark:text-white"
	></div>
	<h2 class="text-center text-2xl font-bold sm:text-3xl dark:text-white">
		Simple, Affordable Pricing
	</h2>
	<p
		class="mx-auto mb-6 mt-3 max-w-xl text-center text-lg font-semibold text-black/70 sm:mb-8 sm:max-w-2xl sm:text-xl dark:text-white/80"
	>
		Start with a free month - <span
			class="text-{$color}-100 rounded-full px-2 bg-{$color}-600 dark:bg-{$color}-700 font-extrabold"
			>30</span
		> day trial
	</p>

	<div class="mb-8 flex justify-center">
		<div class="flex items-center rounded-full bg-${$color}-300 border-{$color}-300">
			<button
				class="rounded-l-full px-3 py-2 font-medium {!isYearly
					? `bg-${$color}-600 dark:bg-${$color}-700 text-white`
					: `bg-${$color}-100/50 dark:bg-${$color}-100`}"
				class:text-{$color}-600={isYearly < 0.5}
				onclick={() => toggleSubscription(false)}>Monthly</button
			>

			<button
				class="relative rounded-r-full px-3 py-2 font-medium {isYearly
					? `bg-${$color}-600 dark:bg-${$color}-700 text-white`
					: `bg-${$color}-100/50 dark:bg-${$color}-100`}"
				onclick={() => toggleSubscription(true)}
				class:text-{$color}-600={isYearly > 0.5}
			>
				Yearly
				<span
					class="absolute -top-4 border-{$color}-300 left-10 text-gray-100 bg-{$color}-600 dark:bg-{$color}-700 flex w-16 items-center justify-center rounded-full p-1 text-xs"
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
				class="rounded-full text-white bg-{$color}-600 dark:bg-{$color}-700 px-4 py-2 text-center font-semibold text-black transition duration-300 hover:bg-{$color}-500"
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
			<div
				class="absolute right-4 top-4 bg-{$color}-600 dark:bg-{$color}-700 rounded-full px-3 py-1 text-sm text-white"
			>
				Supports Development
			</div>
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
				class="rounded-full text-white bg-{$color}-600 dark:bg-{$color}-700 px-4 py-2 text-center font-semibold text-black transition duration-300 hover:bg-{$color}-500"
			>
				Get lifetime access
			</a>
			<p class="mt-1 text-center">
				<em> <span class="text-xl text-{$color}-800">*</span>One-time payment</em>
			</p>
		</div>
	</div>
</div>
