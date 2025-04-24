<script>
  import { createEventDispatcher } from 'svelte';
  import { addSeries } from '../stores/seriesStore';

  const dispatch = createEventDispatcher();

  let title = '';
  let totalVolumes = '';

  async function handleSubmit(e) {
    e.preventDefault();

    const parsedTotal = totalVolumes ? parseInt(totalVolumes) : null;

    if (parsedTotal !== null && parsedTotal < 1) {
      alert("Total volumes must be at least 1.");
      return;
    } else if (parsedTotal !== null && parsedTotal > 500) {
      alert("Input too large!");
      return;
    }

    await addSeries(title, parsedTotal);
    title = '';
    totalVolumes = '';
    dispatch('add');
  }
</script>

<div class="add-series-form">
  <h2>Add New Series</h2>
  <form on:submit={handleSubmit}>
    <input type="text" bind:value={title} placeholder="Series title" required />
    <div class="tooltip-container">
      <input
        type="number"
        bind:value={totalVolumes}
        placeholder="Total volumes"
        min="1"
      />
      <span class="tooltip-text">Leave blank to autofill volume count</span>
    </div>
    <button type="submit">Add Series</button>
  </form>
</div>

<style>
  form {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  input, button {
    padding: 0.5rem;
  }
  .tooltip-container {
    position: relative;
    display: inline-block;
  }

  .tooltip-text {
    visibility: hidden;
    background-color: #333;
    color: #fff;
    font-size: 0.8rem;
    text-align: center;
    border-radius: 4px;
    padding: 0.4rem 0.6rem;
    position: absolute;
    z-index: 1;
    bottom: 125%; /* show above the input */
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
  }

  .tooltip-container:hover .tooltip-text,
  .tooltip-container:focus-within .tooltip-text {
    visibility: visible;
    opacity: 1;
  }

  .add-series-form {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 2rem auto;
    text-align: center;
  }

  .add-series-form form {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
    margin-top: 1rem;
  }

  .add-series-form input,
  .add-series-form button {
    padding: 0.5rem 1rem;
    border-radius: 8px;
    border: 1px solid #ccc;
    font-size: 1rem;
  }

</style>
