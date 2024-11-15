<script>
	import { color } from '$lib/colors/mixer.js';
</script>

<div class="rounded-xl bg-{$color}-50">
	<div
		id="box"
		class="bg-stone-900"
		style="--mask: radial-gradient(14.14px at 50% calc(100% - 20px),#000 99%,#0000 101%) calc(50% - 20px) 0/40px 100%,
radial-gradient(14.14px at 50% calc(100% + 10px),#0000 99%,#000 101%) 50% calc(100% - 10px)/40px 100% repeat-x;"
	></div>

	<h1 class="mb-2 mt-4 px-5 text-3xl font-bold text-{$color}-900"><slot /></h1>
	<p class="mb-4 px-5 text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>

	<div
		id="demo"
		class="bg-stone-900"
		style="--mask: radial-gradient(14.14px at 50% 20px,#000 99%,#0000 101%) calc(50% - 20px) 0/40px 100%,
    radial-gradient(14.14px at 50% -10px,#0000 99%,#000 101%) 50% 10px/40px 100% repeat-x;"
	></div>
</div>

<style>
	#box {
		height: 40px;
		mask: var(--mask);
	}

	#demo {
		/* min-height: 250px; */
		height: 20px;
		/* background: linear-gradient(60deg, #4ecdc4, #00a0b0); */

		mask: var(--mask);
	}
</style>
