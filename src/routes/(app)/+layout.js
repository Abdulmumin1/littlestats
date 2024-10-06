import PocketBase from 'pocketbase';

/** @type {import('./$types').PageLoad} */
export async function load() {
	const pb = new PocketBase('http://127.0.0.1:8090/');
	return { pb };
}
