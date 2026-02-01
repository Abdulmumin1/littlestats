// Format utilities for the dashboard

export function formatNumber(num: number): string {
	if (num >= 1000000) {
		return (num / 1000000).toFixed(1) + 'M';
	}
	if (num >= 1000) {
		return (num / 1000).toFixed(1) + 'K';
	}
	return num?.toString() || '0';
}

export function formatDuration(seconds: number): string {
	if (!seconds || seconds <= 0) return '0s';
	
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;

	let formattedDuration = '';

	if (hours > 0) {
		formattedDuration += `${hours}h `;
	}

	if (formattedDuration === '' && minutes > 0) {
		formattedDuration += `${minutes}m `;
	}

	if (formattedDuration === '' || minutes === 0) {
		formattedDuration += `${secs}s`;
	}

	return formattedDuration.trim();
}

export function formatDate(date: string | Date): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
}

export function formatPercentage(value: number, total: number): number {
	if (!total || total === 0) return 0;
	return Math.round((value / total) * 100);
}
