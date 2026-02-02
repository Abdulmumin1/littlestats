// Helper Functions
export function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFromArray(arr) {
	return arr[randomInt(0, arr.length - 1)];
}

function generateRandomIp() {
	return `${randomInt(1, 254)}.${randomInt(0, 254)}.${randomInt(0, 254)}.${randomInt(1, 254)}`;
}

function generateUUIDs(count) {
	return Array.from({ length: count }, () => randomUUID());
}

function randomUUID() {
	const s4 = () =>
		Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}

function randomDate(start, end) {
	const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
	const pad = (n) => (n < 10 ? '0' + n : n);
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

// Generate users and assign them unique IPs
const user_ids = generateUUIDs(randomInt(100, 500));
const user_ips = user_ids.map(() => generateRandomIp()); // Ensures similar count of users & IPs

const session_ids = generateUUIDs(randomInt(100, 2000));
// Arrays for random selection
const eventTypes = ['customEvent', 'pageview', 'pageExit', 'formSubmit', 'videoPlay', 'error', 'hover', 'scroll'];
const urls = ['/', '/about', '/contact', '/pricing', '/features', '/blog', '/signup', '/dashboard', '/settings'];
const referrers = [
	'',
	'https://google.com',
	'https://facebook.com',
	'https://twitter.com',
	'https://linkedin.com',
	'https://reddit.com',
	'https://medium.com',
	'https://dev.to',
	'https://producthunt.com',
	'https://example.com'
];
const userAgents = [
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/90.0.4430.85 Safari/537.36',
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15',
	'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15A372 Safari/604.1',
	'Mozilla/5.0 (X11; Ubuntu; Linux x86_64) Gecko/20100101 Firefox/134.0',
	'Mozilla/5.0 (Linux; Android 10; SM-G970U) AppleWebKit/537.36 Chrome/88.0.4324.93 Mobile Safari/537.36'
];
const timezones = ['Africa/Lagos', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney', 'Asia/Dubai', 'Europe/Berlin'];
const screens = ['1920x1080', '1366x768', '1440x900', '1536x864', '1280x720', '2560x1440', '1024x768'];
const languages = ['en-US', 'fr-FR', 'es-ES', 'de-DE', 'zh-CN', 'it-IT', 'ru-RU', 'ja-JP'];
const eventNames = [
	'Page View',            // General page visit
	'Sign Up',             // User registration
	'Login',               // User logs in
	'Start Free Trial',    // Begins a free trial
	'Upgrade Plan',        // Upgrades to a paid plan
	'Subscription Renewal',// Subscription renewal event
	'Cancellation',        // Subscription cancellation
	'Feature Used',        // User engages with a core feature
	'Integration Connected', // Connects third-party integration
	'Download Report',     // Downloads analytics report
	'Invite Team Member',  // Invites a teammate
	'Change Settings',     // Updates account settings
	'Contact Support',     // Reaches out for help
	'Form Submission',     // Submits a form (e.g., lead gen, survey)
	'Checkout Started',    // Begins payment process
	'Payment Completed',   // Successfully pays
	'Churned',             // User stops using the service
	'Feedback Given',      // Provides product feedback
	'Webinar Registered',  // Signs up for a webinar
	'Documentation Visit'  // Views API/docs
];
const buttonColors = ['blue', 'red', 'green', 'yellow', 'purple', 'black', 'orange'];
const campaigns = ['summer-sale', 'winter-discount', 'spring-offer', 'autumn-promo', 'black-friday', 'cyber-monday'];
const interactionTypes = ['click', 'hover', 'drag', 'drop', 'input', 'keypress'];
const formIds = ['signup-form', 'contact-form', 'survey-form', 'feedback-form', 'checkout-form'];

const endDated = new Date();
const startDated = new Date(endDated);
startDated.setDate(endDated.getDate() - 90); // 3 months = 90 days

// Function to generate random events
export function generateRandomEvents(
	num = 5000,
	startDate = startDated,
	endDate = endDated
) {
	let dummy = [];
	for (let i = 0; i < num; i++) {
		const event_type = randomFromArray(eventTypes);
		const url = randomFromArray(urls);
		const referrer = randomFromArray(referrers);
		const user_agent = randomFromArray(userAgents);
		const timestamp = randomDate(startDate, endDate);
		const duration = event_type === 'pageExit' ? randomInt(1, 500) : null;
		const user_index = randomInt(0, user_ids.length - 1);
		const user_id = user_ids[user_index];
		const ip = user_ips[user_index]; // Assign the corresponding IP
		const timezone = randomFromArray(timezones);
		const created_at = timestamp;
		const session_id = randomFromArray(session_ids);
		const screen = randomFromArray(screens);
		const language = randomFromArray(languages);
		const event_name = randomFromArray(eventNames);

		// Event data with added variety
		const eventDataObj = {
			buttonId: 'cta-button',
			buttonColor: randomFromArray(buttonColors),
			campaign: randomFromArray(campaigns),
			pageLoadTime: randomInt(500, 5000),
			scrollDepth: randomInt(0, 100),
			interactionType: randomFromArray(interactionTypes),
			formId: event_type === 'formSubmit' ? randomFromArray(formIds) : null,
			videoProgress: event_type === 'videoPlay' ? `${randomInt(0, 100)}%` : null
		};
		const event_data = JSON.stringify(eventDataObj);

		dummy.push({
			domain_id: 'mwn1qyxs2n8ha58',
			event_type,
			url,
			referrer,
			user_agent,
			timestamp,
			duration,
			ip,
			timezone,
			created_at,
			user_id,
			session_id,
			screen,
			language,
			event_name,
			event_data
		});
	}
	return dummy;
}

export const mockDataFunnel = [
    // User 1: Perfect funnel completion (all steps in order)
    {
        user_id: "user_1",
        session_id: "session_1",
        timestamp: "2025-02-01 09:00:00",
        url: "/landing-page",
        event_name: "Page View"
    },
    {
        user_id: "user_1",
        session_id: "session_1",
        timestamp: "2025-02-01 09:05:00",
        url: "/signup",
        event_name: "Sign Up"
    },
    {
        user_id: "user_1",
        session_id: "session_1",
        timestamp: "2025-02-01 09:10:00",
        url: "/onboarding",
        event_name: "Onboarding Complete"
    },
    {
        user_id: "user_1",
        session_id: "session_2",
        timestamp: "2025-02-02 10:00:00",
        url: "/dashboard",
        event_name: "First Login"
    },
    {
        user_id: "user_1",
        session_id: "session_3",
        timestamp: "2025-02-03 11:00:00",
        url: "/subscription",
        event_name: "Subscription Purchased"
    },
    {
        user_id: "user_1",
        session_id: "session_4",
        timestamp: "2025-02-04 12:00:00",
        url: "/feature-usage",
        event_name: "Feature Engaged"
    },

    // User 2: Cross-session completion (sign up + subscription in different sessions)
    {
        user_id: "user_2",
        session_id: "session_a",
        timestamp: "2025-02-01 12:00:00",
        url: "/landing-page",
        event_name: "Page View"
    },
    {
        user_id: "user_2",
        session_id: "session_a",
        timestamp: "2025-02-01 12:05:00",
        url: "/signup",
        event_name: "Sign Up"
    },
    {
        user_id: "user_2",
        session_id: "session_b",
        timestamp: "2025-02-05 14:00:00",
        url: "/subscription",
        event_name: "Subscription Purchased"
    },

    // User 3: Drops off after onboarding (no subscription)
    {
        user_id: "user_3",
        session_id: "session_x",
        timestamp: "2025-02-01 15:00:00",
        url: "/landing-page",
        event_name: "Page View"
    },
    {
        user_id: "user_3",
        session_id: "session_x",
        timestamp: "2025-02-01 15:05:00",
        url: "/signup",
        event_name: "Sign Up"
    },
    {
        user_id: "user_3",
        session_id: "session_x",
        timestamp: "2025-02-01 15:10:00",
        url: "/onboarding",
        event_name: "Onboarding Complete"
    },

    // User 4: Out-of-order completion (sign up → feature usage → subscription)
    {
        user_id: "user_4",
        session_id: "session_alpha",
        timestamp: "2025-02-01 16:00:00",
        url: "/landing-page",
        event_name: "Page View"
    },
    {
        user_id: "user_4",
        session_id: "session_alpha",
        timestamp: "2025-02-01 16:05:00",
        url: "/signup",
        event_name: "Sign Up"
    },
    {
        user_id: "user_4",
        session_id: "session_beta",
        timestamp: "2025-02-02 10:00:00",
        url: "/feature-usage",
        event_name: "Feature Engaged"
    },
    {
        user_id: "user_4",
        session_id: "session_gamma",
        timestamp: "2025-02-03 11:00:00",
        url: "/subscription",
        event_name: "Subscription Purchased"
    },

    // User 5: Multiple sign-ups (should only count once)
    {
        user_id: "user_5",
        session_id: "session_foo",
        timestamp: "2025-02-01 17:00:00",
        url: "/landing-page",
        event_name: "Page View"
    },
    {
        user_id: "user_5",
        session_id: "session_foo",
        timestamp: "2025-02-01 17:05:00",
        url: "/signup",
        event_name: "Sign Up"
    },
    {
        user_id: "user_5",
        session_id: "session_foo",
        timestamp: "2025-02-01 17:10:00",
        url: "/signup",
        event_name: "Sign Up" // Duplicate
    },
    {
        user_id: "user_5",
        session_id: "session_bar",
        timestamp: "2025-02-02 12:00:00",
        url: "/subscription",
        event_name: "Subscription Purchased"
    },

    // User 6: Only first step (landing page view)
    {
        user_id: "user_6",
        session_id: "session_z",
        timestamp: "2025-02-01 18:00:00",
        url: "/landing-page",
        event_name: "Page View"
    },

    // User 7: Engages with feature but doesn't subscribe
    {
        user_id: "user_7",
        session_id: "session_y",
        timestamp: "2025-02-01 19:00:00",
        url: "/landing-page",
        event_name: "Page View"
    },
    {
        user_id: "user_7",
        session_id: "session_y",
        timestamp: "2025-02-01 19:05:00",
        url: "/signup",
        event_name: "Sign Up"
    },
    {
        user_id: "user_7",
        session_id: "session_y",
        timestamp: "2025-02-01 19:10:00",
        url: "/onboarding",
        event_name: "Onboarding Complete"
    },
    {
        user_id: "user_7",
        session_id: "session_y2",
        timestamp: "2025-02-02 10:00:00",
        url: "/feature-usage",
        event_name: "Feature Engaged"
    }
];



export const mockDataFunnelSteps = [
    {
        name: "Landing Page View",
        value: "/landing-page",
        color: "#be185d",
        type: "url"
    },
    {
        name: "Sign Up",
        value: "Sign Up",
        color: "#4CAF50",
        type: "event"
    },
    {
        name: "Onboarding Complete",
        value: "Onboarding Complete",
        color: "#2196F3",
        type: "event"
    },
    {
        name: "First Login",
        value: "First Login",
        color: "#FFC107",
        type: "event"
    },
    {
        name: "Subscription Purchased",
        value: "Subscription Purchased",
        color: "#9C27B0",
        type: "event"
    },
    {
        name: "Feature Engaged",
        value: "Feature Engaged",
        color: "#FF5722",
        type: "event"
    }
];


// Mock Data Aggregation Helpers
export function getMockStatsSummary(events, range) {
    // Basic aggregation logic based on events and range
    // Ideally filter by range first
    const filtered = filterEvents(events, range);
    
    // Only consider sessions that have at least one pageview for the main stats
    // This ensures Views >= Visits >= Visitors
    const pageViewEvents = filtered.filter(e => e.event_type === 'pageview');
    
    const uniqueSessions = new Set(pageViewEvents.map(e => e.session_id));
    const uniqueUsers = new Set(pageViewEvents.map(e => e.user_id));
    
    // Calculate bounce rate: sessions with only 1 event total (even if it's the pageview)
    // We look at ALL events for the identified sessions to check for engagement
    const sessionEventCounts = {};
    filtered.forEach(e => {
        if (uniqueSessions.has(e.session_id)) {
             sessionEventCounts[e.session_id] = (sessionEventCounts[e.session_id] || 0) + 1;
        }
    });
    
    const bounces = Object.values(sessionEventCounts).filter(c => c === 1).length;
    
    return {
        views: pageViewEvents.length,
        visits: uniqueSessions.size,
        visitors: uniqueUsers.size,
        bounceRate: uniqueSessions.size ? Math.round((bounces / uniqueSessions.size) * 100) : 0,
        avgDuration: 120, // Mock average duration
        change: {
            views: 12,
            visits: 8,
            visitors: 15,
            bounceRate: -2,
            avgDuration: 5
        }
    };
}

export function getMockTimeSeries(events, range, granularity = 'day') {
    const filtered = filterEvents(events, range);
    const data = {};
    
    // Only use pageviews to drive the graph, so it matches the summary
    filtered.filter(e => e.event_type === 'pageview').forEach(e => {
        const date = new Date(e.timestamp);
        let key;
        if (granularity === 'hour') {
             key = date.toISOString().slice(0, 13) + ':00:00.000Z';
        } else {
             key = date.toISOString().slice(0, 10) + 'T00:00:00.000Z';
        }
        
        if (!data[key]) {
            data[key] = { timestamp: key, views: 0, visits: new Set(), visitors: new Set() };
        }
        
        data[key].views++;
        data[key].visits.add(e.session_id);
        data[key].visitors.add(e.user_id);
    });
    
    return Object.values(data).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)).map(d => ({
        timestamp: d.timestamp,
        views: d.views,
        visits: d.visits.size,
        visitors: d.visitors.size
    }));
}


