import { COUNTRIES, TIMEZONES } from './geodata.js';

export function mergeEventData(bucket) {
    const mergedData = {};

    for (const event of bucket) {
        if ('event_data' in event) {
            const eventData = JSON.parse(event.event_data); // Parse the JSON string

            for (const [key, value] of Object.entries(eventData)) {
                if (key == 'pageLoadTime' || key == 'memory') continue;
                if (key in mergedData) {
                    mergedData[key][value] = mergedData[key][value] ? mergedData[key][value] + 1 : 1;
                } else {
                    mergedData[key] = Object.fromEntries([[value, 1]]);
                }
            }
            // Object.assign(mergedData, eventData); // Merge the data into a single object
        }
    }

    return mergedData;
}

export function bucketEventsByName(events) {
    let ex =  events.reduce((buckets, event) => {
        // Use the event_name as the bucket key.
        if (!buckets[event.event_name]) {
            buckets[event.event_name] = [];
        }
        buckets[event.event_name].push(event);
        return buckets;
    }, {});

    return Object.entries(ex)
}


export function sortReferals(events) {
    let uniquePages = new Map();
    let direct = 'Direct';

    events.forEach((event) => {
        // console.log(event);
        let ref = event.referrer;

        if (ref) {
            try {
                let hostname = new URL(ref).hostname;
                if (!hostname) {
                    const customUrlRegex = /^([a-zA-Z-]+):\/\/([^\/]+)(\/.*)?$/;
                    const match = ref.match(customUrlRegex);
                    if (match) {
                        hostname = match[2];
                    }
                }
                if (hostname != 'name.dev') {
                    if (!uniquePages.has(hostname)) {
                        uniquePages.set(hostname, 1);
                    } else {
                        uniquePages.set(hostname, uniquePages.get(hostname) + 1);
                    }
                } else {
                    if (!uniquePages.has(direct)) {
                        uniquePages.set(direct, 1);
                    } else {
                        uniquePages.set(direct, uniquePages.get(direct) + 1);
                    }
                }
            } catch (error) {
                if (!uniquePages.has(ref)) {
                    uniquePages.set(ref, 1);
                } else {
                    uniquePages.set(ref, uniquePages.get(ref) + 1);
                }
            }
        } else {
            if (!uniquePages.has(direct)) {
                uniquePages.set(direct, 1);
            } else {
                uniquePages.set(direct, uniquePages.get(direct) + 1);
            }
        }
    });

    return Array.from(uniquePages).sort((a, b) => b[1] - a[1]);
}


export function sortCountryData(events) {
    function getCountry(timezone) {
        if (timezone == '' || !timezone) {
            return undefined;
        }

        const tz = TIMEZONES[timezone];
        if (!tz || !tz.c || !tz.c.length) {
            return undefined;
        }

        const _country = tz.c[0];
        const country = COUNTRIES[_country];
        return country;
    }

    function getCountryFallback(event) {
        const url = typeof event?.url === 'string' ? event.url : '';
        const referrer = typeof event?.referrer === 'string' ? event.referrer : '';
        const isLocal = url.includes('localhost') || url.includes('127.0.0.1') || referrer.includes('localhost') || referrer.includes('127.0.0.1');
        if (isLocal) return 'Local';

        const lang = typeof event?.language === 'string' ? event.language : '';
        const locale = lang.split(',')[0].trim();
        const match = locale.match(/[-_](?<region>[A-Z]{2})\b/);
        const region = match?.groups?.region;
        if (region) return region;

        return 'Unknown';
    }
    
    let uniquePages = new Map();

    for (let index = 0; index < events.length; index++) {
        const event = events[index];
        const timezone = event.timezone;

        let country = getCountry(timezone);
        if (!country) {
            country = getCountryFallback(event);
        }

        if (!uniquePages.has(country)) {
            uniquePages.set(country, 1);
        } else {
            uniquePages.set(country, uniquePages.get(country) + 1);
        }
    }

    return Array.from(uniquePages).sort((a, b) => b[1] - a[1]);
}

export function sumData(d) {
    if (!Array.isArray(d) || d.length === 0) return 0;
    const values = d
        .map((item) => item?.[1])
        .filter((v) => typeof v === 'number' && Number.isFinite(v));
    if (values.length === 0) return 0;
    return Math.max(...values);
}

export function sortData(events){
    return [sortReferals(events), sortCountryData(events)]
}
