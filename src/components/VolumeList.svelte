<script>
  import { seriesStore, toggleOwned } from '../stores/seriesStore';
  import { progressMap } from '../stores/progressStore.js';
  import { createEventDispatcher } from 'svelte';
  export let series;

  let ownedCount = 0;
  let totalCount = series.total_volumes;

  const dispatch = createEventDispatcher();

  function updateProgress() {
    ownedCount = series.volumes.filter(v => v.owned).length;
    const percent = (ownedCount / totalCount) * 100;
    progressMap.update(map => {
      return { ...map, [series.id]: percent };
    });
  }

  async function handleToggleOwnership(volumeId) {
    const volumeIndex = series.volumes.findIndex(v => v.id === volumeId);
    if (volumeIndex !== -1) {
      const updatedVolumes = [...series.volumes];
      updatedVolumes[volumeIndex] = {
        ...updatedVolumes[volumeIndex],
        owned: !updatedVolumes[volumeIndex].owned
      };

      // Update local volumes
      series.volumes = updatedVolumes;
      updateProgress();

      // Now update the backend and the store
      await toggleOwned(volumeId);  // <-- Call the `toggleOwned` function from seriesStore.js
      dispatch('volumeToggle', volumeId);
    }
  }

  updateProgress();
</script>

{#if series.volumes?.length}
  <div class="volume-list">
    {#each series.volumes as v (v.id)}
      <div
        class="volume {v.owned ? 'owned' : ''}"
        on:click={() => handleToggleOwnership(v.id)}>
        Vol. {v.volume_number}
      </div>
    {/each}
  </div>
{:else}
  <p>No volumes found.</p>
{/if}

<style>
  .volume-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  .volume {
    padding: 0.5rem 1rem;
    border: 1px solid #aaa;
    border-radius: 4px;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s, color 0.2s;
  }
  .volume.owned {
    background-color: #4caf50;
    color: white;
    border-color: #4caf50;
  }
</style>
