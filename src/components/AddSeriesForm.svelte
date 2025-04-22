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
</style>
