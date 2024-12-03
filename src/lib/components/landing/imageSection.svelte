<script>
	import { color } from '$lib/colors/mixer.js';
	import { ArrowRight } from 'lucide-svelte';
	import { fly } from 'svelte/transition';
	import DemoComponent from './demoComponent.svelte';

	let images = {
		rose: 'https://res.cloudinary.com/dtrqaqezs/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1728117533/Screenshot_2024-10-05_at_09-25-23_cqlncy.png',
		pink: 'https://res.cloudinary.com/dtrqaqezs/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1728117597/Screenshot_2024-10-05_at_09-39-28_gkinic.png',
		purple:
			'https://res.cloudinary.com/dtrqaqezs/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1728117666/Screenshot_2024-10-05_at_09-40-33_bui583.png',
		fuchsia:
			'https://res.cloudinary.com/dtrqaqezs/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1728117667/Screenshot_2024-10-05_at_09-40-07_mab2gf.png',
		orange:
			'https://res.cloudinary.com/dtrqaqezs/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1728118053/orange_oyfjss.png',
		yellow:
			'https://res.cloudinary.com/dtrqaqezs/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1728118054/yellow_bfumfp.png',
		amber:
			'https://res.cloudinary.com/dtrqaqezs/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1728118054/amber_xt3qdf.png',
		green:
			'https://res.cloudinary.com/dtrqaqezs/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1728118056/green_k9uowc.png',
		lime: 'https://res.cloudinary.com/dtrqaqezs/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1728118056/lime_mh1zxb.png',
		emerald:
			'https://res.cloudinary.com/dtrqaqezs/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1728118058/emerald_airlve.png',
		teal: 'https://res.cloudinary.com/dtrqaqezs/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1728118058/teal_oc7xx1.png',
		blue: 'https://res.cloudinary.com/dtrqaqezs/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1728118060/blue_wycwgx.png',
		cyan: 'https://res.cloudinary.com/dtrqaqezs/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1728118059/cyan_yqauo2.png',
		indigo:
			'https://res.cloudinary.com/dtrqaqezs/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1728118061/indigo_dt7p4u.png',
		sky: 'https://res.cloudinary.com/dtrqaqezs/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1728118063/sky_bazv9r.png',
		violet:
			'https://res.cloudinary.com/dtrqaqezs/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1728118063/violet_qqygfa.png',
		stone:
			'https://res.cloudinary.com/dtrqaqezs/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1728118085/stone_gqjj5x.png',
		red: 'https://res.cloudinary.com/dtrqaqezs/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1728118085/red_gysz22.png'
	};

	let { data = $bindable() } = $props();
</script>

<!-- <p class=" mb-1 mt-20 max-w-xl gap-1 text-lg text-gray-900 dark:text-white sm:mb-8 sm:max-w-2xl sm:text-xl">
	<span class=" text-{$color}-500"><ArrowRight /></span>Not just cheap though,
	<span class="bg-{$color}-900 text-{$color}-100 font-extrabold">Super fun to use</span>
</p> -->
<!-- <div class="container mx-auto max-w-[1000px] p-3">
	<h2
		class="mb-4 mt-20 text-center font-serif text-2xl font-extrabold leading-tight text-black sm:mb-6 sm:text-3xl lg:text-4xl dark:text-white"
	>
		Your <span class="text-{$color}-600 italic">View</span>, Your
		<span class="text-{$color}-600 italic" style="font-family: inter;">Vibes</span>
	</h2>

	{#key $color}
		<div class="mt-12 rounded-2xl border-4 bg-{$color}-50 p-3 border-{$color}-300">
			<img in:fly={{ y: 10 }} class="rounded-xl" src={images[$color]} alt="" srcset="" />
		</div>
	{/key}
</div> -->
<h2
	class="mb-4 mt-20 text-center font-serif text-2xl font-extrabold leading-tight text-black sm:mb-6 sm:text-3xl lg:text-4xl dark:text-white"
>
	<span class="text-{$color}-600 italic">Demo</span>
</h2>
<div class="md:mx-6">
	<div class="mx-auto max-w-[1500px] dark:text-gray-100">
		<p class="flex gap-2 py-2">
			<span class=" text-{$color}-700"><ArrowRight /></span>Click any entity to filter
		</p>
	</div>
	<div
		class="mx-auto mb-12 max-w-[1500px] border-2 px-2 pt-6 md:rounded-2xl md:px-12 border-{$color}-700"
	>
		<DemoComponent {data} />
	</div>
</div>
