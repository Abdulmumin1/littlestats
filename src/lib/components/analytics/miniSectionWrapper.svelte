<script>
	import { color } from '$lib/colors/mixer.js';
    
    export let title

</script>
<div class="min-h-[130px] min-w-[230px] flex-1  rounded-md">
	<div class="mb-3 flex justify-between text-gray-950 dark:text-gray-100">
		<p>{title}</p>
		<p>Views</p>
	</div>

<slot></slot>
</div>