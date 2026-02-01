// Traffic page - Uses v2 API directly from browser
// Server file only provides siteId for client-side API calls

export const load = async ({ params }) => {
	const siteId = params.slug;
	
	return {
		siteId,
		domain_id: siteId
	};
};
