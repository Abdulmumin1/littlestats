import { fail } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ locals: { pb } }) {
	const user = pb.authStore.model;
	return { user };
}

/** @type {import('./$types').Actions} */
export const actions = {
	updateUser: async ({ locals: { pb }, request }) => {
		const data = Object.fromEntries(await request.formData());
		const name = data['name'];
		const weekly_report_setting = data['weekly'] ? true : false;

		if (!name) {
			return fail(400, { namerequired: name == null, message: 'Entries incomplete' });
		}
		const userId = pb.authStore.model?.id;
		try {
			// console.log(pb.collections);
			let dt = {
				name: name,
				weekly_report_setting: weekly_report_setting
			};
			console.log(dt);
			await pb.collection('users').update(userId, dt);
		} catch (error) {
			console.error(error);
			return fail(400, { fail: true, message: error?.data?.message });
		}
	}
};
