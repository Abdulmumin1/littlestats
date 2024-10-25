import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

export const authentication = async ({ event, resolve }) => {
	event.locals.pb = new PocketBase(env.PB_URL);
	// console.log(event.locals.pb);

	// load the store data from the request cookie string
	event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

	try {
		// get an up-to-date auth store state by verifying and refreshing the loaded auth model (if any)
		event.locals.pb.authStore.isValid && (await event.locals.pb.collection('users').authRefresh());
	} catch (_) {
		// clear the auth store on failed refresh
		event.locals.pb.authStore.clear();
	}

	const response = await resolve(event);

	// send back the default 'pb_auth' cookie to the client with the latest store state
	response.headers.append('set-cookie', event.locals.pb.authStore.exportToCookie());

	return response;
};

const unprotectedPrefix = [
	'/signin',
	'/onboarding',
	'/embed',
	'/signup',
	'/terms',
	'/privacy',
	'/acceptable-use'
];
export const authorization = async ({ event, resolve }) => {
	const loggedIn = await event.locals.pb.authStore.model;

	if (event.url.pathname == '/') {
		if (loggedIn) {
			event.locals.user = loggedIn;
			throw redirect(303, '/sites');
		}
	} else if (!unprotectedPrefix.some((path) => event.url.pathname.startsWith(path))) {
		if (!loggedIn) {
			throw redirect(
				303,
				'/signin?after=' + event.url.pathname.slice(1, event.url.pathname.length)
			);
		}
		if (!loggedIn.setup_complete) {
			throw redirect(303, '/onboarding');
		}

		event.locals.user = loggedIn;
	}

	// If the request is still here, just proceed as normally
	const result = await resolve(event);
	return result;
};

export const handle = sequence(authentication, authorization);
