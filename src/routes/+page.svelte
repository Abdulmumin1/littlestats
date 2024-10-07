<script>
	import { fly } from 'svelte/transition';
	import Nav from './nav.svelte';
	import Logo from '../lib/components/generals/logo.svelte';
	import { color } from '$lib/colors/mixer.js';
	import ImageSection from '../lib/components/landing/imageSection.svelte';
	import Seo from '../lib/components/generals/seo.svelte';
	import PricingSection from '../lib/components/landing/pricingSection.svelte';
	import FeatureSection from '../lib/components/landing/featureSection.svelte';

	const plans = [
		{
			name: 'Basic',
			price: 37,
			websites: 4,
			features: ['Full Analytics Suite', 'Real-time Data', 'Custom Reports', 'Email Support']
		},
		{
			name: 'Pro',
			price: 47,
			websites: 9,
			features: [
				'Everything in Basic',
				'Multiple Website Tracking',
				'API Access',
				'Priority Support'
			]
		}
	];
</script>

<svelte:head>
	<Seo />
</svelte:head>

<main class="min-h-screen bg-gradient-to-br from-{$color}-100 to-{$color}-200 text-black">
	<div class="container mx-auto max-w-[1000px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
		<Nav />

		<div
			class="relative flex flex-col items-center justify-start text-center md:items-start md:justify-center md:text-left"
		>
			<h1
				class=" mb-4 max-w-6xl text-balance text-4xl font-extrabold leading-tight text-black sm:mb-6 sm:text-5xl lg:text-7xl"
				in:fly={{ y: -50, duration: 1000 }}
			>
				Just another analytics website <span class="block text-{$color}-400 sm:inline"
					>But Cheap</span
				>
			</h1>
			<p
				class=" mb-6 max-w-xl text-lg text-gray-900 sm:mb-8 sm:max-w-2xl sm:text-xl"
				in:fly={{ y: 50, duration: 1000, delay: 300 }}
			>
				Your analytics needs without the premium price tag
			</p>
			<a
				href="#pricing"
				class="inline-block w-fit transform rounded-full bg-{$color}-500 px-6 py-2 text-base font-semibold text-black transition duration-300 hover:-translate-y-1 hover:bg-{$color}-400 sm:px-8 sm:py-3 sm:text-lg"
				in:fly={{ y: 50, duration: 1000, delay: 600 }}
			>
				Get Started
			</a>
			<div class="pointer-events-none absolute bottom-0 right-0 -z-0 hidden md:block">
				<Logo size={300} />
			</div>
		</div>

		<!-- <div
			class="mt-16 grid grid-cols-1 gap-6 sm:mt-20 sm:grid-cols-2 sm:gap-8 lg:mt-24 lg:grid-cols-3"
		>
			<div class="rounded-lg bg-white p-6 shadow-md">
				<h3 class="mb-3 text-lg font-semibold sm:mb-4 sm:text-xl">Simple Setup</h3>
				<p class="text-sm sm:text-base">
					Get started in minutes with our easy-to-use dashboard and integrations.
				</p>
			</div>
			<div class="rounded-lg bg-white p-6 shadow-md">
				<h3 class="mb-3 text-lg font-semibold sm:mb-4 sm:text-xl">Affordable Pricing</h3>
				<p class="text-sm sm:text-base">
					Pay only for what you need, with plans starting as low as $37/year.
				</p>
			</div>
			<div class="rounded-lg bg-white p-6 shadow-md">
				<h3 class="mb-3 text-lg font-semibold sm:mb-4 sm:text-xl">Powerful Insights</h3>
				<p class="text-sm sm:text-base">
					Gain valuable insights into your website's performance and user behavior.
				</p>
			</div>
		</div> -->
		<ImageSection />

		<!-- <div id="pricing" class="mt-16 sm:mt-20 lg:mt-24">
			<h2 class=" text-center text-2xl font-bold sm:text-3xl">Choose Your Plan</h2>
			<p
				class="mx-auto mb-6 mt-2 max-w-xl text-center text-lg font-bold text-{$color}-800 sm:mb-8 sm:max-w-2xl sm:text-xl"
			>
				Free 7 day trial on all plans
			</p>
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
				{#each plans as plan}
					<div class="flex flex-col rounded-lg bg-white p-6 shadow-md">
						<h3 class="mb-4 text-xl font-semibold">{plan.name}</h3>
						<div class="mb-4 text-4xl font-bold">
							${plan.price}<span class="text-xl font-normal">/year</span>
						</div>
						<p class="mb-4 text-gray-600">
							Up to {plan.websites}
							{plan.websites === 1 ? 'website' : 'websites'}
						</p>
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
				{/each}
			</div>
		</div> -->
		<FeatureSection />
		<PricingSection />
		<div class="mt-16 text-center sm:mt-20 lg:mt-24">
			<h2 class="mb-6 text-2xl font-bold sm:mb-8 sm:text-3xl">Ready to get started?</h2>
			<a
				href="#pricing"
				class="inline-block rounded-full bg-{$color}-500 px-6 py-2 text-base font-semibold text-black transition duration-300 hover:-translate-y-1 hover:bg-{$color}-400 sm:px-8 sm:py-3 sm:text-lg"
			>
				Choose Your Plan
			</a>
		</div>
	</div>
</main>

<style>
	@media (max-width: 640px) {
		:global(body) {
			font-size: 14px;
		}
	}

	main {
		scroll-behavior: smooth;
	}
</style>
