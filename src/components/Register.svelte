<script>
  import { API_BASE } from '../stores/api.js';

  let username = '';
  let email = '';
  let password = '';
  let confirmPassword = '';
  let error = '';
  let success = '';

  async function register() {
    error = '';
    success = '';

    if (password !== confirmPassword) {
      error = 'Passwords do not match.';
      return;
    }

    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    if (res.ok) {
      success = 'Registration successful! You can now log in.';
      username = email = password = confirmPassword = '';
    } else {
      const msg = await res.json();
      error = msg.detail || 'Registration failed';
    }
  }
</script>

<form on:submit|preventDefault={register}>
  <h2>Create Account</h2>
  {#if error}<p style="color: red;">{error}</p>{/if}
  {#if success}<p style="color: green;">{success}</p>{/if}
  <input type="text" placeholder="Username" bind:value={username} required />
  <input type="email" placeholder="Email" bind:value={email} required />
  <input type="password" placeholder="Password" bind:value={password} required />
  <input type="password" placeholder="Confirm Password" bind:value={confirmPassword} required />
  <button type="submit">Register</button>
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
