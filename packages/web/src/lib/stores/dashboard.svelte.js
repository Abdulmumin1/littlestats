import { toLocalDateKey } from '$lib/utils/dateRange.js';

class DashboardStore {
    #getDefaultRange() {
		const end = new Date();
		const start = new Date(end);
		start.setDate(start.getDate() - 29);
        return {
			startDate: toLocalDateKey(start),
			endDate: toLocalDateKey(end)
        };
    }

    dateRange = $state({
        ...this.#getDefaultRange()
    });

    setDateRange(start, end) {
        this.dateRange = {
            startDate: start,
            endDate: end
        };
    }
}

export const dashboardStore = new DashboardStore();
