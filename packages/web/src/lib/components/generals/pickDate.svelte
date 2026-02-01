<script>
	import { defaultRange as DateRange } from './../../globalstate.svelte.js';
	import { run } from 'svelte/legacy';

	import { DatePicker } from '@svelte-plugins/datepicker';
	import { format } from 'date-fns';
	import { Calendar, CalendarRange } from 'lucide-svelte';
	import { onMount, createEventDispatcher } from 'svelte';
	import { color, colorList } from '$lib/colors/mixer.js';
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
	let {
		startDate = $bindable(getDateFromToday(29)),
		endDate = $bindable(today),

		isOpen = $bindable(false)
	} = $props();

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

	$effect(() => {
		if (startDate || endDate) {
			dispatch('dateChange', { startDate, endDate });
		}
	});

	function save() {
		DateRange.setCustom(true);
		DateRange.setRange(startDate, endDate);
		dispatch('close', { startDate, endDate });
		closeModal();
	}

	onMount(() => {
		let unsubscribe = color.subscribe((c) => {
			const root = document.documentElement;
			const theme = colorList[c];
			root.style.setProperty('--datepicker-container-background', 'white');
			root.style.setProperty('--datepicker-container-border', `none`);
			root.style.setProperty('--datepicker-container-box-shadow', '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)');
			
			root.style.setProperty('--datepicker-calendar-range-selected-background', theme.primary);
			root.style.setProperty('--datepicker-calendar-day-selected-background', theme.primary);
			root.style.setProperty('--datepicker-calendar-day-selected-color', 'white');
			root.style.setProperty('--datepicker-calendar-day-range-background', `${theme.primary}20`); // 12.5% opacity
			root.style.setProperty('--datepicker-calendar-day-hover-background', `${theme.primary}10`);
			
			root.style.setProperty('--datepicker-calendar-header-month-nav-background-hover', theme.primary);
			root.style.setProperty('--datepicker-calendar-header-month-nav-color-hover', 'white');
			
			root.style.setProperty('--datepicker-presets-button-background-active', theme.primary);
			root.style.setProperty('--datepicker-presets-button-color-active', 'white');
			root.style.setProperty('--datepicker-presets-button-background-hover', `${theme.primary}10`);
			
			// Transitions and radius
			root.style.setProperty('--datepicker-container-border-radius', '0');
			root.style.setProperty('--datepicker-calendar-day-border-radius', '0');
			root.style.setProperty('--datepicker-presets-button-border-radius', '0');
		});

		return () => {
			unsubscribe();
		};
	});
</script>

{#if isOpen}
	<div transition:fade={{ duration: 400 }} class="modal">
		<div
			transition:fade={{ duration: 150 }}
			class="date-picker-container items-center justify-center"
			use:clickOutside
			onclick_outside={closeModal}
		>
			<DatePicker
				theme="custom-datepicker"
				bind:startDate
				bind:endDate
				isRange
				showPresets
				alwaysShow
				bind:isOpen
			/>
			<div class="flex w-full absolute bottom-0 items-end justify-end gap-2 px-5 pb-5 bg-white dark:bg-stone-900">
				<button
					onclick={() => {
						closeModal();
					}}
					class=" text-black bg-{$color}-100 rounded-none px-4 py-2 font-medium transition-colors hover:bg-{$color}-200">close</button
				>
				<button onclick={save} class=" text-white bg-{$color}-500 rounded-none px-4 py-2 font-medium transition-colors hover:bg-{$color}-600"
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
		background: rgba(0, 0, 0, 0.3);
		/* background-color: transparent; */
		/* backdrop-filter: blur(1px); */
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
		background: white;
		padding: 0;
		z-index: 999;
		border-radius: 0;
		box-shadow: none;
		max-width: 570px;
		width: 100%;
		height: 500px;
		position: fixed;
		/* display: flex; */
		/* flex-direction: column; */
	}

	:global(.dark .date-picker-container) {
		background: #1c1917;
	}

	:global(.datepicker[data-picker-theme='custom-datepicker']) {
		border: none !important;
		background: transparent !important;
		width: 100% !important;
		display: block !important;
		position: relative !important;
	}

	:global(.datepicker[data-picker-theme='custom-datepicker'] .datepicker-container) {
		border: none !important;
		box-shadow: none !important;
		background: transparent !important;
		position: static !important;
		transform: none !important;
		display: flex !important;
		flex-direction: row !important;
		width: 100% !important;
	}

	:global(.datepicker[data-picker-theme='custom-datepicker'] .datepicker-presets) {
		border: none !important;
		background: transparent !important;
		width: 180px !important;
		border-right: 1px solid #f3f4f6 !important;
		flex-shrink: 0 !important;
	}

	:global(.datepicker[data-picker-theme='custom-datepicker'] .datepicker-calendar) {
		border: none !important;
		background: transparent !important;
		flex: 1 !important;
	}

	:global(.dark .datepicker[data-picker-theme='custom-datepicker'] .datepicker-presets) {
		border-right: 1px solid #292524 !important;
	}

	:global(.datepicker[data-picker-theme='custom-datepicker'] *) {
		border-radius: 0 !important;
		box-shadow: none !important;
	}

	:global(.dark) {
		--datepicker-container-background: #1c1917;
		--datepicker-calendar-day-color: #e7e5e4;
		--datepicker-calendar-header-month-nav-color: #e7e5e4;
		--datepicker-presets-button-color: #e7e5e4;
		--datepicker-calendar-day-range-background: rgba(255, 255, 255, 0.05);
	}
</style>
