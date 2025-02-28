<script>
	import LogItem from './../analytics/logItem.svelte';
	import { onMount } from 'svelte';
	import { color } from '$lib/colors/mixer.js';
	import { flip } from 'svelte/animate';
	import Dropdown from '$lib/components/generals/dropdown.svelte';
	import LoadingState from '$lib/components/analytics/graphStuff/loadingState.svelte';
	import { deserialize } from '$app/forms';
	import ChartJsGraph from '$lib/components/analytics/graphStuff/chartJsGraph.svelte';
	import { defaultRange as globalRange, optis } from '$lib/globalstate.svelte.js';
	import BottomDrawer from '$lib/components/generals/bottomDrawer.svelte';
	import DemoLoadingState from './../analytics/graphStuff/demoLoadingState.svelte';
	
	// lib/helpers/logGenerator.js
        export function generateDummyLogs(count = 100) {
            const levels = ['error', 'warning', 'info', 'debug'];
            const sources = ['server', 'client', 'api', 'database', 'auth'];
            const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
            const statusCodes = [200, 201, 400, 401, 403, 404, 500];
            const endpoints = [
                '/api/users',
                '/api/auth/login',
                '/api/products',
                '/api/orders',
                '/healthcheck'
            ];
            const userAgents = [
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Mozilla/5.0 (Linux; Android 10; SM-G960U) AppleWebKit/537.36',
                'curl/7.68.0',
                'PostmanRuntime/7.26.8'
            ];
            const ips = Array.from(
                { length: 50 },
                () =>
                    `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
            );

            const logs = [];

            for (let i = 0; i < count; i++) {
                const level = levels[Math.floor(Math.random() * levels.length)];
                const source = sources[Math.floor(Math.random() * sources.length)];
                const timestamp = new Date(
                    Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
                ).toISOString();

                const baseLog = {
                    id: `log_${Math.random().toString(36).substr(2, 9)}`,
                    timestamp,
                    level,
                    source,
                    message: '',
                    context: {},
                    ip: ips[Math.floor(Math.random() * ips.length)],
                    user_agent: userAgents[Math.floor(Math.random() * userAgents.length)],
                    session_id: Math.random().toString(36).substr(2, 12)
                };

                // Add source-specific context
                switch (source) {
                    case 'api':
                        baseLog.message = `${methods[Math.floor(Math.random() * methods.length)]} ${
                            endpoints[Math.floor(Math.random() * endpoints.length)]
                        }`;
                        baseLog.context = {
                            method: methods[Math.floor(Math.random() * methods.length)],
                            endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
                            status: statusCodes[Math.floor(Math.random() * statusCodes.length)],
                            response_time: Math.random() * 1000,
                            request_id: `req_${Math.random().toString(36).substr(2, 9)}`
                        };
                        break;

                    case 'database':
                        baseLog.message = `Query executed`;
                        baseLog.context = {
                            query_time: Math.random() * 500,
                            query: `SELECT * FROM ${['users', 'products', 'orders'][Math.floor(Math.random() * 3)]}`
                        };
                        break;

                    case 'auth':
                        baseLog.message = `User ${
                            ['login', 'logout', 'failed_login'][Math.floor(Math.random() * 3)]
                        } attempt`;
                        baseLog.context = {
                            user_id: `user_${Math.random().toString(36).substr(2, 6)}`,
                            provider: ['google', 'email', 'github'][Math.floor(Math.random() * 3)]
                        };
                        break;

                    default:
                        baseLog.message = `Sample ${level} message from ${source}`;
                        baseLog.context = {
                            details: `Additional ${level} information`,
                            ...(level === 'error' && {
                                stack_trace: `Error: Sample error\n    at module (file.js:10:5)`
                            })
                        };
                }

                logs.push(baseLog);
            }

            return logs;
        }

	let { data } = $props();
	let log_data = $state(generateDummyLogs());
	let sortInterval = $state(1);
	let loading = $state(false);

    const levelColors = {
		error: 'red',
		warning: 'yellow',
		info: 'sky',
		debug: 'purple'
	};

	// Updated analytics functions
	function bucketLogsByLevel(logs) {
		return logs.reduce((acc, log) => {
			acc[log.level] = acc[log.level] || [];
			acc[log.level].push(log);
			return acc;
		}, {});
	}

	function extractLogMetadata(logs) {
		return logs.reduce(
			(acc, log) => {
				// Source statistics
				acc.sources[log.source] = (acc.sources[log.source] || 0) + 1;

				// Status code statistics (for API logs)
				if (log.source === 'api' && log.context.status) {
					acc.statusCodes[log.context.status] = (acc.statusCodes[log.context.status] || 0) + 1;
				}

				// Method statistics (for API logs)
				if (log.source === 'api' && log.context.method) {
					acc.methods[log.context.method] = (acc.methods[log.context.method] || 0) + 1;
				}

				return acc;
			},
			{ sources: {}, statusCodes: {}, methods: {} }
		);
	}

	let logBuckets = $derived(Object.entries(bucketLogsByLevel(log_data)));
	let activeLogLevel = $state(0);
	let activeLogs = $derived(logBuckets.length > 0 ? logBuckets[activeLogLevel][1] : []);
	let logMetadata = $derived(extractLogMetadata(log_data));

	async function handleDateChange(event) {
		const date = event.detail.value;
		await fetchLogs(date);
		sortInterval = parseInt(date);
		globalRange.setRange(sortInterval);
	}

	async function fetchLogs(date) {
		loading = true;
		const form = new FormData();
		form.append('defaultRange', date);
		form.append('domain_id', data.domain_id);

		const response = await fetch('?/fetchLogs', { method: 'POST', body: form });
		if (response.ok) {
			const result = deserialize(await response.text());
			log_data = result.data.records;
			data.records = log_data;
		}
		loading = false;
	}

	// onMount(async () => {
	// 	let date = globalRange.getRange();
	// 	await fetchLogs(date);
	// 	sortInterval = parseInt(date);
	// });
</script>

{#if loading}
	<DemoLoadingState />
{/if}

<div class="min-h-screen p-4 text-white">
	
	<div class="mt-5 flex flex-col gap-8">
		<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
			<div class="bg-{color}-100/50 p-4 dark:bg-stone-800/50">
				<h3 class="text-sm text-gray-400">Total Logs</h3>
				<p class="text-2xl font-bold">{log_data.length}</p>
			</div>
			<!-- <div class="bg-{color}-100/50 p-4 dark:bg-stone-800/50">
				<h3 class="text-sm text-gray-400">Errors</h3>
              
				<p class="text-2xl font-bold text-red-500">{logMetadata.sources.error || 0}</p>
			</div>
			<div class="bg-{color}-100/50 p-4 dark:bg-stone-800/50">
				<h3 class="text-sm text-gray-400">Warnings</h3>
				<p class="text-2xl font-bold text-yellow-500">{logMetadata.sources.warning || 0}</p>
			</div> -->
                <div class="bg-{color}-100/50 p-4 dark:bg-stone-800/50">
                    <h3 class="text-sm text-gray-400">Most Common Status</h3>
                    <p class="text-2xl font-bold">
                        {Object.entries(logMetadata.statusCodes)[0]?.[0] || 'N/A'}
                    </p>
                </div>
                <div class="bg-{color}-100/50 p-4 dark:bg-stone-800/50">
                    <h3 class="text-sm text-gray-400">Most Used Method</h3>
                    <p class="text-2xl font-bold">{Object.entries(logMetadata.methods)[0]?.[0] || 'N/A'}</p>
                </div>
			<div class="bg-{color}-100/50 p-4 dark:bg-stone-800/50">
				<h3 class="text-sm text-gray-400">Most Common Source</h3>
				<p class="text-2xl font-bold">{Object.entries(logMetadata.sources)[0]?.[0] || 'N/A'}</p>
			</div>
		</div>

		<div class="flex flex-col gap-6 md:flex-row-reverse">
			<div class="flex-1">
				<h2 class="mb-4 text-xl font-bold">Log Levels</h2>
				<div class="flex max-w-xl flex-wrap gap-2">
					{#each logBuckets as [level, logs], index}
						<!-- {#if level != 'error' || level !="warning"} -->
						<button
							on:click={() => (activeLogLevel = index)}
							class="flex flex-1 flex-col gap-4 rounded-lg bg-{$color}-100/50 p-4 transition-colors dark:bg-stone-800/50  {activeLogLevel == index? `border-2 border-${levelColors[logBuckets[activeLogLevel][0]]}-500`:''}"
						>
							<!-- class:bg-{color}-600={activeLogLevel === index} -->
							<!-- class:bg-{color}-100/50={activeLogLevel !== index} -->
							<span class="text-sm capitalize text-gray-400">{level}</span>
							<span class="rounded-full bg-black/20 px-1 py-2 text-2xl font-bold text-{levelColors[logBuckets[index][0]]}-500">
								{logs.length}
							</span>
						</button>
						<!-- {/if} -->
					{/each}
				</div>
			</div>

			
		</div>

		<div class="rounded-lg bg-{$color}-100/50 dark:bg-stone-800">
			<h2 class="p-4 text-xl font-bold">Recent Log Entries</h2>
			<div class="max-h-[600px] overflow-y-auto p-4">
				{#each activeLogs as log}
					<LogItem
						level={log.level}
						timestamp={log.timestamp}
						source={log.source}
						message={log.message}
						context={log.context}
                        user_agent={log.user_agent}
						ip={log.ip}
					/>
				{:else}
					<div class="p-4 text-gray-400">No logs found in this period</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.min-h-screen {
		min-height: 100vh;
	}

	.log-level-error {
		color: theme('colors.red.500');
	}

	.log-level-warning {
		color: theme('colors.yellow.500');
	}

	.log-level-info {
		color: theme('colors.blue.500');
	}
</style>
