<script>
	import { dashboardStore } from '$lib/stores/dashboard.svelte.js';
	import { api } from '$lib/api/analytics.ts';
	import { show_toast } from '$lib/toast.js';
	import LoadingState from '$lib/components/analytics/graphStuff/loadingState.svelte';
	import { color } from '$lib/colors/mixer.js';
	import { flip } from 'svelte/animate';
	import { 
		MessageSquare, Star, Mail, Globe, Monitor, Smartphone, 
		Tablet, Clock, CheckCircle, Archive, Eye, Trash2, 
		ChevronLeft, ChevronRight, Filter, AlertCircle, X
	} from 'lucide-svelte';
	import { fade, slide, fly } from 'svelte/transition';

	let { siteId, current_domain, demo = false, demoData = [] } = $props();

	let loading = $state(true);
	let feedbackList = $state([]);
	let total = $state(0);
	let limit = $state(20);
	let offset = $state(0);
	let statusFilter = $state('');
	let categoryFilter = $state('');
	let selectedFeedback = $state(null);

	let currentPage = $derived(Math.floor(offset / limit) + 1);
	let totalPages = $derived(Math.ceil(total / limit));
	let pageNumbers = $derived(() => {
		const pages = [];
		const maxVisible = 5;
		let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
		let end = Math.min(totalPages, start + maxVisible - 1);
		if (end - start + 1 < maxVisible) {
			start = Math.max(1, end - maxVisible + 1);
		}
		for (let i = start; i <= end; i++) {
			pages.push(i);
		}
		return pages;
	});

	$effect(() => {
		if (demo) {
			feedbackList = demoData;
			total = demoData.length;
			loading = false;
		}
	});

	const statusColors = {
		new: `bg-${$color}-600  text-white`,
		reviewed: 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400',
		resolved: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
		archived: 'bg-stone-50 dark:bg-stone-950 text-stone-400 dark:text-stone-600'
	};

	const categoryLabels = {
		general: 'General',
		bug: 'Bug Report',
		feature: 'Feature Request',
		other: 'Other'
	};

	async function fetchFeedback() {
		if (demo) return;
		if (!siteId) return;
		loading = true;
		try {
			const response = await api.getFeedback(siteId, {
				status: statusFilter || undefined,
				category: categoryFilter || undefined,
				limit,
				offset
			});
			feedbackList = response.feedback || [];
			total = response.total || 0;
		} catch (err) {
			console.error('Feedback fetch error:', err);
			show_toast.set({ message: 'Failed to load feedback', type: 'error' });
			feedbackList = [];
		} finally {
			loading = false;
		}
	}

	async function updateStatus(feedbackId, newStatus) {
		if (demo) {
			feedbackList = feedbackList.map(f => 
				f.id === feedbackId ? { ...f, status: newStatus } : f
			);
			if (selectedFeedback?.id === feedbackId) {
				selectedFeedback = { ...selectedFeedback, status: newStatus };
			}
			show_toast.set({ message: 'Demo: Status updated locally', type: 'success' });
			return;
		}
		try {
			await api.updateFeedbackStatus(siteId, feedbackId, newStatus);
			feedbackList = feedbackList.map(f => 
				f.id === feedbackId ? { ...f, status: newStatus } : f
			);
			if (selectedFeedback?.id === feedbackId) {
				selectedFeedback = { ...selectedFeedback, status: newStatus };
			}
			show_toast.set({ message: 'Status updated', type: 'success' });
		} catch (err) {
			console.error('Update status error:', err);
			show_toast.set({ message: 'Failed to update status', type: 'error' });
		}
	}

	async function deleteFeedback(feedbackId) {
		if (!confirm('Are you sure you want to delete this feedback?')) return;
		if (demo) {
			feedbackList = feedbackList.filter(f => f.id !== feedbackId);
			total = Math.max(0, total - 1);
			if (selectedFeedback?.id === feedbackId) {
				selectedFeedback = null;
			}
			show_toast.set({ message: 'Demo: Feedback deleted locally', type: 'success' });
			return;
		}
		try {
			await api.deleteFeedback(siteId, feedbackId);
			feedbackList = feedbackList.filter(f => f.id !== feedbackId);
			total = Math.max(0, total - 1);
			if (selectedFeedback?.id === feedbackId) {
				selectedFeedback = null;
			}
			show_toast.set({ message: 'Feedback deleted', type: 'success' });
		} catch (err) {
			console.error('Delete error:', err);
			show_toast.set({ message: 'Failed to delete feedback', type: 'error' });
		}
	}

	function formatDate(timestamp) {
		if (!timestamp) return 'Unknown';
		const date = new Date(timestamp * 1000);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getDeviceIcon(device) {
		if (device === 'mobile') return Smartphone;
		if (device === 'tablet') return Tablet;
		return Monitor;
	}

	function nextPage() {
		if (offset + limit < total) {
			offset += limit;
			fetchFeedback();
		}
	}

	function prevPage() {
		if (offset > 0) {
			offset = Math.max(0, offset - limit);
			fetchFeedback();
		}
	}

	function goToPage(page) {
		offset = (page - 1) * limit;
		fetchFeedback();
	}

	function changeLimit(newLimit) {
		limit = newLimit;
		offset = 0;
		fetchFeedback();
	}

	$effect(() => {
		if (siteId) {
			offset = 0;
			fetchFeedback();
		}
	});
</script>

<div class="space-y-8 pb-20">
	<!-- Header Stats -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		<div class="bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-4 transition-all duration-300">
			<p class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-1">Total Entries</p>
			<p class="text-xl font-bold dark:text-white tabular-nums leading-tight mb-2">{total}</p>
		</div>
		<div class="bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-4 transition-all duration-300">
			<p class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-1">Status Filter</p>
			<p class="text-xl font-bold dark:text-white tabular-nums leading-tight mb-2 capitalize">{statusFilter || 'All'}</p>
		</div>
	</div>

	<!-- Filter Bar -->
	<div class="space-y-4 border-b border-stone-100 dark:border-stone-800 pb-4">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div class="flex items-center gap-2">
				<p class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mr-2">Status</p>
				{#each ['all', 'new', 'reviewed', 'resolved', 'archived'] as status, i}
					<button
						onclick={() => { statusFilter = status === 'all' ? '' : status; offset = 0; fetchFeedback(); }}
						class="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer
						{statusFilter === (status === 'all' ? '' : status) 
							? `bg-${$color}-600  text-white `
							: `text-black hover:text-stone-900 dark:text-stone-200 dark:hover:text-white ` }"
					>
						{status}
					</button>
				{/each}
			</div>

			{#if categoryFilter || statusFilter}
				<button 
					onclick={() => { statusFilter = ''; categoryFilter = ''; offset = 0; fetchFeedback(); }}
					class="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 dark:hover:text-white underline underline-offset-4 transition-colors"
				>
					Reset all
				</button>
			{/if}
		</div>

		<div class="flex flex-wrap items-center gap-2">
			<p class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mr-2">Categories</p>
			<button
				onclick={() => { categoryFilter = ''; offset = 0; fetchFeedback(); }}
				class="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer
				{!categoryFilter 
					? `bg-${$color}-600 text-white` 
					: `text-black hover:text-stone-900 dark:text-stone-200 dark:hover:text-white`}"
			>
				All
			</button>
			{#each Object.keys(categoryLabels) as cat}
				<button
					onclick={() => { categoryFilter = cat; offset = 0; fetchFeedback(); }}
					class="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer
					{categoryFilter === cat 
						? `bg-${$color}-600 text-white` 
						: `text-black hover:text-stone-900 dark:text-stone-200 dark:hover:text-white`}"
				>
					{cat}
				</button>
			{/each}
		</div>
	</div>

	{#if loading && feedbackList.length === 0}
		<LoadingState />
	{:else if feedbackList.length === 0}
		<div in:fade class="flex flex-col items-center justify-center py-32 border border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/30 dark:bg-stone-950/30">
			<AlertCircle size={32} class="text-stone-300 dark:text-stone-700 mb-4" />
			<p class="text-sm font-serif italic text-stone-400">No feedback found for this selection</p>
			{#if statusFilter || categoryFilter}
				<button 
					onclick={() => { statusFilter = ''; categoryFilter = ''; fetchFeedback(); }}
					class="mt-4 text-[10px] font-black uppercase tracking-widest text-stone-500 hover:text-stone-900 dark:hover:text-white underline underline-offset-4"
				>
					Clear filters
				</button>
			{/if}
		</div>
	{:else}
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
			<!-- Feedback List -->
			<div class="lg:col-span-7">
				{#key statusFilter + offset + categoryFilter}
					<div in:fly={{ y: 10, duration: 200 }} class="divide-y divide-stone-100 dark:divide-stone-800 border-t border-stone-100 dark:border-stone-800">
						{#each feedbackList as feedback (feedback.id)}
							<div animate:flip={{ duration: 300 }}>
								<button
									onclick={() => selectedFeedback = feedback}
									class="w-full text-left p-6 transition-all duration-300 group relative overflow-hidden
									{selectedFeedback?.id === feedback.id ? 'bg-white dark:bg-stone-800' : 'bg-stone-50 dark:bg-stone-900/50 hover:bg-white dark:hover:bg-stone-800'}"
								>
									{#if selectedFeedback?.id === feedback.id}
										<div in:slide={{ axis: 'x', duration: 200 }} class="absolute left-0 top-0 bottom-0 w-1 bg-stone-900 dark:bg-white"></div>
									{/if}
									
									<div class="flex items-start justify-between gap-4">
										<div class="flex-1 min-w-0">
											<div class="flex items-center gap-3 mb-3">
												<span class="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 {statusColors[feedback.status]}">
													{feedback.status}
												</span>
												{#if feedback.rating}
													<div class="flex items-center gap-0.5 text-stone-900 dark:text-white">
														{#each Array(5) as _, i}
															<Star 
																size={10} 
																class={i < feedback.rating ? 'fill-current' : 'text-stone-200 dark:text-stone-700'}
															/>
														{/each}
													</div>
												{/if}
												<span class="text-[10px] font-black text-stone-400 uppercase tracking-widest tabular-nums">
													{formatDate(feedback.createdAt)}
												</span>
											</div>
											
											<p class="text-sm font-serif italic text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed mb-4 group-hover:text-stone-900 dark:group-hover:text-white transition-colors">
												"{feedback.content}"
											</p>

											<div class="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-stone-400">
												{#if feedback.category}
													<span class="flex items-center gap-1">
														<Filter size={10} />
														{feedback.category}
													</span>
												{/if}
												{#if feedback.url}
													<span class="flex items-center gap-1 truncate max-w-40 font-mono">
														<Globe size={10} />
														{new URL(feedback.url).pathname}
													</span>
												{/if}
											</div>
										</div>
										
										{#if feedback.status === 'new'}
											<div class="w-1.5 h-1.5 bg-stone-900 dark:bg-white rounded-none animate-pulse"></div>
										{/if}
									</div>
								</button>
							</div>
						{/each}
					</div>
				{/key}


				<!-- Pagination -->
				{#if total > 0 && total > limit}
					<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-8 border-t border-stone-100 dark:border-stone-800">
						<div class="flex items-center gap-4">
							<span class="text-[10px] font-black uppercase tracking-widest text-stone-400">
								{offset + 1}—{Math.min(offset + limit, total)} of {total}
							</span>
							<div class="flex items-center gap-2">
								<span class="text-[10px] font-black uppercase tracking-widest text-stone-400">Show</span>
								{#each [10, 20, 50] as size}
									<button
										onclick={() => changeLimit(size)}
										class="px-2 py-1 text-[10px] font-black uppercase tracking-widest transition-all
										{limit === size 
											? `bg-${$color}-600 text-white` 
											: 'text-stone-400 hover:text-stone-900 dark:hover:text-white'}"
									>
										{size}
									</button>
								{/each}
							</div>
						</div>
						
						{#if totalPages > 1}
							<div class="flex items-center gap-1">
								<button
									onclick={prevPage}
									disabled={currentPage === 1}
									class="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-white disabled:opacity-20 transition-colors"
								>
									<ChevronLeft size={16} />
								</button>
								
								{#if pageNumbers()[0] > 1}
									<button
										onclick={() => goToPage(1)}
										class="w-8 h-8 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
									>
										1
									</button>
									{#if pageNumbers()[0] > 2}
										<span class="text-stone-300 dark:text-stone-700 px-1">…</span>
									{/if}
								{/if}
								
								{#each pageNumbers() as page}
									<button
										onclick={() => goToPage(page)}
										class="w-8 h-8 text-[10px] font-black uppercase tracking-widest transition-all
										{currentPage === page 
											? `bg-${$color}-600 text-white` 
											: 'text-stone-400 hover:text-stone-900 dark:hover:text-white'}"
									>
										{page}
									</button>
								{/each}
								
								{#if pageNumbers()[pageNumbers().length - 1] < totalPages}
									{#if pageNumbers()[pageNumbers().length - 1] < totalPages - 1}
										<span class="text-stone-300 dark:text-stone-700 px-1">…</span>
									{/if}
									<button
										onclick={() => goToPage(totalPages)}
										class="w-8 h-8 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
									>
										{totalPages}
									</button>
								{/if}
								
								<button
									onclick={nextPage}
									disabled={currentPage === totalPages}
									class="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-white disabled:opacity-20 transition-colors"
								>
									<ChevronRight size={16} />
								</button>
							</div>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Detail Sidebar -->
			<div class="lg:col-span-5">
				{#if selectedFeedback}
					<div 
						in:fade={{ duration: 200 }}
						class="sticky top-24 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-8 space-y-10"
					>
						<div class="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-6">
							<div>
								<h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-1">Feedback Detail</h3>
								<p class="text-sm font-bold text-stone-900 dark:text-white font-mono uppercase tracking-tight">Entry #{selectedFeedback.id.slice(0, 8)}</p>
							</div>
							<button 
								onclick={() => selectedFeedback = null}
								class="text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
							>
								<X size={20} />
							</button>
						</div>

						<!-- Content Section -->
						<div class="space-y-4">
							<p class="text-[10px] font-black uppercase tracking-widest text-stone-400">Message</p>
							<div class="bg-stone-50 dark:bg-stone-950 p-3 border border-stone-100 dark:border-stone-800">
								<p class="text-sm font-serif italic text-stone-900 dark:text-stone-100 leading-relaxed">
									{selectedFeedback.content}
								</p>
							</div>
						</div>

						<!-- Context Grid -->
						<div class="grid grid-cols-2 gap-x-8 gap-y-10">
							<div class="space-y-4">
								<p class="text-[10px] font-black uppercase tracking-widest text-stone-400">User Identity</p>
								<div class="space-y-3">
									{#if selectedFeedback.email}
										<a href="mailto:{selectedFeedback.email}" class="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-white hover:underline group">
											<Mail size={12} class="text-stone-400" />
											{selectedFeedback.email}
										</a>
									{:else}
										<p class="text-xs font-serif italic text-stone-400">Anonymous Visitor</p>
									{/if}
									<div class="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-white">
										<Globe size={12} class="text-stone-400" />
										{selectedFeedback.country || 'Unknown Location'}
									</div>
								</div>
							</div>

							<div class="space-y-4">
								<p class="text-[10px] font-black uppercase tracking-widest text-stone-400">System Info</p>
								<div class="space-y-3 font-mono text-[11px] font-bold text-stone-900 dark:text-white uppercase tracking-tight">
									<div class="flex items-center gap-2">
										<Monitor size={12} class="text-stone-400" />
										{selectedFeedback.os || 'Unknown OS'}
									</div>
									<div class="flex items-center gap-2">
										<Globe size={12} class="text-stone-400" />
										{selectedFeedback.browser || 'Unknown Browser'}
									</div>
								</div>
							</div>
						</div>

						<!-- Actions -->
						<div class="pt-10 border-t border-stone-100 dark:border-stone-800">
							<p class="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-6">Internal Workflow</p>
							<div class="grid grid-cols-2 gap-3">
								<button
									onclick={() => updateStatus(selectedFeedback.id, 'reviewed')}
									disabled={selectedFeedback.status === 'reviewed'}
									class="flex items-center justify-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest border border-stone-200 dark:border-stone-800 hover:border-stone-900 dark:hover:border-white transition-all disabled:opacity-20"
								>
									<Eye size={14} />
									Reviewed
								</button>
								<button
									onclick={() => updateStatus(selectedFeedback.id, 'resolved')}
									disabled={selectedFeedback.status === 'resolved'}
									class="flex items-center justify-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white bg-{$color}-600 transition-all disabled:opacity-20"
								>
									<CheckCircle size={14} />
									Resolved
								</button>
								<button
									onclick={() => updateStatus(selectedFeedback.id, 'archived')}
									disabled={selectedFeedback.status === 'archived'}
									class="flex items-center justify-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest border border-stone-200 dark:border-stone-800 hover:border-stone-900 dark:hover:border-white transition-all disabled:opacity-20 col-span-2"
								>
									<Archive size={14} />
									Archive Entry
								</button>
								<button
									onclick={() => deleteFeedback(selectedFeedback.id)}
									class="flex items-center justify-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all col-span-2 mt-4"
								>
									<Trash2 size={14} />
									Permanently Delete
								</button>
							</div>
						</div>
					</div>
				{:else}
					<div class="sticky top-24 border border-dashed border-stone-200 dark:border-stone-800 p-12 text-center bg-stone-50/10">
						<MessageSquare size={32} class="text-stone-200 dark:text-stone-800 mx-auto mb-4" />
						<p class="text-sm font-serif italic text-stone-400">Select an entry to view details</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
