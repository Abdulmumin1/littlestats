<script>
	import { color } from '$lib/colors/mixer.js';

	const keyFeatures = [
		{
			title: 'Traffic Monitoring',
			description: 'Optimize performance with sweet traffic flow insights.'
		},
		{
			title: 'Customizable Event Tracking',
			description: 'Monitor specific interactions tailored to your website needs.'
		},
		{
			title: 'Privacy-Focused Analytics',
			description: 'Analyze without cookies or storing personal data, prioritizing user privacy.'
		},
		{
			title: 'Edge-Based First-Party Collection',
			description: "Gather data directly through your website's domain."
		},
		{
			title: 'Seamless Setup Process',
			description: 'Implement with minimal code. Compatible with all websites.'
		},
		{
			title: 'Your site stays fast',
			description: 'Maintain website speed with our compact tracking script under 3kb.'
		}
	];
</script>

<div
	id="features"
	class="mx-auto mt-12 max-w-5xl bg-{$color}-100 rounded-2xl border-4 p-4 border-{$color}-300"
>
	<h3
		class=" mb-3 px-2 text-xl font-bold bg-{$color}-500 text-{$color}-100 w-fit rounded-full px-3 py-[.15rem]"
	>
		Features
	</h3>
	<div class="grid grid-cols-1 gap-5 md:grid-cols-2">
		{#each keyFeatures as feature}
			<div class="rounded-xl bg-{$color}-200 p-6">
				<h4 class="mb-2 text-lg font-semibold">{feature.title}</h4>
				<p class="text-{$color}-900">{feature.description}</p>
			</div>
		{/each}
	</div>
</div>
