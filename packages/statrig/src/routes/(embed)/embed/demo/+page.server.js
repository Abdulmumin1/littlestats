// Embed Demo Server File
// This demo page needs to be updated to use the dashboard API or mock data
// For now, we'll return mock data to break the dependency on PocketBase

import { generateRandomEvents } from '../../../../../lib/mockData.js';

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
	const domain_id = 'demo-site-id';
	const records = generateRandomEvents(100);
	
	return { records, domain_id };
}

// No actions needed for the demo
export const actions = {};
