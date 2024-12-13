import { fail } from '@sveltejs/kit';

async function fetchCache(pb, date, domain_id) {
	try {
		const now = new Date();
		if (date >= 30) {
			const record = await pb
				.collection('last30daysSpike')
				.getFirstListItem(`domain_id="${domain_id}"`);
			const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).getTime();
			let updated_at = new Date(record.updated).getTime();
			if (updated_at >= last30Days) {
				return { record };
			}
		} else if (date >= 21) {
			const record = await pb
				.collection('last21daysSpike')
				.getFirstListItem(`domain_id="${domain_id}"`);
			const last21Days = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000).getTime();
			let updated_at = new Date(record.updated).getTime();
			if (updated_at >= last21Days) {
				return { record };
			}
		} else if (date >= 14) {
			const record = await pb
				.collection('last14daysSpike')
				.getFirstListItem(`domain_id="${domain_id}"`);
			const last14Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).getTime();
			let updated_at = new Date(record.updated).getTime();
			if (updated_at >= last14Days) {
				return { record };
			}
		} else if (date >= 7) {
			const record = await pb
				.collection('last7daysSpike')
				.getFirstListItem(`domain_id="${domain_id}"`);
			const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
			let updated_at = new Date(record.updated).getTime();
			if (updated_at >= last7Days) {
				return { record };
			}
		} else {
			const record = await pb
				.collection('last24hourSpike')
				.getFirstListItem(`domain_id="${domain_id}"`);
			// console.log(record);
			const last24hour = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).getTime();
			let updated_at = new Date(record.updated).getTime();
			// console.log(updated_at >= last24hour);
			if (updated_at >= last24hour) {
				return { record };
			}
		}
		return false;
	} catch (error) {
		console.error(error);
		return false;
	}
}
/** @type {import('./$types').Actions} */
export const actions = {
	fetchDate: async ({ locals: { pb, ch }, request }) => {
		const data = await request.formData();
		let defaultRange = data.get('defaultRange');
		if (!defaultRange) {
			return fail(400, { fail: true, message: 'Range required' });
		}
		defaultRange = parseInt(defaultRange);
		const domain_id = data.get('domain_id');
		try {
			const now = new Date();
			const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
			const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
			const last14Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
			const last21Days = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);
			const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

			let filterToUse = last24Hours;

			if (defaultRange >= 30) {
				filterToUse = last30Days;
			} else if (defaultRange >= 21) {
				filterToUse = last21Days;
			} else if (defaultRange >= 14) {
				filterToUse = last14Days;
			} else if (defaultRange >= 7) {
				filterToUse = last7Days;
			} else {
				filterToUse = last24Hours;
			}
			// you can also fetch all records at once via getFullList
			// const records = await pb.collection('events').getFullList({
			// 	sort: '-created',
			// 	filter: `domain_id = '${domain_id}' && timestamp >= '${filterToUse.toISOString().slice(0, 19).replace('T', ' ')}'`
			// });

			const query = `
			SELECT *
			FROM events
			WHERE domain_id = '${domain_id}' AND timestamp >= '${filterToUse.toISOString().slice(0, 19).replace('T', ' ')}'
			`;
			const resultSet = await ch.query({
				query: query,
				format: 'JSONEachRow'
			});
			const dataset = await resultSet.json();
			// console.log(dataset)
			// // console.log(records);
			// const results = records.map((record) => {
			// 	return {
			// 		id: record.id,
			// 		domain_id: record.domain_id,
			// 		event_type: record.event_type,
			// 		url: record.url,
			// 		referrer: record.referrer,
			// 		user_agent: record.user_agent,
			// 		timestamp: record.timestamp,
			// 		ip: record.ip,
			// 		timezone: record.timezone,
			// 		...{ duration: record.duration }
			// 	};
			// });
			// console.log(results);
			return [...dataset];
		} catch (error) {
			console.error(error);
			return fail(400, { fail: true, message: error?.data?.message });
		}
	},
	fetchSpikes: async ({ locals: { pb, ch }, request }) => {
		const data = await request.formData();
		let defaultRange = data.get('defaultRange');
		if (!defaultRange) {
			return fail(400, { fail: true, message: 'Range required' });
		}
		defaultRange = parseInt(defaultRange);
		const domain_id = data.get('domain_id');
		const cacheData = await fetchCache(pb, defaultRange, domain_id);

		// console.log(cacheData);

		if (cacheData != false) {
			// console.log('We have a catch here');
			return { results: cacheData, cache: true };
		}
		try {
			const now = new Date();
			const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
			const last48Hours = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
			const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
			const last14Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
			const last21Days = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);
			const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

			let endDate = last24Hours;
			let startDate = last48Hours;

			if (defaultRange >= 30) {
				startDate = new Date(now.getTime() - 2 * 30 * 24 * 60 * 60 * 1000).toISOString();
				endDate = last30Days;
			} else if (defaultRange >= 21) {
				startDate = last30Days;
				endDate = last21Days;
			} else if (defaultRange >= 14) {
				startDate = last21Days;
				endDate = last14Days;
			} else if (defaultRange >= 7) {
				startDate = last14Days;
				endDate = last7Days;
			} else {
				endDate = last24Hours;
				startDate = last48Hours;
			}
			// console.log(startDate, endDate);
			// you can also fetch all records at once via getFullList
			// const records = await pb.collection('events').getFullList({
			// 	filter: `domain_id = '${domain_id}' && timestamp >= '${startDate}' && timestamp < '${endDate}'`
			// });
			// // console.log(records);
			// const results = records.map((record) => {
			// 	return {
			// 		id: record.id,
			// 		domain_id: record.domain_id,
			// 		event_type: record.event_type,
			// 		url: record.url,
			// 		referrer: record.referrer,
			// 		user_agent: record.user_agent,
			// 		timestamp: record.timestamp,
			// 		timezone: record.timezone,

			// 		...{ duration: record.duration }
			// 	};
			// });

			const query = `
			SELECT *
			FROM events
			WHERE domain_id = '${domain_id}' AND timestamp >= '${startDate.toISOString().slice(0, 19).replace('T', ' ')}' AND timestamp < '${endDate.toISOString().slice(0, 19).replace('T', ' ')}'
			`;
			const resultSet = await ch.query({
				query: query,
				format: 'JSONEachRow'
			});
			const dataset = await resultSet.json();
			return { results: dataset, cache: false };
		} catch (error) {
			console.error(error);
			return fail(400, { fail: true, message: error?.data?.message });
		}
	},
	updateSpikes: async ({ locals: { pb }, request }) => {
		const data = await request.formData();
		// const domain_id = data.get('domain_id');

		let defaultRange = parseInt(data.get('defaultRange'));
		const domain_id = data.get('domain_id');

		const recordData = JSON.parse(data.get('data'));
		let tableName = `last${defaultRange}daysSpike`;
		if (defaultRange <= 1) {
			tableName = 'last24hourSpike';
		}
		try {
			const existingData = await pb
				.collection(tableName)
				.getFirstListItem(`domain_id="${domain_id}"`);

			const updated = await pb.collection(tableName).update(existingData.id, recordData);
		} catch (e) {
			try {
				const create = await pb.collection(tableName).create(recordData);
			} catch (error) {
				console.error(error);
			}
			console.error(e);
		}
	}
};

/** @type {import('./$types').PageLoad} */
export async function load({ locals: { pb, ch } }) {
	try {
		const now = new Date();
		const last24Hours = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
		let test = 'mwn1qyxs2n8ha58';
		const domain_id = 'ilei2nc1shxp58w';
		// const records = await pb.collection('events').getFullList({
		// 	sort: '-created',
		// 	filter: `domain_id = '${domain_id}' && timestamp >= '${last24Hours}'`
		// });
		const formattedLast24Hours = last24Hours.toISOString().slice(0, 19).replace('T', ' ');

		const query = `
		SELECT *
		FROM events
		WHERE domain_id = '${domain_id}' AND timestamp >= '${formattedLast24Hours}'
		`;
		const resultSet = await ch.query({
			query: query,
			format: 'JSONEachRow'
		});
		const dataset = await resultSet.json();
		return { records: dataset, domain_id };
	} catch (error) {
		console.error(error);
		return { fail: true };
	}
}
