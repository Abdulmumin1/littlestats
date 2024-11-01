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
	},
	oauth: async ({ locals: { pb }, url, cookies }) => {
		const redirectURL = `${url.origin}/oauth`;
		const authMethods = await pb.collection('users').listAuthMethods();
		const provider = authMethods.authProviders[0];
		// console.log(provider);
		if (!provider) {
			return fail(400, { message: 'No such provider' });
		}

		const authProviderRedirect = `${provider.authUrl}${redirectURL}`;

		const state = provider.state;
		const codeVerifier = provider.codeVerifier;

		cookies.set('oauth_state', state, {
			path: '/oauth',
			httpOnly: true
		});
		cookies.set('oauth_verifier', codeVerifier, {
			path: '/oauth',
			httpOnly: true
		});

		throw redirect(302, authProviderRedirect);
	}
};
