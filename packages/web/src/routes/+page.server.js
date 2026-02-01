// Root Server File
// Data is now fetched client-side via the v2 API

import { generateRandomEvents } from '../lib/mockData.js';

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
	// Return mock data for the landing page demo
	const records = generateRandomEvents(50);
	const domain_id = 'demo-site';
	
	return { 
		records, 
		domain_id 
	};
}

// No actions needed - client-side API handles all data operations
export const actions = {};
