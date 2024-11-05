<script>
	import { onMount } from 'svelte';
	import InsideNav from '../../lib/components/generals/insideNav.svelte';
</script>

<InsideNav />
<div class="max-w-7xl p-2">
	<slot />
</div>