export function getMockPages(events, range) {
    const filtered = filterEvents(events, range);
    const counts = {};
    
    filtered.filter(e => e.event_type === 'pageview').forEach(e => {
        // Just store count, we will convert to [url, count] array
        counts[e.url] = (counts[e.url] || 0) + 1;
    });
    
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([path, views]) => ({ path, views }));
}

export function getMockReferrers(events, range) {
    const filtered = filterEvents(events, range);
    const counts = {};
    
    filtered.filter(e => e.event_type === 'pageview').forEach(e => {
        let ref = e.referrer || 'Direct';
        try {
            if(ref !== 'Direct' && ref !== '') {
               const url = new URL(ref);
               ref = url.hostname;
            } else {
                ref = 'Direct';
            }
        } catch {
            ref = 'Direct';
        }
        
        counts[ref] = (counts[ref] || 0) + 1;
    });
    
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([referrer, views]) => ({ referrer, views }));
}

export function getMockCountries(events, range) {
     const filtered = filterEvents(events, range);
     const countriesList = [
         { name: 'United States', code: 'US' },
         { name: 'United Kingdom', code: 'GB' },
         { name: 'Germany', code: 'DE' },
         { name: 'France', code: 'FR' },
         { name: 'Japan', code: 'JP' },
         { name: 'India', code: 'IN' },
         { name: 'Canada', code: 'CA' },
         { name: 'Brazil', code: 'BR' }
     ];
     
     const counts = {};
     filtered.filter(e => e.event_type === 'pageview').forEach(e => {
        // Deterministic mock country based on user_id to be consistent
        const countryInfo = countriesList[e.user_id.charCodeAt(0) % countriesList.length];
        counts[countryInfo.name] = { 
            country: countryInfo.name, 
            code: countryInfo.code, 
            views: (counts[countryInfo.name]?.views || 0) + 1 
        };
     });
     
     return Object.values(counts)
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);
}

