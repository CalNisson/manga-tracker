<script>
  import { createEventDispatcher } from "svelte";
  import { addSeries } from "../stores/seriesStore";

  const dispatch = createEventDispatcher();

  let title = "";
  let totalVolumes = "";

  // MAL search UI state
  let searching = false;
  let searchError = "";
  let results = [];
  let pickerOpen = false;

  // allow users to include non-manga types if they want
  let includeLightNovels = false;

  function normalizeTitleForQuery(t) {
    return (t || "").trim();
  }

  async function searchMAL() {
    searchError = "";
    results = [];
    const q = normalizeTitleForQuery(title);
    if (!q) {
      searchError = "Type a title first.";
      return;
    }

    searching = true;
    try {
      // Jikan v4 manga search. We use Jikan directly from the browser here.
      // Docs: https://docs.api.jikan.moe/
      const url = new URL("https://api.jikan.moe/v4/manga");
      url.searchParams.set("q", q);
      url.searchParams.set("limit", "10");

      const res = await fetch(url.toString());

      if (!res.ok) {
        throw new Error(`Jikan error: HTTP ${res.status}`);
      }

      const json = await res.json();
      const data = Array.isArray(json?.data) ? json.data : [];

      // MAL "manga" category includes Manga / Light Novel / Novel / Manhwa / Manhua / One-shot / Doujinshi etc.
      // Default to showing Manga/Manhwa/Manhua/One-shot; user can opt-in to Light Novel.
      const allowed = new Set(["Manga", "Manhwa", "Manhua", "One-shot", "Doujinshi"]);
      const filtered = data.filter((it) => {
        const type = it?.type ?? "";
        if (includeLightNovels) return true;
        return allowed.has(type);
      });

      // Prefer items where one of the titles matches closely
      const lower = q.toLowerCase();
      const scored = filtered
        .map((it) => {
          const titles = Array.isArray(it?.titles)
            ? it.titles.map((t) => (t?.title || "").toLowerCase())
            : [];
          const main = (it?.title || "").toLowerCase();
          const english = Array.isArray(it?.titles)
            ? (it.titles.find((t) => (t?.type || "").toLowerCase() === "english")?.title || "")
            : "";
          const match =
            titles.includes(lower) || main === lower || (english && english.toLowerCase() === lower);
          return { it, score: match ? 0 : 1 };
        })
        .sort((a, b) => a.score - b.score)
        .map((x) => x.it);

      results = scored;
      pickerOpen = true;
    } catch (err) {
      console.error(err);
      searchError = "Failed to search MAL via Jikan. Try again in a moment.";
    } finally {
      searching = false;
    }
  }

  function pickResult(r) {
    // Set title to English if available, else default title
    const english =
      Array.isArray(r?.titles)
        ? r.titles.find((t) => (t?.type || "").toLowerCase() === "english")?.title
        : null;

    title = (english || r?.title || "").trim();

    // Prefill total volumes if known and valid
    const vols = r?.volumes;
    if (Number.isInteger(vols) && vols >= 1 && vols <= 500) {
      totalVolumes = String(vols);
    } else {
      totalVolumes = "";
    }

    // Store selected MAL id for submission
    selectedMalId = r?.mal_id ?? null;

    // close picker
    pickerOpen = false;
  }

  let selectedMalId = null;

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

    // Send mal_id if we have it so the backend uses the correct entry (manga vs light novel).
    await addSeries(title, parsedTotal, null, [], selectedMalId);

    title = "";
    totalVolumes = "";
    selectedMalId = null;

    dispatch("add");
  }
</script>

