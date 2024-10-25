import { fail } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load() {}

/** @type {import('./$types').Actions} */
export const actions = {
	waitlist: async ({ locals: { pb }, request }) => {
		const data = await request.formData();
		const email = data.get('email');

		// console.log(data);
		if (!email) {
			return fail(400, { emailrequired: email == null });
		}
		try {
			// console.log(pb.collections);
			const data = {
				email: email
			};
			await pb.collection('waitlist').create(data);
		} catch (error) {
			console.error(error);
			return fail(400, { fail: true, message: error?.data?.message });
		}

		return { success: true };
	}
};
