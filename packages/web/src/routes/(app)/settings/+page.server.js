// Server-side load function - uses direct fetch instead of API client
// The API client is browser-only

const API_BASE_URL = process.env.DASHBOARD_URL || 'http://localhost:8787';

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, cookies }) {
	try {
		// Get session token for authentication
		const sessionToken = cookies.get('better-auth.session_token');
		
		// Fetch sites directly using native fetch
		const headers = {
			'Content-Type': 'application/json',
		};
		
		if (sessionToken) {
			headers['Cookie'] = `better-auth.session_token=${sessionToken}`;
		}
		
		const response = await fetch(`${API_BASE_URL}/api/v2/sites`, {
			method: 'GET',
			headers
		});
		
		if (!response.ok) {
			throw new Error(`Failed to fetch sites: ${response.status}`);
		}
		
		const data = await response.json();
		const sites = data.sites || [];
		
		// Transform sites to match expected domain format
		const records = sites.map(site => ({
			id: site.id,
			name: site.domain,
			domain: site.domain,
			unique_key: site.domain_key,
			plan: site.plan,
			created: site.created_at,
			sessionCount: site.session_count || 0,
			events24h: site.events_24h || 0
		}));
		
		return { records };
	} catch (error) {
		console.error('Failed to load sites:', error);
		return { records: [] };
	}
}

/** @type {import('./$types').Actions} */
// Actions removed - frontend now uses direct API calls via api client
export const actions = {};
