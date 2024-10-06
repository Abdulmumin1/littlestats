<script>
	import { fly } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';
	import { show_toast } from '$lib/toast.js';

	let message = $show_toast?.message;
	let type = $show_toast.type ?? 'info'; // 'info', 'success', 'warning', 'error'
	let duration = $show_toast.duration ?? 3000; // Duration in milliseconds
	let position = $show_toast.pos ?? 'bottom-right'; // 'top-left', 'top-right', 'bottom-left', 'bottom-right'

	const dispatch = createEventDispatcher();

	$: typeClasses = {
		info: 'bg-blue-500',
		success: 'bg-green-500',
		warning: 'bg-yellow-500',
		error: 'bg-red-500'
	};

	$: positionClasses = {
		'top-left': 'top-4 left-4',
		'top-right': 'top-4 right-4',
		'bottom-left': 'bottom-4 left-4',
		'bottom-right': 'bottom-4 right-4'
	};

	function closeToast() {
		show_toast.set(null);
		// dispatch('close');
	}

	// Auto-close after duration
	if (duration > 0) {
		setTimeout(closeToast, duration);
	}
</script>

<div
	transition:fly={{ y: 50 }}
	class="fixed z-50 max-w-md rounded-lg p-2 text-white shadow-lg {typeClasses[
		type
	]} {positionClasses[position]}"
	role="alert"
>
	<div class="flex items-center justify-between">
		<p>{message}</p>
		<button on:click={closeToast} class="ml-4 text-white hover:text-gray-200 focus:outline-none">
			<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
				<path
					fill-rule="evenodd"
					d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
					clip-rule="evenodd"
				/>
			</svg>
		</button>
	</div>
</div>
