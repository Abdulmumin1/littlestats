<script>
	export let title = 'Littlestats - Simple, Affordable Analytics for Websites';
	export let description = 'Littlestats gives you easy, affordable website analytics—simple insights to help your site grow faster.';
	export let imageUrl = 'https://littestatsl.click/littlestats.png';
	export let url = 'https://littestatsl.click';
	export let jsonLd;
	export let index = true;
	export let keywords = '';
	export let author = 'Littlestats';
	export let publishedDate = '';
	export let modifiedDate = '';
	export let canonicalUrl = '';
	export let locale = 'en_US';
	export let siteName = 'Littlestats';
	export let twitterHandle = '@abdulmuminyqn';


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
