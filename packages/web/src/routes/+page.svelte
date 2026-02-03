<script>
	import { fade, fly, slide } from 'svelte/transition';
	import { cubicInOut, backOut } from 'svelte/easing';
	import Seo from '../lib/components/generals/seo.svelte';
	import { color } from '$lib/colors/mixer.js';
    import Logo from '$lib/components/generals/logo.svelte';

    // Demo Imports
    import { mockDataFunnel, mockDataFunnelSteps } from '$lib/mockData.js';
	import { calculateFunnel } from '$lib/funnels/helpers.js';
	import { 
        generateRandomEvents, 
        getMockEventCounts,
        getMockStatsSummary,
        getMockTimeSeries,
        getMockPages,
        getMockReferrers,
        getMockCountries,
        getMockDevices,
        getMockBrowsers,
        getMockOS,
        getMockFeedback
    } from '$lib/mockData.js';
	import Funnels from '$lib/components/pages/funnels.svelte';
	import Events from '$lib/components/pages/events.svelte';
	import Campaigns from '$lib/components/pages/campaigns.svelte';
    import Traffic from '$lib/components/pages/traffic.svelte'; // Use real Traffic component
    import Feedback from '$lib/components/pages/feedback.svelte';
    import Dropdown from '$lib/components/generals/dropdown.svelte';
    import DarkMode from '$lib/components/generals/darkMode.svelte';
	import { defaultRange as globalRange, optis } from '$lib/globalstate.svelte.js';
    import { dashboardStore } from '$lib/stores/dashboard.svelte.js';
    import { writable } from 'svelte/store';

    // Icons
    import { LineChart, Filter, MousePointer2, Megaphone, Github, MessageSquare, Menu, X } from 'lucide-svelte';
	import { onMount } from 'svelte';

    // Data handling for Demo
    let funnelStepsContext = writable({
		name: 'Demo Funnel',
		type: 'session',
		steps: mockDataFunnelSteps
	});

    let {data} = $props();
    
    // Defer mock data generation using requestIdleCallback
    let dummyies = $state([]);
    let dataGenerated = $state(false);
    
    $effect(() => {
        if (typeof requestIdleCallback !== 'undefined') {
            requestIdleCallback(() => {
                dummyies = generateRandomEvents(1000);
                dataGenerated = true;
            });
        } else {
            setTimeout(() => {
                dummyies = generateRandomEvents(1000);
                dataGenerated = true;
            }, 0);
        }
    });
    
	let events_dummies = $derived(dummyies);
    
    // Cache eventCounts - only recompute when events_dummies changes
    let eventCounts = $derived(activeTab === 'events' && dataGenerated ? getMockEventCounts(events_dummies, dashboardStore.dateRange) : []);

    // Lazy compute trafficDemoData - only when traffic tab is active
    let trafficDemoData = $derived.by(() => {
        if (activeTab !== 'traffic' || !dataGenerated) return null;
        
        const dateRange = dashboardStore.dateRange;
        // Compute each list once and reuse for preview and full
        const allPages = getMockPages(events_dummies, dateRange);
        const allReferrers = getMockReferrers(events_dummies, dateRange);
        const allCountries = getMockCountries(events_dummies, dateRange);
        
        return {
            stats: getMockStatsSummary(events_dummies, dateRange),
            timeSeries: getMockTimeSeries(events_dummies, dateRange, 'day').map(d => ({
                timestamp: d.timestamp,
                views: d.views,
                visits: d.visits,
                visitors: d.visitors
            })),
            pages: allPages.slice(0, 5),
            allPages,
            referrers: allReferrers.slice(0, 5),
            allReferrers,
            countries: allCountries.slice(0, 5),
            allCountries,
            devices: getMockDevices(events_dummies, dateRange)
        };
    });

    // Features List for Sidebar
    const features = [
		{ id: 'campaigns', label: 'campaigns', component: 'Campaigns', icon: Megaphone },
        { id: 'funnels', label: 'funnels', component: 'Funnels', icon: Filter },
		{ id: 'traffic', label: 'traffic', component: 'Traffic', icon: LineChart },
		{ id: 'events', label: 'events', component: 'Events', icon: MousePointer2 },
        { id: 'feedback', label: 'feedback', component: 'Feedback', icon: MessageSquare },
	];

    let activeTab = $state(features[0].id);
    let isMobileMenuOpen = $state(false);

    // Derived Data
    let sortInterval = $derived(globalRange.getSingle());

    // Mock Feedback Data
    let mockFeedbackData = $state([]);
    let newFeedbackCount = $derived(mockFeedbackData.filter(f => f.status === 'new').length);
    $effect(() => {
        if (dataGenerated) {
            mockFeedbackData = getMockFeedback(12);
        }
    });

    function handleDateChange(event) {
		globalRange.setCustom(false);
		const date = event.detail.value;
		globalRange.setSingle(date);
	}

    // Sync globalRange to dashboardStore for DemoComponent
    $effect(() => {
        const [start, end] = globalRange.getRange();
        // globalRange uses ISO strings, dashboardStore expects YYYY-MM-DD strings usually, 
        // but based on dashboardStore definition it handles it. 
        // Let's ensure format matches what dashboardStore typically has.
        const startDate = new Date(start).toISOString().split('T')[0];
        const endDate = new Date(end).toISOString().split('T')[0];
        dashboardStore.setDateRange(startDate, endDate);
    });

    // Lazy compute funnelData - only when funnels tab is active
	let funnelData = $derived(activeTab === 'funnels' ? calculateFunnel(mockDataFunnel, mockDataFunnelSteps, 'user') : null);

    onMount(() => {
        globalRange.setSingle(90);
    })
