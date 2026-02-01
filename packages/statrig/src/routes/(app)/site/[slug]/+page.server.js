// Site Dashboard Server File
// Data is now fetched client-side via the v2 API
// This file just ensures the site context is passed correctly

import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ parent, params }) {
	try {
		// Inherit domains and other data from parent layout
		const data = await parent();
		
		// Find the current site from the domains list
		const site = data.domains?.find(d => d.id === params.slug || d.domain === params.slug);
		
		if (!site && data.domains?.length > 0) {
			// If site not found but user has other sites, redirect to first site
			throw redirect(303, `/site/${data.domains[0].id}`);
		} else if (!site) {
			// If user has no sites, redirect to sites list (which will handle onboarding)
			throw redirect(303, '/sites');
		}
		
		return {
			...data,
			siteId: params.slug,
			site
		};
	} catch (error) {
		console.error('Error loading dashboard data:', error);
		return { 
			siteId: params.slug,
			error: error.message 
		};
	}
}

// No actions needed - all data operations happen via API client
export const actions = {};
