export let dashboardInterval = 30


export class DateRange {
  isCustom = $state(false);
  range = $state([new Date().toISOString(), new Date().toISOString()])
  single = $state(7);

  getSingle() {
    return this.single;
  }

  getCustom() {
    return this.isCustom;
  }

  setSingle(days) {
    this.single = days <= 0 ? 1 : days;
    const [start, end] = this.getDateRangeFromInterval(days)
    this.setRange(start, end)
  }

  getRange() { return this.range }
  getRangeInterval() { 
    return Math.ceil(
      (new Date(this.range[1]).getTime() - new Date(this.range[0]).getTime()) / (1000 * 60 * 60 * 24)
    ) }

  getDateRangeFromInterval(days) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    return [startDate, endDate];
  }

  setRange(start, end) {
    this.range = [start, end]
  }

  setCustom(bool) {
    this.isCustom = bool;
  }

  clearRange() {
    this.single = 7;
  }


}




class DataCache {
  cache = $state({});

  getCache(key) {
    // console.log(key, this.cache)
    return this.cache?.[key];
  }

  setCach(key, value) {
    this.cache = { ...this.cache, ...Object.fromEntries([[key, value]]) }
  }

  clearCache() {
    this.cache = {};
  }

}

export let defaultRange = new DateRange();
export let datacache = new DataCache()

export const optis = [
  { value: 1, label: 'Last 24 hours' },
  { value: 7, label: 'Last 7 days' },
  { value: 14, label: 'Last 14 days' },
  { value: 21, label: 'Last 21 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 60, label: 'Last 60 days' },
  { value: 90, label: 'Last 90 days' }
];
