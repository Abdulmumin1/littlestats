<div role="status" aria-live="polite" class="w-full space-y-5 py-2">
	<span class="sr-only">Loading analytics</span>
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
		{#each Array(3) as _, index (index)}
			<div class="skeleton h-28 border border-stone-100 dark:border-stone-800"></div>
		{/each}
	</div>
	<div class="skeleton h-72 border border-stone-100 dark:border-stone-800"></div>
	<div class="space-y-2 border border-stone-100 p-3 dark:border-stone-800">
		{#each Array(4) as _, index (index)}
			<div class="skeleton h-11"></div>
		{/each}
	</div>
</div>

<style>
	.skeleton {
		background: linear-gradient(90deg, rgb(231 229 228 / 0.34) 25%, rgb(214 211 209 / 0.3) 50%, rgb(231 229 228 / 0.34) 75%);
		background-size: 200% 100%;
		animation: shimmer 2.4s ease-in-out infinite;
	}
	:global(.dark) .skeleton {
		background: linear-gradient(90deg, rgb(68 64 60 / 0.2) 25%, rgb(87 83 78 / 0.18) 50%, rgb(68 64 60 / 0.2) 75%);
		background-size: 200% 100%;
	}
	@keyframes shimmer {
		from { background-position: 200% 0; }
		to { background-position: -200% 0; }
	}
	@media (prefers-reduced-motion: reduce) {
		.skeleton { animation: none; }
	}
</style>
