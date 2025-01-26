<script>
	import { fly } from 'svelte/transition';
	import Nav from './nav.svelte';
	import Logo from '../lib/components/generals/logo.svelte';
	import ImageSection from '../lib/components/landing/imageSection.svelte';
	import Seo from '../lib/components/generals/seo.svelte';
	import PricingSection from '../lib/components/landing/pricingSection.svelte';
	import FeatureSection from '../lib/components/landing/featureSection.svelte';
	import Waitlist from '../lib/components/landing/waitlist.svelte';
	import Banner from '../lib/components/landing/launchBanner.svelte';
	import Footer from './footer.svelte';
	import Hero from '../lib/components/landing/hero.svelte';
	import ReasonSection from '../lib/components/landing/reasonSection.svelte';

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
	let { data = $bindable() } = $props();
	// console.log(data)
</script>

<svelte:head>
	<Seo />
</svelte:head>

<main class="min-h-screen text-black">
	<div class="mx-auto sm:py-12 lg:py-16">
		<!-- <Banner /> -->
		<Nav />

		<Hero />
		<ImageSection {data} />
		<FeatureSection />
		<!-- <ReasonSection/> -->
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
