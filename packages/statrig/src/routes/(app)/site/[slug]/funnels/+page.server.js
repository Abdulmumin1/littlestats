// Funnels page - Uses v2 API directly from browser

/** @type {import('./$types').PageLoad} */
export async function load({ parent, params }) {
	const data = await parent();
	return {
		...data,
		siteId: params.slug
	};
}
