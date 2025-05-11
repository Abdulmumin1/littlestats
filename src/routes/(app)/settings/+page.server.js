import { fail } from '@sveltejs/kit';

function generateHash(text) {
	// Convert the text to a Uint8Array
	const textEncoder = new TextEncoder();
	const textBytes = textEncoder.encode(text);

	// Initialize hash value
	let hashValue = 0;

	// Simple hash algorithm
	for (let byte of textBytes) {
		hashValue = (hashValue * 31 + byte) & 0xffffffff;
	}

	// Convert to 8-character hex string
	// return hashValue.toString(16).padStart(8, '0');
	return (hashValue >>> 0).toString(16).padStart(8, '0');
}

/** @type {import('./$types').PageLoad} */
export async function load({ locals: { pb, user }, request }) {
	try {
		// you can also fetch all records at once via getFullList
		const records = await pb.collection('domain').getFullList({
			sort: '-created'
		});
		// console.log(user);
		return { records };
	} catch (error) {
		console.error(error);
	}
}

/** @type {import('./$types').Actions} */
export const actions = {
	updateDomain: async ({ locals: { pb, user }, request }) => {
		const domain_recs = await pb.collection('domain').getFullList();

		if (domain_recs.length >= 2) {
			return fail(400, { message: 'Domain Limit reached!' });
		}
		const data = await request.formData();
		let domain = data.get('name');
		try {
			domain = new URL(domain).hostname;
		} catch {
			domain = false;
		}

		if (!domain) {
			return fail(400, { message: 'Domain name required' });
		}

		try {
			// console.log(pb.collections);
			const domain_data = {
				name: domain,
				unique_key: generateHash(domain),
				user_id: user.id
			};
			// console.log(user);
			const record = await pb.collection('domain').create(domain_data);
			return { ...record };
		} catch (error) {
			console.error(error);
			return fail(400, { fail: true, message: error?.data?.message });
		}
	},
	deleteDomain: async ({ locals: { pb }, request }) => {
		const data = await request.formData();
		const domain = data.get('id');

		if (!domain) {
			return fail(400, 'Domain id required');
		}
		try {
			await pb.collection('domain').delete(domain);
			return { success: true };
		} catch (error) {
			console.error(error);
			return fail(400, { fail: true, message: error?.data?.message });
		}
	}
};