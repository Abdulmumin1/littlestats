// DomainAnalyticsDO.ts
// Core Durable Object for LittleStats Analytics v2.0
// Handles session tracking, real-time stats, and batch persistence

import type { Env, SessionState, HourlyStatsState, WebSocketClient, TrackPayload, Event } from "../types";

// Constants
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const HEARTBEAT_INTERVAL = 5000; // 5 seconds
const FLUSH_INTERVAL = 30 * 1000; // 30 seconds for dev
const MAX_EVENTS_BEFORE_FLUSH = 20; // 20 events for dev
const WEBSOCKET_PING_INTERVAL = 30000; // 30 seconds

export class DomainAnalyticsDO {
  private state: DurableObjectState;
  private env: Env;
  
  // In-memory state (persisted to DO storage on every change)
  private activeSessions: Map<string, SessionState> = new Map();
  private currentHour: HourlyStatsState;
  private websocketClients: Set<WebSocketClient> = new Set();
  private lastFlush: number = 0;
  private totalEventsSinceFlush: number = 0;
  private siteId: string = "";
  
  // Limit Enforcement State
  private monthlyUsage: number = 0;
  private monthlyUsageLoaded: boolean = false;
  private planStatus: 'free' | 'paid' = 'free';
  private planLastChecked: number = 0;
  private userId: string | null = null;
  
  // Non-persisted state
  private pingInterval?: number;
  private flushTimeout?: number;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.currentHour = this.initializeHourlyStats();
    
