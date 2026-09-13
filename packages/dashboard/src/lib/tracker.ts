// LittleStats Tracker v2.0
// Client-side analytics tracking script
// This file is the source - it gets minified and served as tracker.js

interface TrackerConfig {
  SESSION_TIMEOUT: number;
  HEARTBEAT_INTERVAL: number;
  CACHE_KEY: string;
  VISITOR_KEY: string;
  MAX_BUFFER_SIZE: number;
}

interface CacheData {
  visitId: string;
  iat: number;
  sessionStart: number;
}

interface SessionData {
  id: string;
  pageViews: number;
  startTime: number;
}

interface TrackPayload {
  eventId?: string;
  type: 'pageview' | 'event' | 'identify' | 'page_exit';
  website: string;
  url?: string;
  referrer?: string;
  title?: string;
  screen?: string;
  language?: string;
  timezone?: string;
  name?: string;
  data?: Record<string, any>;
  id?: string;
  cache?: CacheData;
  visitorId?: string;
  userAgent?: string;
  duration?: number;
}

class LittleStatsTracker {
  private config: TrackerConfig = {
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    HEARTBEAT_INTERVAL: 5000, // 5 seconds
    CACHE_KEY: '_ls_cache',
    VISITOR_KEY: '_ls_vid',
    MAX_BUFFER_SIZE: 20,
  };

  private siteId: string;
  private endpoint: string;
  private currentUrl: string;
  private currentRef: string;
  private cache: CacheData;
  private visitorId: string;
  private pageStartTime: number;

  constructor(siteId: string, endpoint?: string) {
    this.siteId = siteId;
    this.endpoint = endpoint || this.detectEndpoint();
    this.currentUrl = this.pageUrl();
    this.currentRef = document.referrer;
    this.cache = this.loadCache();
    this.visitorId = this.getVisitorId();
    this.pageStartTime = Date.now();

    this.init();
  }

  private detectEndpoint(): string {
    // Auto-detect endpoint from script src
    const scripts = document.querySelectorAll('script[data-site-id]');
    const script = scripts[scripts.length - 1] as HTMLScriptElement;
    
    if (script && script.src) {
      const url = new URL(script.src);
      // Extract base URL from script src
      return `${url.origin}/api/v2/track/${this.siteId}`;
    }
    
    // Fallback
    return `/api/v2/track/${this.siteId}`;
  }

  private loadCache(): CacheData {
    try {
      const cache = JSON.parse(localStorage.getItem(this.config.CACHE_KEY) || '{}');
      const now = Math.floor(Date.now() / 1000);
      
      // Check if visit still valid (30 min timeout)
      if (cache.visitId && cache.iat && (now - cache.iat) < 1800) {
        return cache;
      }
    } catch (e) {
      // Ignore localStorage errors
    }
    
    // Create new visit
    return {
      visitId: this.generateUUID(),
      iat: Math.floor(Date.now() / 1000),
      sessionStart: Date.now(),
    };
  }

