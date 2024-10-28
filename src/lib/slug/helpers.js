export function isOsInUserAgent(userAgent, osName) {
	// Normalize the OS name for case-insensitivity
	osName = osName.toLowerCase();

	// Check for OS in the user agent string
	switch (osName) {
		case 'ios':
			return (
				userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('iPod')
			);
		case 'android':
			return userAgent.includes('Android');
		case 'windows':
			return userAgent.includes('Win');
		case 'macos':
			return userAgent.includes('Mac');
		case 'linux':
			return userAgent.includes('X11') || userAgent.includes('Linux');
		case 'unknown':
			return true; // Return true if "unknown" is specified, for unrecognized OS
		default:
			return false; // Any unrecognized OS name
	}
}

export function isBrowserInUserAgent(userAgent, browserName) {
	// Normalize the browser name for case-insensitivity
	browserName = browserName.toLowerCase();

	// Check for browser in the user agent string
	switch (browserName) {
		case 'firefox':
			return userAgent.includes('Firefox/');
		case 'chrome':
			return userAgent.includes('Chrome/') && !userAgent.includes('Edg/');
		case 'safari':
			return userAgent.includes('Safari/') && !userAgent.includes('Chrome/');
		case 'edge':
			return userAgent.includes('Edge/') || userAgent.includes('Edg/');
		case 'opera':
			return userAgent.includes('Opera/') || userAgent.includes('OPR/');
		default:
			return false;
	}
}

export function formatNumber(num) {
	if (num >= 1000000) {
		return (num / 1000000).toFixed(1) + 'M';
	}
	if (num >= 1000) {
		return (num / 1000).toFixed(1) + 'K';
	}
	return num.toString();
}
