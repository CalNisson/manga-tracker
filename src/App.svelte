<script>
  import { onMount } from 'svelte';
  import { fetchSeries } from './stores/seriesStore';
  import { token, username } from './stores/authStore';
  import { backendStarting } from './stores/backendStatus';
  import SeriesList from './components/SeriesList.svelte';
  import AddSeriesForm from './components/AddSeriesForm.svelte';
  import Login from './components/Login.svelte';
  import Register from './components/Register.svelte';

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
</script>

{#if isLoggedIn}
  <main style="padding: 2rem; max-width: 900px; margin: 0 auto;">
    {#if isWakingUp}
      <div class="overlay">
        <div class="spinner-message">⚙️ Waking up backend...</div>
      </div>
    {/if}

    <div class="layout-container">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h1>Manga Collection Tracker</h1>
        <div style="display: flex; align-items: center; gap: 1rem;">
          {#if $username}
            <span>Welcome, {$username}!</span>
          {/if}
          <button on:click={logout}>Logout</button>
        </div>
      </div>

      <AddSeriesForm />

      <div style="display: flex; gap: 1rem; align-items: center; margin: 1.5rem 0; flex-wrap: wrap;">
        <button on:click={() => showCompleted = false} disabled={!showCompleted}>Incomplete</button>
        <button on:click={() => showCompleted = true} disabled={showCompleted}>Complete</button>

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

      <SeriesList filterCompleted={showCompleted} {searchTerm} {sortBy} />
    </div>
  </main>
{:else}
  <main style="padding: 2rem; max-width: 400px; margin: 0 auto;">
    <h1>Manga Collection Tracker</h1>
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

  .layout-container {
    min-width: 800px;
    max-width: 100%;
    padding: 0 1rem;
    box-sizing: border-box;
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
</style>
