// Sites list page - Uses v2 API directly from browser
// Server file is minimal since data is fetched client-side

export const load = async () => {
	// Data is fetched via api.getSites() on the client
	return {
		domains: []
	};
};
