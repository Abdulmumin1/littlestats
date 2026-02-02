// LittleStats Analytics v2.0 - API Client
// Frontend client for communicating with the v2 API

import { browser } from '$app/environment';

// API Types
export interface Site {
	id: string;
	domain: string;
	name: string | null;
	plan: 'free' | 'pro' | 'enterprise';
	planStatus: string;
	domainKey: string;
	createdAt: string;
	sessionCount?: number;
	events24h?: number;
	verificationToken?: string;
	verifiedAt?: string;
}

export interface CreateSiteRequest {
	domain: string;
	name?: string;
}

export interface CreateSiteResponse {
	id: string;
	domain: string;
	domainKey: string;
	embedCode: string;
}

export interface StatsFilter {
	startDate?: string;
	endDate?: string;
	urlPattern?: string;
	referrerDomain?: string;
	country?: string;
	device?: string;
	browser?: string;
	os?: string;
	eventName?: string;
	excludePageview?: boolean;
}

export interface StatsSummary {
	siteId: string;
	period: {
		start: string;
		end: string;
	};
	views: number;
	visits: number;
	visitors: number;
	bounceRate: number;
	avgDuration: number;
	change: {
		views: number;
		visits: number;
		visitors: number;
		bounceRate: number;
		avgDuration: number;
	};
}

export interface TimeSeriesDataPoint {
	timestamp: string;
	views: number;
	visits: number;
	visitors: number;
}

export interface TimeSeriesResponse {
	data: TimeSeriesDataPoint[];
}

export interface SegmentedTimeSeriesResponse {
	granularity: 'day' | 'hour';
	metric: 'conversions' | 'visits';
	groupBy: 'source' | 'medium';
	segments: Array<{ key: string; total: number }>;
	points: Array<{ timestamp: string; total: number; segments: Record<string, number> }>;
}

export interface ReferrerData {
	referrer: string;
	views: number;
	visits: number;
}

export interface PageData {
	path: string;
	views: number;
	visits: number;
}

export interface CountryData {
	country: string;
	code?: string;
	views: number;
	visits: number;
}

export interface DeviceData {
	device: string;
	views: number;
	visits: number;
}

export interface BrowserData {
	browser: string;
	views: number;
	visits: number;
}

export interface EventData {
	name: string;
	count: number;
}

export interface RealtimeStats {
	siteId: string;
	timestamp: number;
	activeVisitors: number;
	pageviewsLastMinute: number;
	eventsLastMinute: number;
	topPages: Array<{ path: string; count: number }>;
	topReferrers: Array<{ domain: string; count: number }>;
	topCountries: Array<{ country: string; count: number }>;
	currentHour: {
		views: number;
		visits: number;
		visitors: number;
		bounceRate: number;
	};
}

export interface RawEvent {
	event_name: string;
	url: string;
	referrer: string | null;
	timestamp: string;
	timezone: string | null;
	user_id: string;
	language: string | null;
	event_data: string | null;
}

export interface Feedback {
	id: string;
	siteId: string;
	visitorId: string | null;
	sessionId: string | null;
	content: string;
	rating: number | null;
	category: string | null;
	email: string | null;
	url: string | null;
	browser: string | null;
	os: string | null;
	device: string | null;
	screen: string | null;
	country: string | null;
	status: 'new' | 'reviewed' | 'resolved' | 'archived';
	metadata: Record<string, any> | null;
	createdAt: number;
	updatedAt: number;
}

export interface FeedbackListResponse {
	feedback: Feedback[];
	total: number;
	limit: number;
	offset: number;
}

// API Client Class
export class AnalyticsAPI {
	private baseUrl: string;
	private wsUrl: string;
	private ws: WebSocket | null = null;
	private wsCallbacks: Map<string, ((data: RealtimeStats) => void)[]> = new Map();

	constructor(baseUrl = 'https://stats.littlestats.click') {
		this.baseUrl = baseUrl;
		this.wsUrl = baseUrl.replace('https://', 'wss://').replace('http://', 'ws://');
	}

	// Generic fetch wrapper
	private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
		if (!browser) {
			throw new Error('API client can only be used in browser');
		}

