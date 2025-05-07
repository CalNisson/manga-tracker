<script>
  import { createEventDispatcher } from 'svelte';
  import { updateSeries } from '../stores/seriesStore';

  export let series;

  const dispatch = createEventDispatcher();

  let form = {
    title: series.title,
    total_volumes: series.total_volumes,
    score: series.score ?? '',
    tags: [...(series.tags || [])]
  };

  let newTag = '';
  let errorMessage = '';

  function tryAddTag() {
    const rawTags = newTag.split(',').map(t => t.trim()).filter(t => t);
    if (rawTags.length === 0) return;

    const updatedTags = [...form.tags];

    for (const tag of rawTags) {
      if (updatedTags.length >= 15) {
        errorMessage = 'You can only have up to 15 tags.';
        break;
      }

      if (tag.length > 30) {
        errorMessage = `Tag "${tag}" is too long (max 30 characters).`;
        continue;
      }

      if (!updatedTags.includes(tag)) {
        updatedTags.push(tag);
      }
    }

    form.tags = updatedTags;
    newTag = '';
    errorMessage = '';
  }


  function removeTag(index) {
    form.tags = form.tags.filter((_, i) => i !== index);
    errorMessage = '';
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      tryAddTag();
    }
  }

  async function save() {
    errorMessage = '';

    if (form.tags.length > 15) {
      errorMessage = 'Too many tags.';
      return;
    }

    await updateSeries(series.id, {
      title: form.title,
      total_volumes: parseInt(form.total_volumes),
      score: form.score !== '' ? parseFloat(form.score) : null,
      tags: form.tags
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

    <label>
      Score (0.00–10.00):
      <input
        type="number"
        min="0"
        max="10"
        step="0.01"
        bind:value={form.score}
        placeholder="Optional"
      />
    </label>

    <label>
      Tags (max 15, each ≤ 30 chars):
      <div class="tag-editor">
        <div class="tag-input-row">
          <input
            type="text"
            bind:value={newTag}
            on:keydown={handleKeyDown}
            placeholder="Add tag"
          />
          <button type="button" class="add-tag-button" on:click={tryAddTag}>Add</button>
        </div>
    
        <div class="tag-chip-container">
          {#each form.tags as tag, i}
            <span class="tag-chip">
              {tag}
              <button type="button" class="remove-btn" on:click={() => removeTag(i)}>×</button>
            </span>
          {/each}
        </div>
      </div>
    </label> 

    {#if errorMessage}
      <div class="error">{errorMessage}</div>
    {/if}

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

  input[type="number"]::-webkit-inner-spin-button {
    opacity: 0.4;
  }

  .error {
    color: red;
    margin-bottom: 0.75rem;
    font-size: 0.9rem;
  }

  .tag-editor {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.25rem;
  }

  .tag-input-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .tag-input-row input[type="text"] {
    flex: 1;
    padding: 0.4rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .add-tag-button {
    padding: 0.4rem 0.8rem;
    background-color: #ff6b6b;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .tag-chip-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .tag-chip {
    background-color: #ffd9d4;
    padding: 0.3rem 0.75rem;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    color: #333;
    white-space: nowrap;
    max-width: 100%;
  }

  .remove-btn {
    background: none;
    border: none;
    margin-left: 0.4rem;
    cursor: pointer;
    font-weight: bold;
    color: #555;
  }

</style>
