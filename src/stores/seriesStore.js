import { writable } from 'svelte/store';
import { token } from './authStore';

export const seriesStore = writable([]);
const API_BASE = "https://manga-collection-backend-0fqi.onrender.com";

async function authFetch(url, options = {}) {
  const $token = localStorage.getItem('token');
  if (!$token) throw new Error("Not authenticated");

  const headers = options.headers || {};
  headers['Authorization'] = `Bearer ${$token}`;
  headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  options.headers = headers;

  console.log("Using token:", $token);
  return fetch(url, options);
}

export async function fetchSeries() {
  try {
    const res = await authFetch(`${API_BASE}/series`);
    if (res.ok) {
      const data = await res.json();
      seriesStore.set(data);
    }
  } catch (err) {
    console.error('Failed to fetch series:', err);
  }
}

export async function addSeries(title, totalVolumes) {
  const payload = { title, total_volumes: totalVolumes };
  const res = await authFetch(`${API_BASE}/series`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  if (res.ok) fetchSeries();
}

export async function toggleComplete(id) {
  const res = await authFetch(`${API_BASE}/series/${id}/toggle_complete`, {
    method: 'PATCH'
  });

  if (res.ok) {
    const updatedSeries = await res.json();
    seriesStore.update(seriesList =>
      seriesList.map(s => s.id === id ? updatedSeries : s)
    );
  } else {
    console.error('Failed to toggle complete:', await res.text());
  }
}

export async function toggleOwned(volumeId) {
  const res = await authFetch(`${API_BASE}/volumes/${volumeId}/toggle`, {
    method: 'POST'
  });

  if (res.ok) {
    fetchSeries();
  } else {
    console.error('Failed to update volume ownership:', await res.text());
  }
}

export async function updateSeries(id, data) {
  const res = await authFetch(`${API_BASE}/series/${id}/update_total`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });

  if (res.ok) {
    const updatedSeries = await res.json();
    seriesStore.update(seriesList =>
      seriesList.map(s => s.id === id ? updatedSeries : s)
    );
  } else {
    console.error('Failed to update series:', await res.text());
  }
}

export async function deleteSeriesById(id) {
  const res = await authFetch(`${API_BASE}/series/${id}`, {
    method: 'DELETE'
  });

  if (res.ok) {
    seriesStore.update(seriesList => seriesList.filter(s => s.id !== id));
  } else {
    console.error('Failed to delete series:', await res.text());
  }
}
