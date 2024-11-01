<script>
	import { color } from '$lib/colors/mixer.js';
	export let dismissable = true;
	let isVisible = true;

	function dismissBanner() {
		if (dismissable) {
			isVisible = false;
		}
	}
</script>

{#if isVisible}
	<div
		class="w-full bg-{$color}-500 relative mb-4 rounded-lg px-4 py-3 text-center text-white"
		style="z-index: 1000;"
	>
		<div class="mx-auto flex max-w-6xl items-center justify-center">
			<div class="inline-flex flex-col gap-2 space-x-4 md:flex-row md:items-center md:gap-0">
				<span class="text-sm font-bold sm:text-base"> 🎉 Early Bird Special: </span>
				<span class="bg-white text-{$color}-600 rounded-full px-2 py-1 text-xs font-semibold">
					Save 20%
				</span>
				<span class="text-sm sm:text-base">
					on yearly Plan with coupon <strong>Q1OTE0MW</strong>
				</span>
			</div>

			{#if dismissable}
				<button
					on:click={dismissBanner}
					class="absolute right-4 top-1/2 -translate-y-1/2 transform transition-opacity hover:opacity-75"
					aria-label="Dismiss banner"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			{/if}
		</div>
	</div>
{/if}
