// Performance Page Server File
// Data is now fetched client-side via the v2 API

/** @type {import('./$types').PageLoad} */
export async function load({ parent, params }) {
	const data = await parent();
	return {
		...data,
		siteId: params.slug
	};
}

// No actions needed - data is fetched directly from the client using the v2 API
export const actions = {};
