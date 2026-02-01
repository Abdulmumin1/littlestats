import * as v from 'valibot';
import { query, command, getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';

const API_BASE_URL = env.DASHBOARD_URL || 'http://localhost:8787';

// Validation schema for site verification
const VerifySiteSchema = v.object({
	siteId: v.string(),
	domain: v.string()
});

// Query to check site verification status
export const getVerificationStatus = query(VerifySiteSchema, async ({ siteId, domain }) => {
	// This would check the current verification status
	// For now, we'll return a placeholder since the actual verification happens on the backend
	return {
		siteId,
		domain,
		verified: false,
		message: 'Use verifySite command to verify domain'
	};
});

// Command to verify site DNS
export const verifySite = command(VerifySiteSchema, async ({ siteId, domain }) => {
	try {

        const cookies =  getRequestEvent().cookies;

		const sessionToken = cookies.get('better-auth.session_token');
		const headers = { 'Content-Type': 'application/json' };
		if (sessionToken) {
			headers['Cookie'] = `better-auth.session_token=${sessionToken}`;
		}

		const response = await fetch(`${API_BASE_URL}/api/v2/sites/${siteId}/verify`, {
			method: 'POST',
			headers
		});

		const result = await response.json();
		
		if (!response.ok) {
			return {
				success: false,
				verified: false,
				error: result.error || 'Failed to verify site'
			};
		}

		return {
			success: result.success ?? false,
			verified: result.verified ?? false,
			message: result.message,
			token: result.token,
			error: result.error
		};
	} catch (err) {
		console.error('Site verify error:', err);
		return {
			success: false,
			verified: false,
			error: err.message || 'Failed to verify site'
		};
	}
});

// Command to check if site has any data/events
export const checkSiteHasData = command(
	v.object({ siteId: v.string() }),
	async ({ siteId }, { cookies }) => {
		try {
			const sessionToken = cookies.get('better-auth.session_token');
			const headers = { 'Content-Type': 'application/json' };
			if (sessionToken) {
				headers['Cookie'] = `better-auth.session_token=${sessionToken}`;
			}

			const response = await fetch(`${API_BASE_URL}/api/v2/sites/${siteId}/stats`, {
				headers
			});

			if (!response.ok) {
				return { hasData: false, error: 'Failed to fetch stats' };
			}

			const data = await response.json();
			const hasData = data && (
				(data.views > 0) || 
				(data.visits > 0) || 
				(data.visitors > 0)
			);

			return { hasData, stats: data };
		} catch (err) {
			console.error('Check site data error:', err);
			return { hasData: false, error: err.message };
		}
	}
);
