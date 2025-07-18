import { writable, derived } from 'svelte/store';
import { jwtDecode } from 'jwt-decode';

// Writable token store
export const token = writable(localStorage.getItem('token') || '');

// Persist token in localStorage
token.subscribe((value) => {
  if (value) {
    localStorage.setItem('token', value);
  } else {
    localStorage.removeItem('token');
  }
});

// Derived store to get current username and admin flag
export const user = derived(token, ($token) => {
  if (!$token) return { username: null, isAdmin: false };

  try {
    // @ts-ignore - allow access to custom JWT field
    const decoded = jwtDecode($token);

    return {
      username: decoded.sub || null,
      // @ts-ignore - suppress TS warning about is_admin
      isAdmin: !!decoded.is_admin,
    };
  } catch {
    return { username: null, isAdmin: false };
  }
});