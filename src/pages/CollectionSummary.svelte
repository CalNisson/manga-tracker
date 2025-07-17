<script>
  import { seriesStore, fetchSeries } from "../stores/seriesStore";
  import { onMount } from "svelte";
  import OwnedCountTile from "../components/OwnedCountTile.svelte";

  let seriesList = [];
  let sortedList = [];
  let sortBy = "title";

  const maxDisplayVolumes = 56;
  const baseTileSize = 20; // px
  const baseGap = 3;       // px
  const maxGridWidth = (baseTileSize * 8) + (baseGap * 7); // 181px
  const maxGridHeight = (baseTileSize * 7) + (baseGap * 6); // 158px

  const layoutCache = new Map();

  function getVolumeLayout(series) {
    const count = series.volumes?.length || 0;
    const cacheKey = `${series.id}-${count}`;
    if (layoutCache.has(cacheKey)) return layoutCache.get(cacheKey);

    let layout;
    if (count <= maxDisplayVolumes) {
      layout = { columns: 8, size: baseTileSize, gap: baseGap };
    } else {
      const rows = 7;
      const columns = Math.ceil(count / rows);
      const options = [3, 2].map(gap => {
        const tileW = (maxGridWidth - (columns - 1) * gap) / columns;
        const tileH = (maxGridHeight - (rows - 1) * gap) / rows;
        const size = Math.floor(Math.min(tileW, tileH));
        return { columns, size, gap };
      });
      const valid = options.filter(opt => opt.size >= 10);
      layout = valid.length > 0
        ? valid.sort((a, b) => b.size - a.size)[0]
        : { columns, size: 10, gap: baseGap };
    }

    layoutCache.set(cacheKey, layout);
    return layout;
  }

  onMount(() => {
    fetchSeries();
    const unsubscribe = seriesStore.subscribe(data => {
      seriesList = data;
    });
    return () => unsubscribe();
  });

  function sortSeries(list, sortBy) {
    if (!Array.isArray(list)) return [];
    return [...list].sort((a, b) => {
      if (sortBy === "title") return a.title?.localeCompare(b.title) ?? 0;
      if (sortBy === "total_volumes") {
        const diff = (b.total_volumes || 0) - (a.total_volumes || 0);
        return diff !== 0 ? diff : a.title?.localeCompare(b.title) ?? 0;
      }
      if (sortBy === "owned_volumes") {
        const ownedA = a.volumes?.filter(v => v.owned).length || 0;
        const ownedB = b.volumes?.filter(v => v.owned).length || 0;
        const diff = ownedB - ownedA;
        return diff !== 0 ? diff : a.title?.localeCompare(b.title) ?? 0;
      }
      if (sortBy === "percent_owned") {
        const ownedA = a.volumes?.filter(v => v.owned).length || 0;
        const ownedB = b.volumes?.filter(v => v.owned).length || 0;
        const pctA = a.total_volumes > 0 ? ownedA / a.total_volumes : 0;
        const pctB = b.total_volumes > 0 ? ownedB / b.total_volumes : 0;
        const diff = pctB - pctA;
        return diff !== 0 ? diff : a.title?.localeCompare(b.title) ?? 0;
      }
      return 0;
    });
  }

  $: sortedList = sortSeries(seriesList || [], sortBy);
  $: layoutMap = Object.fromEntries(
    sortedList.map(series => [series.id, getVolumeLayout(series)])
  );
</script>

<style>
  .page-container {
    padding: 2rem;
  }

  .sort-select {
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }

  .grid {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: center;
  }

  .tile {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    overflow: hidden;
    display: flex;
    flex-direction: row;
    align-items: center;
    transition: transform 0.2s;
    width: 300px;
    min-height: 150px;
    flex: none;
  }

  .tile:hover {
    transform: translateY(-3px);
  }

  .tile-left {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100px;
    flex-shrink: 0;
  }

  .cover {
    width: 100px;
    height: 150px;
    object-fit: cover;
    background: #eee;
    flex-shrink: 0;
  }

  .tile-content {
    padding: 0.5rem;
    width: 100%;
  }

  .title {
    font-weight: bold;
    font-size: 0.8rem;
    margin-top: 0.5rem;
    text-align: center;
  }

  .volume-grid {
    display: grid;
    justify-content: start;
  }

  .volume-tile {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 2px;
    font-size: 0.65rem;
    border: 1px solid #ccc;
    background-color: #ffffff;
    color: #333;
    flex-shrink: 0;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .volume-tile.owned {
    background-color: #38a169;
    color: white;
    border: 1px solid #38a169;
  }

  .volume-tile.hidden-number {
    color: transparent;
    position: relative;
  }

  .volume-tile.hidden-number::after {
    content: attr(data-volume-number);
    position: absolute;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 2px 5px;
    border-radius: 3px;
    font-size: 0.7rem;
    top: -1.5em;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    pointer-events: none;
    white-space: nowrap;
    z-index: 10;
    transition: opacity 0.2s;
  }

  .volume-tile.hidden-number:hover::after {
    opacity: 1;
  }

  .summary-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    text-align: center;
  }
</style>

<div class="page-container">
  <div class="summary-header">
    <h2>Collection Summary</h2>
    <label class="sort-select">
      Sort by:
      <select bind:value={sortBy}>
        <option value="title">Title (A–Z)</option>
        <option value="total_volumes">Total Volumes</option>
        <option value="owned_volumes">Volumes Owned</option>
        <option value="percent_owned">% Owned</option>
      </select>
    </label>
    <OwnedCountTile />
  </div>

  <div class="grid">
    {#each sortedList as series (series.id)}
      {#key series.id}
        <div class="tile">
          <div class="tile-left">
            {#if series.image_url}
              <img src={series.image_url} alt={series.title} class="cover" />
            {:else}
              <div class="cover">No Image</div>
            {/if}
            <div class="title">{series.title}</div>
          </div>

          <div class="tile-content">
            <div
              class="volume-grid"
              style="grid-template-columns: repeat({layoutMap[series.id].columns}, {layoutMap[series.id].size}px); gap: {layoutMap[series.id].gap}px;"
            >
              {#each series.volumes?.sort((a,b) => a.volume_number - b.volume_number) as vol (vol.id)}
                {#if series.volumes?.length > maxDisplayVolumes}
                  <div
                    class="volume-tile {vol.owned ? 'owned' : ''} hidden-number"
                    data-volume-number={vol.volume_number}
                    style="width: {layoutMap[series.id].size}px; height: {layoutMap[series.id].size}px;"
                  />
                {:else}
                  <div
                    class="volume-tile {vol.owned ? 'owned' : ''}"
                    style="width: {baseTileSize}px; height: {baseTileSize}px;"
                  >
                    {vol.volume_number}
                  </div>
                {/if}
              {/each}
            </div>
          </div>
        </div>
      {/key}
    {/each}
  </div>
</div>