export function getMockBrowsers(events, range) {
    const filtered = filterEvents(events, range);
    const counts = {};
    
    filtered.filter(e => e.event_type === 'pageview').forEach(e => {
        let browser = 'Unknown';
        const ua = e.user_agent;
        if (ua.includes('Chrome')) browser = 'Chrome';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Safari')) browser = 'Safari';
        else if (ua.includes('Edge')) browser = 'Edge';
        
        counts[browser] = (counts[browser] || 0) + 1;
    });
    
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
}

export function getMockOS(events, range) {
    const filtered = filterEvents(events, range);
    const counts = {};
    
    filtered.filter(e => e.event_type === 'pageview').forEach(e => {
        let os = 'Unknown';
        const ua = e.user_agent;
        if (ua.includes('Windows')) os = 'Windows';
        else if (ua.includes('Mac')) os = 'MacOS';
        else if (ua.includes('Linux')) os = 'Linux';
        else if (ua.includes('Android')) os = 'Android';
        else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
        
        counts[os] = (counts[os] || 0) + 1;
    });
    
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
}


export function getMockDevices(events, range) {
     const filtered = filterEvents(events, range);
     const counts = {};
     
     filtered.filter(e => e.event_type === 'pageview').forEach(e => {
        let device = 'Desktop';
        if (e.user_agent.includes('Mobile')) device = 'Mobile';
        else if (e.user_agent.includes('iPad') || e.user_agent.includes('Tablet')) device = 'Tablet';
        
        if (!counts[device]) counts[device] = { device, views: 0, visits: new Set() };
        counts[device].views++;
        counts[device].visits.add(e.session_id);
     });
     
     return Object.values(counts)
        .map(d => ({ ...d, visits: d.visits.size }))
        .sort((a, b) => b.views - a.views);
}





