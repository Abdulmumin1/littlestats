<script>
	/**
	 * @typedef {Object} Props
	 * @property {string} [title]
	 * @property {string} [description]
	 * @property {string} [imageUrl]
	 * @property {string} [url]
	 * @property {any} jsonLd
	 * @property {boolean} [index]
	 * @property {string} [keywords]
	 * @property {string} [author]
	 * @property {string} [publishedDate]
	 * @property {string} [modifiedDate]
	 * @property {string} [canonicalUrl]
	 * @property {string} [locale]
	 * @property {string} [siteName]
	 * @property {string} [twitterHandle]
	 */

	/** @type {Props} */
	let {
		title = 'Littlestats - The Analytics Tool With the Right Metrics',
		description = 'Littlestats gives you the right metrics to help you grow.',
		imageUrl = 'https://littlestats.click/littlestats.png',
		url = 'https://littlestats.click',
		jsonLd,
		index = true,
		keywords = '',
		author = 'Littlestats',
		publishedDate = '',
		modifiedDate = '',
		canonicalUrl = '',
		locale = 'en_US',
		siteName = 'Littlestats',
		twitterHandle = '@abdulmuminyqn'
	} = $props();
</script>

<!-- Basic Meta Tags -->
<title>{title}</title>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
<meta name="description" content={description} />
<meta name="keywords" content={keywords} />
<meta name="author" content={author} />
{#if canonicalUrl}
	<link rel="canonical" href={canonicalUrl} />
{/if}

<!-- Open Graph / Facebook Meta Tags -->
<meta property="og:type" content="website" />
<meta property="og:url" content={url} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={imageUrl} />
<meta property="og:site_name" content={siteName} />
<meta property="og:locale" content={locale} />
{#if publishedDate}
	<meta property="article:published_time" content={publishedDate} />
{/if}
{#if modifiedDate}
	<meta property="article:modified_time" content={modifiedDate} />
{/if}

<!-- Twitter Meta Tags -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content={twitterHandle} />
<meta name="twitter:creator" content={twitterHandle} />
<meta name="twitter:url" content={url} />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={imageUrl} />

<!-- Robots Meta Tag -->
{#if index}
	<meta
		name="robots"
		content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
	/>
{:else}
	<meta name="robots" content="noindex, nofollow" />
{/if}

<!-- JSON-LD -->
{#if jsonLd}
	{@const data = Object.assign({ '@context': 'https://schema.org' }, jsonLd)}
	{@html `<script type="application/ld+json">${JSON.stringify(data)}</script>`}
{/if}