  private saveCache(): void {
    try {
      this.cache.iat = Math.floor(Date.now() / 1000);
      localStorage.setItem(this.config.CACHE_KEY, JSON.stringify(this.cache));
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  private pageUrl(): string {
    return location.pathname + location.search;
  }

  private getVisitorId(): string {
    try {
      let vid = localStorage.getItem(this.config.VISITOR_KEY);
      if (!vid) {
        vid = this.generateUUID();
        localStorage.setItem(this.config.VISITOR_KEY, vid);
      }
      return vid;
    } catch (e) {
      // Fallback to session-based ID
      return this.generateUUID();
    }
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  private getPayload(): TrackPayload {
    return {
      eventId: this.generateUUID(),
      website: this.siteId,
      url: this.pageUrl(),
      referrer: document.referrer,
      screen: `${screen.width}x${screen.height}`,
      language: navigator.language,
      title: document.title,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      cache: this.cache,
      visitorId: this.visitorId,
      userAgent: navigator.userAgent,
    };
  }

  private init(): void {
    // Track initial pageview
    this.trackPageViewInternal();

    // Setup SPA navigation detection
    this.setupSPADetection();

    // Setup activity tracking
    this.setupActivityTracking();

    // Setup beforeunload handler
    this.setupBeforeUnload();

    // Setup visibility tracking
    this.setupVisibilityTracking();
  }

  private trackPageViewInternal(): void {
    // Debounce: Don't track if same URL within 2 seconds
    const now = Date.now();
    const lastView = sessionStorage.getItem('ls_last_view');
    
    if (lastView) {
      const [lastUrl, lastTime] = lastView.split('|');
      if (lastUrl === this.currentUrl && (now - parseInt(lastTime)) < 2000) {
        return; // Skip duplicate
      }
    }
    
    sessionStorage.setItem('ls_last_view', `${this.currentUrl}|${now}`);
    
    // Update session page view count
    const session = JSON.parse(sessionStorage.getItem('ls_session') || '{}');
    session.pageViews = (session.pageViews || 0) + 1;
    sessionStorage.setItem('ls_session', JSON.stringify(session));
    
    // Send pageview
    this.send({
      ...this.getPayload(),
      type: 'pageview',
    });
  }

  private setupSPADetection(): void {
    // Intercept history.pushState
    const originalPushState = history.pushState;
    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.handleNavigation();
    };

    // Intercept history.replaceState
    const originalReplaceState = history.replaceState;
    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      this.handleNavigation();
    };

    // Handle popstate (back/forward buttons)
    window.addEventListener('popstate', () => this.handleNavigation());

  }

  private handleNavigation(): void {
    const nextUrl = this.pageUrl();
    if (this.currentUrl !== nextUrl) {
      // Calculate time on previous page
      const timeOnPage = Math.round((Date.now() - this.pageStartTime) / 1000);
      
      // Send page exit for previous page
      if (timeOnPage > 0) {
        this.send({
          ...this.getPayload(),
          type: 'page_exit',
          url: this.currentUrl,
          duration: Math.min(1800, Math.max(0, timeOnPage)),
        });
      }

      // Update current URL and start tracking new page
      this.currentUrl = nextUrl;
      this.currentRef = document.referrer;
      this.pageStartTime = Date.now();
      
      // Reset cache to get new visit ID if needed
      this.cache = this.loadCache();
      
        this.trackPageViewInternal();
    }
  }

  private setupActivityTracking(): void {
    // Update cache timestamp on user activity
    const events = ['click', 'scroll', 'mousemove', 'keydown', 'touchstart', 'focus'];
    let timeout: ReturnType<typeof setTimeout>;

    const updateActivity = () => {
      clearTimeout(timeout);
      this.saveCache();
      timeout = setTimeout(() => {}, 60000); // Debounce
    };

    events.forEach((event) => {
      document.addEventListener(event, updateActivity, { passive: true, capture: true });
    });
  }

  private setupBeforeUnload(): void {
    const sendExit = () => {
      const payload = {
        ...this.getPayload(),
        type: 'page_exit' as const,
        url: this.currentUrl,
      };
      const body = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        if (navigator.sendBeacon(this.endpoint, new Blob([body], { type: 'application/json' }))) return;
      }
      fetch(this.endpoint, { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {});
    };

    window.addEventListener('pagehide', (event) => {
      if (!event.persisted) sendExit();
    });
  }

  private setupVisibilityTracking(): void {
    // Track visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.pageStartTime = Date.now();
        this.saveCache();
      }
    });
  }

  // Public API methods

  public track(eventName: string, eventData?: Record<string, any>): void {
    this.send({
      ...this.getPayload(),
      type: 'event',
      name: eventName,
      data: eventData,
    });
  }

  public identify(userId: string, userData?: Record<string, any>): void {
    // Update visitor ID to user-provided ID
    this.visitorId = userId;
    
    try {
      localStorage.setItem(this.config.VISITOR_KEY, userId);
    } catch (e) {
      // Ignore localStorage errors
    }

    this.send({
      ...this.getPayload(),
      type: 'identify',
      id: userId,
      data: userData,
    });
  }

  public trackPageView(): void {
    this.trackPageViewInternal();
  }

  // Cleanup
  public destroy(): void {
    // Kept for API compatibility; tracking is sent immediately.
  }
}

// Auto-initialize if script has data-site-id
(function autoInit() {
  const scripts = document.querySelectorAll('script[data-site-id]');
  
  const instances: Record<string, LittleStatsTracker> = {};
  scripts.forEach((script) => {
    const siteId = script.getAttribute('data-site-id');
    if (siteId) {
      if (!instances[siteId]) instances[siteId] = new LittleStatsTracker(siteId);
      // @ts-ignore
      window.littlestats = instances[siteId];
    }
  });

  // Expose global functions
  // @ts-ignore
  window.track = (name: string, data?: Record<string, any>) => {
    // @ts-ignore
    return window.littlestats?.track(name, data);
  };

  // @ts-ignore
  window.identify = (id: string, data?: Record<string, any>) => {
    // @ts-ignore
    return window.littlestats?.identify(id, data);
  };
})();

export { LittleStatsTracker };
export default LittleStatsTracker;
