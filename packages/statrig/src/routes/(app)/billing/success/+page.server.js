import { env } from '$env/dynamic/private';

const API_BASE_URL = env.DASHBOARD_URL || 'http://localhost:8787';

/** @type {import('./$types').PageLoad} */
export async function load({ locals, url, cookies, fetch }) {
	const user = locals.user;
	
	if (!user) {
		return { user: null };
	}

	try {
		const sessionToken = cookies.get('better-auth.session_token');
		const headers = { 'Content-Type': 'application/json' };
		if (sessionToken) {
			headers['Cookie'] = `better-auth.session_token=${sessionToken}`;
		}

		// Fetch latest subscription data from Dodo API
		const response = await fetch(`${API_BASE_URL}/api/v2/billing/subscription`, { headers });
		const subscriptionData = response.ok ? await response.json() : { hasSubscription: false };

		// Get query params from URL (Dodo returns these)
		const status = url.searchParams.get('status');
		const sessionId = url.searchParams.get('session_id');
		const siteIdParam = url.searchParams.get('siteId');

		const metadata = subscriptionData.hasSubscription && subscriptionData.subscription.metadata 
			? subscriptionData.subscription.metadata 
			: null;

		return {
			user: {
				...user,
				sub_id: subscriptionData.hasSubscription ? subscriptionData.subscription.id : null,
				sub_status: subscriptionData.hasSubscription ? subscriptionData.subscription.status : null,
				variant_name: subscriptionData.hasSubscription ? subscriptionData.subscription.planName : null,
				renews_at: subscriptionData.hasSubscription ? subscriptionData.subscription.currentPeriodEnd : null,
			},
			paymentStatus: status,
			checkoutSessionId: sessionId,
			siteId: siteIdParam || metadata?.siteId || null
		};
	} catch (error) {
		console.error('Billing success load error:', error);
		return { user };
	}
}
