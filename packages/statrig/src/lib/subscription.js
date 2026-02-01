// Dodo Payments subscription helpers
// Replaces previous Polar/LemonSqueezy implementations

/**
 * Check if a subscription is active
 * @param {Object} subscription - Subscription object from database
 * @returns {boolean}
 */
export function isSubscriptionActive(subscription) {
	if (!subscription) return false;
	return subscription.status === 'active';
}

/**
 * Check if a subscription is cancelled
 * @param {Object} subscription - Subscription object from database
 * @returns {boolean}
 */
export function isSubscriptionCancelled(subscription) {
	if (!subscription) return false;
	return subscription.status === 'cancelled' || subscription.status === 'canceled';
}

/**
 * Check if a subscription has expired
 * @param {Object} subscription - Subscription object from database
 * @returns {boolean}
 */
export function isSubscriptionExpired(subscription) {
	if (!subscription) return false;
	
	// Check status
	if (subscription.status === 'expired') return true;
	
	// Check if current period has ended
	if (subscription.currentPeriodEnd) {
		const endDate = new Date(subscription.currentPeriodEnd);
		return endDate < new Date();
	}
	
	return false;
}

/**
 * Get subscription status display text
 * @param {Object} subscription - Subscription object
 * @returns {string}
 */
export function getSubscriptionStatusText(subscription) {
	if (!subscription) return 'No Subscription';
	
	switch (subscription.status) {
		case 'active':
			return subscription.cancelAtPeriodEnd ? 'Active (Cancels at period end)' : 'Active';
		case 'cancelled':
		case 'canceled':
			return 'Cancelled';
		case 'expired':
			return 'Expired';
		case 'past_due':
			return 'Past Due';
		default:
			return subscription.status;
	}
}

/**
 * Format subscription period dates
 * @param {Object} subscription - Subscription object
 * @returns {Object}
 */
export function getSubscriptionPeriod(subscription) {
	if (!subscription) return { start: null, end: null };
	
	return {
		start: subscription.currentPeriodStart ? new Date(subscription.currentPeriodStart) : null,
		end: subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null
	};
}
