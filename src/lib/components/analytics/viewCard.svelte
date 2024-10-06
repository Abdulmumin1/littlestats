<script>
	import { color } from '$lib/colors/mixer.js';
	import { ArrowBigUp, ArrowUp } from 'lucide-svelte';

	export let name = 'view';
	export let number = '4.5k';
	export let percentange = '504%';
	export let type = 'up';
</script>

<div class="views bg-{$color}-200 px-6" class:red={type == 'down'}>
	<p class="text-gray-800">{name}</p>
	<p class="text-2xl font-extrabold leading-10">{number}</p>
	<p
		class="flex w-fit items-center gap-1 rounded-md bg-{$color}-300 px-1 font-bold text-{$color}-800"
	>
		<ArrowUp size={14} />
		{percentange}
	</p>
</div>

<style>
	.views {
		/* background-color: #22c55e9c; */
		padding-top: 1rem;
		padding-bottom: 1rem;
		border-radius: 0.5rem;
	}
</style>
