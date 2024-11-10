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
		class="border-w mx-auto mb-5 h-4 w-11 outline outline-[7px] outline-white bg-{$color}-500 rounded-full"
	></div>
	<h2 class="text-center text-2xl font-bold sm:text-3xl">Ridiculously Cheap Pricing</h2>
	<p
		class="mx-auto mb-6 mt-3 max-w-xl text-center text-lg font-semibold text-{$color}-600 sm:mb-8 sm:max-w-2xl sm:text-xl"
	>
		Use Littlestats for free for a whole month - <span
			class="text-{$color}-100 rounded-full px-2 bg-{$color}-500 font-extrabold">30</span
		> day trial
	</p>

	<div class="mb-8 flex justify-center">
		<div class="flex items-center rounded-full bg-${$color}-300 p-1">
			<button
				class=" rounded-l-full px-2 py-1 font-medium {!isYearly
					? `bg-${$color}-500 text-white`
					: `bg-${$color}-50`} "
				class:text-{$color}-600={isYearly < 0.5}
				on:click={() => toggleSubscription(false)}>Monthly</button
			>

			<button
				class="rounded-r-full px-2 py-1 font-medium {isYearly
					? `bg-${$color}-500 text-white`
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
				class="rounded-full text-white bg-{$color}-500 px-4 py-2 text-center font-semibold text-black transition duration-300 hover:bg-{$color}-400"
			>
				Start for free
			</a>
			<p class="mt-1 text-center">
				<em> <span class="text-xl text-{$color}-800">*</span>No credit card required</em>
			</p>
		</div>
	</div>
</div>

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
			? `bg-${$color}-500 text-white`
			: `bg-${$color}-100`}"
		  on:click={() => toggleSubscription(false)}
		>
		  Monthly
		</button>
		<button
		  class="rounded-r-full px-4 py-2 font-medium {isYearly
			? `bg-${$color}-500 text-white`
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
		  class="rounded-full bg-{$color}-500 px-6 py-3 text-center font-semibold text-white transition duration-300 hover:bg-{$color}-400"
		>
		  Start 30-day free trial
		</a>
		
		<p class="mt-3 text-center text-sm text-{$color}-600">
		  No credit card required
		</p>
	  </div>
	</div>
  </div> -->
