<script>
	import { spring } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { color } from '$lib/colors/mixer.js';
	import { clickOutside } from '$lib/utils';
	import { Search, X } from 'lucide-svelte';

	let {
		height = 520,
		isOpen = $bindable(false),
		closeThreshold = 0.23,
		handle,
		header,
		content,
		searchQuery
	} = $props();

	let drawerEl = $state();
	let contentEl = $state();
	let isDragging = false;
	let isScrolling = false;
	let startY;
	let startBottom;

	const position = spring(isOpen ? 0 : -height, {
		stiffness: 0.1,
		damping: 0.4,
		easing: cubicOut
	});

	$effect(() => {
		position.set(isOpen ? 0 : -height);
	});

	function handleMouseDown(event) {
		if (event.target.closest('.drawer-content') && contentEl.scrollTop > 0) {
			isScrolling = true;
			return;
		}
		isDragging = true;
		startY = event.clientY;
		startBottom = $position;
		event.preventDefault();
	}

	function handleTouchStart(event) {
		if (event.target.closest('.drawer-content') && contentEl.scrollTop > 0) {
			isScrolling = true;
			return;
		}
		isDragging = true;
		startY = event.touches[0].clientY;
		startBottom = $position;
	}

	function handleMouseMove(event) {
		if (!isDragging || isScrolling) return;
		const dy = startY - event.clientY;
		const newBottom = Math.max(-height, Math.min(0, startBottom + dy));
		position.set(newBottom);
	}

	function handleTouchMove(event) {
		if (!isDragging || isScrolling) return;
		const dy = startY - event.touches[0].clientY;
		const newBottom = Math.max(-height, Math.min(0, startBottom + dy));
		position.set(newBottom);
		event.preventDefault();
	}

	function handleMouseUp() {
		if (isScrolling) {
			isScrolling = false;
			return;
		}
		if (!isDragging) return;
		isDragging = false;
		if (Math.abs($position) > height * closeThreshold) {
			isOpen = false;
		} else {
			isOpen = true;
		}
	}

	function handleTouchEnd() {
		handleMouseUp();
	}

	function toggleDrawer() {
		isOpen = !isOpen;
	}

	let startSearching = $state(false);
	function toggleSearching() {
		startSearching = !startSearching;
	}

	$effect(() => {
		if (isOpen) {
			searchQuery({ target: { value: '' } });
		}
	});
</script>

<svelte:window
	onmousemove={handleMouseMove}
	onmouseup={handleMouseUp}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
/>

<div class="drawer-container">
	<button
		class="handle z-0 rounded-lg text-black dark:text-gray-100"
		onclick={toggleDrawer}
		aria-expanded={isOpen ? 'true' : 'false'}
		aria-controls="drawer"
		id="drawer-toggle"
		aria-label="Toggle Drawer"
	>
		{@render handle?.()}
	</button>

	<div
		class="drawer bg-{$color}-50 mx-auto max-w-7xl dark:bg-stone-900"
		style="height: {height}px; bottom: {$position}px;"
		use:clickOutside
		onclick_outside={() => {
			isOpen = false;
		}}
	>
		<div
			class:shadow-custom-light={isOpen}
			bind:this={drawerEl}
			onmousedown={handleMouseDown}
			ontouchstart={handleTouchStart}
			id="drawer"
			role="region"
			aria-labelledby="drawer-toggle"
			tabindex="-1"
			aria-hidden={isOpen ? 'false' : 'true'}
		>
			<div class="drawer-handle bg-{$color}-600 dark:bg-{$color}-700"></div>
			{@render header?.()}
		</div>
		<div class="relative flex items-center gap-2 bg-inherit px-4 py-2">
			<input
				type="text"
				placeholder="Search"
				oninput={searchQuery}
				class="z-50 w-full rounded-lg bg-white/30 p-2 dark:bg-stone-800/30"
				style="z-index: 1000 !important;"
			/>

			<div
				class="rounded-full px-2 py-1 hover:bg-white dark:hover:bg-stone-700/50"
				aria-label="Start Searching"
			>
				<Search />
			</div>
		</div>
		<!-- {#if isOpen} -->

		<div class:hidden={!isOpen} class="drawer-content cool-scrollbar" bind:this={contentEl}>
			{@render content?.()}
		</div>
		<!-- {/if} -->
	</div>
</div>

<style>
	.drawer-container {
		position: relative;
	}

	.drawer {
		position: fixed;
		left: 0;
		right: 0;
		border-top-left-radius: 10px;
		border-top-right-radius: 10px;
		transition: transform 0.3s ease;
		display: flex;
		flex-direction: column;
		z-index: 9999 !important;
	}

	.drawer-handle {
		width: 50px;
		height: 5px;
		border-radius: 3px;
		margin: 10px auto;
		flex-shrink: 0;
	}

	.drawer-content {
		/* padding: 0 20px 20px; */
		overflow-y: auto;
		flex-grow: 1;
		z-index: 9999 !important;
		height: calc(100% - 25px); /* Subtracting the handle height and its margin */
	}
</style>
