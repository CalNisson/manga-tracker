<script>
  import { onMount } from 'svelte';
  import { fetchSeries } from './stores/seriesStore';
  import { token, username } from './stores/authStore';
  import { backendStarting } from './stores/backendStatus';
  import { seriesStore } from './stores/seriesStore';
  import SeriesList from './components/SeriesList.svelte';
  import AddSeriesForm from './components/AddSeriesForm.svelte';
  import Login from './components/Login.svelte';
  import Register from './components/Register.svelte';
  import { isMobile } from './stores/screenStore.js';

  let searchTerm = '';
  let sortBy = 'alpha';
  let showCompleted = false;

  let currentView = 'login';

  $: isLoggedIn = $token.length > 0;
  $: isWakingUp = $backendStarting;

  function logout() {
    token.set('');
  }

  onMount(() => {
    if (isLoggedIn) {
      fetchSeries();
    }
  });

  let dots = '';
  let interval;

  $: if ($backendStarting) {
    let count = 0;
    interval = setInterval(() => {
      count = (count + 1) % 4;
      dots = '.'.repeat(count);
    }, 500);
  } else {
    clearInterval(interval);
    dots = '';
  }
</script>

{#if isLoggedIn}
  <main style="padding: 2rem; max-width: 900px; margin: 0 auto;">
    {#if isWakingUp}
      <div class="overlay">
        <div class="spinner-message">
          <span class="gear">⚙️</span>
          <span class="message">Waking up backend<span class="dots">{dots}</span></span>
        </div>        
      </div>
    {/if}

    <div class="layout-container">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <a href="/" class="logo-link">
          {#if $isMobile}
            <img src="/images/manga_collector_logo_mobile.png" alt="Logo" class="logo" />
          {:else}
            <img src="/images/manga_collector_logo.png" alt="Logo" class="logo" />
          {/if}
        </a>
        <div style="display: flex; align-items: center; gap: 1rem;">
          {#if $username}
            <span>Welcome, {$username}!</span>
          {/if}
          <button on:click={logout}>Logout</button>
        </div>
      </div>

      <AddSeriesForm />

      <div class="filter-bar">
        <div class="toggle-switch" on:click={() => showCompleted = !showCompleted}>
          <div class="slider" class:right={showCompleted}></div>
          <div class="label left" class:active={!showCompleted}>Incomplete</div>
          <div class="label right" class:active={showCompleted}>Complete</div>
        </div>        
        
        <input
          type="text"
          placeholder="Search..."
          bind:value={searchTerm}
          style="padding: 0.5rem; border-radius: 4px; border: 1px solid #ccc;"
        />

        <select
          bind:value={sortBy}
          style="padding: 0.5rem; border-radius: 4px; border: 1px solid #ccc;">
          <option value="alpha">Alphabetical</option>
          <option value="total">Total Volumes</option>
          <option value="owned">Volumes Owned</option>
          <option value="percent">% Owned</option>
        </select>
      </div>

      {#if $seriesStore.length > 0}
        <div class="owned-count">
          <span>📚 Total Volumes Owned: <strong>{$seriesStore.reduce((sum, s) => {
            return sum + (s.volumes?.filter(v => v.owned).length || 0);
          }, 0)}</strong></span>
        </div>
      {/if}

      <SeriesList filterCompleted={showCompleted} {searchTerm} {sortBy} />
    </div>
  </main>
{:else}
  <main style="padding: 2rem; max-width: 400px; margin: 0 auto;">
    <a href="/" class="logo-link">
      {#if $isMobile}
        <img src="/images/manga_collector_logo_mobile.png" alt="Logo" class="logo" />
      {:else}
        <img src="/images/manga_collector_logo.png" alt="Logo" class="logo" />
      {/if}
    </a>
    {#if isWakingUp}
      <div class="overlay">
        <div class="spinner-message">⚙️ Waking up backend...</div>
      </div>
    {/if}
    <div style="margin-bottom: 1rem;">
      <button on:click={() => currentView = 'login'} disabled={currentView === 'login'}>Login</button>
      <button on:click={() => currentView = 'register'} disabled={currentView === 'register'}>Register</button>
    </div>
    {#if currentView === 'login'}
      <Login />
    {:else}
      <Register />
    {/if}
  </main>
{/if}

<style>
  body {
    font-family: system-ui, sans-serif;
    margin: 0;
    background: #f9f9f9;
    overflow-x: hidden;
    padding: 0;
    width: 100%;
    box-sizing: border-box;
  }
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .layout-container > div:first-child {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #e5e7eb;
  }

  h1 {
    font-size: 2.25rem;
    background: #2e2e2e;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(255, 255, 255, 0.8);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    font-weight: bold;
    color: #333;
  }

  .spinner-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 1.25rem;
    font-weight: bold;
    color: #333;
    animation: fadeIn 0.5s ease-in;
  }

  .gear {
    display: inline-block;
    font-size: 2rem;
    animation: spin 1s linear infinite;
    margin-bottom: 0.5rem;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.9); }
    to   { opacity: 1; transform: scale(1); }
  }

  .owned-count {
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(90deg, #f6d365, #fda085);
    color: #333;
    padding: 1rem 1.5rem;
    margin: 1.5rem auto;
    width: fit-content;
    border-radius: 12px;
    font-size: 1.25rem;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    animation: fadeInOwned 0.6s ease-in-out;
    transition: transform 0.2s ease;
  }

  .owned-count:hover {
    transform: scale(1.05);
    cursor: default;
  }

  @keyframes fadeInOwned {
    from { opacity: 0; transform: translateY(-10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .filter-bar {
    background: white;
    padding: 1rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    margin: 2rem auto;
    max-width: 900px;
  }

  .filter-bar input,
  .filter-bar select {
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 0.5rem;
    font-size: 1rem;
  }

  .filter-bar button {
    background-color: #4f46e5;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.2s ease, transform 0.2s ease;
  }

  .filter-bar button:hover {
    background-color: #4338ca;
    transform: translateY(-2px);
  }

  .toggle-switch {
    position: relative;
    display: flex;
    width: 200px;
    height: 40px;
    background: #e4e4e7;
    border-radius: 999px;
    cursor: pointer;
    user-select: none;
    overflow: hidden;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    font-weight: bold;
  }

  .toggle-switch .slider {
    position: absolute;
    top: 0;
    left: 0;
    width: 50%;
    height: 100%;
    background-color: #ff6b6b;
    border-radius: 999px;
    transition: transform 0.3s ease;
    z-index: 0;
  }

  .toggle-switch .slider.right {
    transform: translateX(100%);
  }

  .toggle-switch .label {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #333;
    z-index: 1;
    transition: color 0.3s ease;
  }

  .toggle-switch .label.active {
    color: white;
  }
</style>
