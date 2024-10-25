<script>
	import Header from '../header.svelte';
</script>

<section class="mb-16">
	<Header>Terms of Service</Header>
	<div class="prose max-w-none">
		<div class="space-y-6">
			<div>
				<h2 class="mb-3 text-xl font-semibold">1. Our Commitment to Privacy</h2>
				<p>
					littlestats is built on the principle of minimal data collection. We only collect the bare
					minimum analytics data required to provide meaningful insights. We do not track individual
					users, collect personal information, or store any data that could identify specific users.
				</p>
			</div>

			<div>
				<h2 class="mb-3 text-xl font-semibold">2. Service Description</h2>
				<p>littlestats provides lightweight analytics for developers through:</p>
				<ul class="mt-2 list-disc pl-6">
					<li>Simple API endpoints</li>
					<li>Minimal JavaScript snippet</li>
					<li>Basic metrics (page views, referrers, etc.)</li>
					<li>Aggregated data only</li>
				</ul>
			</div>

			<div>
				<h2 class="mb-3 text-xl font-semibold">3. Data Collection</h2>
				<p>We collect only:</p>
				<ul class="mt-2 list-disc pl-6">
					<li>Page views (URL paths only, no query parameters)</li>
					<li>Referrer domain (no full URLs)</li>
					<li>Browser type</li>
					<li>Country (derived from IP, IP address is not stored)</li>
				</ul>
			</div>

			<div>
				<h2 class="mb-3 text-xl font-semibold">4. What We Don't Collect</h2>
				<ul class="mt-2 list-disc pl-6">
					<li>Personal Information</li>
					<li>IP Addresses</li>
					<li>User IDs or any unique identifiers</li>
					<li>Session data</li>
					<li>Cookies</li>
					<li>Form inputs</li>
					<li>Query parameters</li>
				</ul>
			</div>

			<div>
				<h2 class="mb-3 text-xl font-semibold">5. Data Usage</h2>
				<p>Your data is:</p>
				<ul class="mt-2 list-disc pl-6">
					<li>Only used for generating anonymous analytics</li>
					<li>Never sold or shared with third parties</li>
					<li>Automatically deleted after 30 days</li>
					<li>Stored in encrypted format</li>
				</ul>
			</div>

			<div>
				<h2 class="mb-3 text-xl font-semibold">6. Developer Responsibilities</h2>
				<ul class="mt-2 list-disc pl-6">
					<li>Keep API keys secure</li>
					<li>Inform users about analytics in your privacy policy</li>
					<li>Don't modify our script to collect additional data</li>
					<li>Don't attempt to combine our data with other tracking systems</li>
				</ul>
			</div>

			<div>
				<h2 class="mb-3 text-xl font-semibold">7. Service Terms</h2>
				<ul class="mt-2 list-disc pl-6">
					<li>99.9% uptime target</li>
					<li>Data provided "as is" without warranty</li>
					<li>30-day notice for service changes</li>
					<li>Right to terminate for terms violation</li>
				</ul>
			</div>
		</div>
	</div>
</section>
