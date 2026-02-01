<!-- src/lib/components/logs/LogItem.svelte -->
<script>
	import { Clipboard, ChevronDown, AlertCircle, Info, Bug, ShieldAlert, Database, LockKeyhole, Server, Monitor } from 'lucide-svelte';
	import { fade, slide } from 'svelte/transition';

	export let level;
	export let timestamp;
	export let message;
	export let context = {};
	export let ip;
	export let user_agent;
	export let session_id;
	export let source;

	let showDetails = false;
	let showStackTrace = false;
	let copied = false;

	const levelColors = {
		error: 'red',
		warning: 'yellow',
		info: 'sky',
		debug: 'purple'
	};

	const sourceIcons = {
		api: ShieldAlert,
		database: Database,
		auth: LockKeyhole,
		server: Server,
		client: Monitor
	};

	const formatTimestamp = (isoString) => {
		return new Date(isoString).toLocaleString();
	};

	const copyLog = async () => {
		try {
			await navigator.clipboard.writeText(JSON.stringify({
				level,
				timestamp,
				message,
				context,
				ip,
				user_agent,
				session_id,
				source
			}, null, 2));
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch (e) {
			console.error('Copy failed:', e);
		}
	};
</script>

<div
	class="group rounded relative border-l-4 bg-white dark:bg-stone-900 p-4 mb-2 transition-colors hover:bg-opacity-50 border-{levelColors[level]}-500"
	
>
	<div class="flex items-start justify-between gap-3">
		<!-- Level Indicator -->
		<div class="flex-1 min-w-0">
			<div class="flex items-baseline gap-2 mb-1">
				{#if sourceIcons[source]}
					<svelte:component
						class="w-4 h-4 mt-1 text-{levelColors[level]}-500"
						this={sourceIcons[source]}
					/>
				{/if}
				
				<span class="text-sm font-mono text-gray-500 dark:text-gray-400">
					{formatTimestamp(timestamp)}
				</span>
				
				<span class="text-xs px-2 py-1 rounded-full bg-{levelColors[level]}-100 dark:bg-{levelColors[level]}-900 text-white dark:text-{levelColors[level]}-100 uppercase">
					{level}
				</span>
			</div>

			<!-- Main Message -->
			<p class="font-medium text-gray-900 dark:text-gray-100 break-words">
				{message}
			</p>

			<!-- Context Details -->
			{#if Object.keys(context).length > 0}
				<div class="mt-2 text-sm space-y-1">
					{#each Object.entries(context) as [key, value]}
						{#if key !== 'stack_trace'}
							<div class="flex gap-2">
								<span class="font-medium text-gray-600 dark:text-gray-300">{key}:</span>
								<span class="text-gray-500 dark:text-gray-400 break-all">
									{#if typeof value === 'object'}
										<pre>{JSON.stringify(value, null, 2)}</pre>
									{:else}
										{value}
									{/if}
								</span>
							</div>
						{/if}
					{/each}
				</div>
			{/if}

			<!-- Stack Trace -->
			{#if context.stack_trace}
				<div class="mt-3">
					<button
						class="flex items-center text-sm text-{levelColors[level]}-600 hover:text-{levelColors[level]}-700"
						on:click={() => (showStackTrace = !showStackTrace)}
					>
                    <div
                    class:rotate-180={showStackTrace}
                    >

						<ChevronDown size={14}  class="transition-transform" />
                    </div>
						<span class="ml-1">{showStackTrace ? 'Hide' : 'Show'} stack trace</span>
					</button>

					{#if showStackTrace}
						<div
							transition:slide
							class="mt-2 p-3 bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5 rounded overflow-x-auto text-xs font-mono text-red-600 dark:text-red-400"
						>
							{context.stack_trace}
                </div>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Action Buttons -->
		<div class="flex flex-col items-end gap-2">
			<button
				on:click={copyLog}
				class="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600"
				title="Copy log details"
			>
				<Clipboard size={16} />
			</button>

			<button
				on:click={() => (showDetails = !showDetails)}
				class="flex items-center text-xs text-gray-500 hover:text-gray-600"
			>
            <div
            class:rotate-180={showStackTrace}
            >

            <ChevronDown size={14}  class="transition-transform" />
            </div>
				<span class="ml-1">Details</span>
			</button>
		</div>
	</div>

	<!-- Technical Details -->
	{#if showDetails}
		<div transition:slide class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
			<div class="grid grid-cols-2 gap-4 text-xs">
				<div>
					<dt class="text-gray-500 dark:text-gray-400">IP Address</dt>
					<dd class="text-gray-900 dark:text-gray-100 font-mono">{ip}</dd>
				</div>
				<div>
					<dt class="text-gray-500 dark:text-gray-400">User Agent</dt>
					<dd class="text-gray-900 dark:text-gray-100 truncate">{user_agent}</dd>
				</div>
				<div>
					<dt class="text-gray-500 dark:text-gray-400">Session ID</dt>
					<dd class="text-gray-900 dark:text-gray-100 font-mono">{session_id}</dd>
				</div>
				<div>
					<dt class="text-gray-500 dark:text-gray-400">Source</dt>
					<dd class="text-gray-900 dark:text-gray-100 capitalize">{source}</dd>
				</div>
			</div>
		</div>
	{/if}

	<!-- Copy Confirmation -->
	{#if copied}
		<div
			transition:fade
			class="absolute top-2 right-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
		>
			Copied!
		</div>
	{/if}
</div>

<style>
	pre {
		white-space: pre-wrap;
		word-wrap: break-word;
	}

	.font-mono {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
	}
</style>