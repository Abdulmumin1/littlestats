import { json } from '@sveltejs/kit';
// if (IS_DEV_MODE) {
//   let devdata = {
//    eventType: eventType,
//    url: window.location.pathname,
//    referrer: document.referrer,
//    userAgent: navigator.userAgent,
//    timestamp: new Date().toISOString(),
//    };
//    console.log(devdata)
//    console.log('Analytics event in dev mode (not sent):', eventType, additionalData);
//    return;
//  }

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, request, params }) {
	// console.log(params);
	const origin = url.origin;
	const isDev = origin.includes('localhost') || origin.includes('127.0.0.1');
	const analyticsEndpoint = isDev
		? 'http://0.0.0.0:8000/collect/' + params.slug
		: 'https://littlestats-backend.fly.dev/collect/' + params.slug;

	const script = `
    (function() {
      var ANALYTICS_ENDPOINT = '${analyticsEndpoint}';
      var IS_DEV_MODE = ${isDev};
      var lastUrl = location.href;
    
      function sendAnalytics(eventType, additionalData) {
       
        var data = {
          eventType: eventType,
          url: window.location.pathname,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          host: window.location.host,
          ...additionalData
        };

        if (eventType == 'pageExit'){
          const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
          navigator.sendBeacon(ANALYTICS_ENDPOINT, blob);
          return;
        }
    
        fetch(ANALYTICS_ENDPOINT, {
          method: 'POST',
          body: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' }
        }).catch(function(error) {
          console.error('Failed to send analytics data:', error);
        });
      }
    
      function trackPageView() {
        sendAnalytics('pageview');
      }
    
      // Send pageview on initial load
      trackPageView();
    
      // Track URL changes
      function urlChangeHandler() {
        if (lastUrl !== location.href) {
          lastUrl = location.href;
          trackPageView();
        }
      }
    
      // Set up listeners for URL changes
      window.addEventListener('popstate', urlChangeHandler);
      window.addEventListener('hashchange', urlChangeHandler);
    
      // Intercept pushState and replaceState
      var pushState = history.pushState;
      history.pushState = function() {
        pushState.apply(history, arguments);
        urlChangeHandler();
      };
      var replaceState = history.replaceState;
      history.replaceState = function() {
        replaceState.apply(history, arguments);
        urlChangeHandler();
      };
    
      // Track when user leaves the page
      window.addEventListener('beforeunload', function() {
      console.log('leaving')
        sendAnalytics('pageExit', {
          duration: Math.round((new Date() - performance.timing.navigationStart) / 1000)
        });
      });
    
      // Expose function to track custom events
      window.trackEvent = function(eventName, eventData) {
        sendAnalytics('customEvent', { eventName, ...eventData });
      };
    
      // Expose function to manually set dev mode
      window.setAnalyticsDevMode = function(isDevMode) {
        IS_DEV_MODE = isDevMode;
        console.log('Analytics dev mode set to:', IS_DEV_MODE);
      };
    
      // Expose function to manually track a page view
      window.trackPageView = trackPageView;
    })();
      `;
	return new Response(script, {
		headers: {
			'Content-Type': 'application/javascript'
		}
	});
}
