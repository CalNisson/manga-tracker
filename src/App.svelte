<script>
  import { onMount } from 'svelte';
  import { fetchSeries } from './stores/seriesStore';
  import SeriesList from './components/SeriesList.svelte';
  import AddSeriesForm from './components/AddSeriesForm.svelte';

  let searchTerm = '';
  let sortBy = 'alpha';
  let showCompleted = false;

  onMount(() => {
    fetchSeries();
  });
</script>

<main style="padding: 2rem; max-width: 900px; margin: 0 auto;">
  <h1>Manga Collection Tracker</h1>

  <AddSeriesForm />

  <div style="display: flex; gap: 1rem; align-items: center; margin: 1.5rem 0; flex-wrap: wrap;">
    <button on:click={() => showCompleted = false} disabled={!showCompleted}>Incomplete</button>
    <button on:click={() => showCompleted = true} disabled={showCompleted}>Complete</button>

    <input
      type="text"
      placeholder="Search..."
      bind:value={searchTerm}
      style="padding: 0.5rem; border-radius: 4px; border: 1px solid #ccc;"
    />

    <select
      bind:value={sortBy}
      style="padding: 0.5rem; border-radius: 4px; border: 1px solid #ccc;">
      <option value="alpha">Alphabetical</option>
      <option value="total">Total Volumes</option>
      <option value="owned">Volumes Owned</option>
      <option value="percent">% Owned</option>
    </select>
  </div>

  <SeriesList filterCompleted={showCompleted} {searchTerm} {sortBy} />
</main>

<style>
  body {
    font-family: system-ui, sans-serif;
    margin: 0;
    background: #f9f9f9;
  }
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
