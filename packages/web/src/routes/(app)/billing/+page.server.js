import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const API_BASE_URL = env.DASHBOARD_URL || 'http://localhost:8787';

/** @type {import('./$types').PageLoad} */
export async function load({ locals, url, cookies, fetch }) {
	const user = locals.user;

	if (!user) {
		throw redirect(303, '/signup');
	}

	try {
		const sessionToken = cookies.get('better-auth.session_token');
		const headers = { 'Content-Type': 'application/json' };
		if (sessionToken) {
			headers['Cookie'] = `better-auth.session_token=${sessionToken}`;
		}

		// Fetch checkout options from Dodo API
		const checkoutResponse = await fetch(`${API_BASE_URL}/api/v2/billing/checkout-options`, { headers });
		const checkoutData = checkoutResponse.ok ? await checkoutResponse.json() : { checkout: [] };

		// Fetch user's subscription status
		const subscriptionResponse = await fetch(`${API_BASE_URL}/api/v2/billing/subscription`, { headers });
		const subscriptionData = subscriptionResponse.ok ? await subscriptionResponse.json() : { hasSubscription: false };

		return {
			user: {
				...user,
				sub_id: subscriptionData.hasSubscription ? subscriptionData.subscription.id : null,
				sub_status: subscriptionData.hasSubscription ? subscriptionData.subscription.status : null,
				variant_name: subscriptionData.hasSubscription ? subscriptionData.subscription.planName : null,
				renews_at: subscriptionData.hasSubscription ? subscriptionData.subscription.currentPeriodEnd : null,
			},
			subscription: subscriptionData.subscription,
			isCancelled: subscriptionData.hasSubscription && subscriptionData.subscription.status === 'cancelled',
			checkout: checkoutData.checkout || []
		};
	} catch (error) {
		console.error('Billing load error:', error);
		// Return default values if API fails
		return {
			user,
			subscription: null,
			isCancelled: false,
			checkout: [
				[400, 'USD', 'monthly', 'pdt_0NXY8Oz1kUf3jfQMcJH84']
			]
		};
	}
}

/** @type {import('./$types').Actions} */
export const actions = {
	// Checkout action - creates a Dodo checkout session
	checkout: async ({ request, cookies, fetch }) => {
		const formData = await request.formData();
		const productId = formData.get('productId');
		const email = formData.get('email');
		const name = formData.get('name');

		if (!productId || !email) {
			return { error: 'Missing required fields' };
		}

		try {
			const sessionToken = cookies.get('better-auth.session_token');
			const headers = { 'Content-Type': 'application/json' };
			if (sessionToken) {
				headers['Cookie'] = `better-auth.session_token=${sessionToken}`;
			}

			const response = await fetch(`${API_BASE_URL}/api/v2/billing/checkout`, {
				method: 'POST',
				headers,
				body: JSON.stringify({
					productId,
					email,
					name,
					quantity: 1
				})
			});

			
			if (!response.ok) {
				const error = await response.json();
				return { error: error.error || 'Failed to create checkout' };
			}

			const data = await response.json();

			console.log(data)
			
			// Redirect to Dodo checkout
			if (data.checkoutUrl) {
				throw redirect(303, data.checkoutUrl);
			}

			return { error: 'No checkout URL received' };
		} catch (error) {
			if (error.status === 303) throw error; // Re-throw redirect
			console.error('Checkout error:', error);
			return { error: error.message || 'Failed to create checkout' };
		}
	}
};
