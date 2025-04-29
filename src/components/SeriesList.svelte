<script>
  import { seriesStore } from '../stores/seriesStore';
  import { deleteSeriesById } from '../stores/seriesStore.js';
  import { isMobile } from '../stores/screenStore.js';
  import SeriesEntry from './SeriesEntry.svelte';
  import MobileSeriesEntry from './MobileSeriesEntry.svelte';
  import EditSeriesModal from './EditSeriesModal.svelte';
  import { onDestroy } from 'svelte';

  export let filterCompleted = false;
  export let searchTerm = '';
  export let sortBy = 'alpha';

  let seriesData = [];
  let filteredSeries = [];
  let selectedSeries = null;
  let unsubscribe = seriesStore.subscribe(data => {
    seriesData = data;
  });

  function openEditModal(series) {
    selectedSeries = series;
  }

  function closeModal() {
    selectedSeries = null;
  }

  function handleDeleteSeries(seriesToDelete) {
    deleteSeriesById(seriesToDelete.id);
    seriesData = seriesData.filter(s => s.id !== seriesToDelete.id);
    filteredSeries = filteredSeries.filter(s => s.id !== seriesToDelete.id);
  }

  onDestroy(() => unsubscribe());

  $: filteredSeries = seriesData
    .filter(s => s.completed === filterCompleted && s.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const ownedA = (a.volumes || []).filter(v => v.owned).length;
      const ownedB = (b.volumes || []).filter(v => v.owned).length;
      const percentA = a.total_volumes ? ownedA / a.total_volumes : 0;
      const percentB = b.total_volumes ? ownedB / b.total_volumes : 0;

      if (sortBy === 'total') return (b.total_volumes || 0) - (a.total_volumes || 0);
      if (sortBy === 'owned') return ownedB - ownedA;
      if (sortBy === 'percent') return percentB - percentA;
      return a.title.localeCompare(b.title);
    });

  $: EntryComponent = $isMobile ? MobileSeriesEntry : SeriesEntry;
</script>

<h2 style="margin-bottom: 1rem;">{filterCompleted ? 'Complete' : 'Incomplete'} Series</h2>

{#if filteredSeries.length === 0}
  <p>No series found.</p>
{:else}
  {#each filteredSeries as series (series.id)}
    <svelte:component
      this={EntryComponent}
      {series}
      on:edit={(e) => openEditModal(e.detail)}
      on:delete={(e) => handleDeleteSeries(e.detail)}
    />
  {/each}
{/if}

{#if selectedSeries}
  <EditSeriesModal series={selectedSeries} on:close={closeModal} />
{/if}
