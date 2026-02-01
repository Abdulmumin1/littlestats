import { redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { env } from '$env/dynamic/private';

// Better-auth endpoints
const AUTH_API_URL = env.DASHBOARD_URL || 'https://stats.littlestats.click';

/**
 * Authentication hook - validates session with better-auth API
 */
export const authentication = async ({ event, resolve }) => {
	// Initialize empty user
	event.locals.user = null;
	
	// Get all cookies from the request
	const cookieHeader = event.request.headers.get('cookie');
	
	if (cookieHeader) {
		try {
			// Validate session with better-auth API
			// Better Auth uses /get-session endpoint, not /session
			// Forward all cookies to ensure the session is properly validated
			const response = await fetch(`${AUTH_API_URL}/api/auth/get-session`, {
				method: 'GET',
				headers: {
					'Cookie': cookieHeader,
					'Content-Type': 'application/json',
				},
			});
			
			if (response.ok) {
				const session = await response.json();
				if (session && session.user) {
					event.locals.user = session.user;
				}
			}
		} catch (error) {
			console.error('[Auth] Session validation error:', error);
		}
	}
	
	return resolve(event);
};

/**
 * Protected routes configuration
 */
const unprotectedPrefixes = [
	'/signin',
	'/signup',
	'/oauth',
	'/confirm',
	'/terms',
	'/privacy',
	'/acceptable-use',
	'/embed',
	'/api',  // API routes handled separately
	'/_app', // SvelteKit internals
	'/sitemap.xml',
	'/robots.txt',
	'/docs'
];

/**
 * Authorization hook - protects routes and handles redirects
 */
export const authorization = async ({ event, resolve }) => {
	const { pathname } = event.url;
	const user = event.locals.user;
	
	// Check if route is unprotected
	const isUnprotected = unprotectedPrefixes.some(prefix => 
		pathname.startsWith(prefix) || pathname === '/'
	);
	
	// Handle root path
	if (pathname === '/') {
		if (user) {
			throw redirect(303, '/sites');
		}
		return resolve(event);
	}
	
	// Protected routes require authentication
	if (!isUnprotected && !user) {
		// Store the intended destination for post-login redirect
		const redirectTo = encodeURIComponent(pathname.slice(1));
		throw redirect(303, `/signin?after=${redirectTo}`);
	}
	
	// Check if user needs onboarding (account not activated)
	// Note: This would need to be checked against your user model
	// For now, we'll skip this check since better-auth handles user state differently
	
	return resolve(event);
};

export const handle = sequence(authentication, authorization);
