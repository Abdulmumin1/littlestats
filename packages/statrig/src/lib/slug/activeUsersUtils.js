
/**
 * Calculate Daily Active Users (DAU) from an array of event objects.
 * Each key in the returned object is a date (YYYY-MM-DD) and the value is the count of unique users on that day.
 *
 * @param {Array} events - Array of event objects.
 * @returns {Object} - { '2025-02-13': 10, '2025-02-14': 12, ... }
 */
export function calculateDailyActiveUsers(events) {
	const dailyUsers = {};
	events.forEach((event) => {
		if (!event.timestamp || !event.user_id) return;
		// Create a date string in YYYY-MM-DD format
		const dateStr = new Date(event.timestamp).toISOString().split('T')[0];
		if (!dailyUsers[dateStr]) {
			dailyUsers[dateStr] = new Set();
		}
		dailyUsers[dateStr].add(event.user_id);
	});
	// Convert the sets to counts
	const dailyCounts = {};
	for (const date in dailyUsers) {
		dailyCounts[date] = dailyUsers[date].size;
	}
	// console.log(dailyCounts);
	return dailyCounts;
}

/**
 * Helper: Returns the ISO week number for a given date.
 * (ISO weeks start on Monday, and the first week of the year is the one with January 4th.)
 *
 * @param {Date} date
 * @returns {number} - The ISO week number.
 */
function getISOWeekNumber(date) {
	const tmpDate = new Date(date.getTime());
	tmpDate.setUTCHours(0, 0, 0, 0);
	// Shift date to Thursday in current week (ISO standard)
	tmpDate.setDate(tmpDate.getDate() + 3 - ((tmpDate.getDay() + 6) % 7));
	// January 4th is always in week 1.
	const week1 = new Date(Date.UTC(tmpDate.getFullYear(), 0, 4));
	return (
		1 +
		Math.round(
			((tmpDate.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
		)
	);
}

/**
 * Calculate Weekly Active Users (WAU) from an array of event objects.
 * The function groups events by ISO week. Each key in the returned object is a string like "2025-W7"
 * and the value is the count of unique users in that week.
 *
 * @param {Array} events - Array of event objects.
 * @returns {Object} - { '2025-W7': 50, '2025-W8': 45, ... }
 */
export function calculateWeeklyActiveUsers(events) {
	const weeklyUsers = {};
	const weeklyCombacks = {};
	events.forEach((event) => {
		if (!event.timestamp || !event.user_id) return;
		const date = new Date(event.timestamp);
		const year = date.getFullYear();
		const week = getISOWeekNumber(date);
		const weekKey = `${year}-W${week}`;
		if (!weeklyUsers[weekKey]) {
			weeklyUsers[weekKey] = new Set();
		}
		weeklyUsers[weekKey].add(event.user_id);
	});
	// Convert the sets to counts
	const weeklyCounts = {};
	for (const weekKey in weeklyUsers) {
		weeklyCounts[weekKey] = weeklyUsers[weekKey].size;
	}
	console.log(weeklyCounts);
	return weeklyCounts;
}

export function calculateWeeklyUsersRaw(events) {
	const weeklyUsers = {};
	events.forEach((event) => {
		if (!event.timestamp || !event.user_id) return;
		const date = new Date(event.timestamp);
		const year = date.getFullYear();
		const week = getISOWeekNumber(date);
		const weekKey = `${year}-W${week}`;
		if (!weeklyUsers[weekKey]) {
			weeklyUsers[weekKey] = new Set();
		}
		weeklyUsers[weekKey].add(event.user_id);
	});
	return weeklyUsers;
}

export function calculateRetension(events) {
  const raw  = calculateWeeklyUsersRaw(events)
  // console.log('Raw', raw)
	const keys = Object.keys(raw);
	let weeklyCombacks = {};

	for (let week = 0; week < keys.length; week++) {
    let baseKey = keys[week]
		let baseWeek = raw[baseKey];
    if (!weeklyCombacks[baseKey]){
      weeklyCombacks[baseKey] = {}
    }
		weeklyCombacks[baseKey][baseKey] = baseWeek;
		for (let otherweek = 1; otherweek < keys.length; otherweek++) {
      let otherKey = keys[otherweek]
			let weekUsers = raw[otherKey];
			let comebacks = baseWeek.intersection(weekUsers);
			weeklyCombacks[baseKey][otherKey] = comebacks;
		}
	}
  console.log(weeklyCombacks)
  const weeklyCounts = {};
	for (const weekKey in weeklyCombacks) {
    for (const otherKey in weeklyCombacks) {
      if (!weeklyCounts[weekKey]){
        weeklyCounts[weekKey] = {}
      }
      console.log(weekKey, otherKey)
      try{

        weeklyCounts[weekKey][otherKey] = weeklyCombacks[weekKey][otherKey].size;
      }catch{}
    }
	}

  return weeklyCounts
}

/**
 * Transform active user data (either DAU or WAU) into an array of objects
 * that can be used by Chart.js in your generic Chart component.
 *
 * Example input: { '2025-02-13': 10, '2025-02-14': 12, ... }
 * Output: [{ myX: '2025-02-13', myY: 10 }, { myX: '2025-02-14', myY: 12 }, ... ]
 *
 * @param {Object} activeUsersData - Object mapping labels (date or week) to counts.
 * @returns {Array} - Array of data points.
 */
export function transformActiveUsersDataForGraph(activeUsersData) {
	// It’s often helpful to sort the keys so the chart shows data chronologically.
	const sortedKeys = Object.keys(activeUsersData).sort();
	return sortedKeys.map((key) => ({
		myX: key,
		myY: activeUsersData[key]
	}));
}

/**
 * Calculate the number of unique users active in the last X days.
 *
 * @param {Array} events - Array of event objects.
 * @param {number} days - Number of days to look back.
 * @returns {number} - Count of unique active users in the last X days.
 */
export function calculateActiveUsersLastXDays(events, days) {
	const threshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
	const users = new Set();
	events.forEach((event) => {
		if (!event.timestamp || !event.user_id) return;
		const eventDate = new Date(event.timestamp);
		if (eventDate >= threshold) {
			users.add(event.user_id);
		}
	});
	return users.size;
}

/**
 * Calculate the number of unique users active in the last 24 hours.
 *
 * @param {Array} events - Array of event objects.
 * @returns {number} - Count of unique active users in the last 24 hours.
 */
export function calculateActiveUsersLast24Hours(events) {
	// Since 24 hours is just 1 day, this function is similar to the above with days = 1.
	return calculateActiveUsersLastXDays(events, 1);
}

export function calculateAverageValue(values) {
	let a = Array.from(Object.values(values));
	if (a.length < 1) return 0;
	let average = a.reduce((a, b) => a + b) / a.length;
	return parseInt(average);
}
