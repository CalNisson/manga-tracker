<script>
  import { createEventDispatcher } from 'svelte';
  import { addSeries } from '../stores/seriesStore';

  const dispatch = createEventDispatcher();

  let title = '';
  let totalVolumes = '';

  async function handleSubmit(e) {
    e.preventDefault();
    await addSeries(title, totalVolumes ? parseInt(totalVolumes) : null);
    title = '';
    totalVolumes = '';
    dispatch('add');
  }
</script>

<h2>Add New Series</h2>
<form on:submit={handleSubmit}>
  <input type="text" bind:value={title} placeholder="Series title" required />
  <input type="number" bind:value={totalVolumes} placeholder="Total volumes" min="1" />
  <button type="submit">Add Series</button>
</form>

<style>
  form {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  input, button {
    padding: 0.5rem;
  }
</style>
