import { redirect, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const API_BASE_URL = env.DASHBOARD_URL || 'http://localhost:8787';

/** @type {import('./$types').PageLoad} */
export async function load({ locals, url, cookies, fetch }) {
	const user = locals.user;
	
	if (!user) {
		throw redirect(303, '/signin');
	}

	const siteId = url.searchParams.get('siteId');
	if (!siteId) {
		throw redirect(303, '/sites');
	}

	try {
		const sessionToken = cookies.get('better-auth.session_token');
		const headers = { 'Content-Type': 'application/json' };
		if (sessionToken) {
			headers['Cookie'] = `better-auth.session_token=${sessionToken}`;
		}

		// Fetch user's sites to find the specific one and ensure ownership
		const response = await fetch(`${API_BASE_URL}/api/v2/sites`, { headers });
		if (!response.ok) {
			throw error(500, 'Failed to fetch sites');
		}

		const data = await response.json();
		const site = data.sites.find(s => s.id === siteId);

		if (!site) {
			throw error(404, 'Site not found');
		}

		return {
			site
		};
	} catch (err) {
		console.error('Setup guide load error:', err);
		if (err.status) throw err;
		throw error(500, 'Failed to load setup guide');
	}
}