</script>

<svelte:head>
	<Seo />
</svelte:head>

<!-- Minimal Layout -->
<main class="min-h-screen bg-stone-50/50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans p-4 md:p-8 selection:bg-{$color}-100 selection:text-{$color}-900 flex flex-col items-center">
    
    <!-- Main Board -->
    <div class="w-full max-w-[1200px] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden">
        
        <!-- Header Section -->
        <header class="p-8 md:p-12 border-b border-stone-100 dark:border-stone-800 relative">
            <!-- Minimal Nav -->
            <div class="absolute top-4 right-4 md:top-8 md:right-8 flex items-center gap-4">
                <!-- Desktop Nav -->
                <nav class="hidden md:flex gap-6 items-center text-sm font-medium text-stone-600 dark:text-stone-400">
                    <a href="http://github.com/abdulmumin1/littlestats" target="_blank" class="hover:text-stone-900 dark:hover:text-white transition-colors flex items-center gap-1.5">
                        <Github size={14} />
                        <span>opensource</span>
                    </a>
                    <a href="#pricing" class="hover:text-stone-900 dark:hover:text-white transition-colors">pricing</a>
                    <a href="/signin" class="hover:text-stone-900 dark:hover:text-white transition-colors">login</a>
                    <a href="/signup" class="px-4 py-2 text-white bg-{$color}-600 hover:bg-{$color}-700 transition-colors " onclick={()=>{
                        track("Get started", {color:$color})
                    }}>get started</a>
                </nav>

                <!-- Mobile Menu Button -->
                <button 
                    class="md:hidden p-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                    onclick={() => isMobileMenuOpen = !isMobileMenuOpen}
                    aria-label="Toggle menu"
                >
                    {#if isMobileMenuOpen}
                        <X size={24} />
                    {:else}
                        <Menu size={24} />
                    {/if}
                </button>
                
                <DarkMode />
            </div>

            <!-- Mobile Menu Overlay -->
            {#if isMobileMenuOpen}
                <div 
                    transition:fly={{ y: -20, duration: 400, easing: cubicInOut }}
                    class="fixed inset-0 z-50 bg-white/95 dark:bg-stone-950/95 backdrop-blur-md md:hidden flex flex-col p-8"
                >
                    <div 
                        in:fly={{ y: -10, delay: 100, duration: 400, easing: backOut }}
                        class="flex justify-between items-center mb-16"
                    >
                        <div class="flex items-center gap-2">
                            <Logo size={28} />
                            <span class="font-bold text-lg tracking-tight text-stone-900 dark:text-white mt-2">Littlestats</span>
                        </div>
                        <button 
                            onclick={() => isMobileMenuOpen = false}
                            class="p-2 text-stone-600 dark:text-stone-400 hover:rotate-90 transition-transform duration-300"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <nav class="flex flex-col gap-10 text-3xl font-medium">
                        <div in:fly={{ x: -20, delay: 200, duration: 500, easing: backOut }}>
                            <a 
                                href="http://github.com/abdulmumin1/littlestats" 
                                target="_blank" 
                                class="text-stone-600 dark:text-stone-400 flex items-center gap-4 hover:text-stone-900 dark:hover:text-white transition-colors"
                                onclick={() => isMobileMenuOpen = false}
                            >
                                <Github size={28} />
                                <span>GitHub</span>
                            </a>
                        </div>
                        <div in:fly={{ x: -20, delay: 300, duration: 500, easing: backOut }}>
                            <a 
                                href="#pricing" 
                                class="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                                onclick={() => isMobileMenuOpen = false}
                            >
                                Pricing
                            </a>
                        </div>
                        <div in:fly={{ x: -20, delay: 400, duration: 500, easing: backOut }}>
                            <a 
                                href="/signin" 
                                class="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                                onclick={() => isMobileMenuOpen = false}
                            >
                                Login
                            </a>
                        </div>
                        <div in:fly={{ y: 20, delay: 500, duration: 600, easing: backOut }} class="mt-4">
                            <a 
                                href="/signup" 
                                class="w-full py-5 px-3 text-center text-white bg-{$color}-600 hover:bg-{$color}-700 transition-all active:scale-[0.98] shadow-lg shadow-{$color}-600/20"
                                onclick={() => {
                                    isMobileMenuOpen = false;
                                    track("Get started", {color:$color});
                                }}
                            >
                                Get Started
                            </a>
                        </div>
                    </nav>

                    <div 
                        in:fade={{ delay: 800, duration: 400 }}
                        class="mt-auto text-center"
                    >
                        <p class="text-xs uppercase tracking-widest text-stone-400 dark:text-stone-600 font-medium">
                            A product of <span class="text-{$color}-600">The Thirdpen Company</span>
                        </p>
                    </div>
                </div>
            {/if}

             <!-- Logo / Brand (Minimal) -->
            <div class="mb-10">
                 <!-- <div class="w-8 h-8 bg-black rounded-none"></div> -->
                 <div class="flex items-center gap-2">
                    <Logo size={28} />
                    <span class="font-bold text-lg tracking-tight text-stone-900 dark:text-white mt-2">Littlestats</span>
                 </div>
            </div>

            <h1 class="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight max-w-4xl mt-8 text-stone-900 dark:text-white leading-[1.1]">
                Data to make <span class="text-{$color}-400 italic font-serif dark:text-{$color}-200">good</span> <br> 
                <span class="text-{$color}-600">business decisions</span>
            </h1>
            <p class="mt-6 text-xl text-stone-500 dark:text-stone-400 max-w-2xl font-light">
                Analytics that helps you understand your users without the complexity.
            </p>
        </header>

        <!-- Demo / Interaction Section -->
        <div class="flex flex-col md:flex-row min-h-[600px] bg-stone-50/30 dark:bg-stone-950/20">
            
            <!-- Sidebar -->
            <aside class="w-full md:w-64 border-b md:border-b-0 md:border-r border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
                <div class="flex flex-row md:flex-col overflow-x-auto md:overflow-visible p-2 md:p-4 gap-1">
                    <div class="hidden md:block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 px-3 mt-2">Analytics</div>
                    {#each features as feature}
                        <button 
                            onclick={() => activeTab = feature.id}
                            class="flex-1 md:flex-none text-left px-3 py-2  flex items-center justify-between
                            transition-all duration-200 outline-none
                            {activeTab === feature.id ? `bg-{$color}-50 dark:bg-{$color}-900/20 text-{$color}-700 dark:text-{$color}-300` : 'text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white'}"
                        >
                            <div class="flex items-center gap-3">
                                <feature.icon size={18} class={activeTab === feature.id ? `text-{$color}-600` : 'text-stone-400'} />
                                <span class="text-sm font-medium">{feature.label}</span>
                            </div>
                            
                            {#if feature.id === 'feedback' && newFeedbackCount > 0}
                                <span class="bg-{$color}-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-none min-w-[1.2rem] text-center tabular-nums">
                                    {newFeedbackCount}
                                </span>
                            {/if}
                        </button>
                    {/each}
                </div>
            </aside>

            <!-- Main Content Area -->
            <div class="flex-1 bg-white dark:bg-stone-900 relative overflow-hidden flex flex-col">
                <!-- Toolbar -->
                <div class="border-b border-stone-100 dark:border-stone-800 p-4 flex justify-between items-center bg-white dark:bg-stone-900 sticky top-0 z-10 h-16">
                    <div class="font-medium text-sm text-stone-500 flex items-center gap-2">
                         <!-- <div class="w-2 h-2 bg-emerald-500 animate-pulse"></div> -->
                    </div>
                     <Dropdown
                        on:change={handleDateChange}
                        title="Filter"
                        options={optis}
                        value={sortInterval}
                    />
                </div>

                <!-- Content -->
                <div class="p-4 md:p-8 h-full overflow-y-auto bg-white dark:bg-stone-900">
                    {#if activeTab === 'traffic'}
                        <div in:fade={{duration: 300}}>
                            {#if trafficDemoData}
                                <Traffic 
                                    page_data={trafficDemoData} 
                                    current_domain={{name: 'Demo Site'}} 
                                    domain_id="demo" 
                                    demoData={trafficDemoData}
                                />
                            {:else}
                                <div class="flex items-center justify-center h-64 text-stone-400">Loading...</div>
                            {/if}
                        </div>
                    {:else if activeTab === 'funnels'}
                         <div in:fade={{duration: 300}}>
                             <Funnels {funnelStepsContext} />
                         </div>
                    {:else if activeTab === 'campaigns'}
                         <div in:fade={{duration: 300}}>
                            {#if dataGenerated}
                                <Campaigns demo={true} events={events_dummies} dateRange={dashboardStore.dateRange} />
                            {:else}
                                <div class="flex items-center justify-center h-64 text-stone-400">Loading...</div>
                            {/if}
                         </div>
                    {:else if activeTab === 'events'}
                         <div in:fade={{duration: 300}}>
                            {#if dataGenerated}
                                <Events 
                                    page_data={events_dummies} 
                                    {eventCounts} 
                                    loadingLog={false}
                                    totalLogEvents={events_dummies.length}
                                />
                            {:else}
                                <div class="flex items-center justify-center h-64 text-stone-400">Loading...</div>
                            {/if}
                        </div>
                    {:else if activeTab === 'feedback'}
                        <div in:fade={{duration: 300}}>
                            <Feedback 
                                demo={true} 
                                demoData={mockFeedbackData} 
                                siteId="demo"
                                current_domain={{name: 'Demo Site'}}
                            />
                        </div>
                    {/if}
                </div>
            </div>
        </div>

        <!-- Pricing Section (Inside the board) -->
        <div id="pricing" class="border-t border-stone-200 dark:border-stone-800 p-8 md:p-12 bg-stone-50/30 dark:bg-stone-950/20">
            <div class="flex flex-col md:flex-row gap-12 items-start justify-between">
                <div class="max-w-xs">
                    <h3 class="text-2xl font-bold mb-3 text-stone-900 dark:text-white">Pricing</h3>
                    <p class="text-stone-500 dark:text-stone-400 leading-relaxed">For chopped founders</p>
                </div>
                
                <div class="flex flex-col gap-6 w-full max-w-4xl">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                        <!-- Basic Plan -->
                        <div class="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6  transition-all duration-300">
                            <div class="flex justify-between items-baseline mb-2">
                                <span class="font-bold text-lg text-stone-900 dark:text-white">Basic</span>
                                <span class="text-3xl font-bold tracking-tight text-stone-900 dark:text-white">Free</span>
                            </div>
                            <div class="text-sm text-stone-500 dark:text-stone-400 mb-6"></div>
                            
                            <ul class="space-y-3 text-sm text-stone-600 dark:text-stone-300 mb-8">
                                <li class="flex gap-3 items-center"><span class="text-{$color}-600 bg-{$color}-50 dark:bg-{$color}-900/20 p-0.5">✓</span> 500k Events/Months</li>
                                <li class="flex gap-3 items-center"><span class="text-{$color}-600 bg-{$color}-50 dark:bg-{$color}-900/20 p-0.5">✓</span> 2 Websites</li>
                                <li class="flex gap-3 items-center"><span class="text-{$color}-600 bg-{$color}-50 dark:bg-{$color}-900/20 p-0.5">✓</span> 3 Months Retention</li>
                            </ul>
                            <a href="/signup" class="block text-center w-full border border-stone-200 dark:border-stone-800 py-2.5  font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition-colors">Start Free</a>
                        </div>

                        <!-- Pro Plan -->
                        <div class="bg-white dark:bg-stone-900 border border-{$color}-200  p-6 relative overflow-hidden ">
                            <div class="absolute top-0 right-0 bg-{$color}-50 dark:bg-{$color}-900/40 text-{$color}-700 dark:text-{$color}-300 text-[10px] font-bold px-3 py-1  uppercase tracking-wider">
                                Recommended
                            </div>
                            <div class="flex justify-between items-baseline mb-2">
                                <span class="font-bold text-lg text-stone-900 dark:text-white">Pro</span>
                                <span class="text-3xl font-bold tracking-tight text-stone-900 dark:text-white">$5</span>
                            </div>
                            <div class="text-sm text-stone-500 dark:text-stone-400 mb-6">/month</div>

                            <ul class="space-y-3 text-sm text-stone-600 dark:text-stone-300 mb-8">
                                <li class="flex gap-3 items-center"><span class="text-{$color}-600 bg-{$color}-50 dark:bg-{$color}-900/20 p-0.5">✓</span> 5M Events/Months</li>
                                <li class="flex gap-3 items-center"><span class="text-{$color}-600 bg-{$color}-50 dark:bg-{$color}-900/20 p-0.5">✓</span> 10 Websites</li>
                                <li class="flex gap-3 items-center"><span class="text-{$color}-600 bg-{$color}-50 dark:bg-{$color}-900/20 p-0.5">✓</span> 6 Months Retention</li>
                            </ul>
                            <a href="/signup" class="block text-center w-full bg-{$color}-600 text-white  py-2.5  font-medium   transition-all">Select Pro</a>
                        </div>
                    </div>

                    <!-- Self-Hostable (Full Width) -->
                    <div class="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 transition-all duration-300 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div class="flex flex-col gap-1 w-full md:w-auto">
                            <div class="flex items-center gap-3">
                                <span class="font-bold text-lg text-stone-900 dark:text-white">Self-Hostable</span>
                            </div>
                            <div class="text-sm text-stone-500 dark:text-stone-400">Deploy on your own infrastructure with full data control.</div>
                        </div>

                         <a href="http://github.com/abdulmumin1/littlestats" target="_blank" class="w-full md:w-auto px-8 py-2.5 border border-stone-200 dark:border-stone-800 font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition-colors whitespace-nowrap">
                            View GitHub
                         </a>
                    </div>
                </div>
            </div>
        </div>

    </div>

    <!-- Footer (Outside Board) -->
    <div class="w-full max-w-[1200px] mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm px-4">
        <div class="text-stone-400 dark:text-stone-500"><p class="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-600 font-medium">
					A product of <a href="https://thirdpen.app" target="_blank" class="hover:text-{$color}-600 text-{$color}-600 transition-colors">The Thirdpen Company</a>
				</p></div>
        <div class="flex gap-6 text-stone-500 dark:text-stone-400">
             <a href="/docs" class="hover:text-stone-900 dark:hover:text-white transition-colors">Documentation</a>
             <a href="/privacy" class="hover:text-stone-900 dark:hover:text-white transition-colors">Privacy</a>
             <a href="/terms" class="hover:text-stone-900 dark:hover:text-white transition-colors">Terms</a>
        </div>
    </div>

</main>

<style>
    /* Ensure font smoothing for the minimal look */
    :global(body) {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
</style>