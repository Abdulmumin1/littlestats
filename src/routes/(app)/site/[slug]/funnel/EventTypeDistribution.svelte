<!-- src/lib/EventTypeDistribution.svelte -->
<script>
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';
  
    let {counts} = $props();
  
    let chartCanvas = $state();
    let chart = $state();
  
    onMount(() => {
      chart = new Chart(chartCanvas, {
        type: 'pie',
        data: {
          labels: Object.keys(counts),
          datasets: [{
            data: Object.values(counts),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    });
  
    $effect(() => {
      if (chart) {
        chart.data.labels = Object.keys(counts);
        chart.data.datasets[0].data = Object.values(counts);
        chart.update();
      }
    });
  </script>
  
  <div class="h-64">
    <canvas bind:this={chartCanvas}></canvas>
  </div>
  
  <style>
    div {
      position: relative;
    }
  </style>