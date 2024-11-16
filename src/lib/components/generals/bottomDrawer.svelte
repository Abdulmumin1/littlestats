<script>
	import { spring } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { color } from '$lib/colors/mixer.js';
	import { clickOutside } from '$lib/utils';
	export let height = 520;
	export let isOpen = false;
	export let closeThreshold = 0.23; // Percentage of height to trigger close

	let drawerEl;
	let contentEl;
	let isDragging = false;
	let isScrolling = false;
	let startY;
	let startBottom;

	const position = spring(isOpen ? 0 : -height, {
		stiffness: 0.1,
		damping: 0.4,
		easing: cubicOut
	});

	$: {
		position.set(isOpen ? 0 : -height);
	}

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
	on:mousemove={handleMouseMove}
	on:mouseup={handleMouseUp}
	on:touchmove={handleTouchMove}
	on:touchend={handleTouchEnd}
/>

<div class="drawer-container">
	<button class="z-0 handle text-black" on:click={toggleDrawer}><slot name="handle" /></button>
	<div
		class="drawer bg-{$color}-50 dark:bg-stone-900 mx-auto max-w-7xl"
		style="height: {height}px; bottom: {$position}px;"
		bind:this={drawerEl}
		on:mousedown={handleMouseDown}
		on:touchstart={handleTouchStart}
		use:clickOutside
		on:click_outside={() => {
			isOpen = false;
		}}
	>
		<div class="drawer-handle bg-{$color}-700"></div>
		<slot name="header" />

		<div class="drawer-content" bind:this={contentEl}>
			<!-- <p>Drag down to close.</p> -->
			<slot name="content" />
		</div>
	</div>
</div>

<style>
	.drawer-container {
		position: relative;
		z-index: 9999;
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
	}

	.drawer-handle {
		width: 50px;
		height: 5px;
		border-radius: 3px;
		margin: 10px auto;
		flex-shrink: 0;
	}
	.handle{
		z-index: 0 !important;

	}

	* .handle{
		z-index: 0 !important;

	}

	.drawer-content {
		padding: 0 20px 20px;
		overflow-y: auto;
		flex-grow: 1;
		height: calc(100% - 25px); /* Subtracting the handle height and its margin */
	}
</style>
