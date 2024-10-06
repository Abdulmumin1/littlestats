import { fail, redirect } from '@sveltejs/kit';

/** @type {import('./$types').Actions} */
export const actions = {
	register: async ({ locals, request }) => {
		const data = await request.formData();
		const email = data.get('email');
		const password = data.get('password');

		if (!email || !password) {
			return fail(400, { emailrequired: email == null, passwordRequired: password == null });
		}
		try {
			await locals.pb.collections('users').create(data);
			await locals.pb.collections('users').authWithPassword(email, password.toString());
			await locals.pb.collections('users').requestVerification(email);
		} catch (error) {
			return fail(400, { fail: true, message: error.data.message });
		}

		throw redirect(301, '/checkout');
	}
};
