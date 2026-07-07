<script>
	import { defaultRange as DateRange } from './../../globalstate.svelte.js';
	import { DatePicker } from '@svelte-plugins/datepicker';
	import { format } from 'date-fns';
	import { X } from 'lucide-svelte';
	import { onMount, createEventDispatcher } from 'svelte';
	import { color, colorList } from '$lib/colors/mixer.js';
	import { clickOutside } from '$lib/index.js';
	import { getInclusiveRangeDays } from '$lib/utils/dateRange.js';
	import { fade } from 'svelte/transition';

	const dispatch = createEventDispatcher();
	const today = new Date();
	const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;
	const presetLabels = ['Today', 'Last 7 Days', 'Last 30 Days', 'Last 60 Days', 'Last 90 Days', 'Last Year'];

	const getDateFromToday = (days) => Date.now() - days * MILLISECONDS_IN_DAY;

	let dateFormat = 'MMM d, yyyy';
	let showMultiPane = $state(false);
	let showPresetsPane = $state(true);

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

	const formatDate = (dateValue) => (dateValue && format(new Date(dateValue), dateFormat)) || '';

	let theme = $derived(colorList[$color] ?? colorList.purple);
	let resolvedStart = $derived(startDate || endDate);
	let resolvedEnd = $derived(endDate || startDate);
	let selectedDays = $derived(
		resolvedStart && resolvedEnd ? getInclusiveRangeDays(resolvedStart, resolvedEnd) : 0
	);
	let headline = $derived.by(() => {
		if (!resolvedStart && !resolvedEnd) return 'Choose a day or range';
		if (selectedDays <= 1) return formatDate(resolvedStart || resolvedEnd);
		return `${formatDate(resolvedStart)} to ${formatDate(resolvedEnd)}`;
	});
	let helperText = $derived.by(() => {
		if (!resolvedStart && !resolvedEnd) {
			return 'Single click selects one day. Two clicks build a range.';
		}
		if (startDate && !endDate) {
			return 'Tap Apply to use just this day, or pick another date to extend the range.';
		}
		return `${selectedDays} ${selectedDays === 1 ? 'day' : 'days'} selected`;
	});
	let selectionSpan = $derived(
		selectedDays ? `${selectedDays} ${selectedDays === 1 ? 'day' : 'days'}` : 'No dates selected'
	);

	function closeModal() {
		isOpen = false;
	}

	function updateCalendarLayout() {
		showMultiPane = window.innerWidth >= 980;
		showPresetsPane = window.innerWidth >= 640;
	}

	$effect(() => {
		if (startDate || endDate) {
			dispatch('dateChange', { startDate, endDate });
		}
	});

	function save() {
		// A single calendar click represents one complete day. The datepicker
		// leaves endDate empty while it waits for a second click, so normalize
		// that state into an inclusive one-day range before publishing it.
		if (!startDate && !endDate) return;
		startDate = startDate || endDate;
		endDate = endDate || startDate;

		DateRange.setCustom(true);
		DateRange.setRange(startDate, endDate);
		dispatch('close', { startDate, endDate });
		closeModal();
	}

	onMount(() => {
		updateCalendarLayout();
		const handleResize = () => updateCalendarLayout();
		window.addEventListener('resize', handleResize);

		const unsubscribe = color.subscribe((c) => {
			const root = document.documentElement;
			const palette = colorList[c] ?? colorList.purple;

			root.style.setProperty('--datepicker-font-family', 'inherit');
			root.style.setProperty('--datepicker-spacing', '10px');
			root.style.setProperty('--datepicker-container-background', 'transparent');
			root.style.setProperty('--datepicker-container-border', 'none');
			root.style.setProperty('--datepicker-container-box-shadow', 'none');
			root.style.setProperty('--datepicker-container-border-radius', '0');
			root.style.setProperty('--datepicker-calendar-width', '100%');
			root.style.setProperty('--datepicker-calendar-padding', '0');
			root.style.setProperty('--datepicker-calendar-header-padding', '0 0 1rem');
			root.style.setProperty('--datepicker-calendar-header-margin', '0 0 1rem');
			root.style.setProperty('--datepicker-calendar-header-font-size', '1.125rem');
			root.style.setProperty('--datepicker-calendar-header-text-font-weight', '700');
			root.style.setProperty('--datepicker-calendar-header-month-nav-height', '40px');
			root.style.setProperty('--datepicker-calendar-header-month-nav-width', '40px');
			root.style.setProperty('--datepicker-calendar-header-month-nav-border-radius', '0');
			root.style.setProperty('--datepicker-calendar-header-month-nav-margin-left', '0');
			root.style.setProperty('--datepicker-calendar-header-month-nav-background-hover', `${palette.primary}14`);

			root.style.setProperty('--datepicker-presets-border', '0');
			root.style.setProperty('--datepicker-presets-padding', '0');
			root.style.setProperty('--datepicker-presets-minwidth', '0');
			root.style.setProperty('--datepicker-presets-maxwidth', '220px');
			root.style.setProperty('--datepicker-presets-button-background-active', palette.primary);
			root.style.setProperty('--datepicker-presets-button-color-active', 'white');
			root.style.setProperty('--datepicker-presets-button-background-hover', `${palette.primary}10`);
			root.style.setProperty('--datepicker-presets-button-border-radius', '0');
			root.style.setProperty('--datepicker-presets-button-border-radius-active', '0');
			root.style.setProperty('--datepicker-presets-button-font-size', '0.8125rem');
			root.style.setProperty('--datepicker-presets-button-margin', '0');
			root.style.setProperty('--datepicker-presets-button-padding', '0.875rem 1rem');

			root.style.setProperty('--datepicker-calendar-dow-font-size', '0.75rem');
			root.style.setProperty('--datepicker-calendar-dow-font-weight', '800');
			root.style.setProperty('--datepicker-calendar-dow-margin-bottom', '0.75rem');
			root.style.setProperty('--datepicker-calendar-day-height', '44px');
			root.style.setProperty('--datepicker-calendar-day-width', '100%');
			root.style.setProperty('--datepicker-calendar-day-padding', '0');
			root.style.setProperty('--datepicker-calendar-day-font-size', '0.95rem');
			root.style.setProperty('--datepicker-calendar-day-border-radius', '0');
			root.style.setProperty('--datepicker-calendar-day-background-hover', `${palette.primary}10`);
			root.style.setProperty('--datepicker-calendar-today-background', 'transparent');
			root.style.setProperty('--datepicker-calendar-today-border', `1px solid ${palette.primary}50`);

			root.style.setProperty('--datepicker-calendar-range-background', `${palette.primary}10`);
			root.style.setProperty('--datepicker-calendar-range-border-radius', '0');
			root.style.setProperty('--datepicker-calendar-range-start-end-background', `${palette.primary}18`);
			root.style.setProperty('--datepicker-calendar-range-selected-background', palette.primary);
			root.style.setProperty('--datepicker-calendar-range-selected-color', 'white');
			root.style.setProperty('--datepicker-calendar-range-selected-border-radius', '0');
			root.style.setProperty('--datepicker-calendar-range-selected-start-border-radius', '0');
			root.style.setProperty('--datepicker-calendar-range-start-box-shadow', `inset -22px 0 0 ${palette.primary}10`);
			root.style.setProperty('--datepicker-calendar-range-end-box-shadow', `inset 22px 0 0 ${palette.primary}10`);
			root.style.setProperty('--datepicker-calendar-range-start-box-shadow-selected', `inset -22px 0 0 ${palette.primary}18`);
			root.style.setProperty('--datepicker-calendar-range-end-box-shadow-selected', `inset 22px 0 0 ${palette.primary}18`);
			root.style.setProperty('--datepicker-calendar-range-included-background', `${palette.primary}18`);
			root.style.setProperty('--datepicker-calendar-range-included-height', '44px');
		});

		return () => {
			unsubscribe();
			window.removeEventListener('resize', handleResize);
		};
	});
