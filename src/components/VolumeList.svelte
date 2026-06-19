<script>
  import { toggleOwned } from '../stores/seriesStore';
  import { progressMap } from '../stores/progressStore.js';
  import { createEventDispatcher } from 'svelte';
  import { ownedVolumeCount, toggledOwnedVolumeNumbers, volumeList } from '../utils/volumes.js';

  export let series;

  const dispatch = createEventDispatcher();

  $: volumes = volumeList(series);
  $: totalCount = series.total_volumes || 0;

  function updateProgress(nextSeries = series) {
    const ownedCount = ownedVolumeCount(nextSeries);
    const percent = totalCount ? (ownedCount / totalCount) * 100 : 0;
    progressMap.update(map => ({ ...map, [series.id]: percent }));
  }

  async function handleToggleOwnership(volumeNumber) {
    const previousOwned = series.owned_volume_numbers || [];
    const nextOwned = toggledOwnedVolumeNumbers(series, volumeNumber);

    series = { ...series, owned_volume_numbers: nextOwned };
    updateProgress(series);
    dispatch('volumeToggle', { seriesId: series.id, volumeNumber, ownedVolumeNumbers: nextOwned });

    const result = await toggleOwned(series.id, volumeNumber);
    if (!result) {
      series = { ...series, owned_volume_numbers: previousOwned };
      updateProgress(series);
      dispatch('volumeToggle', { seriesId: series.id, volumeNumber, ownedVolumeNumbers: previousOwned });
    }
  }

  updateProgress();
</script>

{#if volumes.length}
  <div class="volume-list">
    {#each volumes as v (v.volume_number)}
      <div
        class="volume {v.owned ? 'owned' : ''}"
        on:click|stopPropagation={() => handleToggleOwnership(v.volume_number)}>
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
    animation: slideFadeIn 0.3s ease-out;
  }
  
  .volume {
    padding: 0.5rem 1rem;
    border: 1px solid #aaa;
    border-radius: 4px;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.3s ease, color 0.3s ease;
    background: #ffffff;
  }

  .volume.owned {
    background: #38a169;
    color: white;
  }

  .volume:not(.owned):hover {
    background-color: #c7d2fe;
  }

  .volume.owned:hover {
    background-color: #2f855a;
    color: white;
  }

  @keyframes slideFadeIn {
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
