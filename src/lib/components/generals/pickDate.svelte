<!-- <script>
	import { DatePicker } from '@svelte-plugins/datepicker';
	import { format } from 'date-fns';
	import { Calendar, CalendarRange } from 'lucide-svelte';
	import { onMount, createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
	const today = new Date();
	const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

	const getDateFromToday = (days) => {
		return Date.now() - days * MILLISECONDS_IN_DAY;
	};

	export let startDate = getDateFromToday(29);
	export let endDate = today;
	let dateFormat = 'MMM d, yyyy';
	let dateModal;
	let isOpen = true;

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
		dateModal.close();
		// isOpen = false;
	}

	const formatDate = (dateString) => (dateString && format(new Date(dateString), dateFormat)) || '';

	$: formattedStartDate = formatDate(startDate);
	$: formattedEndDate = formatDate(endDate);

	function handleClickOutside(event) {
		if (dateModal && !event.target.closest('.date-picker-container')) {
			closeModal();
		}
	}

	$: if (startDate || endDate) {
		dispatch('dateChange', { startDate, endDate });
	}
</script>

<div class="date-picker-container">
	<DatePicker bind:startDate bind:endDate isRange showPresets bind:isOpen />
</div>
<dialog
	bind:this={dateModal}
	class="modal"
	on:close={() => {
		isOpen = false;
		dispatch('close');
	}}
></dialog>

<style>
	.modal {
		padding: 0;
		border: none;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
	}

	.modal::backdrop {
		background: transparent;
	}

	.date-picker-container {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: white;
		padding: 1rem;
		height: 100vh;
		width: 100vw;
		border-radius: 8px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
	}

	.modal[open] {
		animation: fadeIn 0.3s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style> -->
