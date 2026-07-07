const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function isDateKey(value) {
	return typeof value === 'string' && DATE_KEY_PATTERN.test(value);
}

export function toLocalDateKey(value) {
	if (isDateKey(value)) return value;

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '';

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export function fromDateKey(value) {
	if (isDateKey(value)) {
		const [year, month, day] = value.split('-').map(Number);
		return new Date(year, month - 1, day);
	}

	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

function toDayStart(value) {
	if (isDateKey(value)) {
		const [year, month, day] = value.split('-').map(Number);
		return Date.UTC(year, month - 1, day);
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return NaN;
	return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getInclusiveRangeDays(startValue, endValue) {
	if (!startValue || !endValue) return 1;

	const startTime = toDayStart(startValue);
	const endTime = toDayStart(endValue);
	if (Number.isNaN(startTime) || Number.isNaN(endTime)) return 1;

	return Math.max(1, Math.floor((endTime - startTime) / DAY_IN_MS) + 1);
}
