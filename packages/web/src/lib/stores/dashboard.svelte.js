class DashboardStore {
    dateRange = $state({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    setDateRange(start, end) {
        this.dateRange = {
            startDate: start,
            endDate: end
        };
    }
}

export const dashboardStore = new DashboardStore();
