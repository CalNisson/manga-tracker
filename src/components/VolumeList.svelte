<script>
  import { toggleOwned } from '../stores/seriesStore';
  import { createEventDispatcher } from 'svelte';
  export let series;

  const dispatch = createEventDispatcher();

  async function handleClick(volume) {
    await toggleOwned(volume.id);        // sync backend
    dispatch('volumeToggle', volume.id); // notify parent to update UI
  }
</script>

{#if series.volumes?.length}
  <div class="volume-list">
    {#each series.volumes as v (v.id)}
      <div
        class="volume {v.owned ? 'owned' : ''}"
        on:click={() => handleClick(v)}>
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
