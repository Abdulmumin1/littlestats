// Server-side load function - uses direct fetch instead of API client
// The API client is browser-only

const API_BASE_URL = process.env.DASHBOARD_URL || 'http://localhost:8787';

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch, cookies, request }) {
	try {
		const cookieHeader = request.headers.get('cookie');
		
		// Fetch sites directly using native fetch
		const headers = {
			'Content-Type': 'application/json',
		};
		
		if (cookieHeader) {
			headers['Cookie'] = cookieHeader;
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
		
		// Transform to domain format expected by layout
		const domains = sites.map(site => ({
			id: site.id,
			name: site.domain,
			domain: site.domain,
			unique_key: site.domain_key,
			plan: site.plan,
			created: site.created_at
		}));
		
		return { 
			records: [], 
			domains, 
			domain_id: params.slug 
		};
	} catch (error) {
		console.error('Error loading site data:', error);
		return { 
			records: [], 
			domains: [], 
			domain_id: params.slug,
			error: error.message 
		};
	}
}
