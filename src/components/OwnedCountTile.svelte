<script>
  import { seriesStore } from "../stores/seriesStore";
  import { derived, writable } from "svelte/store";
  import { onDestroy } from "svelte";

  export let seriesData = null;

  const effectiveSeries = writable([]);

  let unsubscribe = null;

  // Reactive update if seriesData changes
  $: {
    if (seriesData) {
      effectiveSeries.set(seriesData);
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
    } else if (!unsubscribe) {
      unsubscribe = seriesStore.subscribe(effectiveSeries.set);
    }
  }

  onDestroy(() => {
    if (unsubscribe) unsubscribe();
  });

  const totalOwned = derived(effectiveSeries, ($list) =>
    $list.reduce((sum, s) => sum + (s.volumes?.filter(v => v.owned).length || 0), 0)
  );
</script>

<style>
  .owned-count {
    background: linear-gradient(90deg, #f6d365, #fda085);
    padding: 1rem 1.5rem;
    border-radius: 12px;
    margin: 1.5rem auto;
    font-size: 1.25rem;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
    width: fit-content;
    animation: fadeInOwned 0.6s ease-in-out;
    transition: transform 0.2s ease;
  }

  .owned-count:hover {
    transform: scale(1.05);
    cursor: default;
  }
</style>

<div class="owned-count">
  📚 Total Volumes Owned: <strong>{$totalOwned}</strong>
</div>
