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
  export let selectedTag = '';
  export let sortAsc = true;

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
    .filter(s =>
      s.completed === filterCompleted &&
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!selectedTag || (s.tags || []).includes(selectedTag))
    )
    .sort((a, b) => {
      const ownedA = (a.volumes || []).filter(v => v.owned).length;
      const ownedB = (b.volumes || []).filter(v => v.owned).length;
      const percentA = a.total_volumes ? ownedA / a.total_volumes : 0;
      const percentB = b.total_volumes ? ownedB / b.total_volumes : 0;

      if (sortBy === 'total') return sortAsc ? (a.total_volumes || 0) - (b.total_volumes || 0) : (b.total_volumes || 0) - (a.total_volumes || 0);
      if (sortBy === 'owned') return sortAsc ? ownedA - ownedB : ownedB - ownedA;
      if (sortBy === 'percent') return sortAsc ? percentA - percentB : percentB - percentA;
      if (sortBy === 'score') {
        const scoreA = a.score ?? -1;
        const scoreB = b.score ?? -1;
        if (scoreA !== scoreB) return !sortAsc ? scoreA - scoreB : scoreB - scoreA;
        return a.title.localeCompare(b.title);
      }
      return sortAsc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
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
