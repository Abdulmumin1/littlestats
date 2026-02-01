import { redirect } from '@sveltejs/kit';

// Email confirmation is handled by better-auth on the client side or via API
// This route just redirects to the frontend verification handler

/** @type {import('./$types').PageLoad} */
export async function load({ url }) {
	const token = url.searchParams.get('token');

	if (token) {
		// Redirect to frontend route that handles verification with better-auth client
		throw redirect(303, `/verify-email?token=${token}`);
	} else {
		return { fail: 'No token found' };
	}
}
