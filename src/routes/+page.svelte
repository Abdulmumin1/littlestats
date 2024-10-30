<script>
	import { fly } from 'svelte/transition';
	import Nav from './nav.svelte';
	import Logo from '../lib/components/generals/logo.svelte';
	import { color } from '$lib/colors/mixer.js';
	import ImageSection from '../lib/components/landing/imageSection.svelte';
	import Seo from '../lib/components/generals/seo.svelte';
	import PricingSection from '../lib/components/landing/pricingSection.svelte';
	import FeatureSection from '../lib/components/landing/featureSection.svelte';
	import Waitlist from '../lib/components/landing/waitlist.svelte';
	import Footer from './footer.svelte';

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

<main class="min-h-screen bg-{$color}-100 text-black">
	<div class="container mx-auto max-w-[1000px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
		<Nav />

		<div
			class="relative flex flex-col items-center justify-start text-center md:items-start md:justify-center md:text-left"
		>
			<h1
				class=" mb-4 max-w-6xl text-balance text-4xl font-extrabold leading-tight text-black sm:mb-6 sm:text-5xl lg:text-7xl"
			>
				Just another analytics website <span class="block text-{$color}-400 sm:inline"
					>But Cheap</span
				>
			</h1>
			<p class=" mb-6 max-w-xl text-lg text-gray-900 sm:mb-8 sm:max-w-2xl sm:text-xl">
				Your analytics needs without the premium price tag
			</p>
			<a
				href="#waitlist"
				class="inline-block w-fit transform rounded-full text-white bg-{$color}-500 px-6 py-2 text-base font-semibold text-black transition duration-300 hover:-translate-y-1 hover:bg-{$color}-400 sm:px-8 sm:py-3 sm:text-lg"
			>
				Get Started
			</a>
			<div class="pointer-events-none absolute bottom-0 right-0 -z-0 hidden md:block">
				<Logo size={300} />
			</div>
		</div>
		<ImageSection />
		<FeatureSection />
		<PricingSection />
		<!-- <Waitlist /> -->
	</div>
</main>
<Footer />

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
