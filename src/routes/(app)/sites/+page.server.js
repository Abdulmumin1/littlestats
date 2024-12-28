/** @type {import('./$types').PageLoad} */
export async function load({ locals: { pb, ch }, params }) {
	try {
		// you can also fetch all records at once via getFullList
		// const domains = await pb.collection('domain').getFullList({
		// 	expand: 'events_via_domain_id'
		// });

		const domain_recs = await pb.collection('domain').getFullList({
			sort: '-created'
		});
		let domains = [];

		for (let index = 0; index < domain_recs.length; index++) {
			let element = domain_recs[index];
			const now = new Date();

			const last24Hours = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

			const formattedLast24Hours = last24Hours.toISOString().slice(0, 19).replace('T', ' ');

			const query = `
			SELECT *
			FROM events
			WHERE domain_id = '${element.id}' AND timestamp >= '${formattedLast24Hours}'`;
			const resultSet = await ch.query({
				query: query,
				format: 'JSONEachRow'
			});
			const dataset = await resultSet.json();
			element['expand'] = {};
			element['expand']['events_via_domain_id'] = dataset;
			domains = [...domains, element];
		}

		// console.log(domains);
		// console.log(records);

		// const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
		// console.log(params);
		// you can also fetch all records at once via getFullList
		// const records = await pb.collection('events').getFullList({
		// 	sort: '-created',
		// 	filter: `domain_id = '${params.slug}'`
		// });
		// console.log(domains.length, domain_recs.length);
		return { domains: domain_recs };
	} catch (error) {
		console.error(error);
	}
}
