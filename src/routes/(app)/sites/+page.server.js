import { dashboardInterval } from '../../../lib/globalstate.svelte';
import { env } from '$env/dynamic/private';

/** @type {import('./$types').PageLoad} */
export async function load({ locals: { pb, ch }, params }) {
	try {
		// Fetch all domains
		const domain_recs = await pb.collection('domain').getFullList({
			sort: '-created'
		});

		// Calculate the cutoff date (30 days ago)
		const now = new Date();
		const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
		const formattedLast30Days = last30Days.toISOString().slice(0, 19).replace('T', ' ');

		// // Fetch events for all domains in parallel
		// const domainsWithEvents = await Promise.all(
		// 	domain_recs.map(async (element) => {
		// 		const query = `
		// 			SELECT *
		// 			FROM events
		// 			WHERE domain_id = '${element.id}'
		// 			AND timestamp >= '${formattedLast30Days}'
		// 			AND event_type = 'pageview'
		// 		`;
		// 		const resultSet = await ch.query({ query, format: 'JSONEachRow' });
		// 		const dataset = await resultSet.json();

		// 		// Attach events to the domain object
		// 		return {
		// 			...element,
		// 			expand: {
		// 				events_via_domain_id: dataset
		// 			}
		// 		};
		// 	})
		// );

		return { domains: domain_recs };
	} catch (error) {
		console.error('Error in load function:', error);
		return { fail: true, message: error?.message || 'Failed to load data' };
	}
}

/** @type {import('./$types').Actions} */
export const actions = {
	getData: async ({ locals: { pb, ch }, request }) => {
		const data = await request.formData();
		const domain_id = data.get('domain_id');

		
	// 	const now = new Date();
	// 	const last30Days = new Date(now.getTime() - dashboardInterval * 24 * 60 * 60 * 1000);
	// 	const formattedLast30Days = last30Days.toISOString().slice(0, 19).replace('T', ' ');

	// 	const query = `
	// 	SELECT *
	// 	FROM events
	// 	WHERE domain_id = '${domain_id}' 
	// 	AND timestamp >= '${formattedLast30Days}' 
	// 	AND event_type = 'pageview'
	// `;
	// 	const resultSet = await ch.query({ query, format: 'JSONEachRow' });
	// 	const dataset = await resultSet.json();
		// console.log(dataset)
		// return { dataset };

		let url = `${env.DASHBOARD_WORKER}dash/${domain_id}/${dashboardInterval}`
		console.log(url)
		let res = await fetch(url);
		if (res.ok){
			let data = await res.json()
			console.log(data)
			return {data}
		}
	}
};


