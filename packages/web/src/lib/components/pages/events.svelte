<script>
	import { ChevronDown, Search } from 'lucide-svelte';
	import CustomSelect from '$lib/components/generals/customSelect.svelte';

	let {
		page_data = [],
		eventCounts = [],
		selectedEventName = null,
		selectEvent = () => {},
		loadMore = () => {},
		nextCursor = null,
		loadingLog = false,
		totalLogEvents = 0
	} = $props();

	let eventSearch = $state('');
	let logSearch = $state('');
	let filterPage = $state('');
	let filterReferrer = $state('');
	let expanded = $state(null);

	function parseProperties(value) {
		if (!value) return null;
		if (typeof value === 'object') return value;
		try {
			return JSON.parse(value);
		} catch {
			return null;
		}
	}

	function displayValue(value) {
		if (typeof value === 'string') return value;
		if (typeof value === 'number' || typeof value === 'boolean') return String(value);
		try {
			return JSON.stringify(value);
		} catch {
			return '[object]';
		}
	}

	let eventTotal = $derived(eventCounts.reduce((total, event) => total + Number(event.count || 0), 0));
	let visibleEventNames = $derived.by(() => {
		const query = eventSearch.trim().toLowerCase();
		return eventCounts.filter((event) => !query || String(event.name || '').toLowerCase().includes(query));
	});

	let rows = $derived.by(() => {
		return (page_data || []).map((event, index) => {
			let pagePath = event?.url || '/';
			try {
				pagePath = new URL(event.url, 'https://littlestats.invalid').pathname || '/';
			} catch {}

			let referrer = event?.referrer || 'Direct';
			try {
				referrer = new URL(event.referrer).hostname || 'Direct';
			} catch {}

			const properties = parseProperties(event?.event_data);
			const propertyEntries = properties && typeof properties === 'object'
				? Object.entries(properties).filter(([key, value]) => key !== 'memory' && value != null)
				: [];
			const timestamp = event?.timestamp ? new Date(event.timestamp) : null;
			const validTimestamp = timestamp && !Number.isNaN(timestamp.getTime()) ? timestamp : null;
			const when = validTimestamp
				? validTimestamp.toLocaleString(undefined, {
						month: 'short',
						day: 'numeric',
						hour: 'numeric',
						minute: '2-digit',
						second: '2-digit'
					})
				: 'Unknown time';
			const searchable = [
				event?.event_name,
				event?.user_id,
				pagePath,
				referrer,
				...propertyEntries.flatMap(([key, value]) => [key, displayValue(value)])
			]
				.join(' ')
				.toLowerCase();

			return {
				...event,
				_key: event?.id ?? `${event?.timestamp}-${index}`,
				pagePath,
				referrer,
				propertyEntries,
				when,
				searchable
			};
		});
	});

	let availablePages = $derived(
		Array.from(new Set(rows.map((event) => event.pagePath).filter(Boolean))).sort((a, b) => a.localeCompare(b))
	);
	let availableReferrers = $derived(
		Array.from(new Set(rows.map((event) => event.referrer).filter(Boolean))).sort((a, b) => a.localeCompare(b))
	);
	let filteredRows = $derived.by(() => {
		const query = logSearch.trim().toLowerCase();
		return rows.filter((event) => {
			if (filterPage && event.pagePath !== filterPage) return false;
			if (filterReferrer && event.referrer !== filterReferrer) return false;
			return !query || event.searchable.includes(query);
		});
	});
	let loadedUsers = $derived(new Set(filteredRows.map((event) => event.user_id).filter(Boolean)).size);
	let activeTitle = $derived(selectedEventName || 'All custom events');

	function chooseEvent(name) {
		expanded = null;
		filterPage = '';
		filterReferrer = '';
		selectEvent(name);
	}
</script>

