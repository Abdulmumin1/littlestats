<script>
	import { onMount } from 'svelte';
	import InsideNav from '../../lib/components/generals/insideNav.svelte';
</script>

<InsideNav />
<div class="p-2">
	<slot />
</div>
