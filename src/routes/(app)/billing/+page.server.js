// import { activateLicense } from '@lemonsqueezy/lemonsqueezy.js';

import { redirect } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';
import { calculateTrialDaysLeft } from '../../../lib/utils';
import { Polar } from '@polar-sh/sdk';
import { env } from '$env/dynamic/private';
import { getSubscriptionStatus, isSubscriptionCancelled } from '../../../lib/subscription';

/** @type {import('./$types').PageLoad} */
export async function load({ locals: { pb }, url }) {
	const user = pb.authStore.model;

	// const daysLeft = calculateTrialDaysLeft(user.date_activated);

	// if (daysLeft > 0) {
	// 	throw redirect(303, '/sites');
	// }
	// if (user.setup_complete) {
	// 	throw redirect(303, '/sites');
	// }
	if (!user) {
		throw redirect(303, '/signup');
	}

	// console.log('User subscription ID:', user);

	let subscription = null;
	let isCancelled = false;

	
	if (user.sub_id) {
		subscription = await getSubscriptionStatus(user.sub_id);
		isCancelled = user.sub_cancelled;
	}

	// console.log(env.POLAR_TEST_ACCESS);
	const polar = new Polar({
		accessToken: env.POLAR_ACCESS,
		server: import.meta.env.DEV ? 'sandbox' : 'production'
	});

	const checkoutMonthly = await polar.checkouts.create({
		customerEmail: user.email,
		products: [
			import.meta.env.DEV
				? 'f7558b81-a18e-4aad-8271-feb1bbb55de5'
				: '9f3b93d6-752a-4425-811c-d9046d78ac5c'
		],
		successUrl: `${url.origin}/billing/success?checkout_id={CHECKOUT_ID}`,
		metadata: {
			userId: user.id
		}
	});
	const checkoutYearly = await polar.checkouts.create({
		customerEmail: user.email,
		products: [
			import.meta.env.DEV
				? 'f7558b81-a18e-4aad-8271-feb1bbb55de5'
				: '0efa24ea-e2e8-447b-b8ca-e84fe2cb6744'
		],
		successUrl: `${url.origin}/billing/success?checkout_id={CHECKOUT_ID}`,
		metadata: {
			userId: user.id
		}
	});
	const checkoutLifetime = await polar.checkouts.create({
		customerEmail: user.email,
		products: [
			import.meta.env.DEV
				? 'ec890102-67a8-4fb2-a1f7-6222323d8788'
				: 'fbac1c4e-5fe9-43d0-aa22-4a49c3f50d9b'
		],
		successUrl: `${url.origin}/billing/success?checkout_id={CHECKOUT_ID}`,
		metadata: {
			userId: user.id
		}
	});

	// console.log('Checkout URLs:', {
	// 	checkoutMonthly: checkoutMonthly.amount,
	// 	checkoutYearly: checkoutYearly.url,
	// 	checkoutLifetime: checkoutLifetime.url
	// });
	
	return {
		user,
		subscription,
		isCancelled,
		checkout: [
			[
				checkoutMonthly.productPrice.priceAmount,
				checkoutMonthly.productPrice.priceCurrency,
				checkoutMonthly.productPrice.recurringInterval,
				checkoutMonthly.url
			],
			[
				checkoutYearly.productPrice.priceAmount,
				checkoutYearly.productPrice.priceCurrency,
				checkoutMonthly.productPrice.recurringInterval,
				checkoutYearly.url
			],
			[
				checkoutLifetime.productPrice.priceAmount,
				checkoutLifetime.productPrice.priceCurrency,
				checkoutLifetime.productPrice.recurringInterval,
				checkoutLifetime.url
			]
		]
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	updateUser: async ({ locals: { pb }, request }) => {
		const formdata = await request.formData();
		const name = formdata.get('name');
		const license = formdata.get('license');

		if (!name || license) {
			return fail(400, {
				namerequired: name == null,
				license: license == null,
				message: 'Entries incomplete'
			});
		}
		const userId = pb.authStore.model?.id;
		try {
			let dt = {
				name: name,
				account_activated: true,
				setup_complete: true
			};
			await pb.collection('users').update(userId, dt);
		} catch (error) {
			console.error(error);
			return fail(400, { fail: true, message: error?.data?.message });
		}
	}
};
