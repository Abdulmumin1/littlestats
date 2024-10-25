// import { activateLicense } from '@lemonsqueezy/lemonsqueezy.js';

import { redirect } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ locals: { pb } }) {
	const user = pb.authStore.model;

	// if (user.setup_complete) {
	// 	throw redirect(303, '/sites');
	// }
	if (!user) {
		throw redirect(303, '/signup');
	}
	return { user };
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
				setup_complete: true
			};
			await pb.collection('users').update(userId, dt);
		} catch (error) {
			console.error(error);
			return fail(400, { fail: true, message: error?.data?.message });
		}
	}
};
