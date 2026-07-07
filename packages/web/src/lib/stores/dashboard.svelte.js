import { toLocalDateKey } from '$lib/utils/dateRange.js';

class DashboardStore {
    #getDefaultRange() {
        return {
            startDate: toLocalDateKey(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: toLocalDateKey(new Date())
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
