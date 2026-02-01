import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({fetch}) {
    const url = `${env.DASHBOARD_URL}/tracker.js`;
    throw redirect(301, url)
}