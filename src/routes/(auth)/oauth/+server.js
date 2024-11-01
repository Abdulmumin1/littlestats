import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ locals: { pb }, cookies, url }) {
	const redirectURL = `${url.origin}/oauth`;
	const expectedState = cookies.get('oauth_state');
	const expectedVerifier = cookies.get('oauth_verifier');

	const state = await url.searchParams.get('state');
	const code = await url.searchParams.get('code');

	const authMethods = await pb.collection('users').listAuthMethods();

	if (!authMethods.authProviders) {
		throw redirect(303, '/signup');
	}
	const provider = authMethods.authProviders[0];
	if (!provider) {
		throw redirect(303, '/signup');
	}

	const errorResponse = { status: 403, statusText: 'Forbidden!' };

	// console.log(expectedState, state);
	if (expectedState !== state) {
		return new Response(errorResponse);
	}

	// console.log(provider);

	try {
		await pb
			.collection('users')
			.authWithOAuth2Code(provider.name, code, expectedVerifier, redirectURL);
	} catch (error) {
		console.log(error);
		return new Response(errorResponse);
	}
	await pb.collection('users').authRefresh();
	throw redirect(303, '/signin');
}
