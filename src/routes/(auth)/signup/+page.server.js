import { fail, redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load() {
	// throw redirect(303, '/');
}

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
			// console.log('dome');
			await locals.pb.collection('users').create(data);
			await locals.pb.collection('users').authWithPassword(email, password.toString());
			await locals.pb.collection('users').requestVerification(email);
		} catch (error) {
			console.log(error);
			return fail(400, { fail: true, message: error.data.message });
		}
		return {
			success: true,
			redirectTo: '/checkout',
			message: 'Check your inbox to complete signup'
		};
		// throw redirect(301, '/checkout');
	}
};
