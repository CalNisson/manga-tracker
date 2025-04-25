<script>
  import { toggleComplete } from '../stores/seriesStore';
  import { progressMap } from '../stores/progressStore.js';
  import VolumeList from './VolumeList.svelte';
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';

  export let series;

  let expanded = false;
  let percent = 0;
  let showMenu = false;
  let ownedCount = () => (series.volumes || []).filter(v => v.owned).length;

  const dispatch = createEventDispatcher();

  // Prevent expansion toggle if menu is clicked
  function toggleExpanded(event) {
    if (event.target.closest('.menu-container')) return;
    expanded = !expanded;
  }

  async function toggleCompleteStatus() {
    await toggleComplete(series.id);
    showMenu = false;
  }


  function editSeries() {
    dispatch('edit', series);
    showMenu = false;
  }

  function deleteSeries() {
    if (confirm(`Are you sure you want to delete "${series.title}"?`)) {
      dispatch('delete', series);
    }
    showMenu = false;
  }

  function handleVolumeToggle(volumeId) {
    series = {
      ...series,
      volumes: series.volumes.map(v =>
        v.id === volumeId ? { ...v, owned: !v.owned } : v
      )
    };
  }

  $: progressMap.subscribe(map => {
    if (map[series.id] != null) {
      percent = Math.round(map[series.id]);
    } else {
      const owned = series.volumes.filter(v => v.owned).length;
      percent = Math.round((owned / series.total_volumes) * 100);
    }
  });

  $: ownedCount = series.volumes ? series.volumes.filter(v => v.owned).length : 0;

  $: sortedSeries = {
    ...series,
    volumes: [...(series.volumes || [])].sort((a, b) => a.volume_number - b.volume_number)
  };

  function toggleMenu(event) {
    event.stopPropagation(); // Stop click from bubbling to header
    showMenu = !showMenu;
  }

  function handleClickOutside(event) {
    if (!event.target.closest('.menu-container')) {
      showMenu = false;
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
  });

  onDestroy(() => {
    document.removeEventListener('click', handleClickOutside);
  });
</script>

<div class="series-entry" on:click={toggleExpanded}>
  <div class="series-layout">
    <div class="series-image">
      {#if series.image_url}
        <img src={series.image_url} alt={`Cover for ${series.title}`} />
      {:else}
        <div class="placeholder-image">No Image</div>
      {/if}
    </div>

    <div class="series-content">
      <div class="series-header">
        <h3>{series.title}</h3>
        <span>{ownedCount}/{series.total_volumes || '?'} owned ({percent}%)</span>
        {#if series.completed}
          <span class="status">✅</span>
        {/if}
    
        <div class="menu-container">
          <button class="menu-button" on:click={toggleMenu} aria-label="Options Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="4" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="20" cy="12" r="2" />
            </svg>
          </button>
          {#if showMenu}
            <div class="dropdown">
              <div class="dropdown-item" on:click|stopPropagation={editSeries}>✏️ Edit Series</div>
              <div class="dropdown-item" on:click|stopPropagation={toggleCompleteStatus}>
                {series.completed ? '❌ Mark Incomplete' : '✅ Mark Complete'}
              </div>
              <div class="dropdown-item" on:click|stopPropagation={deleteSeries}>🗑️ Delete Series</div>
            </div>
          {/if}
        </div>        
      </div>
    
      <div class="progress-bar">
        <div class="progress-fill" style="width: {percent}%;"></div>
      </div>

      <div class="expand-toggle" on:click|stopPropagation={toggleExpanded}>
        <span>{expanded ? '▲' : '▼'} Show Volumes</span>
      </div>      
    
      <div class="volume-collapse" style="max-height: {expanded ? '1000px' : '0'};">
        {#if expanded}
          {#key series.id}
            <VolumeList series={sortedSeries} on:volumeToggle={e => handleVolumeToggle(e.detail)} />
          {/key}
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .series-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    gap: 1rem;
  }

  .series-entry {
    background: linear-gradient(145deg, #fff0ec, #ffe0dc);
    border-radius: 16px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    width: 95%;
    margin-inline: auto;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }


  .series-entry:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.1);
    background-color: #f4f4f4;
  }

  .series-entry:active {
    background-color: #eaeaea;
  }

  .series-layout {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    gap: 1rem;
  }

  .status {
    margin-left: 0.5rem;
  }

  .progress-bar {
    margin-top: auto;
    margin-bottom: 0.5rem;
    height: 10px;
    background-color: #eee;
    border-radius: 5px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background-color: #4caf50;
    transition: width 0.3s ease;
  }

  .menu-container {
    position: relative;
  }

  .menu-button {
    background-color: #f0f0f0;
    border: none;
    border-radius: 50%;
    padding: 0.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s ease, transform 0.2s ease;
    color: #444;
    width: 2.25rem;
    height: 2.25rem;
    z-index: 2;
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
    width: 160px;
  }
  .dropdown-item {
    padding: 0.5rem 1rem;
    cursor: pointer;
    white-space: nowrap;
  }
  .dropdown-item:hover {
    background-color: #f0f0f0;
  }

  .volume.owned {
    animation: flash-own 0.3s ease;
  }

  .series-image {
    width: 100px;
    height: 140px;
    flex-shrink: 0;
    overflow: hidden;
  }

  .series-image img {
    width: 100%;
    height: 100%;
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
    border-radius: 6px;
  }

  .series-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.5rem;
  }

  @keyframes flash-own {
    from {
      background-color: #81c784;
    }
    to {
      background-color: #4caf50;
    }
  }

  .expand-toggle {
    text-align: center;
    margin-top: 0.5rem;
    cursor: pointer;
    font-weight: bold;
    color: #555;
    user-select: none;
  }

  .expand-toggle:hover {
    color: #000;
  }

  .volume-collapse {
    overflow: hidden;
    transition: max-height 0.3s ease;
  }
</style>
