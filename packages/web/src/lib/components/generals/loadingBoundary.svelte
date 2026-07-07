<script>
	import { fade } from 'svelte/transition';

	let {
		loading,
		fallback,
		children,
		label = 'Loading content'
	} = $props();
</script>

<div class="loading-boundary">
	{#if loading}
		<div
			class="loading-layer"
			role="status"
			aria-live="polite"
			aria-label={label}
			out:fade={{ duration: 90 }}
		>
			{@render fallback()}
		</div>
	{:else}
		<div class="content-layer" in:fade={{ duration: 140 }}>
			{@render children()}
		</div>
	{/if}
</div>

<style>
	.loading-boundary {
		display: grid;
		width: 100%;
		overflow-anchor: none;
	}

	.loading-layer,
	.content-layer {
		grid-area: 1 / 1;
		min-width: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.loading-layer,
		.content-layer {
			animation-duration: 0ms !important;
		}
	}
</style>
