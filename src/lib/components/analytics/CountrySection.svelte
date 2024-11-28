<script>
	import { fade } from 'svelte/transition';
	import BottomDrawer from '../generals/bottomDrawer.svelte';
	import EmptyValues from './emptyValues.svelte';
	import PageItem from './pageItem.svelte';
	import { LoaderPinwheel } from 'lucide-svelte';
	import { color } from '$lib/colors/mixer.js';
	import { ip_cache } from '$lib/cache/ips.js';
	import { flip } from 'svelte/animate';
	import { getCountry } from '$lib/slug/helpers.js';
	import MiniSectionWrapper from './miniSectionWrapper.svelte';

	let { views, domain } = $props();
	let max_page_item_count = 6;

	// Function using IP geolocation service

	async function g(ip) {
		try {
			// Using ipapi.co - free tier has rate limits
			const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country`);
			if (!response.ok) {
				throw new Error('Failed to fetch location data');
			}

			const data = await response.json();
			return data.country;
		} catch (error) {
			throw new Error(`IP Geolocation error: ${error.message}`);
		}
	}
	// const countries = {
	// 	AF: 'Afghanistan',
	// 	AL: 'Albania',
	// 	DZ: 'Algeria',
	// 	AS: 'American Samoa',
	// 	AD: 'Andorra',
	// 	AO: 'Angola',
	// 	AI: 'Anguilla',
	// 	AQ: 'Antarctica',
	// 	AG: 'Antigua and Barbuda',
	// 	AR: 'Argentina',
	// 	AM: 'Armenia',
	// 	AW: 'Aruba',
	// 	AU: 'Australia',
	// 	AT: 'Austria',
	// 	AZ: 'Azerbaijan',
	// 	BS: 'Bahamas',
	// 	BH: 'Bahrain',
	// 	BD: 'Bangladesh',
	// 	BB: 'Barbados',
	// 	BY: 'Belarus',
	// 	BE: 'Belgium',
	// 	BZ: 'Belize',
	// 	BJ: 'Benin',
	// 	BM: 'Bermuda',
	// 	BT: 'Bhutan',
	// 	BO: 'Bolivia',
	// 	BQ: 'Bonaire, Sint Eustatius and Saba',
	// 	BA: 'Bosnia and Herzegovina',
	// 	BW: 'Botswana',
	// 	BV: 'Bouvet Island',
	// 	BR: 'Brazil',
	// 	IO: 'British Indian Ocean Territory',
	// 	BN: 'Brunei Darussalam',
	// 	BG: 'Bulgaria',
	// 	BF: 'Burkina Faso',
	// 	BI: 'Burundi',
	// 	CV: 'Cabo Verde',
	// 	KH: 'Cambodia',
	// 	CM: 'Cameroon',
	// 	CA: 'Canada',
	// 	KY: 'Cayman Islands',
	// 	CF: 'Central African Republic',
	// 	TD: 'Chad',
	// 	CL: 'Chile',
	// 	CN: 'China',
	// 	CX: 'Christmas Island',
	// 	CC: 'Cocos (Keeling) Islands',
	// 	CO: 'Colombia',
	// 	KM: 'Comoros',
	// 	CD: 'Congo, Democratic Republic of the',
	// 	CG: 'Congo',
	// 	CK: 'Cook Islands',
	// 	CR: 'Costa Rica',
	// 	HR: 'Croatia',
	// 	CU: 'Cuba',
	// 	CW: 'Curaçao',
	// 	CY: 'Cyprus',
	// 	CZ: 'Czech Republic',
	// 	DK: 'Denmark',
	// 	DJ: 'Djibouti',
	// 	DM: 'Dominica',
	// 	DO: 'Dominican Republic',
	// 	EC: 'Ecuador',
	// 	EG: 'Egypt',
	// 	SV: 'El Salvador',
	// 	GQ: 'Equatorial Guinea',
	// 	ER: 'Eritrea',
	// 	EE: 'Estonia',
	// 	SZ: 'Eswatini',
	// 	ET: 'Ethiopia',
	// 	FK: 'Falkland Islands (Malvinas)',
	// 	FO: 'Faroe Islands',
	// 	FJ: 'Fiji',
	// 	FI: 'Finland',
	// 	FR: 'France',
	// 	GF: 'French Guiana',
	// 	PF: 'French Polynesia',
	// 	TF: 'French Southern Territories',
	// 	GA: 'Gabon',
	// 	GM: 'Gambia',
	// 	GE: 'Georgia',
	// 	DE: 'Germany',
	// 	GH: 'Ghana',
	// 	GI: 'Gibraltar',
	// 	GR: 'Greece',
	// 	GL: 'Greenland',
	// 	GD: 'Grenada',
	// 	GP: 'Guadeloupe',
	// 	GU: 'Guam',
	// 	GT: 'Guatemala',
	// 	GG: 'Guernsey',
	// 	GN: 'Guinea',
	// 	GW: 'Guinea-Bissau',
	// 	GY: 'Guyana',
	// 	HT: 'Haiti',
	// 	HM: 'Heard Island and McDonald Islands',
	// 	VA: 'Holy See',
	// 	HN: 'Honduras',
	// 	HK: 'Hong Kong',
	// 	HU: 'Hungary',
	// 	IS: 'Iceland',
	// 	IN: 'India',
	// 	ID: 'Indonesia',
	// 	IR: 'Iran',
	// 	IQ: 'Iraq',
	// 	IE: 'Ireland',
	// 	IM: 'Isle of Man',
	// 	IL: 'Israel',
	// 	IT: 'Italy',
	// 	JM: 'Jamaica',
	// 	JP: 'Japan',
	// 	JE: 'Jersey',
	// 	JO: 'Jordan',
	// 	KZ: 'Kazakhstan',
	// 	KE: 'Kenya',
	// 	KI: 'Kiribati',
	// 	KP: "Korea, Democratic People's Republic of",
	// 	KR: 'Korea, Republic of',
	// 	KW: 'Kuwait',
	// 	KG: 'Kyrgyzstan',
	// 	LA: "Lao People's Democratic Republic",
	// 	LV: 'Latvia',
	// 	LB: 'Lebanon',
	// 	LS: 'Lesotho',
	// 	LR: 'Liberia',
	// 	LY: 'Libya',
	// 	LI: 'Liechtenstein',
	// 	LT: 'Lithuania',
	// 	LU: 'Luxembourg',
	// 	MO: 'Macao',
	// 	MG: 'Madagascar',
	// 	MW: 'Malawi',
	// 	MY: 'Malaysia',
	// 	MV: 'Maldives',
	// 	ML: 'Mali',
	// 	MT: 'Malta',
	// 	MH: 'Marshall Islands',
	// 	MQ: 'Martinique',
	// 	MR: 'Mauritania',
	// 	MU: 'Mauritius',
	// 	YT: 'Mayotte',
	// 	MX: 'Mexico',
	// 	FM: 'Micronesia, Federated States of',
	// 	MD: 'Moldova, Republic of',
	// 	MC: 'Monaco',
	// 	MN: 'Mongolia',
	// 	MH: 'Montenegro',
	// 	MS: 'Montserrat',
	// 	MA: 'Morocco',
	// 	MZ: 'Mozambique',
	// 	MM: 'Myanmar',
	// 	NA: 'Namibia',
	// 	NR: 'Nauru',
	// 	NP: 'Nepal',
	// 	NL: 'Netherlands',
	// 	NC: 'New Caledonia',
	// 	NZ: 'New Zealand',
	// 	NI: 'Nicaragua',
	// 	NE: 'Niger',
	// 	NG: 'Nigeria',
	// 	NU: 'Niue',
	// 	NF: 'Norfolk Island',
	// 	MP: 'Northern Mariana Islands',
	// 	NO: 'Norway',
	// 	OM: 'Oman',
	// 	PK: 'Pakistan',
	// 	PW: 'Palau',
	// 	PS: 'Palestine, State of',
	// 	PA: 'Panama',
	// 	PG: 'Papua New Guinea',
	// 	PY: 'Paraguay',
	// 	PE: 'Peru',
	// 	PH: 'Philippines',
	// 	PN: 'Pitcairn',
	// 	PL: 'Poland',
	// 	PT: 'Portugal',
	// 	PR: 'Puerto Rico',
	// 	QA: 'Qatar',
	// 	RE: 'Réunion',
	// 	RO: 'Romania',
	// 	RU: 'Russian Federation',
	// 	RW: 'Rwanda',
	// 	BL: 'Saint Barthélemy',
	// 	KN: 'Saint Kitts and Nevis',
	// 	LC: 'Saint Lucia',
	// 	MF: 'Saint Martin (French part)',
	// 	SX: 'Saint Martin (Dutch part)',
	// 	PM: 'Saint Pierre and Miquelon',
	// 	VC: 'Saint Vincent and the Grenadines',
	// 	WS: 'Samoa',
	// 	SM: 'San Marino',
	// 	ST: 'Sao Tome and Principe',
	// 	SA: 'Saudi Arabia',
	// 	SN: 'Senegal',
	// 	RS: 'Serbia',
	// 	SC: 'Seychelles',
	// 	SL: 'Sierra Leone',
	// 	SG: 'Singapore',
	// 	SX: 'Sint Maarten (Dutch part)',
	// 	SK: 'Slovakia',
	// 	SI: 'Slovenia',
	// 	SB: 'Solomon Islands',
	// 	SO: 'Somalia',
	// 	ZA: 'South Africa',
	// 	GS: 'South Georgia and the South Sandwich Islands',
	// 	SS: 'South Sudan',
	// 	ES: 'Spain',
	// 	LK: 'Sri Lanka',
	// 	SD: 'Sudan',
	// 	SR: 'Suriname',
	// 	SJ: 'Svalbard and Jan Mayen',
	// 	SZ: 'Sweden',
	// 	CH: 'Switzerland',
	// 	SY: 'Syrian Arab Republic',
	// 	TW: 'Taiwan, Province of China',
	// 	TJ: 'Tajikistan',
	// 	TZ: 'Tanzania, United Republic of',
	// 	TH: 'Thailand',
	// 	TL: 'Timor-Leste',
	// 	TG: 'Togo',
	// 	TK: 'Tokelau',
	// 	TO: 'Tonga',
	// 	TT: 'Trinidad and Tobago',
	// 	TN: 'Tunisia',
	// 	TR: 'Turkey',
	// 	TM: 'Turkmenistan',
	// 	TC: 'Turks and Caicos Islands',
	// 	TV: 'Tuvalu',
	// 	UG: 'Uganda',
	// 	UA: 'Ukraine',
	// 	AE: 'United Arab Emirates',
	// 	GB: 'United Kingdom',
	// 	US: 'United States of America',
	// 	UM: 'United States Minor Outlying Islands',
	// 	UY: 'Uruguay',
	// 	UZ: 'Uzbekistan',
	// 	VU: 'Vanuatu',
	// 	VE: 'Venezuela',
	// 	VN: 'Viet Nam',
	// 	VG: 'Virgin Islands, British',
	// 	VI: 'Virgin Islands, U.S.',
	// 	WF: 'Wallis and Futuna',
	// 	EH: 'Western Sahara',
	// 	YE: 'Yemen',
	// 	ZM: 'Zambia',
	// 	ZW: 'Zimbabwe'
	// };

	// async function getCountryFromIP(ip) {
	// 	try {
	// 		const response = await fetch(`https://rdap.arin.net/registry/ip/${ip}`);
	// 		if (!response.ok) {
	// 			throw new Error('RDAP lookup failed');
	// 		}

	// 		const data = await response.json();
	// 		// Extract just the country name from RDAP response
	// 		// console.log(data.country);

	// 		return data?.country ?? null;
	// 	} catch (error) {
	// 		console.error('Failed to get country:', error);
	// 		return null;
	// 	}
	// }

	let loading = false;
	let loading_indicator = [1];

	function fetchPages(events) {
		// console.log('re-run', events);
		let uniquePages = new Map();
		loading_indicator = [1];

		// loading = true;

		for (let index = 0; index < events.length; index++) {
			const event = events[index];

			let timezone = event.timezone;
			// console.log(event);
			if (timezone) {
				// console.log(ip);
				try {
					// let country_code = null;
					// if ($ip_cache[ip]) {
					// 	country_code = $ip_cache[ip];
					// } else {
					// 	country_code = await getCountryFromIP(ip);
					// }
					// if (country_code) {
					// if (loading_indicator.length <= 5) {
					// 	loading_indicator = [...loading_indicator, crypto.randomUUID()];
					// }
					// ip_cache.update((cur) => {
					// 	const ob = {};
					// 	ob[ip] = country_code;
					// 	return { ...cur, ...ob };
					// });
					// console.log($ip_cache);

					const country = getCountry(timezone) ?? 'Unknown';
					if (country) {
						// console.log(country);
						if (!uniquePages.has(country)) {
							uniquePages.set(country, 1);
							// pages = Array.from(uniquePages).sort((a, b) => b[1] - a[1]);
						} else {
							uniquePages.set(country, uniquePages.get(country) + 1);
							// pages = Array.from(uniquePages).sort((a, b) => b[1] - a[1]);
						}
					}
					// }
				} catch (error) {}
			}
		}
		// loading = false;
		// events.forEach((event) => {
		// console.log(event);

		// });

		// console.log(uniquePages);
		return Array.from(uniquePages).sort((a, b) => b[1] - a[1]);
	}

	let pages = $derived(fetchPages(views));

	let trunaced_pages = $derived(pages.splice(0, max_page_item_count));

	// $: console.log(pages);
</script>

<MiniSectionWrapper title="Country">
	<!-- <div class="flex flex-col gap-1 *:rounded-md *:bg-{$color}-200 *:px-[9px] *:py-[3px]">
        <div class="flex justify-between">
            <p>/</p>
            <p>3.4k</p>
        </div>
        <div class="flex justify-between">
            <p>/play/fdww3</p>
            <p>3.1k</p>
        </div>
        <div class="flex justify-between">
            <p>/blog/why-is-this-viewed</p>
            <p>2.9k</p>
        </div>
        <div class="flex justify-between">
            <p>/explore</p>
            <p>2.5k</p>
        </div>
        <div class="flex justify-between">
            <p>/about</p>
            <p>1.3k</p>
        </div>
        <button class="no-bg text-right">more &rarr;</button>
    </div> -->

	<div class="w-ful flex h-full flex-col gap-1">
		{#each trunaced_pages as page (page[0])}
			<div animate:flip={{ duration: 150 }} class="min-w-full">
				<PageItem on:filter type="country" path={page[0]} views={page[1]} />
			</div>
		{:else}
			<EmptyValues />
		{/each}

		{#if trunaced_pages.length < fetchPages(views).length}
			<BottomDrawer>
				{#snippet handle()}
								<div  class="z-0">
						<button class="no-bg z-0 text-right">more &rarr;</button>
					</div>
							{/snippet}
				{#snippet header()}
								<div
						
						style="padding: 0 20px;"
						class="sticky top-0 mb-3 flex justify-between text-gray-950 dark:text-gray-100"
					>
						<p>Country</p>
						<p>Views</p>
					</div>
							{/snippet}
				{#snippet content()}
								<div  class="relative flex flex-col gap-1 overflow-y-auto">
						{#each fetchPages(views) as page}
							<PageItem on:filter type="country" path={page[0]} views={page[1]} />
						{:else}
							<p>Nothing yet!</p>
						{/each}
					</div>
							{/snippet}
			</BottomDrawer>
		{/if}
	</div>
</MiniSectionWrapper>
