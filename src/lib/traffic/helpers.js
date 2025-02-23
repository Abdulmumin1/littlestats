import { isOsInUserAgent, isBrowserInUserAgent, getCountry } from '$lib/slug/helpers.js';

export function getUniqueUserAgents(events) {
	const uniqueAgents = new Map();
	events.forEach((event) => {
		if (!uniqueAgents.has(event.ip)) {
			uniqueAgents.set(event.ip, event);
		}
	});
	return Array.from(uniqueAgents.values());
}

export function calculateAverageDuration(events) {
	const validEvents = events.filter((e) => e.event_type === 'pageExit' && e.duration > 0);
	if (validEvents.length === 0) return 0;
	const totalDuration = validEvents.reduce((acc, curr) => acc + curr.duration, 0);
	return totalDuration / validEvents.length;
}

export function calculateBounceRate(events) {
	const userSessions = {};
	let totalVisits = 0;
	let bounceCount = 0;

	events.forEach((event) => {
		const { ip, event_type } = event;
		if (!userSessions[ip]) userSessions[ip] = { pageViews: 0 };

		if (event_type === 'pageview') {
			totalVisits++;
			userSessions[ip].pageViews++;
		}

		if (userSessions[ip].pageViews === 1 && event_type === 'pageExit') {
			bounceCount++;
		}
	});

	const bounceRate = totalVisits === 0 ? 0 : (bounceCount / totalVisits) * 100;
	return { bounceRate: bounceRate.toFixed(2), totalVisits, bounceCount };
}

export function filterView(events) {
	return events.filter((e) => e.event_type !== 'pageExit');
}

export function createFilter(data, filters) {
    let filteredData = data;
    filters.forEach((filter) => {
        switch (filter.type) {
            case 'page':
                filteredData = filteredData.filter((e) => e.url === filter.query);
                break;
            case 'ref':
                filteredData = filteredData.filter((e) =>
                    filter.query === 'Direct' ? !e.referrer : e.referrer?.includes(filter.query)
                );
                break;
            case 'browser':
                filteredData = filteredData.filter((e) =>
                    isBrowserInUserAgent(e.user_agent, filter.query)
                );
                break;
            case 'os':
                filteredData = filteredData.filter((e) => isOsInUserAgent(e.user_agent, filter.query));
                break;
            case 'country':
                filteredData = filteredData.filter((e) => {
                    try {
                        return e.timezone && getCountry(e.timezone) === filter.query;
                    } catch {
                        return false;
                    }
                });
                break;
        }
    });
    return filteredData;
}
