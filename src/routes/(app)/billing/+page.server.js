// import { activateLicense } from '@lemonsqueezy/lemonsqueezy.js';

import { redirect } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';
import { calculateTrialDaysLeft } from '../../../lib/utils';
import { Polar } from '@polar-sh/sdk';
import { env } from '$env/dynamic/private';

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

	// console.log(env.POLAR_TEST_ACCESS);
	const polar = new Polar({
		accessToken: env.POLAR_ACCESS,
		server: import.meta.env.DEV ? 'sandbox' : 'production'
	});

	const checkoutMonthly = await polar.checkouts.custom.create({
		productPriceId: import.meta.env.DEV
			? 'bf3e128e-b776-49e4-8586-91e4d65a4ff8'
			: 'fe82208e-2d27-483f-beaa-519b2eba8621',
		customerName: user.name,
		customerEmail: user.email,
		successUrl: `${url.origin}/billing/success?checkout_id={CHECKOUT_ID}`,
		metadata: {
			userId: user.id
		}
	});
	const checkoutYearly = await polar.checkouts.custom.create({
		productPriceId: import.meta.env.DEV
			? 'de7ca2c3-9f9a-42d2-ad3f-fdf3d56e2cb2'
			: '26ae3ef2-3e43-431f-b411-3d9bd574c816',
		customerName: user.name,
		customerEmail: user.email,
		successUrl: `${url.origin}/billing/success?checkout_id={CHECKOUT_ID}`,
		metadata: {
			userId: user.id
		}
	});
	const checkoutLifetime = await polar.checkouts.custom.create({
		productPriceId: import.meta.env.DEV
			? '6e5fa896-4406-4440-b32f-aeacf3850e34'
			: 'e13a3ca8-edb1-4dd4-8de5-7afa84e45d4e',
		customerName: user.name,
		customerEmail: user.email,
		successUrl: `${url.origin}/billing/success?checkout_id={CHECKOUT_ID}`,
		metadata: {
			userId: user.id
		}
	});

	return {
		user,
		checkout: [
			[
				checkoutMonthly.product.prices[0].priceAmount,
				checkoutMonthly.product.prices[0].priceCurrency,
				checkoutMonthly.product.prices[0].recurringInterval,
				checkoutMonthly.url
			],
			[
				checkoutYearly.product.prices[1].priceAmount,
				checkoutYearly.product.prices[1].priceCurrency,
				checkoutMonthly.product.prices[1].recurringInterval,
				checkoutYearly.url
			],
			[
				checkoutLifetime.product.prices[0].priceAmount,
				checkoutLifetime.product.prices[0].priceCurrency,
				checkoutLifetime.product.prices[0].recurringInterval,
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
