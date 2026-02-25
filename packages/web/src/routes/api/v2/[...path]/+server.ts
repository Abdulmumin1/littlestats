import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const DASHBOARD_URL = env.DASHBOARD_URL || 'https://stats.littlestats.click';

/**
 * Proxy all API requests to the dashboard backend
 * This eliminates CORS latency by routing through the same-origin server
 */
export async function GET({ request, params, fetch, cookies }) {
	const path = params.path;
	const url = new URL(request.url);
	const dashboardUrl = `${DASHBOARD_URL}/api/v2/${path}${url.search}`;
	
	// Forward cookies for authentication
	const cookieHeader = request.headers.get('cookie');
	
	try {
		const response = await fetch(dashboardUrl, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				...(cookieHeader && { 'Cookie': cookieHeader })
			}
		});
		
		if (!response.ok) {
			const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
			throw error(response.status, errorData.error || `HTTP ${response.status}`);
		}
		
		const data = await response.json();
		
		// Forward any set-cookie headers from dashboard
		const setCookieHeader = response.headers.get('set-cookie');
		const headers = {};
		if (setCookieHeader) {
			headers['set-cookie'] = setCookieHeader;
		}
		
		return json(data, { headers });
	} catch (err) {
		if (err.status) throw err;
		throw error(500, err.message || 'Proxy request failed');
	}
}

export async function POST({ request, params, fetch }) {
	const path = params.path;
	const url = new URL(request.url);
	const dashboardUrl = `${DASHBOARD_URL}/api/v2/${path}${url.search}`;
	
	const cookieHeader = request.headers.get('cookie');
	let body;
	
	try {
		body = await request.json();
	} catch {
		body = undefined;
	}
	
	try {
		const response = await fetch(dashboardUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(cookieHeader && { 'Cookie': cookieHeader })
			},
			body: body ? JSON.stringify(body) : undefined
		});
		
		if (!response.ok) {
			const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
			throw error(response.status, errorData.error || `HTTP ${response.status}`);
		}
		
		const data = await response.json();
		
		const setCookieHeader = response.headers.get('set-cookie');
		const headers = {};
		if (setCookieHeader) {
			headers['set-cookie'] = setCookieHeader;
		}
		
		return json(data, { headers });
	} catch (err) {
		if (err.status) throw err;
		throw error(500, err.message || 'Proxy request failed');
	}
}

export async function PUT({ request, params, fetch }) {
	const path = params.path;
	const url = new URL(request.url);
	const dashboardUrl = `${DASHBOARD_URL}/api/v2/${path}${url.search}`;
	
	const cookieHeader = request.headers.get('cookie');
	let body;
	
	try {
		body = await request.json();
	} catch {
		body = undefined;
	}
	
	try {
		const response = await fetch(dashboardUrl, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				...(cookieHeader && { 'Cookie': cookieHeader })
			},
			body: body ? JSON.stringify(body) : undefined
		});
		
		if (!response.ok) {
			const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
			throw error(response.status, errorData.error || `HTTP ${response.status}`);
		}
		
		const data = await response.json();
		return json(data);
	} catch (err) {
		if (err.status) throw err;
		throw error(500, err.message || 'Proxy request failed');
	}
}

export async function DELETE({ request, params, fetch }) {
	const path = params.path;
	const url = new URL(request.url);
	const dashboardUrl = `${DASHBOARD_URL}/api/v2/${path}${url.search}`;
	
	const cookieHeader = request.headers.get('cookie');
	
	try {
		const response = await fetch(dashboardUrl, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				...(cookieHeader && { 'Cookie': cookieHeader })
			}
		});
		
		if (!response.ok) {
			const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
			throw error(response.status, errorData.error || `HTTP ${response.status}`);
		}
		
		const data = await response.json().catch(() => ({}));
		return json(data);
	} catch (err) {
		if (err.status) throw err;
		throw error(500, err.message || 'Proxy request failed');
	}
}
