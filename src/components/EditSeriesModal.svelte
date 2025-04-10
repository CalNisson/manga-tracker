<script>
    import { createEventDispatcher } from 'svelte';
    import { toggleComplete, updateSeries } from '../stores/seriesStore';
  
    export let series;
  
    const dispatch = createEventDispatcher();
  
    let form = {
      title: series.title,
      total_volumes: series.total_volumes
    };
  
    async function save() {
      await updateSeries(series.id, {
        title: form.title,
        total_volumes: parseInt(form.total_volumes)
      });
  
      dispatch('close');
    }
  
    function cancel() {
      dispatch('close');
    }
  </script>
  
  <div class="modal-backdrop" on:click={cancel}>
    <div class="modal-content" on:click|stopPropagation>
      <h2>Edit Series</h2>
  
      <label>
        Title:
        <input type="text" bind:value={form.title} />
      </label>
  
      <label>
        Total Volumes:
        <input type="number" min="1" bind:value={form.total_volumes} />
      </label>
  
      <div class="buttons">
        <button on:click={save}>Save</button>
        <button on:click={cancel}>Cancel</button>
      </div>
    </div>
  </div>
  
  <style>
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 100;
    }
  
    .modal-content {
      background: white;
      padding: 1.5rem;
      border-radius: 0.5rem;
      min-width: 300px;
    }
  
    label {
      display: block;
      margin-bottom: 0.75rem;
    }
  
    input {
      width: 100%;
      padding: 0.4rem;
      margin-top: 0.25rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
  
    .buttons {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1rem;
    }
  </style>
  