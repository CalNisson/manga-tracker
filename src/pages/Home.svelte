<script>
  import { onMount } from 'svelte';
  import { fetchSeries } from '../stores/seriesStore';
  import { backendStarting } from '../stores/backendStatus';
  import { seriesStore } from '../stores/seriesStore';
  import AddSeriesForm from '../components/AddSeriesForm.svelte';
  import SeriesList from '../components/SeriesList.svelte';
  import OwnedCountTile from "../components/OwnedCountTile.svelte";

  let searchTerm = '';
  let sortBy = 'alpha';
  let showCompleted = false;
  let selectedTag = '';
  let allTags = [];
  let sortAsc = true;

  $: isWakingUp = $backendStarting;

  onMount(() => {
    fetchSeries();
  });

  let dots = '';
  let interval;

  $: if ($backendStarting) {
    let count = 0;
    interval = setInterval(() => {
      count = (count + 1) % 4;
      dots = '.'.repeat(count);
    }, 500);
  } else {
    clearInterval(interval);
    dots = '';
  }

  $: {
    const tagSet = new Set();
    $seriesStore.forEach(series => {
      (series.tags || []).forEach(tag => tagSet.add(tag));
    });
    allTags = Array.from(tagSet).sort();
  }
</script>

<main style="padding: 2rem; max-width: 900px; margin: 0 auto;">
  {#if isWakingUp}
    <div class="overlay">
      <div class="spinner-message">
        <span class="gear">⚙️</span>
        <span class="message">Waking up backend<span class="dots">{dots}</span></span>
      </div>
    </div>
  {/if}

  <AddSeriesForm />

  <div class="filter-bar">
    <div class="toggle-switch" on:click={() => (showCompleted = !showCompleted)}>
      <div class="slider" class:right={showCompleted}></div>
      <div class="label left" class:active={!showCompleted}>Incomplete</div>
      <div class="label right" class:active={showCompleted}>Complete</div>
    </div>

    <input
      type="text"
      placeholder="Search..."
      bind:value={searchTerm}
      style="padding: 0.5rem; border-radius: 4px; border: 1px solid #ccc;"
    />

    <div class="sort-group">
      <select bind:value={sortBy}>
        <option value="alpha">Alphabetical</option>
        <option value="total">Total Volumes</option>
        <option value="owned">Volumes Owned</option>
        <option value="percent">% Owned</option>
        <option value="score">Score</option>
      </select>

      <button class="sort-toggle" on:click={() => (sortAsc = !sortAsc)}>
        <svg viewBox="0 0 24 24" class:rotated={!sortAsc}>
          <path d="M12 15.5l-7-7 1.41-1.41L12 12.67l5.59-5.58L19 8.5l-7 7z" />
        </svg>        
      </button>
    </div>    

    <select bind:value={selectedTag}>
      <option value="">All Tags</option>
      {#each allTags as tag}
        <option value={tag}>{tag}</option>
      {/each}
    </select>    
  </div>

  <OwnedCountTile />

  <SeriesList filterCompleted={showCompleted} {searchTerm} {sortBy} {selectedTag} {sortAsc} />
</main>

<style>
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(255, 255, 255, 0.8);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    font-weight: bold;
    color: #333;
  }

  .spinner-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    animation: fadeIn 0.5s ease-in;
  }

  .gear {
    font-size: 2rem;
    animation: spin 1s linear infinite;
    margin-bottom: 0.5rem;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .filter-bar {
    background: white;
    padding: 1rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    margin: 2rem auto;
    max-width: 900px;
  }

  .toggle-switch {
    position: relative;
    display: flex;
    width: 200px;
    height: 40px;
    background: #e4e4e7;
    border-radius: 999px;
    cursor: pointer;
    overflow: hidden;
    font-weight: bold;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  .toggle-switch .slider {
    position: absolute;
    top: 0;
    left: 0;
    width: 50%;
    height: 100%;
    background-color: #ff6b6b;
    border-radius: 999px;
    transition: transform 0.3s ease;
    z-index: 0;
  }

  .toggle-switch .slider.right {
    transform: translateX(100%);
  }

  .toggle-switch .label {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #333;
    z-index: 1;
    transition: color 0.3s ease;
  }

  .toggle-switch .label.active {
    color: white;
  }

  .label {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #333;
    transition: color 0.3s ease;
  }

  .label.active {
    color: white;
  }

  .sort-group {
    display: flex;
    align-items: center;
    border: 1px solid #ccc;
    border-radius: 6px;
    overflow: hidden;
    background: white;
    height: 40px;
    transition: box-shadow 0.2s ease;
  }

  .sort-group:focus-within {
    box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.5);
  }

  .sort-group select,
  .sort-toggle {
    all: unset;
    padding: 0 0.75rem;
    font-size: 0.95rem;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background-color: white;
  }

  .sort-toggle {
    border-left: 1px solid #ccc;
  }

  .sort-toggle svg {
    width: 18px;
    height: 18px;
    fill: #444; /* Darker arrow for visibility */
    transition: transform 0.25s ease;
  }

  .sort-toggle svg.rotated {
    transform: rotate(180deg);
  }

  @keyframes fadeInOwned {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
