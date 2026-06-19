<script>
  import { token } from '../stores/authStore';
  import { API_BASE } from '../stores/api.js';

  let username = '';
  let password = '';
  let error = '';
  let loading = false;

  async function login() {
    error = '';
    loading = true;

    try {
      const res = await fetch(`${API_BASE}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username, password })
      });

      if (res.ok) {
        const data = await res.json();
        token.set(data.access_token);
        window.location.href = `${window.location.origin}${import.meta.env.BASE_URL}`;
        return;
      }

      let msg = {};
      try {
        msg = await res.json();
      } catch {
        // Ignore invalid JSON error bodies.
      }

      error = msg.detail || 'Login failed';
    } catch (err) {
      console.error('Login request failed:', err);
      error = `Could not connect to the backend at ${API_BASE}. Make sure the backend is running locally.`;
    } finally {
      loading = false;
    }
  }
</script>

<form on:submit|preventDefault={login}>
  <h2>Login</h2>
  {#if error}<p style="color: red;">{error}</p>{/if}
  <input bind:value={username} placeholder="Username" required />
  <input type="password" bind:value={password} placeholder="Password" required />
  <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
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
