import { env } from '$env/dynamic/private';
import { error, json, type RequestHandler } from '@sveltejs/kit';

const DASHBOARD_URL = env.DASHBOARD_URL || 'https://stats.littlestats.click';

const proxy: RequestHandler = async ({ request, params, fetch }) => {
	const target = new URL(`/api/v2/${params.path}`, DASHBOARD_URL);
	target.search = new URL(request.url).search;

	const headers = new Headers();
	const cookie = request.headers.get('cookie');
	if (cookie) headers.set('cookie', cookie);
	if (request.method !== 'GET' && request.method !== 'HEAD') {
		headers.set('content-type', request.headers.get('content-type') || 'application/json');
	}

	try {
		const response = await fetch(target, {
			method: request.method,
			headers,
			body: request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer()
		});
		const payload = await response.json().catch(() => ({}));
		if (!response.ok) throw error(response.status, payload.error || `HTTP ${response.status}`);

		const responseHeaders = new Headers();
		const setCookie = response.headers.get('set-cookie');
		if (setCookie) responseHeaders.set('set-cookie', setCookie);
		return json(payload, { headers: responseHeaders });
	} catch (cause) {
		if (cause && typeof cause === 'object' && 'status' in cause) throw cause;
		throw error(502, cause instanceof Error ? cause.message : 'Dashboard API unavailable');
	}
};

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
