<script>

	// --- Utility Functions ---

	// A helper function to get the ISO week number.
	// (There are many ways to implement this; this is one example.)
	function getISOWeekNumber(date) {
		const target = new Date(date.valueOf());
		const dayNr = (date.getDay() + 6) % 7;
		target.setDate(target.getDate() - dayNr + 3);
		const firstThursday = target.valueOf();
		target.setMonth(0, 1);
		if (target.getDay() !== 4) {
			target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
		}
		return 1 + Math.ceil((firstThursday - target) / 604800000);
	}

	function getWeekDateRangeFormatted(isoWeekString) {
		const [year, week] = isoWeekString.split('-W').map(Number);

		// Get the first day of the year
		const firstDayOfYear = new Date(year, 0, 1);

		// Find the first Thursday of the year (ISO 8601: week 1 must contain Jan 4)
		const firstThursday = new Date(year, 0, 4);
		const dayOfWeek = firstThursday.getDay(); // 0 (Sun) to 6 (Sat)
		const diff = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek; // Adjust to Monday
		firstThursday.setDate(firstThursday.getDate() + diff);

		// Calculate the start of the given week (Monday)
		const startOfWeek = new Date(firstThursday);
		startOfWeek.setDate(firstThursday.getDate() + (week - 1) * 7);

		// End of the week (Sunday)
		const endOfWeek = new Date(startOfWeek);
		endOfWeek.setDate(startOfWeek.getDate() + 6);

		// Format date as "Feb 3"
		const formatDate = (date) =>
			date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

		return `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
	}

	console.log(getWeekDateRangeFormatted('2025-W6'));

	// NOTE:
	// The original function uses `baseWeek.intersection(weekUsers)`.
	// However, JavaScript’s Set does not include an `intersection` method by default.
	// We define one here on the prototype. (Alternatively, you could write a helper function.)
	if (!Set.prototype.intersection) {
		Set.prototype.intersection = function (setB) {
			const _intersection = new Set();
			for (const elem of setB) {
				if (this.has(elem)) {
					_intersection.add(elem);
				}
			}
			return _intersection;
		};
	}

	// --- Your Calculation Functions ---

	// Calculate a mapping from weekKey -> Set of user IDs.
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

	// Calculate retention data.
	// Corrections and notes:
	// 1. It’s a good idea to sort the week keys to get a chronological order.
	// 2. The inner loop now starts from the current week index rather than always at 1.
	// 3. We removed the empty try/catch so errors are not silently swallowed.
	export function calculateRetension(events) {
		const raw = calculateWeeklyUsersRaw(events);
		const keys = Object.keys(raw).sort(); // sort weeks chronologically
		let weeklyComebacks = {};

		for (let i = 0; i < keys.length; i++) {
			const baseKey = keys[i];
			const baseWeek = raw[baseKey];
			if (!weeklyComebacks[baseKey]) {
				weeklyComebacks[baseKey] = {};
			}
			// Calculate retention for each week from the base week forward
			for (let j = i; j < keys.length; j++) {
				const otherKey = keys[j];
				const weekUsers = raw[otherKey];
				const comebacks = baseWeek.intersection(weekUsers);
				weeklyComebacks[baseKey][otherKey] = comebacks;
			}
		}

		// Convert Sets to counts
		const weeklyCounts = {};
		for (const baseKey in weeklyComebacks) {
			weeklyCounts[baseKey] = {};
			for (const otherKey in weeklyComebacks[baseKey]) {
				weeklyCounts[baseKey][otherKey] = weeklyComebacks[baseKey][otherKey].size;
			}
		}
		return weeklyCounts;
	}

	// --- Sample Data & Reactive Calculation ---

	// Here’s some sample event data.
	// In your application, this data might come from an API or props.
	let {
		events = [
			{ timestamp: '2025-02-03T10:00:00Z', user_id: 'user1' },
			{ timestamp: '2025-02-03T12:00:00Z', user_id: 'user2' },
			{ timestamp: '2025-02-10T09:00:00Z', user_id: 'user1' },
			{ timestamp: '2025-02-10T11:00:00Z', user_id: 'user3' }
		]
	} = $props();

	// Compute the retention data.
	// For example, the output might look like:
	// {
	//   "2025-W6": { "2025-W6": 2, "2025-W7": 1 },
	//   "2025-W7": { "2025-W7": 2 }
	// }
	// console.log(events)
	let retention = calculateRetension(events);
</script>

<h2>Weekly Retention</h2>
{#if retention && Object.keys(retention).length > 0}
	<table>
		<thead>
			<tr>
				<th>Base Week</th>
				<!-- Use the first row's keys for the table headers -->
				{#each Object.keys(retention[Object.keys(retention)[0]]) as weekKey}
					<th>{weekKey}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each Object.entries(retention) as [baseWeek, retentionData]}
				<tr>
					<td>{getWeekDateRangeFormatted(baseWeek)}</td>
					{#each Object.entries(retentionData) as [otherWeek, count]}
						<td>{count}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
{:else}
	<p>No retention data to display.</p>
{/if}

<!--
    Notes on potential issues in the original code:
  
    1. **Set Intersection:**  
       The code calls `baseWeek.intersection(weekUsers)`, but JavaScript Sets do not have a built-in intersection method.
       You need to implement it (as shown above) or use a helper function.
  
    2. **Loop Indices:**  
       In the original code, the inner loop always started at 1 (`for (let otherweek = 1; ...`), which may not correctly align with the base week.
       The corrected version starts the inner loop from the current base week index, ensuring that retention is calculated for the base week
       and all subsequent weeks.
  
    3. **Key Ordering:**  
       The original code uses `Object.keys(raw)` without sorting. Sorting the week keys ensures that the retention table is in chronological order.
  
    4. **Error Handling:**  
       The try/catch block in the original code silently ignores errors when accessing `.size`.
       Removing it helps surface any potential issues during development.
  -->

<style>
	table {
		border-collapse: collapse;
		width: 100%;
		margin-top: 1rem;
	}
	th,
	td {
		border: 1px solid #ccc;
		padding: 0.5rem;
		text-align: center;
	}
</style>


