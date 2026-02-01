// Account settings - simplified for v2 architecture
// User profile updates should go through better-auth in the future

/** @type {import('./$types').PageLoad} */
export async function load({ locals }) {
	// Get user from locals (set up by auth hook)
	const user = locals.user || {};
	
	return { 
		user: {
			id: user.id || '',
			name: user.name || '',
			email: user.email || '',
			weekly_report_setting: user.weekly_report_setting || false,
			variant_name: user.variant_name || ''
		}
	};
}

/** @type {import('./$types').Actions} */
// Actions disabled - user updates should go through better-auth API
export const actions = {};
