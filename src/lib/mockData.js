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


// Function to generate random events
export function generateRandomEvents(
	num = 1000,
	startDate = new Date('2025-01-03T00:00:00'),
	endDate = new Date()
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
