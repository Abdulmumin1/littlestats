<div role="status" aria-live="polite" aria-label="Loading traffic analytics" class="flex min-h-[60vh] flex-col">
	<span class="sr-only">Loading traffic analytics</span>

	<div class="skeleton mb-5 h-7 w-48 border border-stone-200 dark:border-stone-800 md:mb-8"></div>

	<div
		class="mb-5 grid grid-cols-2 gap-3 rounded-none sm:grid-cols-2 md:mb-8 md:gap-4 lg:grid-cols-5 [&>*:last-child]:col-span-2 lg:[&>*:last-child]:col-span-1"
	>
		{#each Array(5) as _, index (index)}
			<div class="h-24 space-y-2 border border-stone-100 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-900">
				<div class="flex items-center justify-between">
					<div class="skeleton h-2.5 w-16"></div>
					<div class="skeleton size-3.5"></div>
				</div>
				<div class="skeleton h-6 w-20"></div>
				<div class="skeleton h-2.5 w-12"></div>
			</div>
		{/each}
	</div>

	<div class="skeleton h-52 w-full md:h-75"></div>

	<div class="grid grid-cols-1 gap-6 rounded-none lg:grid-cols-2">
		{#each Array(3) as _, sectionIndex (sectionIndex)}
			<div class="flex flex-col overflow-hidden rounded-none border border-stone-100 bg-stone-50 dark:border-stone-800 dark:bg-stone-900">
				<div class="flex h-14 items-center justify-between border-b border-stone-100 bg-white/50 px-4 dark:border-stone-800 dark:bg-stone-900/50 md:px-6">
					<div class="skeleton h-2.5 w-24"></div>
					<div class="skeleton h-2.5 w-16"></div>
				</div>
				<div class="flex-1 space-y-0.5 p-2">
					{#each Array(5) as _, rowIndex (rowIndex)}
						<div class="skeleton h-[46px] border border-stone-200/60 dark:border-stone-800"></div>
					{/each}
				</div>
			</div>
		{/each}

		<div class="flex flex-col overflow-hidden rounded-none border border-stone-100 bg-stone-50 dark:border-stone-800 dark:bg-stone-900">
			<div class="flex h-14 items-center justify-between border-b border-stone-100 bg-white/50 px-4 dark:border-stone-800 dark:bg-stone-900/50 md:px-6">
				<div class="skeleton h-2.5 w-20"></div>
				<div class="skeleton h-2.5 w-10"></div>
			</div>
			<div class="flex-1 space-y-4 p-4 md:p-6">
				{#each Array(3) as _, rowIndex (rowIndex)}
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<div class="skeleton h-3 w-24"></div>
							<div class="skeleton h-2.5 w-8"></div>
						</div>
						<div class="skeleton h-1 w-full"></div>
					</div>
				{/each}
			</div>
		</div>
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
