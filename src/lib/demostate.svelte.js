export let dashboardInterval = 30


export class DateRange {
    range = $state(14);
  
    getRange() {
      return this.range;
    }
  
    setRange(message) {
      this.range = message <= 0 ? 1 : message;
    }
  
    clearRange() {
      this.range = 14;
    }

  }
  
export let defaultRange = new DateRange();

export const optis = [
    { value: 1, label: 'Last 24 hours' },
    { value: 7, label: 'Last 7 days' },
    { value: 14, label: 'Last 14 days' },
    { value: 21, label: 'Last 21 days' },
    { value: 30, label: 'Last 30 days' },
    { value: 60, label: 'Last 60 days' },
    { value: 90, label: 'Last 90 days' }
];
