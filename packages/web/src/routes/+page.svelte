<script>
	import { fade } from 'svelte/transition';
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
        getMockOS
    } from '$lib/mockData.js';
	import Funnels from '$lib/components/pages/funnels.svelte';
	import Events from '$lib/components/pages/events.svelte';
	import Retension from '$lib/components/analytics/retension.svelte';
    import Traffic from '$lib/components/pages/traffic.svelte'; // Use real Traffic component
    import Dropdown from '$lib/components/generals/dropdown.svelte';
    import DarkMode from '$lib/components/generals/darkMode.svelte';
	import { defaultRange as globalRange, optis } from '$lib/globalstate.svelte.js';
    import { dashboardStore } from '$lib/stores/dashboard.svelte.js';
    import { writable } from 'svelte/store';

    // Icons
    import { LineChart, Filter, RotateCcw, MousePointer2 } from 'lucide-svelte';

    // Data handling for Demo
    let funnelStepsContext = writable({
		name: 'Demo Funnel',
		type: 'session',
		steps: mockDataFunnelSteps
	});

    let {data} = $props();
	let dummyies = $state(generateRandomEvents(5000));
	let events_dummies = $derived(dummyies);
    
    // Derived Event Counts for the Events Component
    // This needs to be reactive to the mock data range if we were filtering mock data by globalRange here,
    // but dummyies is static for now. We can make it reactive if needed.
    let eventCounts = $derived(getMockEventCounts(events_dummies));

    // Prepare demo data for Traffic component
    let trafficDemoData = $derived({
        stats: getMockStatsSummary(events_dummies, dashboardStore.dateRange),
        timeSeries: getMockTimeSeries(events_dummies, dashboardStore.dateRange, 'day').map(d => ({
            timestamp: d.timestamp,
            views: d.views,
            visits: d.visits,
            visitors: d.visitors
        })),
        pages: getMockPages(events_dummies, dashboardStore.dateRange).slice(0, 5),
        allPages: getMockPages(events_dummies, dashboardStore.dateRange),
        referrers: getMockReferrers(events_dummies, dashboardStore.dateRange).slice(0, 5),
        allReferrers: getMockReferrers(events_dummies, dashboardStore.dateRange),
        countries: getMockCountries(events_dummies, dashboardStore.dateRange).slice(0, 5),
        allCountries: getMockCountries(events_dummies, dashboardStore.dateRange),
        devices: getMockDevices(events_dummies, dashboardStore.dateRange)
    });

    // Features List for Sidebar
    const features = [
		{ id: 'traffic', label: 'traffic', component: 'Traffic', icon: LineChart },
		{ id: 'funnels', label: 'conversion', component: 'Funnels', icon: Filter },
        { id: 'retension', label: 'retention', component: 'Retention', icon: RotateCcw },
		{ id: 'events', label: 'events', component: 'Events', icon: MousePointer2 },
	];

    let activeTab = $state(features[0].id);

    // Derived Data
    let sortInterval = $derived(globalRange.getSingle());

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

    // Helper functions from ImageSection
    function getISOWeekNumber(date) {
		const target = new Date(date.valueOf());
		const dayNr = (date.getDay() + 6) % 7;
		target.setDate(target.getDate() - dayNr + 3);
		const firstThursday = target.valueOf();
		target.setMonth(0, 1);
		if (target.getDay() !== 4) {
			target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
		}
		return 1 + Math.ceil((firstThursday - target) / 604800000);
	}

	function calculateWeeklyUsersRaw(events) {
		const weeklyUsers = {};
		events.forEach((event) => {
			if (!event.timestamp || !event.user_id) return;
			const date = new Date(event.timestamp);
			const weekKey = `${date.getFullYear()}-W${getISOWeekNumber(date)}`;
			(weeklyUsers[weekKey] ||= new Set()).add(event.user_id);
		});
		return weeklyUsers;
	}

	function calculateRetention(raw) {
		const keys = Object.keys(raw).sort();
		const weeklyCounts = {};

		keys.forEach((baseKey, i) => {
			weeklyCounts[baseKey] = {};
			keys.slice(i).forEach((otherKey) => {
				weeklyCounts[baseKey][otherKey] = raw[baseKey].intersection(raw[otherKey]).size;
			});
		});
		return weeklyCounts;
	}

	let retensionData = $derived(calculateRetention(calculateWeeklyUsersRaw(dummyies)));
	let funnelData = $derived(calculateFunnel(mockDataFunnel, mockDataFunnelSteps, 'user'));

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
            <!-- Minimal Nav Positioned Absolute -->
            <div class="absolute top-4 right-4 md:top-8 md:right-8 flex gap-6 items-center text-sm font-medium text-stone-600 dark:text-stone-400">
                <a href="#pricing" class="hover:text-stone-900 dark:hover:text-white transition-colors">pricing</a>
                <a href="/signin" class="hover:text-stone-900 dark:hover:text-white transition-colors">login</a>
                <a href="/signup" class="px-4 py-2 bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-100 transition-all ">get started</a>
                <DarkMode />
            </div>

             <!-- Logo / Brand (Minimal) -->
            <div class="mb-10">
                 <!-- <div class="w-8 h-8 bg-black rounded-none"></div> -->
                 <div class="flex items-center gap-2">
                    <Logo size={28} />
                    <span class="font-bold text-lg tracking-tight text-stone-900 dark:text-white">LITTLESTATS</span>
                 </div>
            </div>

            <h1 class="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight max-w-4xl mt-8 text-stone-900 dark:text-white leading-[1.1]">
                Data to make <br>
                <span class="text-{$color}-600">business decisions</span>
            </h1>
            <p class="mt-6 text-xl text-stone-500 dark:text-stone-400 max-w-2xl font-light">
                Simple, privacy-focused analytics that helps you understand your users without the complexity.
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
                            class="flex-1 md:flex-none text-left px-3 py-2  flex items-center gap-3
                            transition-all duration-200 outline-none
                            {activeTab === feature.id ? `bg-{$color}-50 dark:bg-{$color}-900/20 text-{$color}-700 dark:text-{$color}-300` : 'text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white'}"
                        >
                            <feature.icon size={18} class={activeTab === feature.id ? `text-{$color}-600` : 'text-stone-400'} />
                            <span class="text-sm font-medium">{feature.label}</span>
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
                            <Traffic 
                                page_data={trafficDemoData} 
                                current_domain={{name: 'Demo Site'}} 
                                domain_id="demo" 
                                demoData={trafficDemoData}
                            />
                        </div>
                    {:else if activeTab === 'funnels'}
                         <div in:fade={{duration: 300}}>
                             <Funnels {funnelStepsContext} />
                         </div>
                    {:else if activeTab === 'retension'}
                        <div in:fade={{duration: 300}}>
                             <Retension events={retensionData} />
                        </div>
                    {:else if activeTab === 'events'}
                         <div in:fade={{duration: 300}}>
                            <Events 
                                page_data={events_dummies} 
                                {eventCounts} 
                                loadingLog={false}
                                totalLogEvents={events_dummies.length}
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
                    <h3 class="text-2xl font-bold mb-3 text-stone-900 dark:text-white">Simple Pricing</h3>
                    <p class="text-stone-500 dark:text-stone-400 leading-relaxed">Transparent pricing that scales with you. No hidden fees or surprise charges.</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                    <!-- Basic Plan -->
                    <div class="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6  transition-all duration-300">
                        <div class="flex justify-between items-baseline mb-2">
                            <span class="font-bold text-lg text-stone-900 dark:text-white">Basic</span>
                            <span class="text-3xl font-bold tracking-tight text-stone-900 dark:text-white">Free</span>
                        </div>
                        <div class="text-sm text-stone-500 dark:text-stone-400 mb-6">/</div>
                        
                        <ul class="space-y-3 text-sm text-stone-600 dark:text-stone-300 mb-8">
                             <li class="flex gap-3 items-center"><span class="text-{$color}-600 bg-{$color}-50 dark:bg-{$color}-900/20 p-0.5">✓</span> 500k Events/Months</li>
                             <li class="flex gap-3 items-center"><span class="text-{$color}-600 bg-{$color}-50 dark:bg-{$color}-900/20 p-0.5">✓</span> 2 Websites</li>
                             <li class="flex gap-3 items-center"><span class="text-{$color}-600 bg-{$color}-50 dark:bg-{$color}-900/20 p-0.5">✓</span> 3 Months Retention</li>
                        </ul>
                         <a href="/signup" class="block text-center w-full border border-stone-200 dark:border-stone-800 py-2.5  font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition-colors">Select Basic</a>
                    </div>

                     <!-- Pro Plan -->
                     <div class="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 relative overflow-hidden ring-2 ring-{$color}-500/10 dark:ring-{$color}-500/20 ">
                         <div class="absolute top-0 right-0 bg-{$color}-50 dark:bg-{$color}-900/40 text-{$color}-700 dark:text-{$color}-300 text-[10px] font-bold px-3 py-1  uppercase tracking-wider">
                             Recommended
                         </div>
                        <div class="flex justify-between items-baseline mb-2">
                            <span class="font-bold text-lg text-stone-900 dark:text-white">Pro</span>
                            <span class="text-3xl font-bold tracking-tight text-stone-900 dark:text-white">$3.99</span>
                        </div>
                        <div class="text-sm text-stone-500 dark:text-stone-400 mb-6">/month</div>

                        <ul class="space-y-3 text-sm text-stone-600 dark:text-stone-300 mb-8">
                             <li class="flex gap-3 items-center"><span class="text-{$color}-600 bg-{$color}-50 dark:bg-{$color}-900/20 p-0.5">✓</span> 5M Events/Months</li>
                             <li class="flex gap-3 items-center"><span class="text-{$color}-600 bg-{$color}-50 dark:bg-{$color}-900/20 p-0.5">✓</span> 10 Websites</li>
                             <li class="flex gap-3 items-center"><span class="text-{$color}-600 bg-{$color}-50 dark:bg-{$color}-900/20 p-0.5">✓</span> 6 Months Retention</li>
                        </ul>
                         <a href="/signup" class="block text-center w-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 py-2.5  font-medium hover:bg-stone-800 dark:hover:bg-stone-100  transition-all">Select Pro</a>
                    </div>
                </div>
            </div>
        </div>

    </div>

    <!-- Footer (Outside Board) -->
    <div class="w-full max-w-[1200px] mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm px-4">
        <div class="text-stone-400 dark:text-stone-500">© {new Date().getFullYear()} Littlestats. All rights reserved.</div>
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