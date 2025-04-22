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

<div class="series-entry">
  <div class="series-layout">
    <div class="series-image">
      {#if series.image_url}
        <img src={series.image_url} alt={`Cover for ${series.title}`} />
      {:else}
        <div class="placeholder-image">No Image</div>
      {/if}
    </div>

    <div class="series-content">
      <div class="series-header" on:click={toggleExpanded}>
        <h3>{series.title}</h3>
        <span>{ownedCount}/{series.total_volumes || '?'} owned ({percent}%)</span>
        {#if series.completed}
          <span class="status">✅</span>
        {/if}
    
        <div class="menu-container">
          <button class="menu-button" on:click={toggleMenu}>⋮</button>
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
    
      {#if expanded}
        {#key series.id}
          <VolumeList series={sortedSeries} on:volumeToggle={e => handleVolumeToggle(e.detail)} />
        {/key}
      {/if}
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
    width: 95%;
    margin: 0 auto;
    border: 1px solid #ccc;
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 0.5rem;
    position: relative;
    box-sizing: border-box;
    overflow-x: hidden;
  }

  .series-layout {
    display: flex;
    gap: 1rem;
    align-items: center;
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
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0 0.5rem;
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
</style>
