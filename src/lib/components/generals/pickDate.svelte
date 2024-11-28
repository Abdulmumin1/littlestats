<script>
	import { run } from 'svelte/legacy';

	import { DatePicker } from '@svelte-plugins/datepicker';
	import { format } from 'date-fns';
	import { Calendar, CalendarRange } from 'lucide-svelte';
	import { onMount, createEventDispatcher } from 'svelte';
	import { color } from '$lib/colors/mixer.js';
	import { clickOutside } from '$lib/index.js';
	import { fade } from 'svelte/transition';

	const dispatch = createEventDispatcher();
	const today = new Date();
	const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

	const getDateFromToday = (days) => {
		return Date.now() - days * MILLISECONDS_IN_DAY;
	};

	let dateFormat = 'MMM d, yyyy';
	let dateModal;
	/**
	 * @typedef {Object} Props
	 * @property {any} [startDate]
	 * @property {any} [endDate]
	 * @property {boolean} [isOpen]
	 */

	/** @type {Props} */
	let { startDate = $bindable(getDateFromToday(29)), endDate = $bindable(today), isOpen = $bindable(false) } = $props();

	const onClearDates = () => {
		startDate = '';
		endDate = '';
		dispatch('clear');
	};

	export function showModal() {
		dateModal.showModal();
		// isOpen = true;
	}

	export function closeModal() {
		// dateModal.close();
		isOpen = false;
	}

	const formatDate = (dateString) => (dateString && format(new Date(dateString), dateFormat)) || '';

	let formattedStartDate = $derived(formatDate(startDate));
	let formattedEndDate = $derived(formatDate(endDate));

	function handleClickOutside(event) {
		if (dateModal && !event.target.closest('.date-picker-container')) {
			closeModal();
		}
	}

	run(() => {
		if (startDate || endDate) {
			dispatch('dateChange', { startDate, endDate });
		}
	});
</script>

{#if isOpen}
	<div transition:fade={{ duration: 400 }} class="modal">
		<div
			transition:fade={{ duration: 150 }}
			class="date-picker-container"
			use:clickOutside
			onclick_outside={closeModal}
		>
			<!-- <DatePicker bind:startDate bind:endDate isRange showPresets alwaysShow bind:isOpen /> -->
			<p class="w-fit text-5xl text-white bg-{$color}-500">Feature incoming...</p>
			<div class="mt-96 flex w-full items-end justify-end gap-2">
				<button onclick={closeModal} class=" text-black bg-{$color}-200 rounded-full px-3 py-2"
					>close</button
				>
				<button onclick={closeModal} class=" text-white bg-{$color}-500 rounded-full px-3 py-2"
					>Select</button
				>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal {
		padding: 0;
		border: none;
		/* background: rgba(0, 0, 0, 0.5); */
		background-color: transparent;
		backdrop-filter: blur(4px);
		height: 100vh;
		width: 100vw;
		z-index: 9999;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		position: fixed;
		/* overflow: auto; */
	}

	.modal::backdrop {
		background: transparent;
	}

	.date-picker-container {
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: transparent;
		padding: 1rem;
		z-index: 999;
		/* pointer-events: none; */
		border-radius: 8px;
		/* box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); */
		/* display: flex; */
		height: 460px;
		max-width: 570px;
		width: 100%;
		position: fixed;
		/* overflow: auto; */

		/* display: flex; */
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
