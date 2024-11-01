import { fail, redirect } from '@sveltejs/kit';

let redirectTo;

/** @type {import('./$types').PageLoad} */
export async function load({ locals: { pb }, url }) {
	const user = pb.authStore.model;
	if (user) {
		redirect(301, '/sites');
	}
	redirectTo = url.searchParams.get('after');
	if (redirectTo) {
		redirectTo = '/' + redirectTo;
	}
	// console.log(redirectTo);
}

/** @type {import('./$types').Actions} */
export const actions = {
	login: async ({ locals: { pb }, request, url }) => {
		const data = await request.formData();
		const email = data.get('email');
		const password = data.get('password');

		// console.log(data);
		if (!email || !password) {
			return fail(400, { emailrequired: email == null, passwordRequired: password == null });
		}
		try {
			// console.log(pb.collections);
			await pb.collection('users').authWithPassword(email, password.toString());
		} catch (error) {
			console.error(error);
			return fail(400, { fail: true, message: error?.data?.message });
		}

		throw redirect(301, redirectTo ?? '/sites');
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
			httpOnly: true,
		});
		cookies.set('oauth_verifier', codeVerifier, {
			path: '/oauth',
			httpOnly: true,
		});

		throw redirect(302, authProviderRedirect);
	}
};
