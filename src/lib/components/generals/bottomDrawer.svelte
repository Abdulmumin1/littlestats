<script>
	import { run } from 'svelte/legacy';

	import { spring } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { color } from '$lib/colors/mixer.js';
	import { clickOutside } from '$lib/utils';
	/**
	 * @typedef {Object} Props
	 * @property {number} [height]
	 * @property {boolean} [isOpen]
	 * @property {number} [closeThreshold] - Percentage of height to trigger close
	 * @property {import('svelte').Snippet} [handle]
	 * @property {import('svelte').Snippet} [header]
	 * @property {import('svelte').Snippet} [content]
	 */

	/** @type {Props} */
	let {
		height = 520,
		isOpen = $bindable(false),
		closeThreshold = 0.23,
		handle,
		header,
		content
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

	run(() => {
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
</script>

<svelte:window
	onmousemove={handleMouseMove}
	onmouseup={handleMouseUp}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
/>

<div class="drawer-container">
	<button class="handle z-0 text-black dark:text-gray-100" onclick={toggleDrawer}
		>{@render handle?.()}</button
	>
	<div
		class="drawer bg-{$color}-50 mx-auto max-w-7xl dark:bg-stone-900"
		style="height: {height}px; bottom: {$position}px;"
		bind:this={drawerEl}
		onmousedown={handleMouseDown}
		ontouchstart={handleTouchStart}
		use:clickOutside
		onclick_outside={() => {
			isOpen = false;
		}}
	>
		<div class="drawer-handle bg-{$color}-600 dark:bg-{$color}-700"></div>
		{@render header?.()}

		<div class="drawer-content cool-scrollbar" bind:this={contentEl}>
			<!-- <p>Drag down to close.</p> -->
			{@render content?.()}
		</div>
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
		box-shadow: 0 -10px 100px rgba(0, 0, 0, 0.089);
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
	.handle {
		z-index: 0 !important;
	}

	* .handle {
		z-index: 0 !important;
	}

	.drawer-content {
		padding: 0 20px 20px;
		overflow-y: auto;
		flex-grow: 1;
		z-index: 9999 !important;
		height: calc(100% - 25px); /* Subtracting the handle height and its margin */
	}
</style>
