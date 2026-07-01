<script>
	let {
		children,
		class: className = '',
		maxWidth = 'max-w-7xl'
	} = $props();
</script>

<div class={`min-h-screen mx-auto p-6 text-stone-900 dark:text-stone-100 rounded-none ${maxWidth} ${className}`.trim()}>
	{@render children?.()}
</div>