</script>

{#if isOpen}
	<div transition:fade={{ duration: 400 }} class="modal">
		<div
			transition:fade={{ duration: 150 }}
			class="date-picker-shell"
			style={`--picker-accent: ${theme.primary}; --picker-accent-secondary: ${theme.secondary}; --picker-accent-soft: ${theme.complement};`}
			use:clickOutside
			onclick_outside={closeModal}
		>
			<div class="picker-header">
				<div class="title-block">
					<p class="eyebrow">Date range</p>
					<h2>{headline}</h2>
					<p>{helperText}</p>
				</div>
				<button type="button" class="icon-button" onclick={closeModal} aria-label="Close date picker">
					<X size={18} />
				</button>
			</div>

			<div class="picker-stats">
				<div class="stat-card">
					<span>Start</span>
					<strong>{formatDate(resolvedStart) || 'Choose a day'}</strong>
				</div>
				<div class="stat-card">
					<span>End</span>
					<strong>{formatDate(resolvedEnd) || 'Choose a day'}</strong>
				</div>
				<div class="stat-card">
					<span>Span</span>
					<strong>{selectionSpan}</strong>
				</div>
			</div>

			<div class="calendar-frame">
				<DatePicker
					theme="custom-datepicker"
					bind:startDate
					bind:endDate
					isRange
					showPresets={showPresetsPane}
					alwaysShow
					bind:isOpen
					isMultipane={showMultiPane}
					showYearControls={false}
					includeFont={false}
					{presetLabels}
				/>
			</div>

			<div class="picker-footer">
				<p>Quick pick with one click, or choose a second day to extend the range.</p>
				<div class="picker-actions">
					<button type="button" class="secondary-action" onclick={closeModal}>Cancel</button>
					<button type="button" class="primary-action" onclick={save}>Apply range</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal {
		inset: 0;
		position: fixed;
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		background: rgba(12, 10, 9, 0.72);
	}

	.modal::backdrop {
		background: transparent;
	}

	.date-picker-shell {
		width: min(100%, 1080px);
		max-height: min(92vh, 760px);
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.5rem;
		overflow: hidden;
		border: 1px solid rgba(231, 229, 228, 0.95);
		background: rgb(250 250 249 / 0.98);
		box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
	}

	.picker-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
	}

	.title-block h2 {
		margin: 0.25rem 0 0;
		font-size: clamp(1.25rem, 2.5vw, 1.9rem);
		line-height: 1.15;
		letter-spacing: -0.02em;
		font-weight: 700;
		color: rgb(28 25 23);
	}

	.title-block p {
		margin: 0.45rem 0 0;
		max-width: 44rem;
		color: rgb(87 83 78);
		font-size: 0.95rem;
		line-height: 1.5;
	}

	.eyebrow {
		margin: 0;
		font-size: 0.7rem;
		font-weight: 800;
		letter-spacing: 0.24em;
		text-transform: uppercase;
		color: rgb(120 113 108);
	}

	.icon-button {
		width: 2.5rem;
		height: 2.5rem;
		display: grid;
		place-items: center;
		flex-shrink: 0;
		border: 1px solid rgba(231, 229, 228, 0.95);
		background: rgba(255, 255, 255, 0.92);
		color: rgb(41 37 36);
		transition: border-color 0.2s ease, background-color 0.2s ease;
	}

	.icon-button:hover {
		border-color: var(--picker-accent);
		background: rgba(255, 255, 255, 0.96);
	}

	.picker-stats {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.85rem;
	}

	.stat-card {
		padding: 1rem 1.1rem;
		border: 1px solid rgba(231, 229, 228, 0.95);
		background: rgba(255, 255, 255, 0.92);
	}

	.stat-card span {
		display: block;
		margin-bottom: 0.35rem;
		font-size: 0.65rem;
		font-weight: 800;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: rgb(120 113 108);
	}

	.stat-card strong {
		display: block;
		font-size: 0.95rem;
		line-height: 1.35;
		font-weight: 700;
		color: rgb(28 25 23);
	}

	.calendar-frame {
		flex: 1;
		overflow: auto;
		padding-right: 0.15rem;
	}

	.picker-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding-top: 0.25rem;
	}

	.picker-footer p {
		margin: 0;
		color: rgb(87 83 78);
		font-size: 0.9rem;
		line-height: 1.5;
	}

	.picker-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.secondary-action,
	.primary-action {
		border: 1px solid transparent;
		padding: 0.9rem 1.2rem;
		font-size: 0.9rem;
		font-weight: 700;
		transition: border-color 0.2s ease, background-color 0.2s ease, opacity 0.2s ease;
	}

	.secondary-action:hover,
	.primary-action:hover {
		opacity: 0.92;
	}

	.secondary-action {
		background: rgba(255, 255, 255, 0.92);
		border: 1px solid rgba(231, 229, 228, 0.95);
		color: rgb(41 37 36);
	}

	.primary-action {
		background: linear-gradient(135deg, var(--picker-accent) 0%, var(--picker-accent-secondary) 100%);
		border-color: var(--picker-accent);
		color: white;
	}

	:global(.datepicker[data-picker-theme='custom-datepicker']) {
		width: 100% !important;
		display: block !important;
	}

	:global(.datepicker[data-picker-theme='custom-datepicker'] .calendars-container) {
		position: static !important;
		display: grid !important;
		gap: 1.15rem;
		width: 100% !important;
		border: none !important;
		box-shadow: none !important;
		background: transparent !important;
	}

	:global(.datepicker[data-picker-theme='custom-datepicker'] .calendars-container.presets) {
		grid-template-columns: minmax(190px, 220px) minmax(0, 1fr);
	}

	:global(.datepicker[data-picker-theme='custom-datepicker'] .calendars-container.presets.range) {
		grid-template-columns: minmax(190px, 220px) repeat(2, minmax(0, 1fr));
	}

	:global(.datepicker[data-picker-theme='custom-datepicker'] .calendar-presets),
	:global(.datepicker[data-picker-theme='custom-datepicker'] .calendar) {
		min-width: 0;
		padding: 1.1rem;
		border: 1px solid rgba(231, 229, 228, 0.9);
		background: rgba(255, 255, 255, 0.92);
	}

	:global(.datepicker[data-picker-theme='custom-datepicker'] .calendar-presets) {
		display: grid;
		align-content: start;
		gap: 0.5rem;
	}

	:global(.datepicker[data-picker-theme='custom-datepicker'] .calendar-presets button) {
		width: 100%;
		font-weight: 700;
		letter-spacing: -0.01em;
	}

	:global(.datepicker[data-picker-theme='custom-datepicker'] header button) {
		transition: border-color 0.18s ease, background-color 0.18s ease, color 0.18s ease;
	}

	:global(.datepicker[data-picker-theme='custom-datepicker'] header button:hover) {
		border-color: var(--picker-accent);
	}

	:global(.datepicker[data-picker-theme='custom-datepicker'] header > span > div:first-child) {
		font-size: 1.2rem;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	:global(.datepicker[data-picker-theme='custom-datepicker'] .dow) {
		text-transform: uppercase;
		letter-spacing: 0.16em;
	}

	:global(.datepicker[data-picker-theme='custom-datepicker'] .date) {
		transition: background-color 0.18s ease, color 0.18s ease;
	}

	:global(.datepicker[data-picker-theme='custom-datepicker'] .date span) {
		display: grid;
		width: 100%;
		height: 100%;
		place-items: center;
	}

	:global(.datepicker[data-picker-theme='custom-datepicker'] .date.range span),
	:global(.datepicker[data-picker-theme='custom-datepicker'] .date.rangehover span),
	:global(.datepicker[data-picker-theme='custom-datepicker'] .date.range.start span),
	:global(.datepicker[data-picker-theme='custom-datepicker'] .date.range.end span),
	:global(.datepicker[data-picker-theme='custom-datepicker'] .date.rangehover.start span),
	:global(.datepicker[data-picker-theme='custom-datepicker'] .date.rangehover.end span),
	:global(.datepicker[data-picker-theme='custom-datepicker'] .date.range.first span),
	:global(.datepicker[data-picker-theme='custom-datepicker'] .date.range.last span),
	:global(.datepicker[data-picker-theme='custom-datepicker'] .date.rangehover.first span),
	:global(.datepicker[data-picker-theme='custom-datepicker'] .date.rangehover.last span),
	:global(.datepicker[data-picker-theme='custom-datepicker'] .date:not(.rangehover) + .rangehover span),
	:global(.datepicker[data-picker-theme='custom-datepicker'] .date:not(.rangehover) + .rangehover.start span),
	:global(.datepicker[data-picker-theme='custom-datepicker'] .date.range:nth-child(7n):not(.start):not(.end) span),
	:global(.datepicker[data-picker-theme='custom-datepicker'] .date.range:nth-last-child(7n):not(.start):not(.end) span),
	:global(.datepicker[data-picker-theme='custom-datepicker'] .date.rangehover:nth-child(7n):not(.start):not(.end) span),
	:global(.datepicker[data-picker-theme='custom-datepicker'] .date.rangehover:nth-last-child(7n):not(.start):not(.end) span),
	:global(.datepicker[data-picker-theme='custom-datepicker'] .date.rangehover:hover span),
	:global(.datepicker[data-picker-theme='custom-datepicker'] .date.rangehover:not(.start) + .start span) {
		border-radius: 0 !important;
	}

	:global(.datepicker[data-picker-theme='custom-datepicker'] .date:hover:not(.disabled):not(.future):not(.past):not(.other)) {
		outline: 1px solid rgba(28, 25, 23, 0.08);
	}

	:global(.datepicker[data-picker-theme='custom-datepicker'] .date.other) {
		opacity: 0.22;
	}

	:global(:root) {
		--datepicker-color: #1c1917;
		--datepicker-calendar-dow-color: #78716c;
		--datepicker-calendar-day-color: #1c1917;
		--datepicker-calendar-day-color-disabled: #d6d3d1;
		--datepicker-calendar-header-month-nav-color: #1c1917;
		--datepicker-calendar-range-start-end-color: #1c1917;
		--datepicker-calendar-range-included-color: #1c1917;
	}

	:global(.dark .date-picker-shell) {
		border-color: rgba(68, 64, 60, 0.95);
		background: rgba(12, 10, 9, 0.98);
	}

	:global(.dark .title-block h2),
	:global(.dark .stat-card strong) {
		color: rgb(250 250 249);
	}

	:global(.dark .title-block p),
	:global(.dark .picker-footer p) {
		color: rgb(168 162 158);
	}

	:global(.dark .eyebrow),
	:global(.dark .stat-card span) {
		color: rgb(120 113 108);
	}

	:global(.dark .icon-button),
	:global(.dark .secondary-action),
	:global(.dark .stat-card),
	:global(.dark .datepicker[data-picker-theme='custom-datepicker'] .calendar-presets),
	:global(.dark .datepicker[data-picker-theme='custom-datepicker'] .calendar) {
		border-color: rgba(68, 64, 60, 0.95);
		background: rgba(28, 25, 23, 0.98);
		color: rgb(245 245 244);
	}

	:global(.dark .primary-action) {
		background: linear-gradient(135deg, var(--picker-accent) 0%, var(--picker-accent-secondary) 100%);
		border-color: var(--picker-accent);
	}

	:global(.dark .datepicker[data-picker-theme='custom-datepicker'] .date:hover:not(.disabled):not(.future):not(.past):not(.other)) {
		outline: 1px solid rgba(245, 245, 244, 0.12);
	}

	:global(.dark) {
		--datepicker-color: #f5f5f4;
		--datepicker-calendar-dow-color: #a8a29e;
		--datepicker-calendar-day-color: #f5f5f4;
		--datepicker-calendar-day-color-disabled: #57534e;
		--datepicker-calendar-header-month-nav-color: #f5f5f4;
		--datepicker-calendar-range-start-end-color: #fafaf9;
		--datepicker-calendar-range-included-color: #fafaf9;
	}

	@media (max-width: 960px) {
		.date-picker-shell {
			width: min(100%, 38rem);
			padding: 1.15rem;
			max-height: calc(100vh - 1.5rem);
		}

		.calendar-frame {
			padding-right: 0;
		}

		:global(.datepicker[data-picker-theme='custom-datepicker'] .calendars-container.presets),
		:global(.datepicker[data-picker-theme='custom-datepicker'] .calendars-container.presets.range) {
			grid-template-columns: 1fr;
		}

		:global(.datepicker[data-picker-theme='custom-datepicker'] .calendar-presets) {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 640px) {
		.modal {
			padding: 0;
			align-items: flex-end;
			background: rgba(12, 10, 9, 0.5);
		}

		.date-picker-shell {
			width: 100%;
			max-height: min(78vh, 34rem);
			padding: 0.85rem 0.85rem 0.75rem;
			gap: 0.45rem;
			overflow: auto;
			border-left: 0;
			border-right: 0;
			border-bottom: 0;
			box-shadow: 0 -18px 48px rgba(0, 0, 0, 0.28);
		}

		.picker-header {
			position: relative;
			align-items: flex-start;
			padding-right: 2.25rem;
			gap: 0.35rem;
		}

		.eyebrow {
			font-size: 0.58rem;
			letter-spacing: 0.18em;
		}

		.title-block h2 {
			font-size: 0.88rem;
			line-height: 1.15;
			margin-top: 0.1rem;
		}

		.title-block p {
			display: none;
		}

		.icon-button {
			position: absolute;
			top: 0;
			right: 0;
			width: 1.85rem;
			height: 1.85rem;
		}

		.picker-stats {
			display: none;
		}

		.calendar-frame {
			flex: none;
			min-height: 0;
			overflow: visible;
		}

		.picker-footer {
			flex-direction: row;
			align-items: stretch;
			gap: 0.45rem;
			padding-top: 0.1rem;
		}

		.picker-footer p {
			display: none;
		}

		.picker-actions {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 0.45rem;
			width: 100%;
		}

		.secondary-action,
		.primary-action {
			width: 100%;
			padding: 0.68rem 0.8rem;
			font-size: 0.78rem;
		}

		:global(.datepicker[data-picker-theme='custom-datepicker'] .calendar-presets) {
			grid-template-columns: 1fr;
		}

		:global(.datepicker[data-picker-theme='custom-datepicker'] .calendars-container) {
			gap: 0.35rem;
		}

		:global(.datepicker[data-picker-theme='custom-datepicker'] .calendar-presets),
		:global(.datepicker[data-picker-theme='custom-datepicker'] .calendar) {
			padding: 0.35rem 0;
			border: 0;
			background: transparent;
		}

		:global(.datepicker[data-picker-theme='custom-datepicker'] .calendar-presets button) {
			font-size: 0.72rem;
			padding: 0.65rem 0.75rem;
		}

		:global(.datepicker[data-picker-theme='custom-datepicker'] .calendar) {
			width: 100% !important;
		}

		:global(.datepicker[data-picker-theme='custom-datepicker'] .calendar header) {
			padding: 0 0 0.45rem;
			margin-bottom: 0.45rem;
		}

		:global(.datepicker[data-picker-theme='custom-datepicker'] .calendar header > span > div:first-child) {
			font-size: 0.78rem;
		}

		:global(.datepicker[data-picker-theme='custom-datepicker'] .calendar .month) {
			width: 100% !important;
			grid-template-columns: repeat(7, minmax(0, 1fr));
		}

		:global(.datepicker[data-picker-theme='custom-datepicker'] header button) {
			width: 1.8rem;
			height: 1.8rem;
			margin-left: 0;
			padding: 0;
		}

		:global(.datepicker[data-picker-theme='custom-datepicker'] .dow) {
			font-size: 0.54rem;
			letter-spacing: 0.06em;
			margin-bottom: 0.22rem;
		}

		:global(.datepicker[data-picker-theme='custom-datepicker'] .date span) {
			width: 100% !important;
			height: 1.85rem;
			font-size: 0.74rem;
			margin-bottom: 0;
		}
	}
</style>