function filterEvents(events, range) {
    if (!range || !range.startDate || !range.endDate) return events;
    
    // Create dates from the strings (assuming YYYY-MM-DD)
    // We treat the inputs as local dates (YYYY-MM-DD 00:00:00) to match the events
    const start = new Date(range.startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(range.endDate);
    end.setHours(23, 59, 59, 999);
    
    const startTime = start.getTime();
    const endTime = end.getTime();

    return events.filter(e => {
        const t = new Date(e.timestamp).getTime();
        return t >= startTime && t <= endTime;
    });
}

export function getMockEventCounts(events, range) {
    const filtered = filterEvents(events, range);
    // Only count custom events or specific interactions, usually excluding pageviews if looking for "Events"
    // But for general event log, we might want all.
    // The events page typically excludes pageviews from the "Event names" list but shows them in log if selected.
    // Let's count everything that is NOT a pageview for the summary list, matching typical analytics behavior.
    
    const counts = {};
    filtered.filter(e => e.event_type !== 'pageview').forEach(e => {
        const name = e.event_name || e.event_type;
        counts[name] = (counts[name] || 0) + 1;
    });
    
    return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
}

export function getMockFeedback(count = 50) {
    const feedback = [];
    const contents = [
        "The dashboard is super clean, I love how fast it loads!",
        "Could you add more custom event tracking options?",
        "Found a small bug in the funnels view on mobile.",
        "Your privacy-first approach is exactly what we needed.",
        "I'm really enjoying the new real-time stats feature.",
        "The integration with our SvelteKit app was seamless.",
        "Would be great to have an export to CSV feature for reports.",
        "Best analytics tool I've used in a while. Simple and effective.",
        "The dark mode looks amazing, especially on the graphs.",
        "I had some trouble setting up the tracker script initially."
    ];
    const categories = ['general', 'bug', 'feature', 'other'];
    const statuses = ['new', 'reviewed', 'resolved', 'archived'];
    const osList = ['Windows', 'MacOS', 'iOS', 'Android', 'Linux'];
    const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
    
    for (let i = 0; i < count; i++) {
        const timestamp = Math.floor(Date.now() / 1000) - randomInt(0, 604800); // within last week
        feedback.push({
            id: randomUUID(),
            content: randomFromArray(contents),
            rating: randomInt(1, 5),
            category: randomFromArray(categories),
            status: randomFromArray(statuses),
            email: Math.random() > 0.5 ? `user${i}@example.com` : null,
            url: `https://demo.site${randomFromArray(['/', '/pricing', '/docs', '/blog'])}`,
            country: randomFromArray(['US', 'GB', 'DE', 'FR', 'CA']),
            os: randomFromArray(osList),
            browser: randomFromArray(browsers),
            createdAt: timestamp,
            updatedAt: timestamp
        });
    }
    
    return feedback.sort((a, b) => b.createdAt - a.createdAt);
}


