import { fail } from '@sveltejs/kit';
import { generateRandomEvents, randomInt } from '../lib/mockData';
import { env } from '$env/dynamic/private';

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
		WHERE domain_id = '${domain_id}'
		AND event_type IN ('pageview', 'pageExit')
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
		// const record = await pb.collection(collection).getFirstListItem(`domain_id="${domain_id}"`);
		// const cutoffDate = getDateRange(range);
		// const updatedAt = new Date(record.updated).getTime();

		// if (updatedAt >= cutoffDate.getTime()) {
			return { record:{
				views: randomInt(20, 3000),
				bounce_rate:randomInt(20, 100),
				visit_duration:randomInt(10, 50),
				visitors:randomInt(20, 300),
			} };
		// }
	} catch (error) {
		console.error(`Cache fetch error for ${collection}:`, error);
	}
	return false;
}

/** @type {import('./$types').Actions} */
export const actions = {
	fetchTraffic: async ({ locals: { pb, ch }, request }) => {
		const data = await request.formData();
		const selectedDate = parseInt(data.get('defaultRange'));
		const domain_id = data.get('domain_id');

		if (!selectedDate || !domain_id) {
			return fail(400, { fail: true, message: 'Range and domain ID are required' });
		}

		try {
			let url = `${env.DASHBOARD_WORKER}traffic/${domain_id}/${selectedDate ?? 1}`
			let res = await fetch(url)
			// console.log(res.ok)
			if (res.ok) {
				let result = await res.json();
				return {records:result}
			}
			// const filterToUse = getDateRange(
			// 	selectedDate
			// );
			// const dataset = await fetchRecords(ch, domain_id, filterToUse);
			// console.log(dataset)
			return { records: [...dataset] };
		} catch (error) {
			console.error('Error fetching date:', error);
			return fail(400, { fail: true, message: error?.data?.message || 'Failed to fetch data' });
		}
	},
	
	fetchTrafficRange: async ({ locals: { pb, ch }, request }) => {
			const data = await request.formData();
			const selectedStart = data.get('start');
			const selectedEnd = data.get('end')
			const domain_id = data.get('domain_id');
	
			if (!selectedStart || !selectedEnd || !domain_id) {
				return fail(400, { fail: true, message: 'Range and domain ID are required' });
			}
	
			try {
				// const { start, end } = { start: getDateRange(selectedDate * 2), end: getDateRange(selectedDate) };
				// const dataset = await fetchRecords(ch, domain_id, start, end);
				let url = `${env.DASHBOARD_WORKER}traffic-range/${domain_id}/${selectedStart}/${selectedEnd}`
				let res = await fetch(url)
				if (res.ok) {
					let result = await res.json();
					return {records: result}
				}else {
					return {error:true}
				}
				// traffic-range/mwn1qyxs2n8ha58/2025-02-01/2025-02-25
				// return { results: dataset, cache: false };
			} catch (error) {
				console.error('Error fetching spikes:', error);
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
	
			try {
				const { start, end } = { start: getDateRange(selectedDate * 2), end: getDateRange(selectedDate) };
				// const dataset = await fetchRecords(ch, domain_id, start, end);
				let url = `${env.DASHBOARD_WORKER}traffic-range/${domain_id}/${start}/${end}`
				let res = await fetch(url)
				if (res.ok) {
					let result = await res.json();
					return {records: result}
				}else {
					return {error:true}
				}
				// traffic-range/mwn1qyxs2n8ha58/2025-02-01/2025-02-25
				// return { results: dataset, cache: false };
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
export async function load({ locals: { pb, ch }, params }) {
	try {

		const domain_id = 'ilei2nc1shxp58w';

		return { records: [],  domain_id };
	} catch (error) {
		console.error('Error loading data:', error);
		return { fail: true };
	}
}


