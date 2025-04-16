<script>
    import Login from './Login.svelte';
    import Register from './Register.svelte';
  
    let showLogin = true;
  </script>
  
  <div class="toggle-container">
    <button on:click={() => showLogin = true} class:active={showLogin}>Login</button>
    <button on:click={() => showLogin = false} class:active={!showLogin}>Register</button>
  </div>
  
  {#if showLogin}
    <Login />
  {:else}
    <Register />
  {/if}
  
  <style>
    .toggle-container {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    button {
      padding: 0.5rem 1rem;
      border: 1px solid #ccc;
      background: white;
      cursor: pointer;
    }
    .active {
      background: #4caf50;
      color: white;
      border-color: #4caf50;
    }
  </style>