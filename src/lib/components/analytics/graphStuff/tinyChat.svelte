<script>
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';

    let {data} = $props()

    let chartCanvas = $state();

    onMount(() => {
        new Chart(chartCanvas, {
            type: 'pie',
            data: {
                labels: data.map(item => item[0]),
                datasets: [{
                    data: data.map(item => item[1]),
                    backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff'],
                }]
            }
        });
    });
</script>

<canvas bind:this={chartCanvas}></canvas>