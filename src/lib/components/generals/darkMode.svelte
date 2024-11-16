<script>
    import { onMount } from 'svelte';
    import { Moon, Sun, Monitor } from 'lucide-svelte';
    import { clickOutside } from '$lib/utils';
    import { fly, slide } from 'svelte/transition';
    import { color } from '$lib/colors/mixer.js';
  
    let darkMode = false;
    let isOpen = false;
    let clickoutside = false;
  
    function toggleDropdown() {
      if (clickoutside) {
        clickoutside = false;
        return;
      }
      isOpen = !isOpen;
    }
  
    function closeDropdown() {
      clickoutside = true;
      isOpen = false;
    }
  
    onMount(() => {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      darkMode = savedTheme === 'dark' || (!savedTheme && prefersDark);
      updateTheme(darkMode);
    });
  
    function updateTheme(isDark) {
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      darkMode = isDark;
      isOpen = false;
    }
  
    function setSystemTheme() {
      localStorage.removeItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      updateTheme(prefersDark);
    }
  </script>
  
  <div class="relative">
    <button
      on:click={toggleDropdown}
      class="flex items-center justify-center rounded-full border-2 p-2 border-{$color}-700 bg-{$color}-50 text-black dark:bg-stone-900  dark:text-gray-100 "
      aria-label="Toggle theme"
    >
      {#if darkMode}
        <Moon size={20} />
      {:else}
        <Sun size={20} />
      {/if}
    </button>
  
    {#if isOpen}
      <div
        transition:fly={{y:10}}
        use:clickOutside
        on:click_outside={closeDropdown}
        class="absolute right-0 mt-2 w-48 rounded-md border border-{$color}-200 bg-white shadow-lg  z-50"
      >
        <div class="py-1">
          <button
            on:click={() => updateTheme(false)}
            class="flex w-full items-center px-4 py-2 text-sm hover:bg-{$color}-700 hover:text-white"
          >
            <Sun size={16} class="mr-2" />
            Light
          </button>
          <button
            on:click={() => updateTheme(true)}
            class="flex w-full items-center px-4 py-2 text-sm hover:bg-{$color}-700 hover:text-white"
          >
            <Moon size={16} class="mr-2" />
            Dark (experimental)
          </button>
          <button
            on:click={setSystemTheme}
            class="flex w-full items-center px-4 py-2 text-sm hover:bg-{$color}-700 hover:text-white"
          >
            <Monitor size={16} class="mr-2" />
            System
          </button>
        </div>
      </div>
    {/if}
  </div>