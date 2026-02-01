import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ locals, url }) {
	// Redirect if already logged in
	if (locals.user) {
		throw redirect(303, '/sites');
	}
	
	// Get redirect destination from query params
	const redirectTo = url.searchParams.get('after');
	
	return {
		redirectTo: redirectTo ? '/' + redirectTo : '/sites'
	};
}

/** @type {import('./$types').Actions} */
// Actions removed - authentication handled client-side via better-auth
export const actions = {};
