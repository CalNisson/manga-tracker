<script>
  import { toggleComplete } from '../stores/seriesStore';
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import VolumeList from './VolumeList.svelte';
  import { progressMap } from '../stores/progressStore.js';

  export let series;

  let expanded = false;
  let showMenu = false;
  let percent = 0;

  const dispatch = createEventDispatcher();

  $: progressMap.subscribe((map) => {
    if (map[series.id] != null) {
      percent = Math.round(map[series.id]);
    } else {
      const owned = series.volumes.filter((v) => v.owned).length;
      percent = Math.round((owned / series.total_volumes) * 100);
    }
  });

  $: sortedSeries = (() => {
    if (!series.volumes || series.volumes.length === 0) return series;
    const isSorted = series.volumes.every((v, i, arr) => {
      return i === 0 || arr[i - 1].volume_number <= v.volume_number;
    });
    return isSorted
      ? series
      : {
          ...series,
          volumes: [...series.volumes].sort((a, b) => a.volume_number - b.volume_number),
        };
  })();

  function toggleExpanded(event) {
    expanded = !expanded;
  }

  async function toggleCompleteStatus() {
    await toggleComplete(series.id);
    showMenu = false;
  }
  
  function handleVolumeToggle(volumeId) {
    series = {
      ...series,
      volumes: series.volumes.map((v) => (v.id === volumeId ? { ...v, owned: !v.owned } : v)),
    };
  }

  function toggleMenu(event) {
    event.stopPropagation();
    showMenu = !showMenu;
  }

  function handleEdit() {
    dispatch('edit', series);
    showMenu = false;
  }

  function handleDelete() {
    if (confirm(`Are you sure you want to delete "${series.title}"?`)) {
      dispatch('delete', series);
    }
    showMenu = false;
  }

  function handleClickOutside(event) {
    if (!event.target.closest('.menu-container')) {
      showMenu = false;
    }
  }

  function getScoreColor(score) {
    const clamped = Math.max(0, Math.min(score, 10));
    const hue = (clamped / 10) * 120;
    const saturation = 50;
    const lightness = 55 - (clamped - 5) ** 2 * 0.3;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
  });

  onDestroy(() => {
    document.removeEventListener('click', handleClickOutside);
  });
</script>

<div class="mobile-series-entry" on:click={toggleExpanded}>
  <div class="top-bar">
    <div class="series-image">
      {#if series.image_url}
        <img src={series.image_url} alt={`Cover for ${series.title}`} />
      {:else}
        <div class="placeholder-image">No Image</div>
      {/if}
      {#if series.score != null}
        <div class="series-score">
          Score:
          <span
            class="score-value"
            style="color: {getScoreColor(series.score)}"
          >
            {Number(series.score).toFixed(2)}
          </span>
        </div>
      {/if}
    </div>

    <h3 class="series-title">{series.title}</h3>

    <div class="menu-container">
      <button class="menu-button" on:click|stopPropagation={toggleMenu} aria-label="Options Menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="4" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="20" cy="12" r="2" />
        </svg>
      </button>

      {#if showMenu}
        <div class="dropdown">
          <div class="dropdown-item" on:click|stopPropagation={handleEdit}>✏️ Edit Series</div>
          <div class="dropdown-item" on:click|stopPropagation={toggleCompleteStatus}>
                {series.completed ? '❌ Mark Incomplete' : '✅ Mark Complete'}
              </div>
          <div class="dropdown-item" on:click|stopPropagation={handleDelete}>🗑️ Delete Series</div>
        </div>
      {/if}
    </div>
  </div>

  {#if series.tags && series.tags.length > 0}
      <div class="tag-list">
        {#each series.tags as tag}
          <span class="tag">{tag}</span>
        {/each}
      </div>
    {/if}

  <div class="progress-bar">
    <div class="progress-fill" style="width: {percent}%;"></div>
  </div>

  <p>
    {series.volumes.filter((v) => v.owned).length}/{series.total_volumes || '?'} owned ({percent}%)
  </p>

  <div class="expand-toggle">
    {expanded ? '▲ Hide Volumes' : '▼ Show Volumes'}
  </div>

  <div class="volume-collapse" style="max-height: {expanded ? '10000px' : '0'};">
    {#if expanded}
      {#key series.id}
        <VolumeList series={sortedSeries} on:volumeToggle={(e) => handleVolumeToggle(e.detail)} />
      {/key}
    {/if}
  </div>
</div>

<style>
  .mobile-series-entry {
    background: linear-gradient(145deg, #fff0ec, #ffe0dc);
    border-radius: 16px;
    padding: 1rem;
    margin-bottom: 1rem;
    width: 90%;
    margin-inline: auto;
    text-align: center;
    position: relative;
  }

  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .series-header {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
    margin-left: 0.5rem;
  }

  .series-title {
    flex-grow: 1;
    text-align: center;
    font-size: 1.1rem;
    font-weight: bold;
    color: #333;
  }

  .series-image {
    width: 60px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .series-image img {
    width: 100%;
    height: auto;
    object-fit: cover;
    border-radius: 6px;
  }

  .placeholder-image {
    width: 100%;
    height: 100%;
    background-color: #eee;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    color: #666;
  }

  .progress-bar {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    height: 8px;
    background-color: #eee;
    border-radius: 5px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background-color: #4caf50;
    transition: width 0.3s ease;
  }

  .expand-toggle {
    margin-top: 0.5rem;
    font-weight: bold;
    color: #555;
    cursor: pointer;
  }

  .expand-toggle:hover {
    color: #000;
  }

  .volume-collapse {
    overflow: hidden;
    transition: max-height 0.3s ease;
  }

  .menu-container {
    position: relative;
    flex-shrink: 0;
  }

  .menu-button {
    background-color: #f0f0f0;
    border: none;
    border-radius: 50%;
    color: #444;
    padding: 0.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
  }

  .menu-button:hover,
  .menu-button:focus {
    background-color: #e0e0e0;
    transform: scale(1.05);
  }

  .menu-button svg {
    display: block;
    width: 1.25rem;
    height: 1.25rem;
  }

  .dropdown {
    position: absolute;
    right: 0;
    top: 2rem;
    background: white;
    border: 1px solid #ccc;
    border-radius: 0.25rem;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    z-index: 10;
    width: 150px;
    text-align: left;
  }

  .dropdown-item {
    padding: 0.5rem 1rem;
    cursor: pointer;
  }

  .dropdown-item:hover {
    background-color: #f0f0f0;
  }

  .series-score {
    margin-top: 0.25rem;
    font-weight: bold;
    font-size: 0.85rem;
    color: #444;
  }

  .score-value {
    font-size: 1rem;
    font-weight: bold;
    margin-left: 0.25rem;
  }

  .tag-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.4rem;
    margin: 0.25rem 0 0.5rem 0;
  }

  .tag {
    background-color: #ffd9d4;
    color: #333;
    padding: 0.2rem 0.5rem;
    font-size: 0.7rem;
    border-radius: 999px;
    white-space: nowrap;
  }
</style>
