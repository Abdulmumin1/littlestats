/** @type {import('./$types').PageLoad} */
export async function load({ locals: { pb } }) {
	const user = pb.authStore.model;
	return { user };
}
