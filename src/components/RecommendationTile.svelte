<script>
  export let id;
  export let title;
  export let image_url;
  export let url;
  export let score = null;
  export let genres = [];
</script>

<div class="tile">
  <img src={image_url} alt={`Cover for ${title}`} />
  <div class="info">
    <h3>{title}</h3>
    {#if score}
      <p>⭐ <strong>Score: </strong> {score}</p>
    {/if}
    {#if genres.length > 0}
      <p class="genres"><strong>Genres: </strong>{genres.join(', ')}</p>
    {/if}
    <a href={url} target="_blank" rel="noopener noreferrer">🔗 View on MyAnimeList</a>
  </div>
</div>

<style>
  .tile {
    display: flex;
    gap: 1rem;
    background: linear-gradient(145deg, #fff0ec, #ffe0dc);
    border-radius: 12px;
    padding: 1rem;
    align-items: center;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  .tile img {
    width: 80px;
    height: 110px;
    border-radius: 6px;
    object-fit: cover;
    flex-shrink: 0;
  }

  .info {
    flex: 1;
  }

  .info h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #333;
  }

  .info p {
    margin: 0.3rem 0;
    color: #555;
    font-size: 0.95rem;
  }

  .info .genres {
    font-style: italic;
    color: #777;
  }

  .info a {
    display: inline-block;
    margin-top: 0.5rem;
    color: #ff6b6b;
    text-decoration: none;
    font-weight: bold;
  }

  .info a:hover {
    text-decoration: underline;
  }
</style>
