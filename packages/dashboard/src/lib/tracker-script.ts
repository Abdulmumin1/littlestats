import type { Env } from "../types";

export async function generateTrackerScript(env: Env): Promise<string> {
  return `(function() {
  'use strict';
  
  const CONFIG = {
    SESSION_TIMEOUT: 30 * 60 * 1000,
    CACHE_KEY: '_ls_cache',
    VISITOR_KEY: '_ls_vid',
    PAGEVIEW_DEDUPE_WINDOW: 2000,
    INSTANCE_KEY: '__littlestats_instances__'
  };

  // Skip tracking on localhost or dev environments
  const hostname = location.hostname;
  const isDev = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local') || hostname.includes('::1');
  if (isDev) {
    console.log('[LittleStats] Tracking disabled on development environment:', hostname);
    // Still expose API functions as no-ops so code doesn't break
    window.track = () => {};
    window.identify = () => {};
    return;
  }

  class LittleStatsTracker {
    constructor(siteId, options = {}) {
      this.siteId = siteId;
      this.options = options;
      
      let baseUrl = options.host || 'https://${env.ANALYTICS_DOMAIN}';
      if (baseUrl && !baseUrl.startsWith('http')) baseUrl = 'https://' + baseUrl;
      this.baseUrl = baseUrl.replace(/\\/$/, '');
      
      this.endpoint = this.baseUrl + '/api/v2/track/' + siteId;
      this.currentUrl = this.pageUrl();
      this.cache = this.loadCache();
      // Keep one external acquisition source for the whole visit. Internal
      // navigations must not become new referrers or inflate source totals.
      this.currentReferrer = this.cache.referrer ?? this.externalReferrer(document.referrer);
      this.cache.referrer = this.currentReferrer;
      this.visitorId = this.getVisitorId();
      this.saveCacheTimeout = null;
      this.pageStartedAt = Date.now();
      this.pageExitSent = false;
      this.init();
    }
    
    loadCache() {
      try {
        const cache = JSON.parse(localStorage.getItem(this.storageKey(CONFIG.CACHE_KEY)) || 'null');
        const now = Math.floor(Date.now() / 1000);
        if (cache && (now - cache.iat) < 1800) return cache;
      } catch (e) {}
      return { visitId: this.generateUUID(), iat: Math.floor(Date.now() / 1000), sessionStart: Date.now() };
    }

    storageKey(key) {
      return key + ':' + this.siteId;
    }

    pageUrl() {
      return location.pathname + location.search;
    }

    externalReferrer(referrer) {
      if (!referrer) return '';
      try {
        return new URL(referrer).hostname === location.hostname ? '' : referrer;
      } catch (e) {
        return '';
      }
    }
    
    saveCache() {
      // Debounce localStorage writes to prevent blocking during rapid events (scroll/mousemove)
      if (this.saveCacheTimeout) clearTimeout(this.saveCacheTimeout);
      this.saveCacheTimeout = setTimeout(() => {
        this.cache.iat = Math.floor(Date.now() / 1000);
        try { localStorage.setItem(this.storageKey(CONFIG.CACHE_KEY), JSON.stringify(this.cache)); } catch (e) {}
      }, 250);
    }
    
    flushCache() {
      // Immediate save for page unload events
      if (this.saveCacheTimeout) clearTimeout(this.saveCacheTimeout);
      this.cache.iat = Math.floor(Date.now() / 1000);
      try {
        localStorage.setItem(this.storageKey(CONFIG.CACHE_KEY), JSON.stringify(this.cache));
      } catch (e) {}
    }
    
    getVisitorId() {
      try {
        let vid = localStorage.getItem(this.storageKey(CONFIG.VISITOR_KEY));
        if (!vid) {
          vid = this.generateUUID();
          localStorage.setItem(this.storageKey(CONFIG.VISITOR_KEY), vid);
        }
        return vid;
      } catch (e) {
        return this.generateUUID();
      }
    }
    
    generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
    }
    
    getPayload() {
      return {
        eventId: this.generateUUID(),
        website: this.siteId,
        url: this.pageUrl(),
        referrer: this.currentReferrer,
        screen: screen.width + 'x' + screen.height,
        language: navigator.language,
        title: document.title,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cache: this.cache,
        visitorId: this.visitorId,
        userAgent: navigator.userAgent
      };
    }
    
    init() {
      this.track();
      const originalPushState = history.pushState;
      history.pushState = (...args) => {
        originalPushState.apply(history, args);
        this.handleNavigation();
      };
      const originalReplaceState = history.replaceState;
      history.replaceState = (...args) => {
        originalReplaceState.apply(history, args);
        this.handleNavigation();
      };
      window.addEventListener('popstate', () => this.handleNavigation());
      // Hash changes do not change the URL sent to analytics, so they are not
      // separate pageviews. This prevents tab/anchor clicks from inflating views.
      
      // Debounced cache save on interaction events
      ['click', 'scroll', 'mousemove'].forEach(e => {
        document.addEventListener(e, () => this.saveCache(), { passive: true });
      });
      
      // Flush cache on page unload
      window.addEventListener('beforeunload', () => this.flushCache());
      window.addEventListener('pagehide', (event) => {
        // A persisted pagehide is a bfcache transition, not a real exit.
        if (!event.persisted) this.trackPageExit();
        this.flushCache();
      });
      
    }
    
    handleNavigation() {
      const nextUrl = this.pageUrl();
      if (this.currentUrl !== nextUrl) {
        this.trackPageExit();
        this.currentUrl = nextUrl;
        this.pageStartedAt = Date.now();
        this.pageExitSent = false;
        this.track();
      }
    }

    trackPageExit() {
      if (this.pageExitSent) return;
      this.pageExitSent = true;

      const payload = this.getPayload();
      const previousUrl = new URL(this.currentUrl, location.origin);
      payload.type = 'page_exit';
      payload.url = previousUrl.pathname + previousUrl.search;
      payload.duration = Math.min(1800, Math.max(0, Math.round((Date.now() - this.pageStartedAt) / 1000)));
      this.send(payload);
    }
    
    track(eventName, eventData) {
      const payload = this.getPayload();
      if (eventName) {
        payload.type = 'event';
        payload.name = eventName;
        payload.data = eventData;
      } else {
        const dedupeKey = this.storageKey('_ls_last_pageview');
        try {
          const previous = sessionStorage.getItem(dedupeKey);
          const [previousUrl, previousTime] = previous ? previous.split('|') : [];
          if (previousUrl === payload.url && Number.isFinite(Number(previousTime)) && Date.now() - Number(previousTime) < CONFIG.PAGEVIEW_DEDUPE_WINDOW) {
            return;
          }
          sessionStorage.setItem(dedupeKey, payload.url + '|' + Date.now());
        } catch (e) {}
        payload.type = 'pageview';
      }
      this.send(payload);
    }
    
    identify(userId, userData) {
      try { localStorage.setItem(this.storageKey(CONFIG.VISITOR_KEY), userId); } catch (e) {}
      this.visitorId = userId;
      const payload = this.getPayload();
      payload.type = 'identify';
      payload.id = userId;
      payload.data = userData;
      this.send(payload);
    }

    trackPageView() {
      this.track();
    }
    
    send(payload) {
      const body = JSON.stringify(payload);
      if (payload.type === 'page_exit' && navigator.sendBeacon) {
        const queued = navigator.sendBeacon(this.endpoint, new Blob([body], { type: 'application/json' }));
        if (queued) return;
      }

      const sendAttempt = (attempt) => fetch(this.endpoint, {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true
      }).then(response => {
        if (!response.ok && response.status >= 500) throw new Error('temporary tracking failure');
        if (response.ok) {
          return response.json().then(result => {
            if (result && result.cache) {
              this.cache = { ...this.cache, ...result.cache };
              this.saveCache();
            }
          }).catch(() => {});
        }
      }).catch(() => {
        if (attempt < 3) {
          setTimeout(() => sendAttempt(attempt + 1), 500 * Math.pow(2, attempt));
        }
      });

      sendAttempt(0);
    }
    
  }
  
  const script = document.currentScript || document.querySelector('script[data-site-id]');
  if (script) {
    const siteId = script.getAttribute('data-site-id');
    if (!siteId) return;
    const options = { host: script.getAttribute('data-host') };
    const instances = window[CONFIG.INSTANCE_KEY] || (window[CONFIG.INSTANCE_KEY] = {});
    window.littlestats = instances[siteId] || (instances[siteId] = new LittleStatsTracker(siteId, options));
    window.track = (name, data) => window.littlestats?.track(name, data);
    window.identify = (id, data) => window.littlestats?.identify(id, data);
  }
})();`;
}
