import { writable, derived } from 'svelte/store';
import { jwtDecode } from 'jwt-decode';

// Store the token in localStorage for persistence
export const token = writable(localStorage.getItem('token') || '');

token.subscribe(value => {
  if (value) {
    localStorage.setItem('token', value);
  } else {
    localStorage.removeItem('token');
  }
});

// 🔍 Derived store that gives us the current username from the token
export const username = derived(token, ($token) => {
  if (!$token) return null;

  try {
    const decoded = jwtDecode($token);
    return decoded.sub || null;
  } catch {
    return null;
  }
});
