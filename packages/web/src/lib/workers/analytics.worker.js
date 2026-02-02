import { sortReferals, sortCountryData, sumData } from '../events/helpers.js';

const handlers = {
	sortReferals,
	sortCountryData,
	sumData
};

self.onmessage = function (e) {
	const { id, type, args } = e.data;

	if (!handlers[type]) {
		self.postMessage({ id, ok: false, error: `Unknown handler: ${type}` });
		return;
	}

	try {
		const result = handlers[type](...args);
		self.postMessage({ id, ok: true, result });
	} catch (err) {
		self.postMessage({ id, ok: false, error: err?.message ?? String(err) });
	}
};
