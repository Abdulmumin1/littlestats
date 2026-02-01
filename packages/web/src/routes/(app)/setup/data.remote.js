import * as v from 'valibot';
import { command, getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';

const API_BASE_URL = env.DASHBOARD_URL || 'http://localhost:8787';

const OnboardSchema = v.object({
	name: v.string(),
	domain: v.string(),
	plan: v.string(),
	email: v.string()
});

export const onboard = command(OnboardSchema, async ({ name, domain, plan, email }) => {
	try {
		const cookies = getRequestEvent().cookies;
		const sessionToken = cookies.get('better-auth.session_token');
		const headers = { 'Content-Type': 'application/json' };
		if (sessionToken) {
			headers['Cookie'] = `better-auth.session_token=${sessionToken}`;
		}

		// 1. Create the site
		const siteResponse = await fetch(`${API_BASE_URL}/api/v2/sites`, {
			method: 'POST',
			headers,
			body: JSON.stringify({ domain, name: domain })
		});

		if (!siteResponse.ok) {
			const error = await siteResponse.json();
			return { success: false, error: error.error || 'Failed to create site' };
		}

		const siteData = await siteResponse.json();

		// 2. If Pro plan selected, create checkout session
		if (plan === 'pro') {
			const optionsResponse = await fetch(`${API_BASE_URL}/api/v2/billing/checkout-options`, { headers });
			const optionsData = optionsResponse.ok ? await optionsResponse.json() : { checkout: [] };
			
			if (optionsData.checkout.length === 0) {
				return { success: false, error: 'No pricing options available' };
			}

			// Use the monthly plan (first option)
			const productId = optionsData.checkout[0][3];

			const checkoutResponse = await fetch(`${API_BASE_URL}/api/v2/billing/checkout`, {
				method: 'POST',
				headers,
				body: JSON.stringify({
					productId,
					email,
					name,
					quantity: 1,
					metadata: {
						siteId: siteData.id,
						plan: 'pro'
					}
				})
			});

			if (!checkoutResponse.ok) {
				const error = await checkoutResponse.json();
				return { success: false, error: error.error || 'Failed to create checkout' };
			}

			const checkoutData = await checkoutResponse.json();
			
			if (checkoutData.checkoutUrl) {
				return { success: true, redirect: checkoutData.checkoutUrl };
			}
		}

		// Free plan - redirect to the new setup guide
		return { success: true, redirect: `/setup/guide?siteId=${siteData.id}` };
		
	} catch (error) {
		console.error('Onboarding error:', error);
		return { success: false, error: error.message || 'Failed to complete onboarding' };
	}
});
