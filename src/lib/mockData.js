// You can import additional components (e.g., charts, filters) as needed

// Example JSON data (this would normally come from your server or props)
// Helper Functions
function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFromArray(arr) {
	return arr[randomInt(0, arr.length - 1)];
}

function randomIp() {
	return `${randomInt(1, 254)}.${randomInt(0, 254)}.${randomInt(0, 254)}.${randomInt(1, 254)}`;
}

// A basic random UUID generator (not RFC compliant but good enough for simulation)
function randomUUID() {
	const s4 = () =>
		Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}

function randomUUIDd() {
    let ar = []
	for (let i = 0; i < 1000; i++) {
        ar.push(randomUUID())
    }
    return ar
}

// Random date generator between two dates
function randomDate(start, end) {
	const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
	// Format as "YYYY-MM-DD HH:MM:SS"
	const pad = (n) => (n < 10 ? '0' + n : n);
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

// Arrays for random selection
const eventTypes = ['customEvent', 'pageview', 'pageExit'];
const urls = ['/', '/about', '/contact', '/pricing', '/features', '/blog'];
const referrers = [
	'',
	'https://google.com',
	'https://facebook.com',
	'https://twitter.com',
	'https://linkedin.com',
	'https://news.ycommbinator.com',
	'https://lofa.com',
	'https://yaqeen.e.com',
	'https://es.ru',
	'https://minorotr.io'
];
const userAgents = [
	'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:134.0) Gecko/20100101 Firefox/134.0',
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/90.0.4430.85 Safari/537.36',
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15',
	'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15A372 Safari/604.1'
];
const timezones = [
	'Africa/Lagos',
	'America/New_York',
	'Europe/London',
	'Asia/Tokyo',
	'Australia/Sydney'
];
const screens = ['1920x1080', '1366x768', '1440x900', '1536x864', '1280x720'];
const languages = ['en-US', 'fr-FR', 'es-ES', 'de-DE', 'zh-CN'];
const eventNames = ['Get Started', 'Sign Up', 'Purchase', 'Logout', 'View Page', 'Add to Cart'];
const buttonColors = ['blue', 'red', 'green', 'yellow', 'purple'];
const campaigns = [
	'summer-sale',
	'winter-discount',
	'spring-offer',
	'autumn-promo',
	'black-friday'
];

// Date range for the simulation
const startDate = new Date('2024-08-03T00:00:00');
const endDate = new Date('2024-09-04T00:00:00');
const session_ids = randomUUIDd()
// Build the data object with 400 records
// const data = $state({
// 	records: [],
// 	domain_id: 'mwn1qyxs2n8ha58',
// 	domains: [{ id: 'mwn1qyxs2n8ha58', name: 'Demo Domain' }]
// });

export function generateRandomEvents(num = 1000) {
	let dummy = [];
	for (let i = 0; i < num; i++) {
		// Randomly choose properties
		const event_type = randomFromArray(eventTypes);
		const url = randomFromArray(urls);
		const referrer = randomFromArray(referrers);
		const user_agent = randomFromArray(userAgents);
		const timestamp = randomDate(startDate, endDate);
		// For 'pageExit' events, give a random duration between 1 and 500 seconds; otherwise null.
		const duration = event_type === 'pageExit' ? randomInt(1, 500) : null;
		const ip = randomIp();
		const timezone = randomFromArray(timezones);
		// Use the same timestamp for created_at for simplicity.
		const created_at = timestamp;
		const user_id = randomFromArray(session_ids);
		const screen = randomFromArray(screens);
		const language = randomFromArray(languages);
		const event_name = randomFromArray(eventNames);
		// Build a random event_data payload
		const eventDataObj = {
			buttonId: 'cta-button',
			buttonColor: randomFromArray(buttonColors),
			campaign: randomFromArray(campaigns),
			pageLoadTime: randomInt(500, 2000)
		};
		const event_data = JSON.stringify(eventDataObj);
		const session_id = randomFromArray(session_ids);

		// Assemble the event object
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
			screen,
			language,
			event_name,
			event_data,
			session_id
		});
	}
	return dummy;
}
