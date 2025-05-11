import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { calculateTrialDaysLeft } from './lib/utils';
import { createClient } from '@clickhouse/client-web';

export const authentication = async ({ event, resolve }) => {
	event.locals.pb = new PocketBase(env.PB_URL);
	const client = createClient({
		url: env.CLICKHOUSE_HOST ?? 'http://localhost:8123',
		username: env.CLICKHOUSE_USER ?? 'default',
		password: env.CLICKHOUSE_PASSWORD
	});
	event.locals.ch = client;
	// console.log(event.locals.pb);/

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
	response.headers.append(
		'set-cookie',
		event.locals.pb.authStore.exportToCookie({ sameSite: 'Lax' })
	);

	return response;
};

const unprotectedPrefix = [
	'/signin',
	'/embed',
	'/signup',
	'/terms',
	'/privacy',
	'/acceptable-use',
	'/confirm',
	'/oauth',
	'/sitemap.xml',
	'/robots.txt',
];

export const authorization = async ({ event, resolve }) => {
	const loggedIn = await event.locals.pb.authStore.model;

	if (event.url.pathname == '/') {
		// # redirect to homepage
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
		} else if (!loggedIn?.account_activated && !event.url.pathname.startsWith('/setup')) {
			throw redirect(303, '/setup');
		} else if (!loggedIn?.sub_id) {
			const daysLeft = calculateTrialDaysLeft(loggedIn.date_activated);

			if (!event.url.pathname.startsWith('/billing') && daysLeft <= 0) {
				throw redirect(303, '/billing');
			}
		}

		event.locals.user = loggedIn;
	}

	// If the request is still here, just proceed as normally
	const result = await resolve(event);
	return result;
};

export const handle = sequence(authentication, authorization);
