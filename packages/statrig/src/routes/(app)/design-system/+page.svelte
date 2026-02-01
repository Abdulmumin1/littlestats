<script>
	import { color } from '$lib/colors/mixer.js';
	import { Moon, Sun, Palette, LayoutGrid, Sparkles, MessageSquare, ArrowRight, MousePointerClick, Table2, Layers } from 'lucide-svelte';

	const TOKENS = {
		color: {
			bg: {
				light: 'bg-white',
				dark: 'bg-stone-950',
			},
			accent: {
				primary: () => `bg-${$color}-600 hover:bg-${$color}-700 text-white`,
				ring: () => `focus:ring-${$color}-500`
			}
		},
		radius: {
			section: 'rounded-3xl',
			card: 'rounded-2xl',
			item: 'rounded-xl',
			pill: 'rounded-full'
		},
		elevation: {
			none: 'shadow-none',
			border: 'border border-stone-100 dark:border-stone-800'
		}
	};
</script>

<div class="space-y-10 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
	<!-- Hero / Header -->
	<header>
		<div class="py-12 px-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 text-center space-y-4 relative overflow-hidden">
			<div class="relative z-10 space-y-4">
				<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 text-[10px] font-black uppercase tracking-widest border border-stone-200 dark:border-stone-700">
					<Sparkles size={10} /> Design System v2.2
				</div>
				<h1 class="text-4xl font-serif italic text-stone-900 dark:text-white tracking-tight leading-tight">
					Flat, colorful, compact
				</h1>
				<p class="text-base text-stone-500 dark:text-stone-400 max-w-xl mx-auto font-light leading-relaxed italic">
					Standardizing on high-contrast neutrals and dynamic accents. <br/>No shadows, max-w-7xl, and professional typography.
				</p>
				<div class="flex items-center justify-center gap-3 pt-2">
					<button class={`px-6 py-2 rounded-full bg-${$color}-600 text-white text-xs font-bold hover:bg-${$color}-700 transition-all`}>Colorful Pill</button>
					<button class="px-6 py-2 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs font-bold hover:bg-stone-50 dark:hover:bg-stone-800 transition-all">Outlined Pill</button>
				</div>
			</div>
		</div>
	</header>

	<!-- Foundation Primitives -->
	<section class="space-y-4">
		<div class="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-black text-stone-400">
			<LayoutGrid size={12} /> Foundations
		</div>
		<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
			<div class="p-6 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 space-y-2 shadow-sm">
				<div class="text-[10px] uppercase tracking-widest font-black text-stone-400">Stone 50</div>
				<div class="text-xl font-serif italic text-stone-900 dark:text-white">Neutral</div>
			</div>
			<div class="p-6 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-2 shadow-sm">
				<div class="text-[10px] uppercase tracking-widest font-black text-stone-500">Stone 100</div>
				<div class="text-xl font-serif italic text-stone-900 dark:text-white">Surface</div>
			</div>
			<div class="p-6 rounded-2xl bg-stone-200 dark:bg-stone-700 border border-stone-300 dark:border-stone-600 space-y-2 shadow-sm">
				<div class="text-[10px] uppercase tracking-widest font-black text-stone-600">Stone 200</div>
				<div class="text-xl font-serif italic text-stone-900 dark:text-white">Contrast</div>
			</div>
			<div class="p-6 rounded-2xl bg-stone-900 dark:bg-stone-100 border border-stone-800 dark:border-stone-200 space-y-2 shadow-sm">
				<div class="text-[10px] uppercase tracking-widest font-black text-stone-400 dark:text-stone-500">Stone 900</div>
				<div class="text-xl font-serif italic text-stone-50 dark:text-stone-900">Primary</div>
			</div>
		</div>
	</section>

	<!-- Layout Components -->
	<section class="grid grid-cols-1 lg:grid-cols-3 gap-8">
		<div class="lg:col-span-2">
			<div class="p-10 rounded-3xl bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 h-full flex flex-col justify-between shadow-sm relative overflow-hidden">
				<div class="relative z-10">
					<div class="flex items-center gap-5 mb-12">
						<div class="h-12 w-12 rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-center shadow-sm">
							<MessageSquare class="text-stone-900 dark:text-stone-100" size={24} />
						</div>
						<div>
							<h3 class="text-2xl font-semibold text-stone-900 dark:text-white tracking-tight">Stone Interface</h3>
							<p class="text-base text-stone-500 font-light italic font-serif opacity-80">Strict neutral editorial style</p>
						</div>
					</div>

					<div class="space-y-6">
						<h4 class="text-3xl font-serif italic tracking-tight leading-tight max-w-lg">
							Flat surfaces and <br/>high-contrast neutrals
						</h4>
						<p class="text-lg text-stone-600 dark:text-stone-400 font-light leading-relaxed max-w-xl">
							Removing tints and grids in favor of a pure stone-based system. Deep obsidian darks and clean paper whites.
						</p>
						<button class="inline-flex items-center gap-3 text-stone-900 dark:text-stone-100 font-bold uppercase tracking-widest text-xs group pt-4">
							Standard Action <ArrowRight size={16} class="transition-transform group-hover:translate-x-2" />
						</button>
					</div>
				</div>
			</div>
		</div>

		<div class="space-y-8 h-full rounded-none">
			<div class="p-10 rounded-none bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-6 h-1/2 flex flex-col justify-center shadow-none">
				<div class="text-xs uppercase tracking-widest font-black text-stone-500">Strict Rules</div>
				<ul class="space-y-4 text-stone-700 dark:text-stone-300">
					<li class="flex gap-3">
						<span class="text-stone-400 font-bold">01</span>
						<span class="text-sm font-medium"><span class="font-bold text-stone-900 dark:text-white">Neutrality:</span> Use only stone-based greys.</span>
					</li>
					<li class="flex gap-3">
						<span class="text-stone-400 font-bold">02</span>
						<span class="text-sm font-medium"><span class="font-bold text-stone-900 dark:text-white">Flatness:</span> No background patterns or grids.</span>
					</li>
					<li class="flex gap-3">
						<span class="text-stone-400 font-bold">03</span>
						<span class="text-sm font-medium"><span class="font-bold text-stone-900 dark:text-white">Radii:</span> Sharp edges for containers.</span>
					</li>
				</ul>
			</div>
			
			<div class="p-10 rounded-none bg-white dark:bg-stone-950 border border-stone-100 dark:border-stone-900 space-y-6 shadow-none h-1/2 flex flex-col justify-center">
				<div class="text-xs uppercase tracking-widest font-black text-stone-400 text-center">Controls</div>
				<div class="flex flex-col gap-3">
					<button class="w-full py-3 rounded-none bg-stone-100 dark:bg-stone-800 text-sm font-semibold hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">Neutral Control</button>
					<button class="w-full py-3 rounded-none bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-bold hover:opacity-90 transition-colors">Primary Control</button>
					<button class="w-full py-3 rounded-none bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 text-sm font-semibold hover:bg-stone-100 transition-colors">Secondary</button>
				</div>
			</div>
		</div>
	</section>

	<!-- Layout & Spacing Codification -->
	<section class="space-y-4 rounded-none">
		<div class="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-black text-stone-400">
			<Layers size={12} /> Layout & Spacing
		</div>
		<div class="bg-white dark:bg-stone-800 rounded-none border border-stone-100 dark:border-stone-700 p-8 space-y-6 shadow-none">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
				<div class="space-y-3">
					<h3 class="text-base font-bold text-stone-900 dark:text-white uppercase tracking-tight">Container Hierarchy</h3>
					<div class="space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
						<div class="flex justify-between items-center p-2 rounded-none bg-stone-50 dark:bg-stone-900/50 border border-stone-100 dark:border-stone-800">
							<span>All Components</span>
							<code class="text-[10px] font-mono text-stone-400">rounded-none</code>
						</div>
						<div class="flex justify-between items-center p-2 rounded-none bg-stone-50 dark:bg-stone-900/50 border border-stone-100 dark:border-stone-800">
							<span>Elevation</span>
							<code class="text-[10px] font-mono text-stone-400">shadow-none (borders only)</code>
						</div>
						<div class="flex justify-between items-center p-2 rounded-none bg-stone-50 dark:bg-stone-900/50 border border-stone-100 dark:border-stone-800">
							<span>Accent Colors</span>
							<code class="text-[10px] font-mono text-stone-400">bg-&#123;$color&#125;-600</code>
						</div>
					</div>
				</div>
				<div class="space-y-3">
					<h3 class="text-base font-bold text-stone-900 dark:text-white uppercase tracking-tight">Compact Spacing</h3>
					<div class="space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
						<div class="flex justify-between items-center p-2 rounded-none bg-stone-50 dark:bg-stone-900/50 border border-stone-100 dark:border-stone-800">
							<span>Page Gap</span>
							<code class="text-[10px] font-mono text-stone-400">space-y-8</code>
						</div>
						<div class="flex justify-between items-center p-2 rounded-none bg-stone-50 dark:bg-stone-900/50 border border-stone-100 dark:border-stone-800">
							<span>Section Padding</span>
							<code class="text-[10px] font-mono text-stone-400">p-6 / p-8</code>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Interaction Patterns -->
	<section class="bg-white dark:bg-stone-800 rounded-none border border-stone-100 dark:border-stone-700 overflow-hidden shadow-none">
		<div class="px-8 py-6 border-b border-stone-100 dark:border-stone-700 flex items-center gap-3 rounded-none">
			<MousePointerClick size={18} class="text-stone-400" />
			<h2 class="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-widest">Component Patterns</h2>
		</div>

		<div class="p-8 space-y-10 rounded-none">
			<!-- Buttons -->
			<div class="space-y-4 rounded-none">
				<div class="flex items-center justify-between">
					<p class="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Primary Actions</p>
					<div class="inline-flex items-center gap-2 text-[10px] text-stone-400 font-medium italic font-serif">
						<Sun size={12} /> daylight / <Moon size={12} /> nightfall
					</div>
				</div>
				<div class="flex flex-wrap items-center gap-4">
					<button class={`px-6 py-2.5 rounded-none bg-${$color}-600 text-white text-xs font-bold hover:bg-${$color}-700 transition-all`}>
						Primary Flat
					</button>
					<button class="px-6 py-2.5 rounded-none border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white text-xs font-bold hover:bg-stone-50 dark:hover:bg-stone-800 transition-all">
						Secondary Outlined
					</button>
					<button class="px-4 py-2 rounded-none text-stone-500 font-black uppercase tracking-widest text-[10px] hover:text-stone-900 dark:hover:text-stone-100 transition-all">
						Ghost Action
					</button>
				</div>
			</div>

			<!-- Status Chips -->
			<div class="space-y-4 rounded-none">
				<p class="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Status & Deltas</p>
				<div class="flex flex-wrap items-center gap-3">
					<span class="inline-flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold rounded-none bg-stone-50 dark:bg-stone-900 text-emerald-600 border border-stone-100 dark:border-stone-800">
						<span class="h-1.5 w-1.5 rounded-none bg-emerald-500 animate-pulse"></span>
						Performance +12%
					</span>
					<span class="inline-flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold rounded-none bg-stone-50 dark:bg-stone-900 text-red-600 border border-stone-100 dark:border-stone-800">
						<span class="h-1.5 w-1.5 rounded-none bg-red-500"></span>
						Critical -3%
					</span>
					<span class="inline-flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold rounded-none bg-stone-50 dark:bg-stone-900 text-stone-500 border border-stone-100 dark:border-stone-800">
						Neutral State
					</span>
				</div>
			</div>

			<!-- Forms & Inputs -->
			<div class="space-y-4 rounded-none">
				<p class="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Forms & Inputs</p>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div class="space-y-1.5">
						<label for="ds-search" class="text-[10px] font-bold text-stone-400 uppercase ml-3 cursor-pointer">Search Domain</label>
						<div class="relative">
							<input 
								id="ds-search"
								type="text" 
								placeholder="thirdpen.app" 
								class="w-full px-5 py-3 rounded-none bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 text-xs focus:outline-none focus:ring-1 focus:ring-stone-400 transition-all"
							/>
							<div class="absolute right-2 top-1/2 -translate-y-1/2">
								<button aria-label="Search" class={`p-1.5 rounded-none bg-${$color}-600 text-white hover:bg-${$color}-700`}>
									<ArrowRight size={14} />
								</button>
							</div>
						</div>
					</div>
					<div class="space-y-1.5">
						<label for="ds-timeframe" class="text-[10px] font-bold text-stone-400 uppercase ml-3 cursor-pointer">Select Timeframe</label>
						<select id="ds-timeframe" class="w-full px-5 py-3 rounded-none bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 text-xs appearance-none focus:outline-none focus:ring-1 focus:ring-stone-400 transition-all">
							<option>Last 30 days (default)</option>
							<option>Last 7 days</option>
						</select>
					</div>
				</div>
			</div>

			<!-- Dashboard Table Pattern -->
			<div class="space-y-4 rounded-none">
				<p class="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Data List Style</p>
				<div class="bg-stone-50 dark:bg-stone-900/50 rounded-none overflow-hidden border border-stone-100 dark:border-stone-800">
					<div class="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-white/50 dark:bg-stone-900/50">
						<span class="text-[10px] font-black uppercase tracking-widest text-stone-400">Top Pages</span>
						<span class="text-xs font-bold text-stone-900 dark:text-white font-serif italic opacity-50">Views</span>
					</div>
					<div class="p-1">
						<div class="divide-y divide-stone-50 dark:divide-stone-800">
							{#each [
								{ path: '/site/e0e142e2...', val: 147 },
								{ path: '/events', val: 71 },
								{ path: '/', val: 67 }
							] as item}
								<div class="px-5 py-3 flex justify-between items-center group hover:bg-white dark:hover:bg-stone-800 rounded-none transition-all duration-300">
									<span class="text-xs font-medium text-stone-600 dark:text-stone-400 font-mono truncate">{item.path}</span>
									<span class="text-sm font-bold text-stone-900 dark:text-white tabular-nums">{item.val}</span>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</div>
