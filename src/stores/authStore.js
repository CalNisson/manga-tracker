import { writable, derived } from 'svelte/store';
import { jwtDecode } from 'jwt-decode';

function isTokenExpired(value) {
  if (!value) return true;

  try {
    const decoded = jwtDecode(value);

    if (!decoded.exp) return true;

    // Treat tokens that expire within the next 30 seconds as expired so the UI
    // does not briefly load authenticated pages before getting a 401.
    return decoded.exp * 1000 <= Date.now() + 30_000;
  } catch {
    return true;
  }
}

const savedToken = localStorage.getItem('token') || '';
const initialToken = isTokenExpired(savedToken) ? '' : savedToken;

if (!initialToken && savedToken) {
  localStorage.removeItem('token');
}

// Writable token store
export const token = writable(initialToken);

// Persist token in localStorage
// Expired or invalid tokens are removed immediately instead of keeping the app
// in a half-logged-in state.
token.subscribe((value) => {
  if (value && !isTokenExpired(value)) {
    localStorage.setItem('token', value);
  } else {
    localStorage.removeItem('token');
  }
});

// Derived store to get current username and admin flag
export const user = derived(token, ($token) => {
  if (!$token || isTokenExpired($token)) return { username: null, isAdmin: false };

  try {
    const decoded = jwtDecode($token);

    return {
      username: decoded.sub || null,
      isAdmin: !!decoded.is_admin,
    };
  } catch {
    return { username: null, isAdmin: false };
  }
});

export function clearSession() {
  token.set('');
}

export function getValidToken() {
  const value = localStorage.getItem('token') || '';

  if (isTokenExpired(value)) {
    clearSession();
    return '';
  }

  return value;
}
