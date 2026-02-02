let worker = null;
let requestId = 0;
const pending = new Map();

function getWorker() {
	if (!worker) {
		worker = new Worker(new URL('./analytics.worker.js', import.meta.url), { type: 'module' });
		worker.onmessage = handleMessage;
		worker.onerror = handleError;
	}
	return worker;
}

function handleMessage(e) {
	const { id, ok, result, error } = e.data;
	const entry = pending.get(id);
	if (!entry) return;

	pending.delete(id);
	if (ok) {
		entry.resolve(result);
	} else {
		entry.reject(new Error(error));
	}
}

function handleError(e) {
	for (const entry of pending.values()) {
		entry.reject(new Error(e.message || 'Worker error'));
	}
	pending.clear();
}

export function runWorker(type, ...args) {
	const id = ++requestId;
	const w = getWorker();

	return new Promise((resolve, reject) => {
		pending.set(id, { resolve, reject });
		w.postMessage({ id, type, args });
	});
}

export function cancelAllRequests() {
	for (const entry of pending.values()) {
		entry.reject(new Error('Cancelled'));
	}
	pending.clear();
}

export function terminateWorker() {
	if (worker) {
		worker.terminate();
		worker = null;
	}
	pending.clear();
}
