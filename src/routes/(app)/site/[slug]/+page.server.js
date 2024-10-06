import { json } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';

/** @type {import('./$types').Actions} */
export const actions = {
	fetchDate: async ({ locals: { pb }, request }) => {
		const data = await request.formData();
		let defaultRange = data.get('defaultRange');
		if (!defaultRange) {
			return fail(400, { fail: true, message: 'Range required' });
		}
		defaultRange = parseInt(defaultRange);
		const domain_id = data.get('domain_id');
		try {
			const now = new Date();
			const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
			const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
			const last14Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
			const last21Days = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString();
			const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

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
			const records = await pb.collection('events').getFullList({
				sort: '-created',
				filter: `domain_id = '${domain_id}' && created >= '${filterToUse}'`
			});
			// console.log(records);
			const results = records.map((record) => {
				return {
					id: record.id,
					domain_id: record.domain_id,
					event_type: record.event_type,
					url: record.url,
					referrer: record.referrer,
					user_agent: record.user_agent,
					timestamp: record.timestamp,
					...{ duration: record.duration }
				};
			});
			// console.log(results);
			return results;
		} catch (error) {
			console.error(error);
			return fail(400, { fail: true, message: error?.data?.message });
		}
	}
};

/** @type {import('./$types').PageLoad} */
export async function load({ locals: { pb }, params }) {
	try {
		// you can also fetch all records at once via getFullList
		const domains = await pb.collection('domain').getFullList({
			sort: '-created'
		});
		// console.log(records);

		const now = new Date();
		const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
		// console.log(params);
		// you can also fetch all records at once via getFullList
		const records = await pb.collection('events').getFullList({
			sort: '-created',
			filter: `domain_id = '${params.slug}' && created >= '${last24Hours}'`
		});
		// console.log(records);
		return { records, domains, domain_id: params.slug };
	} catch (error) {
		console.error(error);
	}
}
