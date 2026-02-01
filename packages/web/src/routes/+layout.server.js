/** @type {import('./$types').PageLoad} */
export async function load({ locals: { user } }) {
	return { user };
}
