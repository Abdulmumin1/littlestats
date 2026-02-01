import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, cookies }) {
	// Better-auth handles OAuth callback automatically
	// This route just redirects back to the app after auth
	
	const error = url.searchParams.get('error');
	
	if (error) {
		console.error('[OAuth] Error:', error);
		throw redirect(303, '/signin?error=oauth_failed');
	}
	
	// The actual token exchange and session creation is handled by better-auth
	// Just redirect to sites or the original destination
	const callbackURL = cookies.get('callback_url') || '/sites';
	cookies.delete('callback_url', { path: '/' });
	
	throw redirect(303, callbackURL);
}
