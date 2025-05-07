import { writable } from 'svelte/store';
import { token } from './authStore';
import { backendStarting } from './backendStatus';
import { API_BASE } from './api.js';

export const seriesStore = writable([]);

async function authFetch(url, options = {}) {
  const $token = localStorage.getItem('token');
  if (!$token) throw new Error('Not authenticated');

  const headers = options.headers || {};
  headers['Authorization'] = `Bearer ${$token}`;
  headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  options.headers = headers;

  let wakeNoticeShown = false;
  const wakeTimeout = setTimeout(() => {
    backendStarting.set(true);
    wakeNoticeShown = true;
  }, 1500);

  try {
    const res = await fetch(url, options);
    clearTimeout(wakeTimeout);

    if (res.status === 401) {
      backendStarting.set(false);
      token.set('');
      alert('Session expired. Please log in again.');
      location.reload();
      return null;
    }

    if (wakeNoticeShown) {
      setTimeout(() => backendStarting.set(false), 3000);
    }

    return res;
  } catch (err) {
    clearTimeout(wakeTimeout);
    backendStarting.set(false);
    console.error('Fetch error:', err);
    throw err;
  }
}

export async function fetchSeries() {
  try {
    const res = await authFetch(`${API_BASE}/series`);
    if (res?.ok) {
      const data = await res.json();
      seriesStore.set(data);
    }
  } catch (err) {
    console.error('Failed to fetch series:', err);
  }
}

export async function addSeries(title, totalVolumes, score = null, tags = []) {
  const payload = {
    title,
    total_volumes: totalVolumes,
    score,
    tags
  };

  const res = await authFetch(`${API_BASE}/series`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (res?.ok) fetchSeries();
}


export async function toggleComplete(id) {
  const res = await authFetch(`${API_BASE}/series/${id}/toggle_complete`, {
    method: 'PATCH',
  });

  if (res?.ok) {
    const updatedSeries = await res.json();
    seriesStore.update((seriesList) => seriesList.map((s) => (s.id === id ? updatedSeries : s)));
  } else {
    console.error('Failed to toggle complete:', await res.text());
  }
}

export async function toggleOwned(volumeId) {
  const res = await authFetch(`${API_BASE}/volumes/${volumeId}/toggle`, {
    method: 'POST',
  });

  if (res?.ok) {
    fetchSeries();
  } else {
    console.error('Failed to update volume ownership:', await res.text());
  }
}

export async function updateSeries(id, data) {
  console.log("Updating series:", id, data);
  const res = await authFetch(`${API_BASE}/series/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

  if (res?.ok) {
    const updatedSeries = await res.json();
    seriesStore.update((seriesList) => seriesList.map((s) => (s.id === id ? updatedSeries : s)));
  } else {
    console.error('Failed to update series:', await res.text());
  }
}

export async function deleteSeriesById(id) {
  const res = await authFetch(`${API_BASE}/series/${id}`, {
    method: 'DELETE',
  });

  if (res?.ok) {
    seriesStore.update((seriesList) => seriesList.filter((s) => s.id !== id));
  } else {
    console.error('Failed to delete series:', await res.text());
  }
}

export async function fetchMalMetadata(mal_id) {
  try {
    const res = await authFetch(`${API_BASE}/series/${mal_id}/mal_info`);
    if (res.ok) {
      return await res.json();  // { score, genres }
    }
  } catch (err) {
    console.error('Failed to fetch MAL metadata:', err);
    return null;
  }
}
