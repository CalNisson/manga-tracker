<script>
  import { toggleComplete } from '../stores/seriesStore';
  import { progressMap } from '../stores/progressStore.js';
  import VolumeList from './VolumeList.svelte';
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';

  export let series;

  let expanded = false;
  let percent = 0;
  let showMenu = false;

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

  const ownedCount = () => (series.volumes || []).filter(v => v.owned).length;

  $: progressMap.subscribe(map => {
    if (map[series.id] != null) {
      percent = Math.round(map[series.id]);
    } else {
      const owned = series.volumes.filter(v => v.owned).length;
      percent = Math.round((owned / series.total_volumes) * 100);
    }
  });

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
  <div class="header" on:click={toggleExpanded}>
    <h3>{series.title}</h3>
    <span>{ownedCount()}/{series.total_volumes || '?'} owned ({percent}%)</span>
    {#if series.completed}
      <span class="status">✅</span>
    {/if}

    <!-- 3-dot menu -->
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

<style>
  .series-entry {
    border: 1px solid #ccc;
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 0.5rem;
    position: relative;
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
    margin-top: 0.5rem;
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

  @keyframes flash-own {
    from {
      background-color: #81c784;
    }
    to {
      background-color: #4caf50;
    }
  }
</style>
