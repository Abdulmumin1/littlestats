import { Polar } from '@polar-sh/sdk';
import { env } from '$env/dynamic/private';

export async function getSubscriptionStatus(subId) {
	if (!subId) return null;

	const polar = new Polar({
		accessToken: env.POLAR_ACCESS,
		server: import.meta.env.DEV ? 'sandbox' : 'production'
	});

	try {
		const subscription = await polar.subscriptions.get({id: subId});
		return subscription;
	} catch (error) {
		console.error('Error fetching subscription:', error);
		return null;
	}
}

export function isSubscriptionCancelled(subscription) {
	if (!subscription) return false;
	return subscription.status === 'canceled';
}

export function isSubscriptionActive(subscription) {
	if (!subscription) return false;
	return subscription.status === 'active';
}
