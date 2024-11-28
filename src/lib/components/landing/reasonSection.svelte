<script>
    import { ArrowLeft, ArrowRight, Check, X } from 'lucide-svelte';
    import { color } from '$lib/colors/mixer.js';

    const needs = [
        "Traffic monitoring",
        "Conversion tracking",
        "Geographic data",
        "Source attribution",
        "Custom events"
    ];

    const dontNeeds = [
        "Machine learning predictions",
        "Complex user journey mapping",
        "47 different dashboard views",
        "Enterprise-grade features we'll never use",
        "Mediocre AI features to justify the price"
    ];
</script>

<div class="bg-{$color}-600 dark:bg-{$color}-700 mx-auto">
    <div
        id="box"
        class="bg-{$color}-100"
        style="--mask: radial-gradient(14.14px at 50% calc(100% - 20px),#000 99%,#0000 101%) calc(50% - 20px) 0/40px 100%,
        radial-gradient(14.14px at 50% calc(100% + 10px),#0000 99%,#000 101%) 50% calc(100% - 10px)/40px 100% repeat-x;"
    ></div>
    <div
        id="features"
        class="container py-6 pb-20 max-w-[1000px] mx-auto z-50 mt-12 rounded-2xl p-4"
    >
        <h3
            class="mb-12 flex items-center  mx-auto gap-1 px-2 text-xl font-bold bg-{$color}-900 text-white w-fit rounded-full px-3 py-[.15rem]"
        >
        <ArrowRight size={20} />   Micro Website Essentials <ArrowLeft size={20} /> 
        </h3>

        <div class="grid grid-cols-1 gap-12 md:grid-cols-2">
            <!-- What you need -->
            <div class="flex flex-col w-full items-start md:items-end md:w-fit  ml-auto   ">
                <div class="mb-5 flex items-center justify-start md:self-start gap-2">
                    <Check size={24} class="text-{$color}-100" />
                    <h4 class="text-xl font-semibold text-white">What you need</h4>
                </div>
                <div class="space-y-3 md:pr-12">
                    {#each needs as item}
                        <div class="flex items-center gap-2 text-{$color}-100">
                            <Check size={16} class="bg-green-100 text-green-700 flex-shrink-0" />
                            <p>{item}</p>
                        </div>
                    {/each}
                </div>
            </div>

            <!-- What you don't need -->
            <div class="rounded-xl  w-full md:ml-5 ">
                <div class="mb-5 flex items-center gap-2">
                    <X size={24} class="text-{$color}-100" />
                    <h4 class="text-xl font-semibold text-white">What you don't need</h4>
                </div>
                <div class="space-y-3">
                    {#each dontNeeds as item}
                        <div class="flex items-center gap-2 text-{$color}-100">
                            <X size={16} class="text-red-700 bg-red-100 flex-shrink-0"/>
                            <p>{item}</p>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    #box {
        height: 40px;
        mask: var(--mask);
    }
</style>