<div class="space-y-5">
	<header class="flex flex-col gap-2 px-1 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<h1 class="text-xl font-bold tracking-tight text-stone-900 dark:text-white">Events</h1>
			<p class="mt-1 text-sm text-stone-500 dark:text-stone-400">Inspect the product actions your app sends.</p>
		</div>
		<p class="text-xs text-stone-400"><span class="font-bold tabular-nums text-stone-700 dark:text-stone-200">{eventTotal.toLocaleString()}</span> custom events in range</p>
	</header>

	<div class="grid overflow-hidden border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-950 lg:grid-cols-[17rem_minmax(0,1fr)]">
		<aside class="border-b border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-900 lg:border-b-0 lg:border-r">
			<div class="border-b border-stone-200 p-3 dark:border-stone-800">
				<label class="relative block">
					<span class="sr-only">Search event names</span>
					<Search size={14} class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
					<input bind:value={eventSearch} placeholder="Find an event" class="w-full border border-stone-200 bg-white py-2 pl-9 pr-3 text-xs text-stone-900 outline-none focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-white" />
				</label>
			</div>

			<nav class="max-h-72 overflow-y-auto p-2 lg:max-h-[calc(100vh-15rem)]" aria-label="Event names">
				<button type="button" onclick={() => chooseEvent(null)} class="flex w-full items-center justify-between px-3 py-2.5 text-left text-xs transition-colors {selectedEventName ? 'text-stone-500 hover:bg-white dark:hover:bg-stone-800' : 'bg-white font-bold text-stone-900 dark:bg-stone-950 dark:text-white'}">
					<span>All events</span>
					<span class="tabular-nums text-stone-400">{eventTotal.toLocaleString()}</span>
				</button>
				{#each visibleEventNames as event (event.name)}
					<button type="button" onclick={() => chooseEvent(event.name)} class="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-xs transition-colors {selectedEventName === event.name ? 'bg-white font-bold text-stone-900 dark:bg-stone-950 dark:text-white' : 'text-stone-600 hover:bg-white dark:text-stone-300 dark:hover:bg-stone-800'}">
						<span class="truncate">{event.name}</span>
						<span class="shrink-0 tabular-nums text-stone-400">{Number(event.count || 0).toLocaleString()}</span>
					</button>
				{:else}
					<p class="px-3 py-8 text-center text-xs text-stone-400">{eventSearch ? 'No matching events' : 'No custom events yet'}</p>
				{/each}
			</nav>
		</aside>

		<section class="min-w-0">
			<div class="flex flex-col gap-1 border-b border-stone-200 px-4 py-3 dark:border-stone-800 sm:flex-row sm:items-center sm:justify-between">
				<h2 class="truncate text-sm font-bold text-stone-900 dark:text-white">{activeTitle}</h2>
				<p class="text-xs text-stone-400">
					<span class="font-semibold text-stone-600 dark:text-stone-300">{totalLogEvents.toLocaleString()}</span> triggers
					{#if loadedUsers} · {loadedUsers.toLocaleString()} loaded users{/if}
				</p>
			</div>

			<div class="grid gap-2 border-b border-stone-200 bg-stone-50 p-3 dark:border-stone-800 dark:bg-stone-900 sm:grid-cols-2 xl:grid-cols-[minmax(12rem,1fr)_11rem_11rem]">
				<label class="relative block">
					<span class="sr-only">Search event log</span>
					<Search size={14} class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
					<input bind:value={logSearch} placeholder="Search user, page or property" class="h-9 w-full border border-stone-200 bg-white pl-9 pr-3 text-xs text-stone-900 outline-none focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-white" />
				</label>
				<CustomSelect bind:value={filterPage} options={[{ value: '', label: 'All pages' }, ...availablePages.map((page) => ({ value: page, label: page }))]} />
				<CustomSelect bind:value={filterReferrer} options={[{ value: '', label: 'All sources' }, ...availableReferrers.map((referrer) => ({ value: referrer, label: referrer }))]} />
			</div>

			<div class="overflow-x-auto">
				<table class="w-full min-w-[760px] table-fixed">
					<thead class="border-b border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-950">
						<tr class="text-left text-[10px] font-bold uppercase tracking-widest text-stone-400">
							<th class="w-[18%] px-4 py-3">Event</th>
							<th class="w-[18%] px-4 py-3">When</th>
							<th class="w-[24%] px-4 py-3">Page</th>
							<th class="w-[16%] px-4 py-3">User</th>
							<th class="px-4 py-3">Details</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-stone-100 dark:divide-stone-800">
						{#each filteredRows as event (event._key)}
							<tr class="cursor-pointer align-top text-xs hover:bg-stone-50 dark:hover:bg-stone-900" onclick={() => (expanded = expanded === event._key ? null : event._key)}>
								<td class="px-4 py-3 font-semibold text-stone-900 dark:text-white"><p class="truncate">{event.event_name || 'Custom event'}</p></td>
								<td class="px-4 py-3 text-stone-500 dark:text-stone-400"><p class="truncate">{event.when}</p></td>
								<td class="px-4 py-3">
									<p class="truncate font-mono text-stone-700 dark:text-stone-200">{event.pagePath}</p>
									{#if event.referrer !== 'Direct'}<p class="mt-1 truncate text-[10px] text-stone-400">from {event.referrer}</p>{/if}
								</td>
								<td class="px-4 py-3 font-mono text-stone-500 dark:text-stone-400"><p class="truncate">{event.user_id?.slice(0, 8) || 'Anonymous'}</p></td>
								<td class="px-4 py-3">
									<div class="flex items-start justify-between gap-2">
										<div class="min-w-0 space-y-1">
											{#each event.propertyEntries.slice(0, 2) as [key, value] (key)}
												<p class="truncate font-mono text-[10px] text-stone-500"><span class="text-stone-800 dark:text-stone-200">{key}</span>: {displayValue(value)}</p>
											{:else}
												<span class="text-stone-300">—</span>
											{/each}
										</div>
										<ChevronDown size={14} class="mt-0.5 shrink-0 text-stone-400 transition-transform {expanded === event._key ? 'rotate-180' : ''}" />
									</div>
								</td>
							</tr>
							{#if expanded === event._key}
								<tr class="bg-stone-50 text-xs dark:bg-stone-900">
									<td colspan="5" class="px-4 py-4">
										<div class="grid gap-4 sm:grid-cols-3">
											<div><p class="mb-1 text-[10px] font-bold uppercase tracking-widest text-stone-400">User</p><p class="break-all font-mono text-stone-700 dark:text-stone-200">{event.user_id || 'Anonymous'}</p></div>
											<div><p class="mb-1 text-[10px] font-bold uppercase tracking-widest text-stone-400">Source</p><p class="break-all text-stone-700 dark:text-stone-200">{event.referrer}</p></div>
											<div><p class="mb-1 text-[10px] font-bold uppercase tracking-widest text-stone-400">Client</p><p class="text-stone-700 dark:text-stone-200">{[event.language, event.timezone].filter(Boolean).join(' · ') || 'Unknown'}</p></div>
										</div>
										{#if event.propertyEntries.length}
											<div class="mt-4 border-t border-stone-200 pt-4 dark:border-stone-800">
												<p class="mb-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">Properties</p>
												<div class="grid gap-x-6 gap-y-2 sm:grid-cols-2">
													{#each event.propertyEntries as [key, value] (key)}
														<p class="break-words font-mono text-stone-600 dark:text-stone-300"><span class="font-semibold text-stone-900 dark:text-white">{key}</span>: {displayValue(value)}</p>
													{/each}
												</div>
											</div>
										{/if}
									</td>
								</tr>
							{/if}
						{:else}
							<tr><td colspan="5" class="px-6 py-20 text-center"><p class="text-sm font-medium text-stone-600 dark:text-stone-300">No custom events in this view</p><p class="mt-1 text-xs text-stone-400">Change the date range or clear a filter.</p></td></tr>
						{/each}
					</tbody>
				</table>
			</div>

			<footer class="flex items-center justify-between border-t border-stone-200 bg-stone-50 px-4 py-3 text-xs text-stone-400 dark:border-stone-800 dark:bg-stone-900">
				<span>{filteredRows.length.toLocaleString()} loaded</span>
				{#if nextCursor}
					<button type="button" onclick={loadMore} disabled={loadingLog} class="border border-stone-300 bg-white px-3 py-1.5 font-semibold text-stone-700 hover:border-stone-500 disabled:opacity-50 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200">
						{loadingLog ? 'Loading…' : 'Load more'}
					</button>
				{/if}
			</footer>
		</section>
	</div>
</div>
