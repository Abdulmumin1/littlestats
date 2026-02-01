import { deserialize } from '$app/forms';

export async function fetchUpdates(domain_id , lastEvent) {
    try {
        const form = new FormData();
		form.append('lastEvent', lastEvent);
		form.append('domain_id', domain_id);

		const response = await fetch('?/fetchLatest', { method: 'POST', body: form });
        if (response.ok){
            let res = deserialize(await response.text())
            return res.data
        }else{
            return []
        }
    } catch (error) {
        console.error("ClickHouse fetch error:", error);
        return 'do_need_to_retry'
    }
}
