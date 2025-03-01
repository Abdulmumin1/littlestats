<script>
	import { ArrowBigDown, ArrowDown } from 'lucide-svelte';
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import { color } from '$lib/colors/mixer.js';
	import { getContext, setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import Dropdown from '../generals/dropdown.svelte';
    import {calctypeoptions} from '$lib/funnels/helpers.js'
	let {
		availableSteps = [
			{ id: 1, name: 'Get Started', value: 'Get Started', color: '#60A5FA', type: 'event' },
			{ id: 2, name: 'Sign Up', value: 'Sign Up', color: '#34D399', type: 'event' },
			{ id: 3, name: 'Purchase', value: 'Purchase', color: '#FBBF24', type: 'event' },
			{ id: 4, name: 'Logout', value: 'Logout', color: '#F472B6', type: 'event' }
		], uniquePages = []
	} = $props();

	let funnelSteps = $state([]);
	let funnelType = $state('user');
	let funnelName = $state('');
	let searchQuery = $state('');
	const dndConfig = $state({
		flipDurationMs: 1
	});
	let modal = $state(null);

	let funnelContext = getContext('funnelSteps');
	// Handle DND events for funnel
	function handleFunnelConsider(e) {
		e.detail.accept(); // Always accept drops
	}

	function handleFunnelFinalize(e) {
		// console.log(e)
		if (e.detail.items) {
			// Handle both new items and reordering
			const newItems = e.detail.items;
			const uniqueItems = [];

			const seenIds = new Set();

			newItems.forEach((item) => {
				 console.log(item)
				if (!seenIds.has(item.value)) {
					uniqueItems.push({ ...item });
					seenIds.add(item.value);
				}
			});
			console.log(uniqueItems)
			funnelSteps = uniqueItems;
			// filteredSteps = filteredSteps.filter((e) => !funnelSteps?.includes(e));
		}
	}

	function openModal() {
		modal.showModal();
	}

	function closeModal() {
        filteredSteps = availableSteps;
		funnelSteps = [];
		change = !change;
        tab != tab;
		modal.close();
	}

	let name;
	function save() {
		if (!funnelName){
			name.focus()
			return;
		}
		try {
			funnelContext.set({ name: funnelName, type:funnelType, steps: funnelSteps });
			closeModal();
		} catch (error) {}
	}


	function handleRemoveStep(index) {
		// let s = funnelSteps.find((_, i) => i == index)
		// let x = [...new Set([...filteredSteps, s])]
		// console.log(x)
		funnelSteps = funnelSteps.filter((_, i) => i !== index);
	}

	// let filteredSteps = $derived(
	// 	availableSteps.filter((step) => step.name.toLowerCase().includes(searchQuery.toLowerCase()))
	// );

	let filteredSteps = $state(availableSteps);

	$effect(()=>{
		filteredSteps = availableSteps;
	})
	let change = $state(true);

	let tab = $state(true);
   
</script>


<button
	class="flex items-center justify-center gap-1 rounded-xl border-b-4 border-{$color}-800 border text-gray-100 bg-{$color}-600 px-4 py-1 font-bold hover:bg-{$color}-600 dark:bg-{$color}-700"
	onclick={openModal}>Create Funnel</button
>

<dialog bind:this={modal} class=" rounded-md ">
	{#key change}
		<div class="relative min-w-full md:min-w-[1200px] rounded-xl bg-stone-50">
			<header class="sticky top-0 flex items-center gap-3 p-3 flex-wrap bg-stone-100">
				<div class="flex-1">
					<input
						type="text"
						bind:value={funnelName}
						bind:this={name}
						placeholder="Enter Funnel Name"
						class="flex-1 rounded-lg border-0 p-2 text-xl"
					/>
				</div>
                <Dropdown
					on:change={(e) => {
                        funnelType = e.detail.value
                    }}
					title="Sorting Type"
					value={funnelType}
					options={calctypeoptions}
				>
				</Dropdown>
				<div class="flex gap-2">
					<button
						onclick={save}
						class="flex items-center justify-center gap-1 rounded-lg border-b-4 border-{$color}-800 border text-gray-100 bg-{$color}-600 px-4 py-1 font-bold hover:bg-{$color}-600 dark:bg-{$color}-700"
						>Save</button
					>

					<button class="p-2 bg-{$color}-200 rounded-lg bg-opacity-35 px-4" onclick={closeModal}
						>X</button
					>
				</div>
			</header>
			<div class="">
				<div class="flex flex-col md:flex-row gap-8">
					<!-- Available Steps Pool -->
					<div class="w-full md:w-1/3 bg-{$color}-200 bg-opacity-15 shadow-sm px-6 flex flex-col gap-3">
						<div class="flex flex-col">
                            <h2 class="mb-4 text-xl font-bold ">Available Steps</h2>
                            <div class="flex *:flex-1 *:py-2 *:rounded-lg">
                                <button class:bg-white={tab} onclick={()=>{
                                    tab = true
                                }}> Events </button>
                                <button class:bg-white={!tab} 
                                onclick={()=>{
                                    tab = false
                                }}
                                > Pages </button>
                            </div>
    
                        </div>
						<div class="">
							{#if tab}
								<input
									type="text"
									bind:value={searchQuery}
									placeholder="Search steps..."
									class="mb-3 w-full rounded border p-2"
								/>
								<div
									use:dndzone={{
										...dndConfig,
										items: filteredSteps
									}}
									class="h-[300px] space-y-2 overflow-y-auto"
								>
									{#each filteredSteps as step (step.id)}
										<div
											animate:flip={{ duration: 150 }}
											class="cursor-move rounded-lg bg-white p-4 transition-colors hover:bg-gray-50 "
										>
											<div class="flex items-center gap-3">
												<div class="h-4 w-4 rounded-full" style="background: {step.color}"></div>
												<span class="font-medium">{step.name}</span>
											</div>
										</div>
									{/each}
								</div>
							{:else}
								<input
									type="text"
									bind:value={searchQuery}
									placeholder="Search steps..."
									class="mb-3 w-full rounded border p-2"
								/>
								<div
									use:dndzone={{
										...dndConfig,
										items: uniquePages
									}}
									class="h-[300px] space-y-2  overflow-y-auto"
								>
									{#each uniquePages as step (step.id)}
										<div
											animate:flip={{ duration: 150 }}
											class="cursor-move rounded-lg bg-white p-4 transition-colors hover:bg-gray-50"
										>
											<div class="flex items-center gap-3">
												<div class="h-4 w-4 rounded-full" style="background: {step.color}"></div>
												<span class="font-medium">{step.name}</span>
											</div>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					</div>

					<!-- Funnel Builder -->
					<div class="flex-1  rounded-lg bg-stone-50 p-6 shadow-sm">
						<h2 class="mb-4 text-xl font-bold">Your Funnel</h2>
						<div
							use:dndzone={{
								...dndConfig,
								items: funnelSteps
							}}
							onconsider={handleFunnelFinalize}
							onfinalize={handleFunnelFinalize}
							class="min-h-[300px] space-y-8"
						>
							{#each funnelSteps as step, index (step.id)}
								<div
									animate:flip={{ duration: 150 }}
									class="group relative rounded-xl p-2 transition-shadow hover:shadow-lg"
									style="background: {step.color}"
								>
									<div class="flex h-fit items-center gap-4">
										<div
											class="flex cursor-move items-center justify-center rounded-lg bg-white p-2 hover:bg-white/75"
										>
											↔
										</div>
										<div class="flex-1 space-y-2">
											<p
												class="w-full bg-transparent text-2xl font-bold text-white placeholder-white/80"
											>
												{step.name}
											</p>
											<!-- <input
                                            bind:value={step.name}
                                            placeholder="Step name"
                                        /> -->
										</div>
										<div class="flex items-center gap-2">
											<label
												for="color-{index}"
												class="h-6 w-6 cursor-pointer rounded-full border-2 border-white"
											></label>
											<input
												type="color"
												id="color-{index}"
												bind:value={step.color}
												class="sr-only"
											/>
											<button
												onclick={() => handleRemoveStep(index)}
												class="flex items-center justify-center rounded-lg bg-white p-2 hover:bg-white/75"
											>
												✕
											</button>
										</div>
									</div>
									{#if index > 0}
										<div class="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1">
											<ArrowDown />
										</div>
									{/if}
								</div>
							{:else}
								<div class="text-center text-gray-400 p-8">
									Drag steps here to build your funnel
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	{/key}
</dialog>

<style>
	input[type='color']::-webkit-color-swatch {
		border: none;
		border-radius: 4px;
	}
</style>
