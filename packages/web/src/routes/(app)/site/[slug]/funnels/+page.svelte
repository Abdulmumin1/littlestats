<script>
	import Seo from '$lib/components/generals/seo.svelte';
	import LoadingState from '$lib/components/analytics/graphStuff/loadingState.svelte';
	import { dashboardStore } from '$lib/stores/dashboard.svelte.js';
	import { show_toast } from '$lib/toast.js';
	import { api } from '$lib/api/analytics.ts';
	import { Plus, Trash2, ArrowRight, Filter, BarChart3, GitBranch } from 'lucide-svelte';
	import CustomSelect from '$lib/components/generals/customSelect.svelte';
	import { color } from '$lib/colors/mixer.js';

	let { data } = $props();
	let siteId = $derived(data.siteId);
	let current_domain = $derived(data.site);

	// Funnel configuration
	let funnelName = $state('My Funnel');
	let funnelType = $state('session');
	let steps = $state([]);

	// Available steps from backend
	let availablePages = $state([]);
	let availableEvents = $state([]);
	let loadingOptions = $state(false);

	// Saved funnels
	let savedFunnels = $state([]);
	let currentFunnelId = $state(null);
	let loadingSaved = $state(false);
	let showSavedModal = $state(false);

	// Funnel results
	let funnelResult = $state(null);
	let loading = $state(false);
	let error = $state(null);

	// Fetch saved funnels
	async function fetchSavedFunnels() {
		if (!siteId) return;
		loadingSaved = true;
		try {
			const response = await api.listFunnels(siteId);
			savedFunnels = response.funnels || [];
		} catch (err) {
			console.error('Failed to fetch saved funnels:', err);
		} finally {
			loadingSaved = false;
		}
	}

	// Save current funnel
	async function saveFunnel() {
		if (!siteId || !funnelName || steps.length === 0) {
			show_toast.set({ message: 'Name and steps are required', type: 'error' });
			return;
		}

		try {
			const res = await api.saveFunnel(siteId, {
				id: currentFunnelId || undefined,
				name: funnelName,
				type: funnelType,
				steps: steps
			});
			currentFunnelId = res.id;
			show_toast.set({ message: 'Funnel saved', type: 'success' });
			fetchSavedFunnels();
		} catch (err) {
			console.error('Failed to save funnel:', err);
			show_toast.set({ message: 'Failed to save funnel', type: 'error' });
		}
	}

	// Load a funnel
	function loadFunnel(funnel) {
		currentFunnelId = funnel.id;
		funnelName = funnel.name;
		funnelType = funnel.type;
		steps = funnel.steps;
		funnelResult = null;
		showSavedModal = false;
	}

	// Create new funnel
	function createNew() {
		currentFunnelId = null;
		funnelName = 'New Funnel';
		funnelType = 'session';
		steps = [];
		funnelResult = null;
	}

	// Delete funnel
	async function deleteFunnel(id) {
		if (!confirm('Are you sure you want to delete this funnel?')) return;
		try {
			await api.deleteFunnel(siteId, id);
			if (currentFunnelId === id) createNew();
			show_toast.set({ message: 'Funnel deleted', type: 'success' });
			fetchSavedFunnels();
		} catch (err) {
			console.error('Failed to delete funnel:', err);
			show_toast.set({ message: 'Failed to delete funnel', type: 'error' });
		}
	}

	// Fetch available pages and events for step selection
	async function fetchAvailableSteps() {
		if (!siteId) return;
		loadingOptions = true;
		try {
			const [pagesRes, eventsRes] = await Promise.all([
				api.getPages(siteId, dashboardStore.dateRange, 50),
				api.getCustomEvents(siteId, dashboardStore.dateRange)
			]);
			availablePages = (pagesRes.pages || []).map(p => p.path);
			availableEvents = (eventsRes.events || []).map(e => e.name);
		} catch (err) {
			console.error('Failed to fetch available steps:', err);
		} finally {
			loadingOptions = false;
		}
	}

	// Analyze funnel
	async function analyzeFunnel() {
		if (!siteId || steps.length < 2) {
			show_toast.set({ message: 'Add at least 2 steps to analyze', type: 'error' });
			return;
		}

		loading = true;
		error = null;
		try {
			funnelResult = await api.analyzeFunnel(siteId, steps, {
				funnelType,
				filter: dashboardStore.dateRange
			});
		} catch (err) {
			console.error('Funnel analysis error:', err);
			error = err.message || 'Failed to analyze funnel';
			show_toast.set({ message: error, type: 'error' });
			funnelResult = null;
		} finally {
			loading = false;
		}
	}

	// Add a new step
	function addStep(type, value) {
		steps = [...steps, { type, value, name: value }];
	}

	// Remove a step
	function removeStep(index) {
		steps = steps.filter((_, i) => i !== index);
	}

	// Move step up/down
	function moveStep(index, direction) {
		const newSteps = [...steps];
		const targetIndex = index + direction;
		if (targetIndex < 0 || targetIndex >= newSteps.length) return;
		[newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
		steps = newSteps;
	}

	// Fetch data when site or date range changes
	$effect(() => {
		if (siteId && dashboardStore?.dateRange?.startDate) {
			fetchAvailableSteps();
			fetchSavedFunnels();
		}
	});

	// Re-analyze when date range changes and we have a funnel loaded
	$effect(() => {
		if (siteId && dashboardStore?.dateRange?.startDate && steps.length >= 2) {
			analyzeFunnel();
		}
	});

	// Color palette for funnel bars
	const colors = [
		'#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#06b6d4', '#eab308', '#ef4444'
	];
</script>

<svelte:head>
	<Seo title={`${current_domain?.name || 'Site'} - Funnels`} />
</svelte:head>

<div class="space-y-8">
	<!-- Header -->
	<div class="px-2 flex flex-wrap items-center justify-between gap-4">
		<div>
			<h1 class="text-xl font-bold text-stone-900 dark:text-white tracking-tight">Funnels</h1>
			<p class="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mt-1">Analyze user journeys step by step</p>
		</div>
		<div class="flex items-center gap-2">
			<button
				onclick={() => showSavedModal = true}
				class="px-4 py-2 text-xs font-bold rounded-none border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white hover:bg-stone-50 dark:hover:bg-stone-800 transition-all flex items-center gap-2"
			>
				<GitBranch size={14} />
				Saved Funnels
			</button>
			<button
				onclick={createNew}
				class="px-4 py-2 text-xs font-bold rounded-none border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white hover:bg-stone-50 dark:hover:bg-stone-800 transition-all flex items-center gap-2"
			>
				<Plus size={14} />
				New Funnel
			</button>
			<button
				onclick={saveFunnel}
				disabled={steps.length === 0}
				class="px-4 py-2 text-xs font-bold rounded-none bg-{$color}-600  text-white hover:opacity-90 transition-all disabled:opacity-50"
			>
				Save Funnel
			</button>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
		<!-- Funnel Builder (Left) -->
		<div class="lg:col-span-4 space-y-4">
			<!-- Funnel Config -->
			<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 p-4">
				<div class="space-y-4">
					<div class="w-full">
						<label for="funnel-name" class="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2 block">Funnel Name</label>
						<input
							id="funnel-name"
							bind:value={funnelName}
							class="w-full px-4 py-2 text-xs font-bold rounded-none border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-stone-500"
						/>
					</div>
					<div class="w-full">
						<CustomSelect
							id="funnel-type"
							label="Count By"
							bind:value={funnelType}
							options={[
								{ value: 'session', label: 'Sessions (visits)' },
								{ value: 'user', label: 'Users (unique visitors)' }
							]}
						/>
					</div>
				</div>
			</div>

			<!-- Steps List -->
			<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 overflow-hidden">
				<div class="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-white/50 dark:bg-stone-900/50">
					<h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Steps</h2>
					<span class="text-xs font-bold text-stone-500">{steps.length}</span>
				</div>
				<div class="p-2">
					{#if steps.length === 0}
						<p class="py-10 text-center text-stone-400 italic font-serif text-sm">Add steps below</p>
					{:else}
						<div class="space-y-1">
							{#each steps as step, index (index)}
								<div class="flex items-center gap-2 px-3 py-2 bg-white dark:bg-stone-950/40 border border-stone-200 dark:border-stone-800">
									<div class="w-5 h-5 flex items-center justify-center text-[10px] font-black text-white shrink-0" style="background: {colors[index % colors.length]}">
										{index + 1}
									</div>
									<div class="flex-1 min-w-0">
										<p class="text-[11px] font-bold text-stone-900 dark:text-white truncate">{step.name}</p>
										<p class="text-[9px] font-black uppercase tracking-widest text-stone-400">{step.type}</p>
									</div>
									<div class="flex items-center gap-1">
										<button
											type="button"
											onclick={() => moveStep(index, -1)}
											disabled={index === 0}
											class="p-1 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors disabled:opacity-30"
										>
											<ArrowRight size={12} class="-rotate-90" />
										</button>
										<button
											type="button"
											onclick={() => moveStep(index, 1)}
											disabled={index === steps.length - 1}
											class="p-1 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors disabled:opacity-30"
										>
											<ArrowRight size={12} class="rotate-90" />
										</button>
										<button
											type="button"
											onclick={() => removeStep(index)}
											class="p-1 text-stone-400 hover:text-red-500 transition-colors"
										>
											<Trash2 size={12} />
										</button>
									</div>
								</div>
								{#if index < steps.length - 1}
									<div class="flex justify-center py-0.5">
										<ArrowRight size={14} class="text-stone-300 dark:text-stone-600 rotate-90" />
									</div>
								{/if}
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<!-- Add Step -->
			<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 p-4 space-y-4">
				<h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Add Step</h3>
				
				{#if loadingOptions}
					<p class="text-xs text-stone-400 italic">Loading...</p>
				{:else}
					<div class="space-y-3">
						<div class="w-full">
							<CustomSelect
								id="add-page"
								label="Page URL"
								placeholder="Select a page..."
								onchange={(val) => { if (val) { addStep('url', val); } }}
								options={availablePages.map(p => ({ value: p, label: p }))}
							/>
						</div>
						<div class="w-full">
							<CustomSelect
								id="add-event"
								label="Custom Event"
								placeholder="Select an event..."
								onchange={(val) => { if (val) { addStep('event', val); } }}
								options={availableEvents.map(e => ({ value: e, label: e }))}
							/>
						</div>
					</div>
				{/if}
			</div>

			<!-- Analyze Button -->
			<button
				type="button"
				onclick={analyzeFunnel}
				disabled={loading || steps.length < 2}
				class="w-full px-4 py-3 text-xs font-black uppercase tracking-widest bg-{$color}-600 text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{loading ? 'Analyzing...' : 'Analyze Funnel'}
			</button>
		</div>

		<!-- Funnel Results (Right) -->
		<div class="lg:col-span-8 space-y-6">
			{#if loading}
				<div class="h-100 flex items-center justify-center">
					<LoadingState />
				</div>
			{:else if error}
				<div class="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 p-6 text-center">
					<p class="text-sm text-red-800 dark:text-red-200">{error}</p>
				</div>
			{:else if funnelResult && funnelResult.steps.length > 0}
				<!-- Summary Cards -->
				<div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
					<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 p-4">
						<div class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2">Total Entries</div>
						<p class="text-2xl font-bold text-stone-900 dark:text-white tabular-nums">{funnelResult.totalEntries.toLocaleString()}</p>
					</div>
					<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 p-4">
						<div class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2">Completed</div>
						<p class="text-2xl font-bold text-stone-900 dark:text-white tabular-nums">{funnelResult.steps[funnelResult.steps.length - 1]?.count.toLocaleString() || 0}</p>
					</div>
					<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 p-4">
						<div class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2">Conversion Rate</div>
						<p class="text-2xl font-bold text-stone-900 dark:text-white tabular-nums">{funnelResult.totalConversionRate}%</p>
					</div>
				</div>

				<!-- Funnel Visualization -->
				<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 p-6">
					<h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-6">Funnel Breakdown</h3>
					<div class="space-y-4">
						{#each funnelResult.steps as step, index}
							{@const maxCount = funnelResult.steps[0]?.count || 1}
							{@const barWidth = Math.max(5, (step.count / maxCount) * 100)}
							<div class="space-y-2">
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-3">
										<div class="w-6 h-6 flex items-center justify-center text-[10px] font-black text-white shrink-0" style="background: {colors[index % colors.length]}">
											{step.step}
										</div>
										<div>
											<p class="text-sm font-bold text-stone-900 dark:text-white">{step.name}</p>
											<p class="text-[10px] font-black uppercase tracking-widest text-stone-400">{step.type}</p>
										</div>
									</div>
									<div class="text-right">
										<p class="text-sm font-bold text-stone-900 dark:text-white tabular-nums">{step.count.toLocaleString()}</p>
										{#if index > 0}
											<p class="text-[10px] font-black uppercase tracking-widest text-stone-400">
												{step.conversionRate}% from prev
											</p>
										{/if}
									</div>
								</div>
								<div class="h-8 bg-stone-200 dark:bg-stone-800 relative overflow-hidden">
									<div
										class="h-full transition-all duration-500"
										style="width: {barWidth}%; background: {colors[index % colors.length]}; opacity: 0.8;"
									></div>
									{#if index > 0 && step.dropOffRate > 0}
										<div class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-red-500">
											-{step.dropOffRate}% drop
										</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{:else}
				<div class="bg-stone-50 dark:bg-stone-900 rounded-none border border-stone-100 dark:border-stone-800 p-12 text-center h-100 flex flex-col items-center justify-center">
					<BarChart3 size={48} class="mx-auto text-stone-300 dark:text-stone-600 mb-4" />
					<h3 class="text-lg font-bold text-stone-900 dark:text-white mb-2">Analyze Your Journey</h3>
					<p class="text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto">
						Add at least 2 steps to analyze how users move through your conversion flow.
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Saved Funnels Modal -->
{#if showSavedModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/40 backdrop-blur-sm p-4">
		<button
			type="button"
			class="absolute inset-0 cursor-default"
			onclick={() => showSavedModal = false}
			aria-label="Close modal"
		></button>
		
		<div class="relative bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh]">
			<div class="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-950/20">
				<h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Saved Funnels</h2>
				<button
					onclick={() => showSavedModal = false}
					class="text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
				>
					<Plus size={20} class="rotate-45" />
				</button>
			</div>
			
			<div class="flex-1 overflow-y-auto p-4">
				{#if loadingSaved}
					<p class="py-10 text-center text-stone-400 italic text-sm">Loading saved funnels...</p>
				{:else if savedFunnels.length === 0}
					<div class="py-12 text-center">
						<GitBranch size={32} class="mx-auto text-stone-200 dark:text-stone-800 mb-3" />
						<p class="text-stone-400 italic font-serif text-sm">No saved funnels yet</p>
					</div>
				{:else}
					<div class="space-y-1">
						{#each savedFunnels as funnel}
							<div class="group flex items-center gap-1">
								<button
									type="button"
									onclick={() => loadFunnel(funnel)}
									class={`flex-1 text-left px-5 py-3 text-xs font-bold rounded-none transition-all border border-transparent ${currentFunnelId === funnel.id ? 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white' : 'text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800/50 hover:border-stone-200 dark:hover:border-stone-800'}`}
								>
									<div class="flex items-center justify-between">
										<span>{funnel.name}</span>
										<span class="text-[10px] font-black uppercase tracking-widest text-stone-400 opacity-60">
											{funnel.steps.length} steps • {funnel.type}
										</span>
									</div>
								</button>
								<button
									type="button"
									onclick={() => deleteFunnel(funnel.id)}
									class="p-3 text-stone-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
								>
									<Trash2 size={14} />
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</div>
			
			<div class="px-6 py-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/20 text-right">
				<button
					onclick={() => showSavedModal = false}
					class="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors"
				>
					Close
				</button>
			</div>
		</div>
	</div>
{/if}
