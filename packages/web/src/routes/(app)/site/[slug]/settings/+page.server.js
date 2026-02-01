import { env } from '$env/dynamic/private';
import { error, redirect } from '@sveltejs/kit';

const API_BASE_URL = env.DASHBOARD_URL || 'http://localhost:8787';

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch, cookies }) {
	try {
		const sessionToken = cookies.get('better-auth.session_token');
		const headers = { 'Content-Type': 'application/json' };
		if (sessionToken) {
			headers['Cookie'] = `better-auth.session_token=${sessionToken}`;
		}

		// Fetch all sites to find the current one (since we don't have a direct get-site endpoint that returns tokens yet, but the list does)
		const response = await fetch(`${API_BASE_URL}/api/v2/sites`, { headers });
		
		if (!response.ok) {
			throw error(response.status, 'Failed to load site');
		}

		const data = await response.json();
		const site = data.sites.find(s => s.id === params.slug);

		if (!site) {
			throw error(404, 'Site not found');
		}

		return { site };
	} catch (err) {
		console.error('Site settings load error:', err);
		throw error(500, err.message);
	}
}
