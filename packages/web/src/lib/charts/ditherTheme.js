import Chart from 'chart.js/auto';

const DITHER_COLORS = ['#7c3aed', '#2563eb', '#059669', '#ea580c', '#db2777', '#dc2626', '#64748b'];
const patternCache = new Map();

function isDark() {
	return typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
}

function colorWithAlpha(color, alpha) {
	if (typeof color !== 'string') return color;
	const hex = color.match(/^#([\da-f]{3}|[\da-f]{6})$/i)?.[1];
	if (hex) {
		const value =
			hex.length === 3
				? hex
						.split('')
						.map((character) => character + character)
						.join('')
				: hex;
		const [red, green, blue] = [0, 2, 4].map((offset) =>
			Number.parseInt(value.slice(offset, offset + 2), 16)
		);
		return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
	}
	return color;
}

function makePattern(context, color, variant = 0) {
	if (typeof document === 'undefined' || typeof color !== 'string') return color;
	const key = `${color}-${variant}-${isDark() ? 'dark' : 'light'}`;
	if (patternCache.has(key)) return patternCache.get(key);

	const tile = document.createElement('canvas');
	tile.width = 6;
	tile.height = 6;
	const tileContext = tile.getContext('2d');
	const ink = colorWithAlpha(color, isDark() ? 0.82 : 0.72);
	const wash = colorWithAlpha(color, isDark() ? 0.16 : 0.11);

	tileContext.fillStyle = wash;
	tileContext.fillRect(0, 0, 6, 6);
	tileContext.fillStyle = ink;
	if (variant % 3 === 0) {
		tileContext.fillRect(0, 0, 2, 2);
		tileContext.fillRect(3, 3, 2, 2);
	} else if (variant % 3 === 1) {
		tileContext.fillRect(0, 1, 6, 1);
		tileContext.fillRect(0, 4, 6, 1);
	} else {
		tileContext.fillRect(0, 0, 1, 1);
		tileContext.fillRect(2, 2, 1, 1);
		tileContext.fillRect(4, 4, 1, 1);
	}

	const pattern = context.createPattern(tile, 'repeat') || color;
	patternCache.set(key, pattern);
	return pattern;
}

function sourceColor(dataset, index) {
	const border = dataset.borderColor;
	const background = dataset.backgroundColor;
	if (typeof border === 'string') return border;
	if (typeof background === 'string') return background;
	return DITHER_COLORS[index % DITHER_COLORS.length];
}

const ditherKitTheme = {
	id: 'littlestatsDitherKit',
	beforeUpdate(chart) {
		const { ctx, data } = chart;
		const chartType = chart.config.type;
		data.datasets.forEach((dataset, datasetIndex) => {
			const color = sourceColor(dataset, datasetIndex);
			const colors = Array.isArray(dataset.backgroundColor)
				? dataset.backgroundColor.map((item, index) =>
						makePattern(
							ctx,
							typeof item === 'string' ? item : DITHER_COLORS[index % DITHER_COLORS.length],
							index
						)
					)
				: null;

			if (chartType === 'pie' || chartType === 'doughnut' || chartType === 'polarArea') {
				dataset.backgroundColor =
					colors ||
					data.labels.map((_, index) =>
						makePattern(ctx, DITHER_COLORS[index % DITHER_COLORS.length], index)
					);
				dataset.borderColor = isDark() ? '#1c1917' : '#fafaf9';
				dataset.borderWidth = 2;
				dataset.hoverOffset = 7;
				return;
			}

			dataset.borderColor = color;
			dataset.backgroundColor = makePattern(ctx, color, datasetIndex);
			dataset.borderWidth = chartType === 'bar' ? 1 : Math.max(Number(dataset.borderWidth) || 0, 2);
			dataset.borderRadius = chartType === 'bar' ? 2 : dataset.borderRadius;
			dataset.pointRadius = 0;
			dataset.pointHoverRadius = 4;
			dataset.pointHoverBackgroundColor = color;
			dataset.pointHoverBorderColor = isDark() ? '#fafaf9' : '#1c1917';
			if (chartType === 'line') dataset.fill = 'origin';
		});
	},
	beforeDatasetsDraw(chart) {
		chart.ctx.save();
		chart.ctx.shadowColor = isDark() ? 'rgba(167, 139, 250, 0.24)' : 'rgba(124, 58, 237, 0.12)';
		chart.ctx.shadowBlur = 8;
	},
	afterDatasetsDraw(chart) {
		chart.ctx.restore();
	}
};

Chart.defaults.color = '#78716c';
Chart.defaults.font.family = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
Chart.defaults.font.size = 10;
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.pointStyle = 'rect';
Chart.defaults.plugins.legend.labels.boxWidth = 8;
Chart.defaults.plugins.legend.labels.boxHeight = 8;
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(28, 25, 23, 0.94)';
Chart.defaults.plugins.tooltip.titleColor = '#fafaf9';
Chart.defaults.plugins.tooltip.bodyColor = '#d6d3d1';
Chart.defaults.plugins.tooltip.borderColor = 'rgba(168, 162, 158, 0.45)';
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.cornerRadius = 4;
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.displayColors = true;
Chart.defaults.plugins.tooltip.usePointStyle = true;
Chart.defaults.animation.duration = 500;
Chart.defaults.animation.easing = 'easeOutQuart';
Chart.defaults.elements.line.tension = 0.08;

Chart.register(ditherKitTheme);
