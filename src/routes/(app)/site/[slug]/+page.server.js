import { fail } from '@sveltejs/kit';

// Helper function to calculate date ranges
function getDateRange(days) {
	days = days <= 0 ?1 :days
	const now = new Date();
	return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

// Helper function to fetch records from the database
async function fetchRecords(pb, domain_id, startDate, endDate) {
	const query = `
		SELECT *
		FROM events
		WHERE domain_id = '${domain_id.replaceAll(' ', '')}' 
		AND timestamp >= '${startDate.toISOString().slice(0, 19).replace('T', ' ')}'
		${endDate ? `AND timestamp < '${endDate.toISOString().slice(0, 19).replace('T', ' ')}'` : ''}
	`;
	const resultSet = await pb.query({ query, format: 'JSONEachRow' });
	return await resultSet.json();
}

// Cache fetching logic
async function fetchCache(pb, date, domain_id) {
	const now = new Date();
	const collections = {
		30: 'last30daysSpike',
		21: 'last21daysSpike',
		14: 'last14daysSpike',
		7: 'last7daysSpike',
		default: 'last24hourSpike'
	};

	const range = date >= 30 ? 30 : date >= 21 ? 21 : date >= 14 ? 14 : date >= 7 ? 7 : 1;
	const collection = collections[range] || collections.default;

	try {
		const record = await pb.collection(collection).getFirstListItem(`domain_id="${domain_id}"`);
		const cutoffDate = getDateRange(range);
		const updatedAt = new Date(record.updated).getTime();

		if (updatedAt >= cutoffDate.getTime()) {
			return { record };
		}
	} catch (error) {
		console.error(`Cache fetch error for ${collection}:`, error);
	}
	return false;
}

/** @type {import('./$types').Actions} */
export const actions = {
	fetchDate: async ({ locals: { pb, ch }, request }) => {
		const data = await request.formData();
		const selectedDate = parseInt(data.get('defaultRange'));
		const domain_id = data.get('domain_id');

		if (!selectedDate || !domain_id) {
			return fail(400, { fail: true, message: 'Range and domain ID are required' });
		}

		try {
			const filterToUse = getDateRange(
				selectedDate
			);
			const dataset = await fetchRecords(ch, domain_id, filterToUse);
			// console.log(dataset)
			return {records:[...dataset]};
		} catch (error) {
			console.error('Error fetching date:', error);
			return fail(400, { fail: true, message: error?.data?.message || 'Failed to fetch data' });
		}
	},

	fetchSpikes: async ({ locals: { pb, ch }, request }) => {
		const data = await request.formData();
		const selectedDate = parseInt(data.get('defaultRange'));
		const domain_id = data.get('domain_id');

		if (!selectedDate || !domain_id) {
			return fail(400, { fail: true, message: 'Range and domain ID are required' });
		}

		const cacheData = await fetchCache(pb, selectedDate, domain_id);
		if (cacheData) {
			return { results: cacheData, cache: true };
		}

		try {
			const now = new Date();
			const ranges = {
				30: { start: getDateRange(60), end: getDateRange(30) },
				21: { start: getDateRange(30), end: getDateRange(21) },
				14: { start: getDateRange(21), end: getDateRange(14) },
				7: { start: getDateRange(14), end: getDateRange(7) },
				default: { start: getDateRange(2), end: getDateRange(1) }
			};

			const { start, end } = { start: getDateRange(selectedDate * 2), end: getDateRange(selectedDate) };
			const dataset = await fetchRecords(ch, domain_id, start, end);
			return { results: dataset, cache: false };
		} catch (error) {
			console.error('Error fetching spikes:', error);
			return fail(400, { fail: true, message: error?.data?.message || 'Failed to fetch data' });
		}
	},

	updateSpikes: async ({ locals: { pb }, request }) => {
		const data = await request.formData();
		const selectedDate = parseInt(data.get('defaultRange'));
		const domain_id = data.get('domain_id');
		const recordData = JSON.parse(data.get('data'));

		if (!selectedDate || !domain_id || !recordData) {
			return fail(400, { fail: true, message: 'Invalid input data' });
		}

		const tableName = selectedDate <= 1 ? 'last24hourSpike' : `last${selectedDate}daysSpike`;

		try {
			const existingData = await pb
				.collection(tableName)
				.getFirstListItem(`domain_id="${domain_id}"`);
			await pb.collection(tableName).update(existingData.id, recordData);
		} catch (e) {
			try {
				await pb.collection(tableName).create(recordData);
			} catch (error) {
				console.error('Error updating spikes:', error);
				return fail(400, { fail: true, message: error?.data?.message || 'Failed to update data' });
			}
		}
	}
};

/** @type {import('./$types').PageLoad} */
export async function load({ parent, locals: { pb, ch }, params }) {
	try {
		const domains = await parent()
		// const last24Hours = getDateRange(1);
		// const dataset = await fetchRecords(ch, params.slug, last24Hours);

		return domains
	} catch (error) {
		console.error('Error loading data:', error);
		return { fail: true };
	}
}
