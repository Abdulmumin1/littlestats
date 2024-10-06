<script>
	import { spring } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	export let side = 'left'; // 'left' or 'right'
	export let width = 300;
	export let isOpen = false;

	let drawerEl;
	let isDragging = false;
	let startX;
	let startY;
	let startLeft;

	const position = spring(isOpen ? 0 : -width, {
		stiffness: 0.1,
		damping: 0.4,
		easing: cubicOut
	});

	$: {
		position.set(isOpen ? 0 : -width);
	}

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
	on:mousemove={handleMouseMove}
	on:mouseup={handleMouseUp}
	on:touchmove={handleTouchMove}
	on:touchend={handleTouchEnd}
/>

<div class="drawer-container">
	<button on:click={toggleDrawer}>Toggle Drawer</button>
	<div
		class="drawer"
		style="width: {width}px; {side}: {$position}px;"
		bind:this={drawerEl}
		on:mousedown={handleMouseDown}
		on:touchstart={handleTouchStart}
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
