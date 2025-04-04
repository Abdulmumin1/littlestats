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
            } catch (error) {}
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
    let uniquePages = new Map();
    let loading_indicator = [1]; // Consider updating or removing this if it's unnecessary

    // Loop through all events
    for (let index = 0; index < events.length; index++) {
        const event = events[index];
        const timezone = event.timezone;

        // Check if the timezone exists and is not empty
        let country = 'United States of America'; // Default fallback

        if (timezone && timezone.trim() !== '') {
            try {
                country = getCountry(timezone) || 'Unknown'; // Fallback if getCountry returns falsy
                // Update the uniquePages Map
                if (!uniquePages.has(country)) {
                    uniquePages.set(country, 1);
                } else {
                    uniquePages.set(country, uniquePages.get(country) + 1);
                }
            } catch (error) {
                if (!uniquePages.has(country)) {
                    uniquePages.set(country, 1);
                } else {
                    uniquePages.set(country, uniquePages.get(country) + 1);
                }
            }
        } else {
            // If no timezone, set country as 'Unknown'
            if (!uniquePages.has(country)) {
                uniquePages.set(country, 1);
            } else {
                uniquePages.set(country, uniquePages.get(country) + 1);
            }
        }
    }

    // Sort the uniquePages Map by frequency (highest to lowest)
    return Array.from(uniquePages).sort((a, b) => b[1] - a[1]);
}

export function sumData(d) {
	return Math.max(...d.map((item) => item[1]));
}


export function sortData(events){
    return [sortReferals(events), sortCountryData(events)]
}