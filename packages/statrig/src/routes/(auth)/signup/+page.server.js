import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ locals }) {
	// Redirect if already logged in
	if (locals.user) {
		throw redirect(303, '/sites');
	}
	
	return {};
}

/** @type {import('./$types').Actions} */
// Actions removed - registration handled client-side via better-auth
export const actions = {};
