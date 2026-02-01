<script>
	import { run } from 'svelte/legacy';

	import { spring } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	/**
	 * @typedef {Object} Props
	 * @property {string} [side] - 'left' or 'right'
	 * @property {number} [width]
	 * @property {boolean} [isOpen]
	 */

	/** @type {Props} */
	let { side = 'left', width = 300, isOpen = $bindable(false), handle } = $props();

	let drawerEl = $state();
	let isDragging = false;
	let startX;
	let startY;
	let startLeft;

	const position = spring(isOpen ? 0 : -width, {
		stiffness: 0.1,
		damping: 0.4,
		easing: cubicOut
	});

	run(() => {
		position.set(isOpen ? 0 : -width);
	});

	function handleMouseDown(event) {
		isDragging = true;
		startX = event.clientX;
		startY = event.clientY;
		startLeft = $position;
		event.preventDefault();
	}

	function handleTouchStart(event) {
		isDragging = true;
		startX = event.touches[0].clientX;
		startY = event.touches[0].clientY;
		startLeft = $position;
	}

	function handleMouseMove(event) {
		if (!isDragging) return;
		const dx = event.clientX - startX;
		const newLeft = side === 'left' ? startLeft + dx : startLeft - dx;
		position.set(Math.max(-width, Math.min(0, newLeft)));
	}

	function handleTouchMove(event) {
		if (!isDragging) return;
		const dx = event.touches[0].clientX - startX;
		const newLeft = side === 'left' ? startLeft + dx : startLeft - dx;
		position.set(Math.max(-width, Math.min(0, newLeft)));
		event.preventDefault();
	}

	function handleMouseUp() {
		if (!isDragging) return;
		isDragging = false;
		const threshold = width / 2;
		if (Math.abs($position) > threshold) {
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
	<div onclick={toggleDrawer}>
		{@render handle?.()}
	</div>
	<div
		class="drawer"
		style="width: {width}px; {side}: {$position}px;"
		bind:this={drawerEl}
		onmousedown={handleMouseDown}
		ontouchstart={handleTouchStart}
	>
		<div class="drawer-content">
			<h2>Drawer Content</h2>
			<p>This is the content of the drawer. You can add any elements here.</p>
		</div>
	</div>
</div>

<style>
	.drawer-container {
		position: relative;
		overflow: hidden;
		height: 100vh;
	}

	.drawer {
		position: fixed;
		top: 0;
		height: 100%;
		background-color: #f0f0f0;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
		transition: transform 0.3s ease;
	}

	.drawer-content {
		padding: 20px;
	}

	button {
		margin: 20px;
		padding: 10px 20px;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 5px;
		cursor: pointer;
	}

	button:hover {
		background-color: #0056b3;
	}
</style>
