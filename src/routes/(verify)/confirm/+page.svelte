<script>
	let { data } = $props();
</script>

{#if data.fail}
	<div class="flex min-h-screen items-center justify-center">
		<p class="text-3xl font-semibold">{data.fail}</p>
	</div>
{/if}
