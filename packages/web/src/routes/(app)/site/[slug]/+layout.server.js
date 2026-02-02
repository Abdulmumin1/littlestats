// Server-side load function - uses direct fetch instead of API client
// The API client is browser-only
import { env } from '$env/dynamic/private';

const API_BASE_URL = env.DASHBOARD_URL || 'http://localhost:8787';

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

		// Fetch new feedback count for this specific site
		let newFeedbackCount = 0;
		try {
			const feedbackRes = await fetch(`${API_BASE_URL}/api/v2/sites/${params.slug}/feedback?status=new&limit=1`, {
				method: 'GET',
				headers
			});
			if (feedbackRes.ok) {
				const feedbackData = await feedbackRes.json();
				newFeedbackCount = feedbackData.total || 0;
			}
		} catch (err) {
			console.error('Error fetching feedback count:', err);
		}
		
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
			domain_id: params.slug,
			newFeedbackCount
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
