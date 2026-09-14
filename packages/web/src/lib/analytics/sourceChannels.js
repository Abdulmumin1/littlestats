export const SOURCE_CHANNELS = ['All', 'Direct', 'Search', 'Social', 'AI', 'UTM', 'Referral'];

const AI_HOSTS = [
	'chatgpt.com',
	'chat.openai.com',
	'perplexity.ai',
	'claude.ai',
	'gemini.google.com',
	'copilot.microsoft.com',
	'meta.ai',
	'poe.com',
	'phind.com',
	'you.com',
	'mistral.ai'
];

const SEARCH_HOSTS = [
	'google.',
	'bing.com',
	'duckduckgo.com',
	'kagi.com',
	'search.brave.com',
	'ecosia.org',
	'yahoo.',
	'yandex.',
	'baidu.com'
];

const SOCIAL_HOSTS = [
	't.co',
	'x.com',
	'twitter.com',
	'facebook.com',
	'instagram.com',
	'linkedin.com',
	'reddit.com',
	'youtube.com',
	'tiktok.com',
	'threads.net',
	'bsky.app'
];

function normalizeSource(value) {
	return String(value || '')
		.trim()
		.toLowerCase()
		.replace(/^www\./, '');
}

export function isSameSiteSource(source, siteDomain) {
	const normalizedSource = normalizeSource(source);
	const normalizedSite = normalizeSource(siteDomain);
	if (!normalizedSource || !normalizedSite || normalizedSource === 'direct') return false;
	return normalizedSource === normalizedSite || normalizedSource.endsWith(`.${normalizedSite}`);
}

function matchesHost(source, hosts) {
	return hosts.some((host) => source === host || source.endsWith(`.${host}`) || source.includes(host));
}

export function classifySource(source, isUtm = false) {
	const normalized = normalizeSource(source);
	if (!normalized || normalized === 'direct' || normalized === '(direct)') return 'Direct';
	if (isUtm) return 'UTM';
	if (matchesHost(normalized, AI_HOSTS)) return 'AI';
	if (matchesHost(normalized, SEARCH_HOSTS)) return 'Search';
	if (matchesHost(normalized, SOCIAL_HOSTS)) return 'Social';
	return 'Referral';
}

export function sourceFromCampaign(row) {
	const bucket = String(row?.bucket || 'Direct');
	const isUtm = bucket.includes('|');
	const [rawSource = 'Direct', rawMedium = '', rawCampaign = ''] = isUtm
		? bucket.split('|')
		: [bucket, '', ''];
	const source = rawSource && rawSource !== 'unknown' ? rawSource : 'Unknown source';
	const medium = rawMedium && rawMedium !== 'unknown' ? rawMedium : '';
	const campaign = rawCampaign && rawCampaign !== 'unknown' ? rawCampaign : '';

	return {
		...row,
		bucket,
		source: source === 'Direct' ? 'Direct' : source,
		channel: classifySource(source, isUtm),
		detail: isUtm ? [medium, campaign].filter(Boolean).join(' · ') || 'Tagged link' : ''
	};
}

export function sourceFromReferrer(row) {
	const source = row?.referrer || 'Direct';
	return {
		...row,
		bucket: source,
		source,
		channel: classifySource(source),
		detail: ''
	};
}

export function channelTotals(rows, valueKey = 'visits') {
	const totals = new Map(SOURCE_CHANNELS.slice(1).map((channel) => [channel, 0]));
	for (const row of rows) {
		totals.set(row.channel, (totals.get(row.channel) || 0) + Number(row[valueKey] || 0));
	}
	return totals;
}
