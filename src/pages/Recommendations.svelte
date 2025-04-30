<script>
  import { onMount } from 'svelte';
  import { seriesStore, fetchMalMetadata } from '../stores/seriesStore';
  import RecommendationTile from '../components/RecommendationTile.svelte';

  let allSeries = [];
  let recommendedTitles = [];
  let isLoading = false;
  let error = null;

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  function loadFromCache(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function saveToCache(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to cache:', key, e);
    }
  }

  async function batchFetchMetadata(entries, batchSize = 5) {
    const enriched = [];

    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(async (entry) => {
          const meta = await fetchMalMetadata(entry.id);
          await delay(100); // reduce backend load
          return {
            ...entry,
            score: meta?.score ?? entry.score,
            genres: meta?.genres ?? entry.genres,
          };
        })
      );
      enriched.push(...results);
    }

    return enriched;
  }

  onMount(async () => {
    isLoading = true;
    error = null;
    recommendedTitles = [];
    const seenIds = new Set();
    const rawRecommendations = [];

    try {
      const $seriesStore = await new Promise((resolve) => {
        const unsub = seriesStore.subscribe((val) => {
          resolve(val);
          unsub();
        });
      });

      if (!$seriesStore || $seriesStore.length === 0) {
        console.warn('No series data — redirecting to Home.');
        window.location.href = `${window.location.origin}${import.meta.env.BASE_URL}`;
        return;
      }

      allSeries = $seriesStore.filter((s) => s.mal_id);
      const ownedMalIds = new Set(allSeries.map((s) => s.mal_id));
      console.log('Series considered for recommendations:', allSeries);

      for (const series of allSeries) {
        if (!series.title || !series.mal_id) continue;

        const malId = series.mal_id;
        const recKey = `rec_${malId}`;
        const cachedRecs = loadFromCache(recKey);
        let recData;

        if (cachedRecs) {
          recData = cachedRecs;
        } else {
          const recRes = await fetch(`https://api.jikan.moe/v4/manga/${malId}/recommendations`);
          recData = await recRes.json();
          saveToCache(recKey, recData);
          await delay(400);
        }

        let count = 0;
        for (const rec of recData?.data || []) {
          if (count >= 5) break;

          const recMalId = rec.entry?.mal_id;
          if (!recMalId || typeof recMalId !== 'number') {
            console.warn('❗ Bad recommendation entry:', rec.entry);
            continue;
          }

          if (ownedMalIds.has(recMalId)) {
            console.log('Skipped rec (by mal_id):', recMalId, rec.entry.title);
            continue;
          }

          seenIds.add(recMalId);

          const englishTitle =
            rec.entry.titles?.find((t) => t.type?.toLowerCase() === 'english')?.title ||
            rec.entry.title;
          console.log(rec)

          rawRecommendations.push({
            id: recMalId,
            title: englishTitle,
            url: rec.entry.url,
            image_url: rec.entry.images?.jpg?.image_url,
            reason: rec.content || 'Recommended by MAL users',
            score: rec.entry.score ?? null,
            genres: rec.entry.genres?.map((g) => g.name) ?? [],
          });

          count++;
        }
      }

      const enriched = await batchFetchMetadata(rawRecommendations, 5);

      recommendedTitles = enriched
        .filter((r) => typeof r.score === 'number')
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    } catch (err) {
      console.error(err);
      error = 'Failed to load recommendations.';
    } finally {
      isLoading = false;
    }
  });
</script>

<main class="recommendations-page">
  <h2>📖 Top Manga Recommendations</h2>

  {#if isLoading}
    <div class="loading-spinner">
      <p class="loading-dots">Loading recommendations<span class="dots"></span></p>
    </div>
  {:else if error}
    <p class="error">{error}</p>
  {:else if recommendedTitles.length > 0}
    <div class="grid">
      {#each recommendedTitles as rec (rec.id)}
        <RecommendationTile {...rec} />
      {/each}
    </div>
  {:else}
    <p>No new recommendations at this time. 📚</p>
  {/if}
</main>

<style>
  .recommendations-page {
    padding: 2rem;
    max-width: 1000px;
    margin: 0 auto;
  }

  .grid {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .error {
    color: red;
    font-weight: bold;
    text-align: center;
  }

  .loading-dots {
    text-align: center;
    font-size: 1.2rem;
    color: #444;
    margin-top: 2rem;
  }

  .dots::after {
    content: '';
    display: inline-block;
    width: 1em;
    text-align: left;
    animation: dots 1.2s steps(4, end) infinite;
  }

  @keyframes dots {
    0% {
      content: '';
    }
    33% {
      content: '.';
    }
    66% {
      content: '..';
    }
    100% {
      content: '...';
    }
  }
</style>
