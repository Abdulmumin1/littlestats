/** @type {import('./$types').PageLoad} */
export async function load({ locals: { pb, ch }, params }) {
	try {
		const domains = await pb.collection('domain').getFullList({ sort: '-created' });
		return { records: [], domains, domain_id: params.slug };
	} catch (error) {
		console.error('Error loading data:', error);
		return { fail: true };
	}
}