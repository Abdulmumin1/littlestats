<script>
	import { CircleOff, Maximize } from 'lucide-svelte';
	import BottomDrawer from '../generals/bottomDrawer.svelte';
	import PageItem from './pageItem.svelte';
	import { color } from '$lib/colors/mixer.js';
	import EmptyValues from './emptyValues.svelte';
	import { flip } from 'svelte/animate';
	import MiniSectionWrapper from './miniSectionWrapper.svelte';

	let { views, domain, jump = true } = $props();
	let max_page_item_count = 6;

	function parseUserAgent(userAgent) {
		let browser = 'Unknown';

		// Converting to lowercase for case-insensitive matching
		const ua = userAgent.toLowerCase();

		// Specialized Browsers
		if (ua.includes('silk/')) {
			browser = 'Amazon Silk';
		} else if (ua.includes('phantomjs')) {
			browser = 'PhantomJS';
		} else if (ua.includes('electron')) {
			browser = 'Electron';
		} else if (ua.includes('googlebot')) {
			browser = 'Google Bot';
		}
		// Chromium-based browsers (check these first to avoid false Safari detection)
		else if (ua.includes('edg/') || ua.includes('edge/')) {
			browser = 'Edge';
		} else if (ua.includes('opr/') || ua.includes('opera/')) {
			browser = 'Opera';
		} else if (ua.includes('samsung browser') || ua.includes('samsungbrowser')) {
			browser = 'Samsung Browser';
		} else if (ua.includes('ucbrowser') || ua.includes('uc browser')) {
			browser = 'UC Browser';
		} else if (ua.includes('yabrowser')) {
			browser = 'Yandex';
		} else if (ua.includes('vivaldi')) {
			browser = 'Vivaldi';
		} else if (ua.includes('brave')) {
			browser = 'Brave';
		} else if (ua.includes('whale/')) {
			browser = 'Naver Whale';
		} else if (ua.includes('maxthon')) {
			browser = 'Maxthon';
		} else if (ua.includes('qihu 360')) {
			browser = '360 Browser';
		} else if (ua.includes('coc_coc_browser')) {
			browser = 'Coc Coc';
		} else if (ua.includes('dragon/')) {
			browser = 'Comodo Dragon';
		} else if (ua.includes('iron/')) {
			browser = 'SRWare Iron';
		} else if (ua.includes('chromium/')) {
			browser = 'Chromium';
		} else if (ua.includes('chrome/')) {
			browser = 'Chrome';
		}
		// Non-Chromium browsers
		else if (ua.includes('firefox/')) {
			if (ua.includes('seamonkey')) {
				browser = 'SeaMonkey';
			} else if (ua.includes('waterfox')) {
				browser = 'Waterfox';
			} else if (ua.includes('palemoon')) {
				browser = 'Pale Moon';
			} else {
				browser = 'Firefox';
			}
		} else if (ua.includes('safari/') && !ua.includes('chrome/')) {
			browser = 'Safari';
		} else if (ua.includes('trident/') || ua.includes('msie')) {
			browser = 'Internet Explorer';
		}
		// Mobile-specific browsers
		else if (ua.includes('dolphin')) {
			browser = 'Dolphin';
		} else if (ua.includes('coast/')) {
			browser = 'Opera Coast';
		} else if (ua.includes('phoenix/')) {
			browser = 'Phoenix';
		} else if (ua.includes('duckduckgo/')) {
			browser = 'DuckDuckGo';
		} else if (ua.includes('focus/')) {
			browser = 'Firefox Focus';
		} else if (ua.includes('kiwi')) {
			browser = 'Kiwi';
		}
		// Privacy-focused browsers
		else if (ua.includes('tor')) {
			browser = 'Tor Browser';
		} else if (ua.includes('epic/')) {
			browser = 'Epic Privacy Browser';
		}

		// Get browser version
		const version = getBrowserVersion(ua, browser);

		// Get additional details
		const details = getBrowserDetails(ua, browser);

		return {
			name: browser,
			version: version,
			...details
		};
	}

	function getBrowserVersion(ua, browserName) {
		let version = '';

		try {
			switch (browserName) {
				case 'Chrome':
					version = ua.match(/chrome\/([0-9.]+)/)?.[1];
					break;
				case 'Firefox':
				case 'Waterfox':
				case 'Pale Moon':
					version = ua.match(/(?:firefox|waterfox|palemoon)\/([0-9.]+)/)?.[1];
					break;
				case 'Safari':
					version = ua.match(/version\/([0-9.]+)/)?.[1];
					break;
				case 'Edge':
					version = ua.match(/edg(?:e)?\/([0-9.]+)/)?.[1];
					break;
				case 'Opera':
					version = ua.match(/(?:opera|opr)\/([0-9.]+)/)?.[1];
					break;
				case 'Internet Explorer':
					version = ua.match(/(?:msie |rv:)([0-9.]+)/)?.[1];
					break;
				case 'Samsung Browser':
					version = ua.match(/samsungbrowser\/([0-9.]+)/)?.[1];
					break;
				case 'UC Browser':
					version = ua.match(/ucbrowser\/([0-9.]+)/)?.[1];
					break;
				case 'Yandex':
					version = ua.match(/yabrowser\/([0-9.]+)/)?.[1];
					break;
				case 'Naver Whale':
					version = ua.match(/whale\/([0-9.]+)/)?.[1];
					break;
				case 'DuckDuckGo':
					version = ua.match(/duckduckgo\/([0-9.]+)/)?.[1];
					break;
				case 'Amazon Silk':
					version = ua.match(/silk\/([0-9.]+)/)?.[1];
					break;
				case 'Dolphin':
					version = ua.match(/dolphin\/([0-9.]+)/)?.[1];
					break;
				case 'Kiwi':
					version = ua.match(/kiwi\s?browser\/([0-9.]+)/)?.[1];
					break;
				default:
					// Generic version extraction attempt
					const matches = ua.match(/(?:version|v)[\s\/]([0-9.]+)/i);
					version = matches ? matches[1] : '';
			}
		} catch (e) {
			version = 'unknown';
		}

		return version || 'unknown';
	}

	function getBrowserDetails(ua, browserName) {
		const details = {
			engine: 'Unknown',
			isPrivate: false,
			isMobile: false,
			platform: 'Unknown'
		};

		// Detect rendering engine
		if (ua.includes('gecko/')) {
			details.engine = 'Gecko';
		} else if (ua.includes('webkit/')) {
			details.engine = 'WebKit';
		} else if (ua.includes('presto/')) {
			details.engine = 'Presto';
		} else if (ua.includes('trident/')) {
			details.engine = 'Trident';
		}

		// Detect if privacy-focused
		if (['Tor Browser', 'Epic Privacy Browser', 'Brave'].includes(browserName)) {
			details.isPrivate = true;
		}

		// Detect if mobile
		if (
			ua.includes('mobile') ||
			ua.includes('android') ||
			ua.includes('iphone') ||
			ua.includes('ipod') ||
			ua.includes('ipad') ||
			ua.includes('windows phone')
		) {
			details.isMobile = true;
		}

		// Detect platform
		if (ua.includes('windows')) {
			details.platform = 'Windows';
		} else if (ua.includes('macintosh') || ua.includes('mac os x')) {
			details.platform = 'macOS';
		} else if (ua.includes('linux')) {
			details.platform = 'Linux';
		} else if (ua.includes('android')) {
			details.platform = 'Android';
		} else if (ua.includes('iphone') || ua.includes('ipod') || ua.includes('ipad')) {
			details.platform = 'iOS';
		}

		return details;
	}

	function fetchPages(events) {
		let uniquePages = new Map();

		events.forEach((event) => {
			// console.log(event);
			let ref = event.user_agent;

			if (ref) {
				let user_agent = parseUserAgent(event.user_agent);
				let browser = user_agent.name;
				if (!uniquePages.has(browser)) {
					uniquePages.set(browser, 1);
				} else {
					uniquePages.set(browser, uniquePages.get(browser) + 1);
				}
			}
		});

		return Array.from(uniquePages).sort((a, b) => b[1] - a[1]);
	}

	let pages = $derived(fetchPages(views));
	let fullPages = $state([...pages]);
	let trunaced_pages = $derived([...pages].splice(0, max_page_item_count));

	let trottle;
	function searchQuery(event) {
		clearTimeout(trottle);
		trottle = setTimeout(() => {
			let query = event.target.value;

			fullPages = pages.filter((e) => e[0].toLowerCase().search(query.toLowerCase()) !== -1);
			// console.log(fullPages)
		});
	}