<div class="add-series-form">
  <h2>Add New Series</h2>

  <form on:submit={handleSubmit}>
    <input type="text" bind:value={title} placeholder="Series title" required />

    <div class="tooltip-container">
      <input type="number" bind:value={totalVolumes} placeholder="Total volumes" min="1" />
      <span class="tooltip-text">Leave blank to autofill volume count</span>
    </div>

    <button type="submit">Add Series</button>
    <button type="button" class="secondary" on:click={searchMAL} disabled={searching}>
      {searching ? "Searching..." : "Search MAL"}
    </button>
  </form>

  <div class="search-options">
    <label class="checkbox">
      <input type="checkbox" bind:checked={includeLightNovels} />
      Include Light Novels / Novels
    </label>
    {#if searchError}
      <div class="error">{searchError}</div>
    {/if}
  </div>
</div>

{#if pickerOpen}
  <div class="modal-overlay" on:click={() => (pickerOpen = false)}>
    <div class="modal" role="dialog" aria-modal="true" on:click|stopPropagation>
      <div class="modal-header">
        <div class="modal-title">Pick the correct MAL entry</div>
        <button class="icon-btn" type="button" on:click={() => (pickerOpen = false)}>✕</button>
      </div>

      <div class="modal-body">
        {#if results.length === 0}
          <div class="muted">No results found.</div>
        {:else}
          <div class="result-list">
            {#each results as r}
              <button class="result" type="button" on:click={() => pickResult(r)}>
                <img
                  class="cover"
                  src={r?.images?.jpg?.image_url}
                  alt={r?.title || "Cover"}
                  loading="lazy"
                />
                <div class="meta">
                  <div class="r-title">{r?.title}</div>
                  <div class="r-sub">
                    <span class="pill">{r?.type || "?"}</span>
                    {#if r?.volumes}
                      <span class="pill">{r.volumes} vols</span>
                    {:else}
                      <span class="pill muted-pill">vols ?</span>
                    {/if}
                    {#if r?.status}
                      <span class="pill muted-pill">{r.status}</span>
                    {/if}
                  </div>
                </div>
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <div class="modal-footer">
        <button class="secondary" type="button" on:click={() => (pickerOpen = false)}>
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .add-series-form {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 2rem auto;
    text-align: center;
  }

  form {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
  }

  input,
  button {
    padding: 0.5rem 1rem;
    border-radius: 8px;
    border: 1px solid #ccc;
    font-size: 1rem;
  }

  button.secondary {
    background: transparent;
    color: #ff6b6b;
    border: 1px solid #ff6b6b;
  }

  button.secondary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
    bottom: 125%;
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

  .search-options {
    width: min(680px, 92vw);
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 0.5rem;
  }

  .checkbox {
    display: inline-flex;
    gap: 0.5rem;
    align-items: center;
    font-size: 0.95rem;
  }

  .error {
    color: #b00020;
    background: #ffe7ea;
    border: 1px solid #ffb7c0;
    padding: 0.4rem 0.6rem;
    border-radius: 8px;
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.25rem;
    z-index: 9999;
  }

  .modal {
    width: min(760px, 96vw);
    max-height: 86vh;
    overflow: hidden;
    background: #fff;
    border-radius: 16px;
    border: 1px solid #e9d9d6;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
    display: flex;
    flex-direction: column;

    /* FORCE readable text in the modal even if global CSS makes buttons white */
    color: #333 !important;
  }

  .modal * {
    color: inherit;
  }

  .modal-header {
    padding: 0.9rem 1rem;
    border-bottom: 1px solid #f0e4e1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    background: #fff8f6;
  }

  .modal-title {
    font-weight: 700;
    font-size: 1.05rem;
    color: #222 !important;
  }

  .icon-btn {
    background: transparent;
    border: 1px solid #e9d9d6;
    color: #333 !important;
    border-radius: 10px;
    padding: 0.35rem 0.6rem;
    cursor: pointer;
  }

  .modal-body {
    padding: 0.9rem 1rem;
    overflow: auto;
    color: #333 !important;
  }

  .modal-footer {
    padding: 0.9rem 1rem;
    border-top: 1px solid #f0e4e1;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    background: #fff8f6;
  }

  .result-list {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.6rem;
  }

  /* This is the key: your results are BUTTONS, so force their text color */
  .result {
    display: grid;
    grid-template-columns: 56px 1fr;
    gap: 0.8rem;
    text-align: left;
    align-items: center;
    background: #fff;
    border: 1px solid #f0e4e1;
    border-radius: 14px;
    padding: 0.6rem;
    cursor: pointer;

    color: #222 !important;
  }

  .result * {
    color: inherit !important;
  }

  .result:hover {
    border-color: #ffb0b0;
    box-shadow: 0 6px 18px rgba(255, 107, 107, 0.18);
  }

  .cover {
    width: 56px;
    height: 80px;
    object-fit: cover;
    border-radius: 10px;
    border: 1px solid #f0e4e1;
    background: #fff8f6;
  }

  .meta {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .r-title {
    font-weight: 700;
    line-height: 1.15;
    color: #222 !important;
  }

  .r-sub {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    align-items: center;
    font-size: 0.9rem;
    line-height: 1.2;
    color: #444 !important;
  }

  .pill {
    display: inline-flex;
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    border: 1px solid #f0e4e1;
    background: #fff8f6;
    color: #333 !important;
    font-size: 0.82rem;
  }

  .muted-pill {
    color: #666 !important;
  }

  .muted {
    color: #666 !important;
  }
</style>