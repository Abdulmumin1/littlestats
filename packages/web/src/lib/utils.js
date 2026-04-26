/** Dispatch event on click outside of node */
export function clickOutside(node) {
	const handleClick = (event) => {
		if (node && !node.contains(event.target) && !event.defaultPrevented) {
			node.dispatchEvent(new CustomEvent('click_outside', node));
		}
	};

	document.addEventListener('click', handleClick, true);

	return {
		destroy() {
			document.removeEventListener('click', handleClick, true);
		}
	};
}

export function calculateTrialDaysLeft(activationDate) {
	// Given date (activation date)
	const givenDate = new Date(activationDate); // Replace with the activation date passed as argument

	// Get the current date
	const now = new Date();

	// Calculate the trial end date (30 days after the given date)
	const trialEnd = new Date(givenDate);
	trialEnd.setDate(givenDate.getDate() + 30); // Add 30 days to the activation date

	// Calculate the difference in milliseconds between now and the trial end date
	const timeDifference = trialEnd - now;

	// Convert milliseconds to days
	const daysLeft = timeDifference / (1000 * 60 * 60 * 24);

	// Optionally, round to the nearest whole day
	const roundedDaysLeft = Math.ceil(daysLeft); // Use Math.floor() to round down if needed

	return roundedDaysLeft;
}

export function formatDate(dateString, year = true) {
	const date = new Date(dateString);

	let d = date.toLocaleDateString('en-US', {
		...(year && { year: 'numeric' }),
		month: 'short', // Use 'short' for "Jan" instead of "January"
		day: '2-digit'
	});
	if (d == 'Invalid Date') return dateString;
	return d;
}

export function executeInWorker(func, ...args) {
	return new Promise((resolve, reject) => {
		const blob = new Blob(
			[
				`onmessage = function(e) {
                const [funcStr, args] = e.data;
                const func = new Function('return ' + funcStr)();
                postMessage(func(...args));
            }`
			],
			{ type: 'application/javascript' }
		);

		const worker = new Worker(URL.createObjectURL(blob));
		worker.onmessage = (e) => {
			resolve(e.data);
			worker.terminate();
		};
		worker.onerror = (e) => {
			reject(e.message);
			worker.terminate();
		};
		// console.log(func.toString())

		worker.postMessage([func.toString(), args]);
	});
}

/**
 * Get the DNS host record value for a domain.
 * Assumes the DNS zone is the last two labels of the domain.
 * @param {string} domain - The domain name (e.g., "example.com" or "blog.example.com")
 * @returns {string} - The host value for DNS TXT record ("@" for root domains, subdomain for subdomains)
 */
export function getDnsHostRecord(domain) {
	if (!domain) return '@';

	const cleanDomain = domain
		.replace(/^https?:\/\//, '')
		.split('/')[0]
		.split(':')[0]
		.toLowerCase()
		.replace(/\.$/, '');
	const parts = cleanDomain.split('.').filter(Boolean);

	if (parts.length <= 2) {
		return '@';
	}

	const subdomainParts = parts.slice(0, parts.length - 2);
	return subdomainParts.join('.');
}
