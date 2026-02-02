import type { Env } from "../types";

export async function generateTrackerScript(env: Env): Promise<string> {
  return `(function() {
  'use strict';
  
  const CONFIG = {
    SESSION_TIMEOUT: 30 * 60 * 1000,
    CACHE_KEY: '_ls_cache',
    VISITOR_KEY: '_ls_vid'
  };

  class LittleStatsTracker {
    constructor(siteId, options = {}) {
      this.siteId = siteId;
      this.options = options;
      
      let baseUrl = options.host || 'https://${env.ANALYTICS_DOMAIN}';
      if (baseUrl && !baseUrl.startsWith('http')) baseUrl = 'https://' + baseUrl;
      this.baseUrl = baseUrl.replace(/\\/$/, '');
      
      this.endpoint = this.baseUrl + '/api/v2/track/' + siteId;
      this.feedbackEndpoint = this.baseUrl + '/api/v2/feedback/' + siteId;
      this.currentUrl = location.href;
      this.cache = this.loadCache();
      this.visitorId = this.getVisitorId();
      this.feedbackWidget = null;
      this.init();
    }
    
    loadCache() {
      try {
        const cache = JSON.parse(localStorage.getItem(CONFIG.CACHE_KEY));
        const now = Math.floor(Date.now() / 1000);
        if (cache && (now - cache.iat) < 1800) return cache;
      } catch (e) {}
      return { visitId: this.generateUUID(), iat: Math.floor(Date.now() / 1000) };
    }
    
    saveCache() {
      this.cache.iat = Math.floor(Date.now() / 1000);
      localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify(this.cache));
    }
    
    getVisitorId() {
      let vid = localStorage.getItem(CONFIG.VISITOR_KEY);
      if (!vid) {
        vid = this.generateUUID();
        localStorage.setItem(CONFIG.VISITOR_KEY, vid);
      }
      return vid;
    }
    
    generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
    }
    
    getPayload() {
      return {
        website: this.siteId,
        url: location.pathname + location.search,
        referrer: document.referrer,
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
      window.addEventListener('popstate', () => this.handleNavigation());
      ['click', 'scroll', 'mousemove'].forEach(e => {
        document.addEventListener(e, () => this.saveCache(), { passive: true });
      });
      
      if (this.options.feedback !== false && this.options.feedbackUi !== false) {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => this.initFeedbackWidget());
        } else {
          this.initFeedbackWidget();
        }
      }
    }
    
    handleNavigation() {
      if (this.currentUrl !== location.href) {
        this.currentUrl = location.href;
        this.track();
      }
    }
    
    track(eventName, eventData) {
      const payload = this.getPayload();
      if (eventName) {
        payload.type = 'event';
        payload.name = eventName;
        payload.data = eventData;
      }
      this.send(payload);
    }
    
    identify(userId, userData) {
      const payload = this.getPayload();
      payload.type = 'identify';
      payload.id = userId;
      payload.data = userData;
      localStorage.setItem(CONFIG.VISITOR_KEY, userId);
      this.visitorId = userId;
      this.send(payload);
    }
    
    send(payload) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(this.endpoint, blob);
      } else {
        fetch(this.endpoint, {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
          keepalive: true
        }).catch(() => {});
      }
    }
    
    initFeedbackWidget() {
			const container = document.createElement('div');
			container.id = 'ls-feedback-widget';
			const shadow = container.attachShadow({ mode: 'closed' });
			
			const styles = \`
				* { box-sizing: border-box; margin: 0; padding: 0; }
				.ls-trigger {
					position: fixed;
					bottom: 24px;
          right: 24px;
          width: 48px;
          height: 48px;
          border-radius: 0;
          background: #18181b;
					color: white;
					border: none;
					cursor: pointer;
					display: flex;
					align-items: center;
					justify-content: center;
					transition: all 0.2s ease;
					z-index: 999999;
					box-shadow: 0 4px 12px rgba(0,0,0,0.1);
				}
				.ls-trigger:hover { background: #000; transform: translateY(-2px); }
				.ls-trigger svg { width: 20px; height: 20px; }
				.ls-modal {
					position: fixed;
					bottom: 84px;
					right: 24px;
					width: 360px;
					max-width: calc(100vw - 48px);
					background: #18181b;
					border-radius: 0;
					border: 1px solid #27272a;
					z-index: 999998;
					display: none;
					overflow: hidden;
					font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
					box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.35);
				}
				.ls-modal.open { display: block; animation: lsFadeIn 0.2s ease-out; }
				@keyframes lsFadeIn {
					from { opacity: 0; transform: translateY(10px); }
					to { opacity: 1; transform: translateY(0); }
				}
				.ls-header {
					padding: 24px;
					background: #09090b;
					border-bottom: 1px solid #27272a;
					display: flex;
					justify-content: space-between;
					align-items: center;
				}
				.ls-header-content h3 { font-size: 12px; font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
				.ls-header-content p { font-size: 11px; color: #a1a1aa; font-style: italic; }
				.ls-close { background: none; border: none; color: #71717a; cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; }
				.ls-close:hover { color: #fff; }
				.ls-body { padding: 24px; background: #18181b; }
				.ls-rating { display: flex; gap: 8px; margin-bottom: 24px; }
				.ls-rating button {
					flex: 1;
					height: 48px;
					border: 1px solid #27272a;
					border-radius: 0;
					background: #09090b;
					cursor: pointer;
					font-size: 20px;
					transition: all 0.15s;
					display: flex;
					align-items: center;
					justify-content: center;
				}
				.ls-rating button:hover { border-color: #3f3f46; background: #18181b; }
				.ls-rating button.selected { border-color: #fafafa; background: #27272a; outline: 1px solid #fafafa; }
				.ls-field { margin-bottom: 24px; }
				.ls-field label {
					display: block;
					font-size: 10px;
					font-weight: 900;
					color: #a1a1aa;
					margin-bottom: 8px;
					text-transform: uppercase;
					letter-spacing: 0.05em;
				}
				.ls-field textarea, .ls-field input, .ls-field select {
					width: 100%;
					padding: 12px;
					border: 1px solid #27272a;
					border-radius: 0;
					font-size: 13px;
					font-family: inherit;
					transition: all 0.15s;
					background: #09090b;
					color: #fafafa;
				}
				.ls-field textarea:focus, .ls-field input:focus, .ls-field select:focus {
					outline: none;
					border-color: #fafafa;
				}
				.ls-field textarea { resize: vertical; min-height: 100px; }
				.ls-actions { display: flex; gap: 8px; }
				.ls-btn {
					flex: 1;
					padding: 14px 16px;
					border-radius: 0;
					font-size: 10px;
					font-weight: 900;
					cursor: pointer;
					transition: all 0.15s;
					border: none;
					text-transform: uppercase;
					letter-spacing: 0.05em;
				}
				.ls-btn-primary {
					background: #fafafa;
					color: #18181b;
				}
				.ls-btn-primary:hover { background: #fff; opacity: 0.9; }
				.ls-btn-primary:disabled { background: #27272a; color: #52525b; cursor: not-allowed; }
				.ls-btn-secondary {
					background: #09090b;
					color: #a1a1aa;
					border: 1px solid #27272a;
				}
				.ls-btn-secondary:hover { background: #18181b; color: #fafafa; border-color: #3f3f46; }
				.ls-success {
					text-align: center;
					padding: 48px 24px;
					background: #18181b;
				}
				.ls-success svg { width: 40px; height: 40px; color: #10b981; margin-bottom: 16px; }
				.ls-success h4 { font-size: 12px; font-weight: 900; color: #fafafa; text-transform: uppercase; }
				.ls-success p { font-size: 11px; color: #a1a1aa; margin-top: 8px; font-style: italic; }
				.ls-branding-footer {
					padding: 12px;
					background: #09090b;
					border-top: 1px solid #27272a;
					text-align: center;
				}
				.ls-branding-link {
					font-size: 10px;
					color: #52525b;
					text-decoration: none;
					text-transform: uppercase;
					letter-spacing: 0.05em;
					font-weight: 700;
				}
				.ls-branding-link:hover { color: #a1a1aa; }
			\`;
			
			shadow.innerHTML = \`
				<style>\${styles}</style>
				<button class="ls-trigger" aria-label="Send feedback">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
					</svg>
				</button>
        <div class="ls-modal">
          <div class="ls-header">
            <div class="ls-header-content">
              <h3>Send us feedback</h3>
              <p>We'd love to hear from you</p>
            </div>
            <button class="ls-close" aria-label="Close">✕</button>
          </div>
          <div class="ls-body">
            <div class="ls-form">
              <div class="ls-field">
                <label>How would you rate your experience?</label>
                <div class="ls-rating">
                  <button data-rating="1" title="Very Bad">😠</button>
                  <button data-rating="2" title="Bad">🙁</button>
                  <button data-rating="3" title="Neutral">😐</button>
                  <button data-rating="4" title="Good">🙂</button>
                  <button data-rating="5" title="Very Good">😍</button>
                </div>
              </div>
              <div class="ls-field">
                <label>Category</label>
                <select class="ls-category">
                  <option value="general">General Feedback</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div class="ls-field">
                <label>Your message *</label>
                <textarea class="ls-message" placeholder="Tell us what's on your mind..."></textarea>
              </div>
              <div class="ls-field">
                <label>Email (optional)</label>
                <input type="email" class="ls-email" placeholder="your@email.com">
              </div>
              <div class="ls-actions">
                <button class="ls-btn ls-btn-secondary ls-cancel">Cancel</button>
                <button class="ls-btn ls-btn-primary ls-submit">Send Feedback</button>
              </div>
            </div>
            <div class="ls-success" style="display:none">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <h4>Thank you!</h4>
              <p>Your feedback has been received.</p>
            </div>
          </div>
				</div>
			\`;
      
      document.body.appendChild(container);
      this.feedbackWidget = shadow;
      
      const modal = shadow.querySelector('.ls-modal');
      const form = shadow.querySelector('.ls-form');
      const success = shadow.querySelector('.ls-success');
      const ratingBtns = shadow.querySelectorAll('.ls-rating button');
      const submitBtn = shadow.querySelector('.ls-submit');
      
      let selectedRating = 0;
      
      shadow.querySelector('.ls-trigger').addEventListener('click', () => modal.classList.toggle('open'));
      shadow.querySelector('.ls-close').addEventListener('click', () => modal.classList.remove('open'));
      shadow.querySelector('.ls-cancel').addEventListener('click', () => {
        modal.classList.remove('open');
        this.resetFeedbackForm();
      });
      
      ratingBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          ratingBtns.forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedRating = parseInt(btn.dataset.rating);
        });
      });
      
      submitBtn.addEventListener('click', async () => {
        const message = shadow.querySelector('.ls-message').value.trim();
        if (!message) {
          shadow.querySelector('.ls-message').style.borderColor = '#ef4444';
          return;
        }
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        
        try {
          await this.submitFeedback({
            content: message,
            rating: selectedRating || undefined,
            category: shadow.querySelector('.ls-category').value,
            email: shadow.querySelector('.ls-email').value.trim() || undefined,
          });
          
          form.style.display = 'none';
          success.style.display = 'block';
          
          setTimeout(() => {
            modal.classList.remove('open');
            setTimeout(() => {
              form.style.display = 'block';
              success.style.display = 'none';
              this.resetFeedbackForm();
            }, 300);
          }, 2000);
        } catch (err) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Feedback';
        }
      });
      
      document.addEventListener('click', (e) => {
        if (!container.contains(e.target) && modal.classList.contains('open')) {
          modal.classList.remove('open');
        }
      });
    }
    
    resetFeedbackForm() {
      if (!this.feedbackWidget) return;
      const shadow = this.feedbackWidget;
      shadow.querySelector('.ls-message').value = '';
      shadow.querySelector('.ls-message').style.borderColor = '';
      shadow.querySelector('.ls-email').value = '';
      shadow.querySelector('.ls-category').value = 'general';
      shadow.querySelectorAll('.ls-rating button').forEach(b => b.classList.remove('selected'));
      shadow.querySelector('.ls-submit').disabled = false;
      shadow.querySelector('.ls-submit').textContent = 'Send Feedback';
    }
    
    async submitFeedback(data) {
      const payload = {
        ...data,
        visitorId: this.visitorId,
        sessionId: this.cache.visitId,
        url: location.href,
        screen: screen.width + 'x' + screen.height,
      };
      const response = await fetch(this.feedbackEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to submit feedback');
      return response.json();
    }

    showFeedback() { if (this.feedbackWidget) this.feedbackWidget.querySelector('.ls-modal').classList.add('open'); }
    hideFeedback() { if (this.feedbackWidget) this.feedbackWidget.querySelector('.ls-modal').classList.remove('open'); }
    async submit(content, options = {}) {
      return this.submitFeedback({
        content,
        rating: options.rating,
        category: options.category,
        email: options.email,
        metadata: options.metadata
      });
    }
  }
  
  const script = document.currentScript || document.querySelector('script[data-site-id]');
  if (script) {
    const siteId = script.getAttribute('data-site-id');
    const options = {
      host: script.getAttribute('data-host'),
      feedback: script.getAttribute('data-feedback') !== 'false',
      feedbackUi: script.getAttribute('data-feedback-ui') !== 'false'
    };
    window.littlestats = new LittleStatsTracker(siteId, options);
    window.track = (name, data) => window.littlestats?.track(name, data);
    window.identify = (id, data) => window.littlestats?.identify(id, data);
  }
})();`;
}
