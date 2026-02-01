import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const API_BASE_URL = env.DASHBOARD_URL || 'http://localhost:8787';

/** @type {import('./$types').PageLoad} */
export async function load({ locals, fetch, cookies, request }) {
	// Check if user is authenticated
	const user = locals.user;
	
	if (!user) {
		throw redirect(303, '/signin');
	}

	// Check if user has sites
	try {
		const cookieHeader = request.headers.get('cookie');
		const headers = { 'Content-Type': 'application/json' };
		if (cookieHeader) {
			headers['Cookie'] = cookieHeader;
		}

		// const response = await fetch(`${API_BASE_URL}/api/v2/sites`, { headers });
		// if (response.ok) {
		// 	const data = await response.json();
		// 	if (data.sites?.length > 0) {
		// 		// User already has sites, onboarding complete
		// 		throw redirect(303, '/sites');
		// 	}
		// }
	} catch (error) {
		console.error('Setup load error:', error);
	}
	
	return { 
		user: {
			id: user?.id || '',
			name: user?.name || '',
			email: user?.email || ''
		}
	};
}
