// import { activateLicense } from '@lemonsqueezy/lemonsqueezy.js';

import { redirect } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ locals: { pb }, url }) {
	const user = pb.authStore.model;

	if (user?.account_activated) {
		throw redirect(303, '/sites');
	}
	if (!user) {
		throw redirect(303, '/signup');
	}
	return { user };
}

/** @type {import('./$types').Actions} */
export const actions = {
	updateUser: async ({ locals: { pb }, request }) => {
		if (pb.authStore.model?.account_activated) return { success: true };
		const formdata = await request.formData();
		const name = formdata.get('name');

		const userId = pb.authStore.model?.id;
		try {
			let dt = {
				name: name,
				account_activated: true,
				date_activated: new Date()
			};
			await pb.collection('users').update(userId, dt);
		} catch (error) {
			console.error(error);
			return fail(400, { fail: true, message: error?.data?.message });
		}
	}
};