		const url = `${this.baseUrl}${endpoint}`;
		const response = await fetch(url, {
			...options,
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				...options?.headers
			}
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({ error: 'Unknown error' }));
			throw new Error(error.error || `HTTP ${response.status}`);
		}

		return response.json();
	}

	// POST fetch wrapper
	private async fetchPost<T>(endpoint: string, body: unknown): Promise<T> {
		return this.fetch<T>(endpoint, {
			method: 'POST',
			body: JSON.stringify(body),
		});
	}

	// Site Management
	async getSites(): Promise<{ sites: Site[] }> {
		return this.fetch('/api/v2/sites');
	}

	async createSite(data: CreateSiteRequest): Promise<CreateSiteResponse> {
		return this.fetch('/api/v2/sites', {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}

	// Stats
	async getStatsSummary(siteId: string, filter?: StatsFilter): Promise<StatsSummary> {
		const params = new URLSearchParams();
		if (filter?.startDate) params.set('start', filter.startDate);
		if (filter?.endDate) params.set('end', filter.endDate);
		if (filter?.urlPattern) params.set('page', filter.urlPattern);
		if (filter?.referrerDomain) params.set('referrer', filter.referrerDomain);
		if (filter?.country) params.set('country', filter.country);

		return this.fetch(`/api/v2/sites/${siteId}/stats?${params}`);
	}

	async getTimeSeries(
		siteId: string,
		filter?: StatsFilter,
		granularity: 'hour' | 'day' = 'day'
	): Promise<TimeSeriesResponse> {
		const params = new URLSearchParams();
		if (filter?.startDate) params.set('start', filter.startDate);
		if (filter?.endDate) params.set('end', filter.endDate);
		if (filter?.urlPattern) params.set('page', filter.urlPattern);
		if (filter?.referrerDomain) params.set('referrer', filter.referrerDomain);
		if (filter?.country) params.set('country', filter.country);
		params.set('granularity', granularity);

		return this.fetch(`/api/v2/sites/${siteId}/timeseries?${params}`);
	}

	// Breakdown Data
	async getReferrers(
		siteId: string,
		options?: { limit?: number; filter?: StatsFilter; q?: string }
	): Promise<{ referrers: ReferrerData[] }> {
		const params = new URLSearchParams();
		params.set('limit', String(options?.limit ?? 10));
		if (options?.q) params.set('q', options.q);
		const filter = options?.filter;
		if (filter?.startDate) params.set('start', filter.startDate);
		if (filter?.endDate) params.set('end', filter.endDate);
		if (filter?.urlPattern) params.set('page', filter.urlPattern);
		if (filter?.referrerDomain) params.set('referrer', filter.referrerDomain);
		if (filter?.country) params.set('country', filter.country);
		return this.fetch(`/api/v2/sites/${siteId}/referrers?${params}`);
	}

	async getPages(
		siteId: string,
		options?: { limit?: number; filter?: StatsFilter; q?: string }
	): Promise<{ pages: PageData[] }> {
		const params = new URLSearchParams();
		params.set('limit', String(options?.limit ?? 10));
		if (options?.q) params.set('q', options.q);
		const filter = options?.filter;
		if (filter?.startDate) params.set('start', filter.startDate);
		if (filter?.endDate) params.set('end', filter.endDate);
		if (filter?.urlPattern) params.set('page', filter.urlPattern);
		if (filter?.referrerDomain) params.set('referrer', filter.referrerDomain);
		if (filter?.country) params.set('country', filter.country);
		return this.fetch(`/api/v2/sites/${siteId}/pages?${params}`);
	}

	async getCountries(
		siteId: string,
		options?: { limit?: number; filter?: StatsFilter; q?: string }
	): Promise<{ countries: CountryData[] }> {
		const params = new URLSearchParams();
		params.set('limit', String(options?.limit ?? 10));
		if (options?.q) params.set('q', options.q);
		const filter = options?.filter;
		if (filter?.startDate) params.set('start', filter.startDate);
		if (filter?.endDate) params.set('end', filter.endDate);
		if (filter?.urlPattern) params.set('page', filter.urlPattern);
		if (filter?.referrerDomain) params.set('referrer', filter.referrerDomain);
		if (filter?.country) params.set('country', filter.country);
		return this.fetch(`/api/v2/sites/${siteId}/countries?${params}`);
	}

	async getDevices(siteId: string): Promise<{ devices: DeviceData[] }> {
		return this.fetch(`/api/v2/sites/${siteId}/devices`);
	}

	async getBrowsers(siteId: string, limit = 10): Promise<{ browsers: BrowserData[] }> {
		return this.fetch(`/api/v2/sites/${siteId}/browsers?limit=${limit}`);
	}

	async getEvents(
		siteId: string,
		options?: {
			limit?: number;
			cursor?: string;
			filter?: StatsFilter;
			eventName?: string;
	excludePageview?: boolean;
		}
	): Promise<{ events: RawEvent[]; total: number; nextCursor: string | null }> {
		const params = new URLSearchParams();
		params.set('limit', String(options?.limit ?? 100));
		if (options?.cursor) params.set('cursor', options.cursor);
		if (options?.filter?.startDate) params.set('start', options.filter.startDate);
		if (options?.filter?.endDate) params.set('end', options.filter.endDate);
		if (options?.filter?.excludePageview) params.set('excludePageview', 'true');
		if (options?.eventName) params.set('eventName', options.eventName);
		return this.fetch(`/api/v2/sites/${siteId}/events?${params}`);
	}

	async getCustomEvents(
		siteId: string,
		filter?: StatsFilter
	): Promise<{ events: Array<{ name: string; count: number }> }> {
		const params = new URLSearchParams();
		if (filter?.startDate) params.set('start', filter.startDate);
		if (filter?.endDate) params.set('end', filter.endDate);
		return this.fetch(`/api/v2/sites/${siteId}/custom-events?${params}`);
	}

	// Campaigns & Goals (MVP)
	async getEventNames(siteId: string): Promise<{ eventNames: string[] }> {
		return this.fetch(`/api/v2/sites/${siteId}/event-names`);
	}

	async getCampaigns(
		siteId: string,
		filter?: StatsFilter,
		limit = 20,
		goalEventName?: string
	): Promise<{
		campaigns: Array<{
			bucket: string;
			visits: number;
			conversions: number;
			conversionRate: number;
		}>;
	}> {
		const params = new URLSearchParams();
		if (filter?.startDate) params.set('start', filter.startDate);
		if (filter?.endDate) params.set('end', filter.endDate);
		params.set('limit', String(limit));
		if (goalEventName) params.set('goal', goalEventName);

		return this.fetch(`/api/v2/sites/${siteId}/campaigns?${params}`);
	}

	async getCampaignsSegmentedTimeSeries(
		siteId: string,
		options?: {
			filter?: StatsFilter;
			groupBy?: 'source' | 'medium';
			metric?: 'conversions' | 'visits';
			granularity?: 'day' | 'hour';
			segmentsLimit?: number;
			goalEventName?: string;
		}
	): Promise<SegmentedTimeSeriesResponse> {
		const params = new URLSearchParams();
		const filter = options?.filter;
		if (filter?.startDate) params.set('start', filter.startDate);
		if (filter?.endDate) params.set('end', filter.endDate);
		if (options?.groupBy) params.set('groupBy', options.groupBy);
		if (options?.metric) params.set('metric', options.metric);
		if (options?.granularity) params.set('granularity', options.granularity);
		if (options?.segmentsLimit != null) params.set('segmentsLimit', String(options.segmentsLimit));
		if (options?.goalEventName) params.set('goal', options.goalEventName);

		return this.fetch(`/api/v2/sites/${siteId}/campaigns/segmented-timeseries?${params}`);
	}

	async getGoalSummary(
		siteId: string,
		goalEventName: string,
		filter?: StatsFilter
	): Promise<{
		conversions: number;
		conversionRate: number;
		byBucket: Array<{ bucket: string; conversions: number; conversionRate: number }>;
		timeSeries: Array<{ date: string; conversions: number }>;
	}> {
		const params = new URLSearchParams();
		params.set('goalEventName', goalEventName);
		if (filter?.startDate) params.set('start', filter.startDate);
		if (filter?.endDate) params.set('end', filter.endDate);

		return this.fetch(`/api/v2/sites/${siteId}/goals/summary?${params}`);
	}

	async analyzeFunnel(
		siteId: string,
		steps: Array<{ type: 'url' | 'event'; value: string; name?: string }>,
		options?: {
			funnelType?: 'session' | 'user';
			filter?: StatsFilter;
		}
	): Promise<{
		steps: Array<{
			step: number;
			name: string;
			type: 'url' | 'event';
			value: string;
			count: number;
			conversionRate: number;
			dropOffRate: number;
		}>;
		totalConversionRate: number;
		totalEntries: number;
	}> {
		return this.fetchPost(`/api/v2/sites/${siteId}/funnels/analyze`, {
			steps,
			funnelType: options?.funnelType || 'session',
			startDate: options?.filter?.startDate,
			endDate: options?.filter?.endDate,
		});
	}

	async listFunnels(siteId: string): Promise<{ funnels: any[] }> {
		return this.fetch(`/api/v2/sites/${siteId}/funnels`);
	}

	async saveFunnel(
		siteId: string,
		data: { id?: string; name: string; type: 'session' | 'user'; steps: any[] }
	): Promise<{ id: string }> {
		return this.fetchPost(`/api/v2/sites/${siteId}/funnels`, data);
	}

	async deleteFunnel(siteId: string, funnelId: string): Promise<{ success: true }> {
		return this.fetch(`/api/v2/sites/${siteId}/funnels/${funnelId}`, {
			method: 'DELETE',
		});
	}

	// Real-time WebSocket
	connectRealtime(siteId: string, onUpdate: (data: RealtimeStats) => void): () => void {
		if (!browser) return () => {};

		// Store callback
		if (!this.wsCallbacks.has(siteId)) {
			this.wsCallbacks.set(siteId, []);
		}
		this.wsCallbacks.get(siteId)!.push(onUpdate);

		// Connect if not already connected
		if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
			this.ws = new WebSocket(`${this.wsUrl}/api/v2/realtime/${siteId}`);

			this.ws.onmessage = (event) => {
				const data = JSON.parse(event.data);
				if (data.type === 'stats_update') {
					// Notify all callbacks for this site
					this.wsCallbacks.get(siteId)?.forEach((cb) => cb(data.data));
				}
			};

			this.ws.onerror = (error) => {
				console.error('WebSocket error:', error);
			};

			this.ws.onclose = () => {
				// Reconnect after 5 seconds
				setTimeout(() => {
					if (this.wsCallbacks.get(siteId)?.length) {
						this.connectRealtime(siteId, onUpdate);
					}
				}, 5000);
			};
		}

		// Return disconnect function
		return () => {
			const callbacks = this.wsCallbacks.get(siteId);
			if (callbacks) {
				const index = callbacks.indexOf(onUpdate);
				if (index > -1) {
					callbacks.splice(index, 1);
				}
				// Close WS if no more callbacks
				if (callbacks.length === 0 && this.ws) {
					this.ws.close();
					this.ws = null;
				}
			}
		};
	}

	// Verify site
	async verifySite(siteId: string): Promise<{ success: boolean; verified: boolean; message?: string; error?: string; token?: string }> {
		return this.fetch(`/api/v2/sites/${siteId}/verify`, {
			method: 'POST'
		});
	}

	// Delete site
	async deleteSite(siteId: string): Promise<{ success: boolean }> {
		return this.fetch(`/api/v2/sites/${siteId}`, {
			method: 'DELETE'
		});
	}

	// Feedback
	async getFeedback(
		siteId: string,
		options?: { status?: string; category?: string; limit?: number; offset?: number }
	): Promise<FeedbackListResponse> {
		const params = new URLSearchParams();
		if (options?.status) params.set('status', options.status);
		if (options?.category) params.set('category', options.category);
		if (options?.limit) params.set('limit', String(options.limit));
		if (options?.offset) params.set('offset', String(options.offset));
		return this.fetch(`/api/v2/sites/${siteId}/feedback?${params}`);
	}

	async updateFeedbackStatus(
		siteId: string,
		feedbackId: string,
		status: 'new' | 'reviewed' | 'resolved' | 'archived'
	): Promise<{ success: boolean }> {
		return this.fetch(`/api/v2/sites/${siteId}/feedback/${feedbackId}`, {
			method: 'PATCH',
			body: JSON.stringify({ status })
		});
	}

	async deleteFeedback(siteId: string, feedbackId: string): Promise<{ success: boolean }> {
		return this.fetch(`/api/v2/sites/${siteId}/feedback/${feedbackId}`, {
			method: 'DELETE'
		});
	}

	// Health check
	async healthCheck(siteId: string): Promise<{ status: string; sessions: number }> {
		return this.fetch(`/api/v2/health/${siteId}`);
	}
}

// Create singleton instance
export const api = new AnalyticsAPI(
	browser && import.meta.env.VITE_DASHBOARD_URL
		? import.meta.env.VITE_DASHBOARD_URL
		: (browser && location.hostname === 'localhost' ? 'http://localhost:8787' : 'https://stats.littlestats.click')
);

export default api;
