<script>
  import { toggleComplete } from '../stores/seriesStore';
  import VolumeList from './VolumeList.svelte';

  export let series;
  let expanded = false;

  function toggleExpanded() {
    expanded = !expanded;
  }

  async function toggleCompleteStatus() {
    await toggleComplete(series.id, series.completed);
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
  const percent = () => series.total_volumes ? Math.round((ownedCount() / series.total_volumes) * 100) : 0;

  $: sortedSeries = {
  ...series,
  volumes: [...(series.volumes || [])].sort((a, b) => a.volume_number - b.volume_number)
};
</script>

<div class="series-entry">
  <div class="header" on:click={toggleExpanded}>
    <h3>{series.title}</h3>
    <span>{ownedCount()}/{series.total_volumes || '?'} owned ({percent()}%)</span>
    {#if series.completed}
      <span class="status">✅</span>
    {/if}
  </div>

  <div class="progress-bar">
    <div class="progress-fill" style="width: {percent()}%;"></div>
  </div>

  {#if expanded}
    <button on:click={toggleCompleteStatus}>
      {series.completed ? 'Mark Incomplete' : 'Mark Complete'}
    </button>
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
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
  }
  .status {
    margin-left: 0.5rem;
  }
  .progress-bar {
    margin-top: 0.5rem;
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


