/** @type {import('./$types').PageLoad} */
export async function load({ locals: { pb }, params }) {
	try {
		// you can also fetch all records at once via getFullList
		const domains = await pb.collection('domain').getFullList({
			expand: 'events_via_domain_id'
		});
		// console.log(records);

		// const now = new Date();
		// const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
		// console.log(params);
		// you can also fetch all records at once via getFullList
		// const records = await pb.collection('events').getFullList({
		// 	sort: '-created',
		// 	filter: `domain_id = '${params.slug}'`
		// });
		// console.log(domains);
		return { domains };
	} catch (error) {
		console.error(error);
	}
}
