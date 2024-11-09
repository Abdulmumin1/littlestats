export async function GET() {
	const xml = `
    <?xml version="1.0" encoding="UTF-8" ?>
    <urlset
        xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="https://www.w3.org/1999/xhtml"
        xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
    >
    <url>
        <loc>https://littlestats.click</loc>
    </url>
    <url>
        <loc>https://littlestats.click/signin</loc>
    </url>
    <url>
        <loc>https://littlestats.click/signup</loc>
    </url>
    <url>
        <loc>https://littlestats.click/terms</loc>
    </url>
    <url>
        <loc>https://littlestats.click/privacy-policy</loc>  <!-- Corrected typo here -->
    </url>
    <url>
        <loc>https://littlestats.click/acceptable-use</loc>
    </url>
    </urlset>`.trim();

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml'
		}
	});
}
