<script>
  import { seriesStore, fetchSeries } from "../stores/seriesStore";
  import { onMount } from "svelte";
  import OwnedCountTile from "../components/OwnedCountTile.svelte";
  import { user } from '../stores/authStore';
  import { get } from 'svelte/store';
  import { API_BASE } from '../stores/api.js';

  let seriesList = [];
  let sortedList = [];
  let sortBy = "title";
  let adminSearch = '';
  let otherUserSeries = [];
  let layoutMap = {};
  let separateCompleted = false;

  const maxDisplayVolumes = 56;
  const baseTileSize = 20;

  function getVolumeLayout(series) {
    const count = series.volumes?.length || 0;

    if (count <= maxDisplayVolumes) {
      return { columns: 8, size: 20, gap: 3 };
    }

    const MAX_WIDTH = 186;
    const MAX_HEIGHT = 163;
    const MIN_TILE_SIZE = 10;
    const MAX_COLUMNS = 30;
    const GAP_OPTIONS = [3, 2, 1];

    let best = null;

    for (const gap of GAP_OPTIONS) {
      for (let columns = 8; columns <= Math.min(count, MAX_COLUMNS); columns++) {
        const rows = Math.ceil(count / columns);

        const totalGapWidth = (columns - 1) * gap;
        const totalGapHeight = (rows - 1) * gap;

        const maxTileW = Math.floor((MAX_WIDTH - totalGapWidth) / columns);
        const maxTileH = Math.floor((MAX_HEIGHT - totalGapHeight) / rows);
        const tileSize = Math.min(maxTileW, maxTileH);

        if (tileSize >= MIN_TILE_SIZE) {
          if (!best || tileSize > best.size || (tileSize === best.size && columns > best.columns)) {
            best = { columns, size: tileSize, gap };
          }
        }
      }

      if (best) break;
    }

    return best || { columns: 20, size: MIN_TILE_SIZE, gap: 1 };
  }

  async function searchUser() {
    const currentUser = get(user);
    if (!currentUser.isAdmin || !adminSearch) return;

    const res = await fetch(`${API_BASE}/admin/series/${encodeURIComponent(adminSearch)}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (res.ok) {
      otherUserSeries = await res.json();
    } else {
      otherUserSeries = [];
      alert("User not found or not accessible.");
    }
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

  $: {
    const activeList = otherUserSeries.length > 0 ? otherUserSeries : seriesList;
    const complete = activeList.filter(s => s.completed);
    const incomplete = activeList.filter(s => !s.completed);
    sortedList = separateCompleted
      ? [sortSeries(complete, sortBy), sortSeries(incomplete, sortBy)]
      : [sortSeries(activeList, sortBy)];
  }

  $: {
    const flatList = sortedList.flat();
    layoutMap = Object.fromEntries(flatList.map(series => [series.id, getVolumeLayout(series)]));
  }
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
    padding-left: 5px;
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

  .switch {
    position: relative;
    display: inline-block;
    width: 48px;
    height: 24px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 34px;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 4px;
    bottom: 3px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }

  input:checked + .slider {
    background-color: #38a169;
  }

  input:checked + .slider:before {
    transform: translateX(24px);
  }

  .divider {
    width: 100%;
    height: 2px;
    background-color: #ccc;
    margin: 2rem auto;
  }
</style>

<div class="page-container">
  <div class="summary-header">
    <h2>Collection Summary</h2>

    {#if $user.isAdmin}
      <form on:submit|preventDefault={searchUser} style="margin-bottom: 1rem;">
        <input placeholder="Search by username..." bind:value={adminSearch} />
        <button type="submit">View Collection</button>
      </form>
    {/if}

    <label class="sort-select">
      Sort by:
      <select bind:value={sortBy}>
        <option value="title">Title (A–Z)</option>
        <option value="total_volumes">Total Volumes</option>
        <option value="owned_volumes">Volumes Owned</option>
        <option value="percent_owned">% Owned</option>
      </select>
    </label>

    <label style="display: flex; align-items: center; gap: 0.5rem;">
      <span>Separate Completed</span>
      <div class="switch">
        <input type="checkbox" bind:checked={separateCompleted} />
        <span class="slider"></span>
      </div>
    </label>

    <OwnedCountTile seriesData={otherUserSeries.length > 0 ? otherUserSeries : seriesList} />
  </div>

  {#each sortedList as group, index}
    <div class="grid">
      {#each group as series (series.id)}
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
      {/each}
    </div>

    {#if separateCompleted && index === 0 && sortedList.length > 1}
      <div class="divider"></div>
    {/if}
  {/each}
</div>