    // Restore state from storage
    this.state.blockConcurrencyWhile(async () => {
      await this.restoreState();
    });
  }

  // ============================================
  // State Initialization & Restoration
  // ============================================

  private initializeHourlyStats(): HourlyStatsState {
    const now = new Date();
    return {
      hour: this.formatHour(now),
      views: 0,
      visits: new Set(),
      visitors: new Set(),
      bounceCount: 0,
      totalDuration: 0,
      customEvents: 0,
    };
  }

  private async restoreState(): Promise<void> {
    try {
      // Restore active sessions
      const storedSessions = await this.state.storage.get<[string, SessionState][]>("activeSessions");
      if (storedSessions) {
        // Hydrate Date objects in sessions
        const hydratedSessions = storedSessions.map(([id, session]) => {
          return [id, {
            ...session,
            firstSeen: new Date(session.firstSeen),
            lastSeen: new Date(session.lastSeen),
            events: session.events.map(event => ({
              ...event,
              createdAt: new Date(event.createdAt)
            }))
          }] as [string, SessionState];
        });
        
        this.activeSessions = new Map(hydratedSessions);
        console.log(`[DO] Restored ${this.activeSessions.size} sessions`);
      }

      // Restore current hour stats
      const storedHour = await this.state.storage.get<HourlyStatsState>("currentHour");
      if (storedHour) {
        // Convert Sets back from arrays (they get serialized as arrays)
        this.currentHour = {
          ...storedHour,
          visits: new Set(storedHour.visits),
          visitors: new Set(storedHour.visitors),
        };
        
        // Check if we need to roll over to new hour
        const currentHourStr = this.formatHour(new Date());
        if (this.currentHour.hour !== currentHourStr) {
          console.log(`[DO] Hour rolled over: ${this.currentHour.hour} -> ${currentHourStr}`);
          await this.flushHourlyStats();
          this.currentHour = this.initializeHourlyStats();
        }
      }

      // Restore metadata
      this.lastFlush = (await this.state.storage.get<number>("lastFlush")) || 0;
      this.totalEventsSinceFlush = (await this.state.storage.get<number>("totalEventsSinceFlush")) || 0;
      this.siteId = (await this.state.storage.get<string>("siteId")) || "";

      // Load monthly usage (non-blocking for startup, but blocking for first request if not finished)
      // We await it here because restoreState blocks concurrency, ensuring it's ready
      if (this.siteId) {
        await this.loadMonthlyUsage();
      }

      // Clean up expired sessions
      this.cleanupExpiredSessions();

    } catch (error) {
      console.error("[DO] Error restoring state:", error);
      // Initialize fresh state
      this.activeSessions = new Map();
      this.currentHour = this.initializeHourlyStats();
    }
  }

  private async persistState(): Promise<void> {
    // Persist everything that needs to survive hibernation
    const persistPromises = [
      this.state.storage.put("activeSessions", Array.from(this.activeSessions.entries())),
      this.state.storage.put("currentHour", {
        ...this.currentHour,
        visits: Array.from(this.currentHour.visits),
        visitors: Array.from(this.currentHour.visitors),
      }),
      this.state.storage.put("lastFlush", this.lastFlush),
      this.state.storage.put("totalEventsSinceFlush", this.totalEventsSinceFlush),
      this.state.storage.put("siteId", this.siteId),
    ];

    await Promise.all(persistPromises);
  }

  // ============================================
  // Limit Enforcement
  // ============================================

  private checkEventLimit(): boolean {
    const now = Date.now();

    // 1. Ensure Site ID is known
    if (!this.siteId) return true;

    // 2. Load Plan Status (Background Refresh)
    // If cache is expired or user ID missing, trigger background refresh
    // Don't block the request. Use existing/default status.
    if (!this.userId || now - this.planLastChecked > 3600 * 1000) {
      // Background refresh - use waitUntil to ensure completion
      this.state.waitUntil(
        this.refreshPlanStatus().catch(err => console.error("[DO] Background plan refresh failed:", err))
      );
    }

    // 3. Load Monthly Usage (Background Load)
    // Should be loaded by restoreState, but if not, trigger background load
    if (!this.monthlyUsageLoaded) {
      this.state.waitUntil(
        this.loadMonthlyUsage().catch(err => console.error("[DO] Background usage load failed:", err))
      );
      // Fallback: Assume under limit if data not loaded yet to avoid blocking
      return true;
    }

    // 4. Define Limits
    const limit = this.planStatus === 'paid' ? 5_000_000 : 500_000;

    // 5. Check
    return this.monthlyUsage < limit;
  }

  private async refreshPlanStatus(): Promise<void> {
    try {
      // Get User ID if missing
      if (!this.userId) {
        const site = await this.env.DB.prepare(
          "SELECT user_id FROM sites WHERE id = ?"
        ).bind(this.siteId).first<{ user_id: string }>();
        
        if (site) {
          this.userId = site.user_id;
        } else {
          this.planStatus = 'free';
          return;
        }
      }

      // Check Subscription
      const sub = await this.env.DB.prepare(
        "SELECT status FROM subscriptions WHERE user_id = ? AND status = 'active'"
      ).bind(this.userId).first();

      this.planStatus = sub ? 'paid' : 'free';
      this.planLastChecked = Date.now();
      
    } catch (e) {
      console.error("[DO] Error refreshing plan:", e);
    }
  }

  private async loadMonthlyUsage(): Promise<void> {
    try {
      const now = new Date();
      // Start of current month in UTC
      const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

      const result = await this.env.DB.prepare(`
        SELECT SUM(views + custom_events) as total 
        FROM hourly_stats 
        WHERE site_id = ? AND hour >= ?
      `).bind(this.siteId, startOfMonth).first<{ total: number }>();

      this.monthlyUsage = (result?.total || 0) + this.totalEventsSinceFlush;
      this.monthlyUsageLoaded = true;
    } catch (e) {
      console.error("[DO] Error loading monthly usage:", e);
    }
  }

  // ============================================
  // Main Request Handler
  // ============================================

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Set site ID from URL if available
    const siteIdFromUrl = url.searchParams.get("site_id");
    if (siteIdFromUrl && !this.siteId) {
      this.siteId = siteIdFromUrl;
      await this.state.storage.put("siteId", this.siteId);
    }

    try {
      // WebSocket upgrade for real-time
      if (pathname === "/realtime") {
        return this.handleWebSocket(request);
      }

      // Track endpoint
      if (pathname === "/track" && request.method === "POST") {
        return this.handleTrack(request);
      }

      // Stats endpoint
      if (pathname === "/stats") {
        return this.handleStats(request);
      }

      // Health check
      if (pathname === "/health") {
        return Response.json({ 
          status: "healthy", 
          sessions: this.activeSessions.size,
          websockets: this.websocketClients.size,
          hour: this.currentHour.hour,
        });
      }

      return new Response("Not Found", { status: 404 });

    } catch (error) {
      console.error("[DO] Error handling request:", error);
      return Response.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }

  // ============================================
  // Tracking Handler
  // ============================================

  private async handleTrack(request: Request): Promise<Response> {
    const payload: TrackPayload = await request.json();
    const now = new Date();
    const clientIP = request.headers.get("CF-Connecting-IP") || "0.0.0.0";
    const country = request.headers.get("CF-IPCountry") || null;

    // Validate payload
    if (!payload.website) {
      return Response.json({ error: "Missing website ID" }, { status: 400 });
    }

    // Ensure site ID is set
    if (!this.siteId) {
      this.siteId = payload.website;
    }

    // Check plan limits
    if (!this.checkEventLimit()) {
      return Response.json({ error: "Monthly event limit reached for this site" }, { status: 403 });
    }

    // Get or create session
    const session = await this.getOrCreateSession(payload, clientIP, now, country);
    
    // Create event
    const event = this.createEvent(payload, session, now, clientIP, country);
    
    // Update session
    this.updateSession(session, event, payload.type);
    
    // Update hourly stats
    this.updateHourlyStats(session, event, payload.type);
    
    // Add event to session buffer
    session.events.push(event);
    this.totalEventsSinceFlush++;
    this.monthlyUsage++;

    // Persist state immediately (requirement: no data loss)
    await this.persistState();

    // Broadcast to WebSocket clients
    await this.broadcastUpdate();

		// Custom events are often used for conversions (e.g. form_submitted) and should
		// be queryable immediately from the dashboard (which reads from D1).
		// Pageviews can remain batched for throughput.
		if (payload.type === "event") {
			await this.flushSessionToD1(session);
		}

    // Check if we need to flush to D1
    if (this.shouldFlush()) {
      // Don't await - let it run in background
      this.flushToD1().catch(console.error);
    }

    // Return cache data to client
    return Response.json({
      success: true,
      cache: {
        visitId: session.visitId,
        iat: Math.floor(now.getTime() / 1000),
        sessionStart: session.firstSeen.getTime(),
      },
    });
  }

  private async getOrCreateSession(
    payload: TrackPayload,
    clientIP: string,
    now: Date,
    country: string | null
  ): Promise<SessionState> {
    const monthSalt = this.getMonthSalt(now);
    let sessionId: string;

    if (payload.id) {
      // Identified user
      sessionId = this.generateSessionId(this.siteId, payload.id, "", monthSalt);
    } else {
      // Anonymous user - use IP + User Agent
      sessionId = this.generateSessionId(
        this.siteId,
        clientIP,
        payload.userAgent || "",
        monthSalt
      );
    }

    // Check if session exists
    let session = this.activeSessions.get(sessionId);

    if (session) {
      // Check if session expired (30 min inactivity)
      const timeSinceLastActivity = now.getTime() - session.lastActivity;
      
      if (timeSinceLastActivity > SESSION_TIMEOUT) {
        // Session expired - create new visit but keep session
        console.log(`[DO] Session ${sessionId} expired after ${timeSinceLastActivity}ms`);
        
        // Flush old session data first
        await this.flushSessionToD1(session);
        
        // Create new visit
        session.visitId = this.generateVisitId(sessionId, now);
        session.visitCount++;
        session.isBounce = true; // Reset bounce status for new visit
      }

      // Update session activity
      session.lastSeen = now;
      session.lastActivity = now.getTime();
      
    } else {
      // Create new session
      const visitorId = payload.visitorId || sessionId;
      
      session = {
        id: sessionId,
        visitorId,
        visitId: payload.cache?.visitId || this.generateVisitId(sessionId, now),
        firstSeen: now,
        lastSeen: now,
        lastActivity: now.getTime(),
        pageViews: 0,
        events: [],
        visitCount: 1,
        deviceInfo: this.parseDeviceInfo(payload, country),
        isBounce: true, // Will be set to false on second pageview
        totalEngagementTime: 0,
        lastHeartbeat: now.getTime(),
      };

      this.activeSessions.set(sessionId, session);
      console.log(`[DO] Created new session: ${sessionId}`);
    }

    return session;
  }

  private createEvent(
    payload: TrackPayload,
    session: SessionState,
    now: Date,
    clientIP: string,
    country: string | null
  ): Event {
    const url = new URL(payload.url || "/", "http://example.com");
    
    let eventType: 1 | 2 | 3 | 4;
    switch (payload.type) {
      case "pageview": eventType = 1; break;
      case "event": eventType = 2; break;
      case "page_exit": eventType = 3; break;
      default: eventType = 1;
    }

    // Parse UTM parameters from URL
    const params = new URLSearchParams(url.search);
    const utmSource = params.get('utm_source');
    const utmMedium = params.get('utm_medium');
    const utmCampaign = params.get('utm_campaign');
    const utmContent = params.get('utm_content');
    const utmTerm = params.get('utm_term');

    // Compute campaign bucket for attribution
    let campaignBucket: string;
    if (utmSource || utmMedium || utmCampaign) {
      campaignBucket = `${utmSource || 'unknown'}|${utmMedium || 'unknown'}|${utmCampaign || 'unknown'}`;
    } else if (payload.referrer) {
      try {
        campaignBucket = new URL(payload.referrer).hostname;
      } catch {
        campaignBucket = 'Direct';
      }
    } else {
      campaignBucket = 'Direct';
    }

    // Parse referrer safely
    let referrerDomain: string | null = null;
    let referrerPath: string | null = null;
    if (payload.referrer) {
      try {
        const refUrl = new URL(payload.referrer);
        referrerDomain = refUrl.hostname;
        referrerPath = refUrl.pathname;
      } catch {
        // Invalid referrer URL, leave as null
      }
    }

    return {
      id: 0, // Will be set by D1
      siteId: this.siteId,
      sessionId: session.id,
      visitId: session.visitId,
      eventType,
      urlPath: url.pathname,
      urlQuery: url.search || null,
      urlHash: url.hash || null,
      referrerDomain,
      referrerPath,
      pageTitle: payload.title || null,
      eventName: payload.name || null,
      eventData: payload.data ? JSON.stringify(payload.data) : null,
      browser: session.deviceInfo.browser,
      browserVersion: session.deviceInfo.browserVersion,
      os: session.deviceInfo.os,
      osVersion: session.deviceInfo.osVersion,
      device: session.deviceInfo.device,
      screen: payload.screen || null,
      country: country,
      region: null,
      city: null,
      language: payload.language || null,
      timezone: payload.timezone || null,
      engagementTime: null,
      createdAt: now,
      // Campaign tracking
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      campaignBucket,
    };
  }

  private updateSession(
    session: SessionState,
    event: Event,
    eventType: string
  ): void {
    // Update page view count
    if (eventType === "pageview") {
      session.pageViews++;
      
      // Not a bounce if more than one pageview
      if (session.pageViews > 1) {
        session.isBounce = false;
      }
    }

    // Handle page exit with duration
    if (eventType === "page_exit" && event.engagementTime) {
      session.totalEngagementTime += event.engagementTime;
    }
  }

  private updateHourlyStats(
    session: SessionState,
    event: Event,
    eventType: string
  ): void {
    const now = new Date();
    const currentHourStr = this.formatHour(now);

    // Check if hour rolled over
    if (this.currentHour.hour !== currentHourStr) {
      // Check for month rollover
      // If the month of the old hour is different from the current month, reset usage
      const oldDate = new Date(this.currentHour.hour);
      if (oldDate.getUTCMonth() !== now.getUTCMonth()) {
        console.log(`[DO] Month rolled over: ${oldDate.toISOString()} -> ${now.toISOString()}. Resetting monthly usage.`);
        this.monthlyUsage = 0;
      }

      this.flushHourlyStats();
      this.currentHour = this.initializeHourlyStats();
    }

    // Update stats
    this.currentHour.views++;
    this.currentHour.visits.add(session.visitId);
    this.currentHour.visitors.add(session.id);

    if (eventType === "event" && event.eventName) {
      this.currentHour.customEvents++;
    }

    // Bounce detection
    if (eventType === "page_exit" && session.isBounce) {
      this.currentHour.bounceCount++;
    }

    // Duration tracking
    if (event.engagementTime) {
      this.currentHour.totalDuration += event.engagementTime;
    }
  }

  // ============================================
  // WebSocket Real-Time Handler
  // ============================================

  private async handleWebSocket(request: Request): Promise<Response> {
    // Validate upgrade request
    const upgradeHeader = request.headers.get("Upgrade");
    if (upgradeHeader !== "websocket") {
      return new Response("Expected websocket", { status: 400 });
    }

    // Create WebSocket pair
    const [client, server] = Object.values(new WebSocketPair());

    // Generate client ID
    const clientId = crypto.randomUUID();
    
    const wsClient: WebSocketClient = {
      ws: server,
      clientId,
      connectedAt: new Date(),
      lastPing: Date.now(),
    };

    this.websocketClients.add(wsClient);

    // Accept the websocket
    server.accept();

    // Send initial stats
    this.sendRealtimeStats(wsClient);

    // Handle messages
    server.addEventListener("message", (msg) => {
      this.handleWebSocketMessage(wsClient, msg.data);
    });

    // Handle close
    server.addEventListener("close", () => {
      this.websocketClients.delete(wsClient);
      console.log(`[DO] WebSocket client ${clientId} disconnected`);
    });

    // Setup ping/pong
    this.setupPing(wsClient);

    console.log(`[DO] WebSocket client ${clientId} connected`);

    return new Response(null, { status: 101, webSocket: client });
  }

  private handleWebSocketMessage(client: WebSocketClient, data: string): void {
    try {
      const msg = JSON.parse(data);
      
      switch (msg.type) {
        case "ping":
          client.lastPing = Date.now();
          client.ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
          break;
          
        case "filter":
          // Store filters for this client
          client.filters = msg.filters;
          // Send filtered stats
          this.sendRealtimeStats(client);
          break;
          
        case "subscribe":
          // Client wants specific metrics
          // Implementation depends on requirements
          break;
      }
    } catch (e) {
      console.error("[DO] Invalid WebSocket message:", e);
    }
  }

  private setupPing(client: WebSocketClient): void {
    const pingInterval = setInterval(() => {
      // Check if client is still connected
      if (!this.websocketClients.has(client)) {
        clearInterval(pingInterval);
        return;
      }

      // Check for timeout (2 minutes)
      const timeSinceLastPing = Date.now() - client.lastPing;
      if (timeSinceLastPing > 120000) {
        console.log(`[DO] WebSocket client ${client.clientId} timed out`);
        client.ws.close(1000, "Timeout");
        this.websocketClients.delete(client);
        clearInterval(pingInterval);
        return;
      }

      // Send ping
      try {
        client.ws.send(JSON.stringify({ type: "ping", timestamp: Date.now() }));
      } catch (e) {
        console.log(`[DO] Failed to ping client ${client.clientId}`);
        client.ws.close();
        this.websocketClients.delete(client);
        clearInterval(pingInterval);
      }
    }, WEBSOCKET_PING_INTERVAL);
  }

  private sendRealtimeStats(client: WebSocketClient): void {
    const stats = this.getCurrentStats();
    
    try {
      client.ws.send(JSON.stringify({
        type: "stats_update",
        data: stats,
        timestamp: Date.now(),
      }));
    } catch (e) {
      console.error("[DO] Failed to send stats:", e);
    }
  }

  private async broadcastUpdate(): Promise<void> {
    if (this.websocketClients.size === 0) return;

    const stats = this.getCurrentStats();
    const message = JSON.stringify({
      type: "stats_update",
      data: stats,
      timestamp: Date.now(),
    });

    const deadClients: WebSocketClient[] = [];

    for (const client of this.websocketClients) {
      try {
        client.ws.send(message);
      } catch (e) {
        deadClients.push(client);
      }
    }

    // Clean up dead clients
    for (const client of deadClients) {
      this.websocketClients.delete(client);
      try {
        client.ws.close();
      } catch (e) {
        // Ignore
      }
    }
  }

  private getCurrentStats() {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    
    let activeVisitors = 0;
    const topPages = new Map<string, number>();
    
    for (const session of this.activeSessions.values()) {
      if (session.lastActivity > fiveMinutesAgo) {
        activeVisitors++;
      }
      
      // Aggregate page views by URL
      for (const event of session.events) {
        if (event.eventType === 1) { // pageview
          const count = topPages.get(event.urlPath) || 0;
          topPages.set(event.urlPath, count + 1);
        }
      }
    }

    // Get top 10 pages
    const sortedPages = Array.from(topPages.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }));

    return {
      siteId: this.siteId,
      timestamp: now,
      activeVisitors,
      currentHour: {
        views: this.currentHour.views,
        visits: this.currentHour.visits.size,
        visitors: this.currentHour.visitors.size,
        bounceRate: this.currentHour.visits.size > 0
          ? Math.round((this.currentHour.bounceCount / this.currentHour.visits.size) * 100)
          : 0,
      },
      topPages: sortedPages,
    };
  }

  private async handleStats(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "current";

    if (type === "realtime") {
      return Response.json(this.getCurrentStats());
    }

    // Other stats types would query D1
    return Response.json({ error: "Not implemented" }, { status: 501 });
  }

  // ============================================
  // D1 Flush Logic
  // ============================================

  private shouldFlush(): boolean {
    const now = Date.now();
    const timeSinceLastFlush = now - this.lastFlush;
    
    return (
      timeSinceLastFlush >= FLUSH_INTERVAL ||
      this.totalEventsSinceFlush >= MAX_EVENTS_BEFORE_FLUSH
    );
  }

  private async flushToD1(): Promise<void> {
    if (this.totalEventsSinceFlush === 0) return;

    console.log(`[DO] Flushing to D1: ${this.totalEventsSinceFlush} events`);

    try {
      // Flush all active sessions
      for (const session of this.activeSessions.values()) {
        if (session.events.length > 0) {
          await this.flushSessionToD1(session);
        }
      }

      // Flush hourly stats
      await this.flushHourlyStats();

      // Update metadata
      this.lastFlush = Date.now();
      this.totalEventsSinceFlush = 0;
      await this.persistState();

      console.log("[DO] Flush complete");

    } catch (error) {
      console.error("[DO] Flush error:", error);
      // Don't reset counters - will retry on next flush
    }
  }

  private async flushSessionToD1(session: SessionState): Promise<void> {
    if (session.events.length === 0) return;

    // Verify site exists before flushing
    const siteExists = await this.env.DB.prepare(
      "SELECT 1 FROM sites WHERE id = ?"
    ).bind(this.siteId).first();
    
    if (!siteExists) {
      console.log(`[DO] Site ${this.siteId} no longer exists, skipping flush`);
      // Clear events to prevent retry
      session.events = [];
      return;
    }

    // IMPORTANT: Insert session FIRST to satisfy foreign key constraint
    const sessionSql = `
      INSERT INTO sessions (
        id, site_id, visitor_id, first_visit_at, last_visit_at, visit_count,
        browser, os, device, screen, country, language, timezone,
        total_pageviews, total_events, total_engagement_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        last_visit_at = excluded.last_visit_at,
        visit_count = excluded.visit_count,
        total_pageviews = excluded.total_pageviews,
        total_events = excluded.total_events,
        total_engagement_time = excluded.total_engagement_time,
        updated_at = CURRENT_TIMESTAMP
    `;

    await this.env.DB.prepare(sessionSql).bind(
      session.id,
      this.siteId,
      session.visitorId,
      session.firstSeen instanceof Date ? session.firstSeen.toISOString() : new Date(session.firstSeen).toISOString(),
      session.lastSeen instanceof Date ? session.lastSeen.toISOString() : new Date(session.lastSeen).toISOString(),
      session.visitCount,
      session.deviceInfo.browser,
      session.deviceInfo.os,
      session.deviceInfo.device,
      session.deviceInfo.screen,
      session.deviceInfo.country,
      session.deviceInfo.language,
      session.deviceInfo.timezone,
      session.pageViews,
      session.events.length,
      session.totalEngagementTime,
    ).run();

    // Then insert events
    const events = session.events.map(event => ({
      site_id: event.siteId,
      session_id: event.sessionId,
      visit_id: event.visitId,
      event_type: event.eventType,
      url_path: event.urlPath,
      url_query: event.urlQuery,
      referrer_domain: event.referrerDomain,
      page_title: event.pageTitle,
      event_name: event.eventName,
      event_data: event.eventData,
      browser: event.browser,
      os: event.os,
      device: event.device,
      screen: event.screen,
      country: event.country,
      language: event.language,
      timezone: event.timezone,
      engagement_time: event.engagementTime,
      created_at: event.createdAt instanceof Date ? event.createdAt.toISOString() : new Date(event.createdAt).toISOString(),
      campaign_bucket: event.campaignBucket,
    }));

    // Batch insert events (reduced to 5 per batch to stay under SQLite limits)
    for (let i = 0; i < events.length; i += 5) {
      const batch = events.slice(i, i + 5);
      const placeholders = batch.map(() => 
        "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).join(", ");
      
      const sql = `
        INSERT INTO events (
          site_id, session_id, visit_id, event_type, url_path, url_query,
          referrer_domain, page_title, event_name, event_data, browser, os, device,
          screen, country, language, timezone, engagement_time, created_at, campaign_bucket
        ) VALUES ${placeholders}
      `;

      const params = batch.flatMap(e => [
        e.site_id, e.session_id, e.visit_id, e.event_type, e.url_path,
        e.url_query || null, e.referrer_domain || null, e.page_title || null, e.event_name || null, e.event_data || null,
        e.browser || null, e.os || null, e.device || null, e.screen || null, e.country || null, e.language || null,
        e.timezone || null, e.engagement_time || null, e.created_at instanceof Date ? e.created_at.toISOString() : (e.created_at || new Date().toISOString()),
        e.campaign_bucket,
      ]);

      await this.env.DB.prepare(sql).bind(...params).run();
    }

    // Clear flushed events
    session.events = [];
  }

  private async flushHourlyStats(): Promise<void> {
    if (this.currentHour.views === 0) return;

    const sql = `
      INSERT INTO hourly_stats (
        site_id, hour, views, visits, visitors, bounce_count, total_duration, custom_events
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(site_id, hour) DO UPDATE SET
        views = excluded.views,
        visits = excluded.visits,
        visitors = excluded.visitors,
        bounce_count = excluded.bounce_count,
        total_duration = excluded.total_duration,
        custom_events = excluded.custom_events
    `;

    await this.env.DB.prepare(sql).bind(
      this.siteId,
      this.currentHour.hour,
      this.currentHour.views,
      this.currentHour.visits.size,
      this.currentHour.visitors.size,
      this.currentHour.bounceCount,
      this.currentHour.totalDuration,
      this.currentHour.customEvents,
    ).run();

    console.log(`[DO] Flushed hourly stats: ${this.currentHour.hour}`);
  }

  // ============================================
  // Session Management
  // ============================================

  private cleanupExpiredSessions(): void {
    const now = Date.now();
    const expiredSessions: string[] = [];

    for (const [sessionId, session] of this.activeSessions) {
      // Sessions expire after 30 min inactivity
      if (now - session.lastActivity > SESSION_TIMEOUT) {
        expiredSessions.push(sessionId);
      }
    }

    for (const sessionId of expiredSessions) {
      const session = this.activeSessions.get(sessionId);
      if (session && session.events.length > 0) {
        // Flush remaining events
        this.flushSessionToD1(session).catch(console.error);
      }
      this.activeSessions.delete(sessionId);
    }

    if (expiredSessions.length > 0) {
      console.log(`[DO] Cleaned up ${expiredSessions.length} expired sessions`);
    }
  }

  // ============================================
  // Helper Methods
  // ============================================

  private generateSessionId(siteId: string, ip: string, userAgent: string, salt: string): string {
    const input = `${siteId}|${ip}|${userAgent}|${salt}`;
    return this.hashToUUID(input);
  }

  private generateVisitId(sessionId: string, now: Date): string {
    const hourSalt = this.formatHour(now);
    const input = `${sessionId}|${hourSalt}|${now.getTime()}`;
    return this.hashToUUID(input);
  }

  private hashToUUID(input: string): string {
    // Simple hash-based UUID generation
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    const hashStr = Math.abs(hash).toString(16).padStart(32, '0');
    return `${hashStr.slice(0, 8)}-${hashStr.slice(8, 12)}-4${hashStr.slice(13, 16)}-${hashStr.slice(16, 20)}-${hashStr.slice(20, 32)}`;
  }

  private parseDeviceInfo(payload: TrackPayload, country: string | null): SessionState["deviceInfo"] {
    const ua = payload.userAgent || "";
    const ual = ua.toLowerCase();

    // Browser
    let browser: string | null = null;
    let browserVersion: string | null = null;
    
    if (ual.includes('chrome/')) {
      browser = 'Chrome';
      const match = ua.match(/chrome\/(\d+\.?\d*)/);
      browserVersion = match ? match[1] : null;
    } else if (ual.includes('firefox/')) {
      browser = 'Firefox';
      const match = ua.match(/firefox\/(\d+\.?\d*)/);
      browserVersion = match ? match[1] : null;
    } else if (ual.includes('safari/') && !ual.includes('chrome/')) {
      browser = 'Safari';
      const match = ua.match(/version\/(\d+\.?\d*)/);
      browserVersion = match ? match[1] : null;
    } else if (ual.includes('edge/')) {
      browser = 'Edge';
    }

    // OS
    let os: string | null = null;
    let osVersion: string | null = null;
    
    if (ual.includes('windows')) {
      os = 'Windows';
    } else if (ual.includes('macintosh') || ual.includes('mac os')) {
      os = 'macOS';
    } else if (ual.includes('linux')) {
      os = 'Linux';
    } else if (ual.includes('android')) {
      os = 'Android';
    } else if (ual.includes('iphone') || ual.includes('ipad')) {
      os = 'iOS';
    }

    // Device Type
    let device: DeviceInfo['device'] = 'desktop';
    if (ual.includes('mobile') || ual.includes('android') || ual.includes('iphone')) {
      device = 'mobile';
    } else if (ual.includes('tablet') || ual.includes('ipad')) {
      device = 'tablet';
    }

    return {
      browser,
      browserVersion,
      os,
      osVersion,
      device,
      screen: payload.screen || null,
      language: payload.language || null,
      timezone: payload.timezone || null,
      country: country,
    };
  }

  private getMonthSalt(date: Date): string {
    return date.toISOString().slice(0, 7); // YYYY-MM
  }

  private formatHour(date: Date): string {
    return date.toISOString().slice(0, 13) + ':00:00'; // YYYY-MM-DDTHH:00:00
  }
}
