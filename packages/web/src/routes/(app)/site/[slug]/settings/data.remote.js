import * as v from 'valibot';
import { command, getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';

const API_BASE_URL = env.DASHBOARD_URL || 'http://localhost:8787';

const SiteIdSchema = v.object({
	siteId: v.string()
});

const UpdateSettingsSchema = v.object({
	siteId: v.string(),
	feedbackEmailNotifications: v.boolean()
});

export const verifySite = command(SiteIdSchema, async ({ siteId }) => {
	try {
		const request = getRequestEvent().request;
		const cookieHeader = request.headers.get('cookie');
		const headers = { 'Content-Type': 'application/json' };
		if (cookieHeader) {
			headers['Cookie'] = cookieHeader;
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

export const deleteSite = command(SiteIdSchema, async ({ siteId }) => {
	try {
		const request = getRequestEvent().request;
		const cookieHeader = request.headers.get('cookie');
		const headers = { 'Content-Type': 'application/json' };
		if (cookieHeader) {
			headers['Cookie'] = cookieHeader;
		}

		const response = await fetch(`${API_BASE_URL}/api/v2/sites/${siteId}`, {
			method: 'DELETE',
			headers
		});

		if (!response.ok) {
			const result = await response.json();
			return { success: false, error: result.error || 'Failed to delete site' };
		}

		return { success: true, deleted: true };
	} catch (err) {
		console.error('Site delete error:', err);
		return { success: false, error: err.message || 'Failed to delete site' };
	}
});

export const updateSiteSettings = command(
	UpdateSettingsSchema,
	async ({ siteId, feedbackEmailNotifications }) => {
		try {
			const request = getRequestEvent().request;
			const cookieHeader = request.headers.get('cookie');
			const headers = { 'Content-Type': 'application/json' };
			if (cookieHeader) {
				headers['Cookie'] = cookieHeader;
			}

			const response = await fetch(`${API_BASE_URL}/api/v2/sites/${siteId}/settings`, {
				method: 'PATCH',
				headers,
				body: JSON.stringify({ feedbackEmailNotifications })
			});

			const result = await response.json();
			if (!response.ok) {
				return { success: false, error: result.error || 'Failed to update settings' };
			}

			return { success: true, settings: result.settings };
		} catch (err) {
			console.error('Site settings update error:', err);
			return { success: false, error: err.message || 'Failed to update settings' };
		}
	}
);
