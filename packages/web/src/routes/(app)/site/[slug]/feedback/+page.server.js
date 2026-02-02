export async function load({ params, parent }) {
	const parentData = await parent();
	return {
		siteId: parentData.domain_id,
		site: parentData.site
	};
}
