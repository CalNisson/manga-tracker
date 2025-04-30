<script>
  import { token } from '../stores/authStore';
  import { API_BASE } from '../stores/api.js';

  let username = '';
  let password = '';
  let error = '';

  async function login() {
    error = '';
    const res = await fetch(`${API_BASE}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username, password })
    });

    if (res.ok) {
      const data = await res.json();
      token.set(data.access_token);
      location.reload();
      window.location.href = '/';
    } else {
      const msg = await res.json();
      error = msg.detail || 'Login failed';
    }
  }
</script>

<form on:submit|preventDefault={login}>
  <h2>Login</h2>
  {#if error}<p style="color: red;">{error}</p>{/if}
  <input bind:value={username} placeholder="Username" required />
  <input type="password" bind:value={password} placeholder="Password" required />
  <button type="submit">Login</button>
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-width: 300px;
    margin: auto;
  }
  input, button {
    padding: 0.5rem;
  }
</style>
