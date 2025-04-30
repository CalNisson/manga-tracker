<script>
    import { token, username } from './stores/authStore';
    import { isMobile } from './stores/screenStore';
    import Login from './components/Login.svelte';
    import Register from './components/Register.svelte';
    import Router from 'svelte-spa-router';
    import Home from './pages/Home.svelte';
    import Recommendations from './pages/Recommendations.svelte';
  
    let currentView = 'login';
    $: isLoggedIn = $token.length > 0;
  
    const routes = {
      '/': Home,
      '/recommendations': Recommendations
    };
  
    function logout() {
      token.set('');
    }
  </script>
  
  {#if isLoggedIn}
    <header>
      <div class="layout-container">
        <a href="#/" class="logo-link">
          {#if $isMobile}
            <img src="/manga-tracker/images/manga_collector_logo_mobile.png" alt="Logo" class="logo" />
          {:else}
            <img src="/manga-tracker/images/manga_collector_logo.png" alt="Logo" class="logo" />
          {/if}
        </a>
        <div style="display: flex; align-items: center; gap: 1rem;">
          {#if $username}
            <span>Welcome, {$username}!</span>
          {/if}
          <button on:click={logout}>Logout</button>
        </div>
      </div>
  
      <nav class="navbar">
        <a href="#/" class="nav-link">Home</a>
        <a href="#/recommendations" class="nav-link">Recommendations</a>
      </nav>
    </header>
  
    <Router {routes} />
  {:else}
    <main style="padding: 2rem; max-width: 400px; margin: 0 auto;">
      <a href="/" class="logo-link">
        {#if $isMobile}
          <img src="/manga-tracker/images/manga_collector_logo_mobile.png" alt="Logo" class="logo" />
        {:else}
          <img src="/manga-tracker/images/manga_collector_logo.png" alt="Logo" class="logo" />
        {/if}
      </a>
  
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
    .layout-container {
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  
    .logo {
      height: 50px;
    }
  
    .navbar {
      display: flex;
      justify-content: center;
      gap: 1rem;
      padding: 1rem 2rem;
      background: #ff6b6b;
      color: white;
      font-weight: bold;
      align-items: center;
    }
  
    .navbar a:not(:last-child) {
      border-right: 1px solid white;
      padding-right: 1rem;
    }
  
    .nav-link {
      color: white;
      text-decoration: none;
    }
  
    .nav-link:hover {
      text-decoration: underline;
    }
  
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  </style>
  