<script>
	import { color } from '$lib/colors/mixer.js';

	export let path, views;
</script>

<!-- [#3db33925] -->
<div class="flex justify-between rounded-md bg-{$color}-200 px-[9px] py-[3px]">
	<p>{path}</p>
	<p>{views}</p>
</div>