</script>

<MiniSectionWrapper title="Browser">
	<div class="flex h-full flex-col gap-1">
		{#each trunaced_pages as page (page[0])}
			<div animate:flip={{ duration: 150 }} class="w-full">
				<PageItem {jump} on:filter type="browser" path={page[0]} views={page[1]} />
			</div>
		{:else}
			<EmptyValues />
		{/each}

		{#if trunaced_pages.length < fetchPages(views).length}
			<BottomDrawer {searchQuery}>
				{#snippet handle()}
					<div>
						<button class="no-bg mx-auto flex items-center justify-center gap-2 text-right"
							>more <Maximize size={15} /></button
						>
					</div>
				{/snippet}
				{#snippet header()}
					<div
						style="padding: 0 20px;"
						class="sticky top-0 mb-3 flex justify-between text-gray-950 dark:text-gray-100"
					>
						<p>Browsers</p>
						<p>Views</p>
					</div>
				{/snippet}
				{#snippet content()}
					<div class="no-scrollbar relative flex flex-col gap-1 overflow-y-auto px-[20px] py-2">
						{#each fullPages as page (page[0])}
							<div animate:flip={{ duration: 100 }}>
								<PageItem {jump} on:filter type="browser" path={page[0]} views={page[1]} />
							</div>
						{:else}
							<p>Nothing yet!</p>
						{/each}
					</div>
				{/snippet}
			</BottomDrawer>
		{/if}
	</div>
</MiniSectionWrapper>
