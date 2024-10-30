import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ locals: { pb }, url }) {
	const token = url.searchParams.get('token');

	if (token) {
		try {
			await pb.collection('users').confirmVerification(token);
			throw redirect(303, '/signin');
		} catch (error) {
			if (error?.status == 303) {
				throw redirect(303, '/signin');
			} else {
				return { fail: error?.response?.message };
			}
		}
	} else {
		return { fail: 'No token found' };
	}
}
