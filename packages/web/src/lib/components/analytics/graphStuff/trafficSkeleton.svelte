<div role="status" aria-live="polite" class="space-y-8" aria-label="Loading traffic analytics">
	<span class="sr-only">Loading traffic analytics</span>

	<div class="skeleton h-7 w-48 border border-stone-100 dark:border-stone-800"></div>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
		{#each Array(5) as _, index (index)}
			<div class="h-28 space-y-3 border border-stone-100 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-900">
				<div class="skeleton h-2.5 w-20"></div>
				<div class="skeleton h-7 w-24"></div>
				<div class="skeleton h-2.5 w-14"></div>
			</div>
		{/each}
	</div>

	<div class="border border-stone-100 bg-stone-50 p-6 dark:border-stone-800 dark:bg-stone-900">
		<div class="mb-8 flex items-center justify-between">
			<div class="skeleton h-2.5 w-32"></div>
			<div class="skeleton h-9 w-28"></div>
		</div>
		<div class="skeleton h-72 w-full"></div>
	</div>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		{#each Array(4) as _, sectionIndex (sectionIndex)}
			<div class="border border-stone-100 bg-stone-50 p-3 dark:border-stone-800 dark:bg-stone-900">
				<div class="mb-4 flex items-center justify-between px-2 py-2">
					<div class="skeleton h-2.5 w-24"></div>
					<div class="skeleton h-2.5 w-16"></div>
				</div>
				<div class="space-y-1">
					{#each Array(5) as _, rowIndex (rowIndex)}
						<div class="skeleton h-11"></div>
					{/each}
				</div>
			</div>
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
