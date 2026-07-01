// Sites list page - Uses v2 API directly from browser
// Server-side onboarding check prevents existing users from flickering through /setup

import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const API_BASE_URL = env.DASHBOARD_URL || 'https://stats.littlestats.click';

/** @type {import('./$types').PageLoad} */
export async function load({ locals, fetch, request }) {
	const user = locals.user;
	
	if (!user) {
		throw redirect(303, '/signin');
	}

	// Server-side onboarding check: redirect to /setup only if the user truly has zero sites
	try {
		const cookieHeader = request.headers.get('cookie');
		const headers = { 'Content-Type': 'application/json' };
		if (cookieHeader) {
			headers['Cookie'] = cookieHeader;
		}

		const response = await fetch(`${API_BASE_URL}/api/v2/sites`, { headers });
		if (response.ok) {
			const data = await response.json();
			if (data.sites?.length === 0) {
				throw redirect(303, '/setup');
			}
		}
	} catch (err) {
		// Re-throw SvelteKit redirects so the framework handles them
		if (err?.status && err?.location) throw err;
		console.error('Sites load error:', err);
	}
	
	return {
		domains: []
	};
}