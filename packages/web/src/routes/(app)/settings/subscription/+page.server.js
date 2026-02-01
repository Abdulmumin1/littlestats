import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';

const API_BASE_URL = env.DASHBOARD_URL || 'http://localhost:8787';

/** @type {import('./$types').PageLoad} */
export async function load({ locals, cookies, fetch, request }) {
	const user = locals.user;
	
	if (!user) {
		return { user: null };
	}

	try {
		const cookieHeader = request.headers.get('cookie');
		const headers = { 'Content-Type': 'application/json' };
		if (cookieHeader) {
			headers['Cookie'] = cookieHeader;
		}

		// Fetch subscription data from Dodo API
		const response = await fetch(`${API_BASE_URL}/api/v2/billing/subscription`, { headers });
		const subscriptionData = response.ok ? await response.json() : { hasSubscription: false };

		// Fetch usage statistics
		const usageResponse = await fetch(`${API_BASE_URL}/api/v2/billing/usage`, { headers });
		const usageData = usageResponse.ok ? await usageResponse.json() : null;

		return {
			user: {
				...user,
				sub_id: subscriptionData.hasSubscription ? subscriptionData.subscription.id : null,
				sub_status: subscriptionData.hasSubscription ? subscriptionData.subscription.status : null,
				variant_name: subscriptionData.hasSubscription ? subscriptionData.subscription.planName : null,
				renews_at: subscriptionData.hasSubscription ? subscriptionData.subscription.currentPeriodEnd : null,
				provider: subscriptionData.hasSubscription ? subscriptionData.subscription.provider : null,
				// Additional subscription details
				subscriptionDetails: subscriptionData.hasSubscription ? {
					periodStart: subscriptionData.subscription.currentPeriodStart,
					periodEnd: subscriptionData.subscription.currentPeriodEnd,
					cancelAtPeriodEnd: subscriptionData.subscription.cancelAtPeriodEnd,
					createdAt: subscriptionData.subscription.createdAt,
					providerSubscriptionId: subscriptionData.subscription.providerSubscriptionId,
					// Dodo-specific details
					dodoDetails: subscriptionData.subscription.dodoDetails
				} : null
			},
			usage: usageData
		};
	} catch (error) {
		console.error('Subscription settings load error:', error);
		return { user };
	}
}

/** @type {import('./$types').Actions} */
export const actions = {
	// Action to redirect to customer portal
	portal: async ({ cookies, fetch, request }) => {
		try {
			const cookieHeader = request.headers.get('cookie');
			const headers = { 'Content-Type': 'application/json' };
			if (cookieHeader) {
				headers['Cookie'] = cookieHeader;
			}

			// Fetch portal URL from API
			const response = await fetch(`${API_BASE_URL}/api/v2/billing/portal`, { headers });
			
			if (!response.ok) {
				const error = await response.json();
				return { error: error.error || 'Failed to generate portal URL' };
			}

			const data = await response.json();
			
			if (data.portalUrl) {
				throw redirect(303, data.portalUrl);
			}

			return { error: 'No portal URL received' };
		} catch (error) {
			if (error.status === 303) throw error;
			console.error('Portal redirect error:', error);
			return { error: error.message || 'Failed to redirect to portal' };
		}
	}
};
