<script>
	import Header from '../header.svelte';
</script>

<section class="mb-16">
	<Header>Privacy Policy</Header>
	<div class="prose max-w-none">
		<!-- <p class="mb-4 text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p> -->

		<div class="space-y-6">
			<div>
				<h2 class="mb-3 text-xl font-semibold">1. Core Privacy Principles</h2>
				<ul class="mt-2 list-disc pl-6">
					<li>No personal data collection</li>
					<li>No user tracking</li>
					<li>No data sharing</li>
					<li>30-day data retention only</li>
				</ul>
			</div>

			<div>
				<h2 class="mb-3 text-xl font-semibold">2. Data Collection</h2>
				<p>We collect minimal data:</p>
				<ul class="mt-2 list-disc pl-6">
					<li>Page URLs (paths only)</li>
					<li>Referrer domains</li>
					<li>Browser type</li>
					<li>Country (from IP, immediately discarded)</li>
				</ul>
			</div>

			<div>
				<h2 class="mb-3 text-xl font-semibold">3. Data Processing</h2>
				<ul class="mt-2 list-disc pl-6">
					<li>All data is aggregated immediately</li>
					<li>No raw data storage</li>
					<li>No individual user profiles</li>
					<li>No cross-site tracking</li>
				</ul>
			</div>

			<div>
				<h2 class="mb-3 text-xl font-semibold">4. Data Security</h2>
				<ul class="mt-2 list-disc pl-6">
					<li>TLS encryption in transit</li>
					<li>AES-256 encryption at rest</li>
					<li>Regular security audits</li>
					<li>Automated data deletion</li>
				</ul>
			</div>
		</div>
	</div>
</section>
