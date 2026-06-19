import { writable } from 'svelte/store';
import { clearSession, getValidToken } from './authStore';
import { API_BASE } from './api.js';

export const seriesStore = writable([]);

async function authFetch(url, options = {}) {
  const currentToken = getValidToken();
  if (!currentToken) throw new Error('Not authenticated');

  const headers = { ...(options.headers || {}) };
  headers.Authorization = `Bearer ${currentToken}`;
  headers['Content-Type'] = headers['Content-Type'] || 'application/json';

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    clearSession();
    throw new Error('Session expired');
  }

  return res;
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

export async function addSeries(title, totalVolumes, score = null, tags = [], mal_id = null) {
  const payload = {
    title,
    total_volumes: totalVolumes,
    score,
    tags,
    mal_id
  };

  const res = await authFetch(`${API_BASE}/series`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (res?.ok) {
    fetchSeries();
    return { ok: true };
  }

  // Try to surface useful errors
  let text = '';
  try { text = await res.text(); } catch {}
  console.error('Failed to add series:', res?.status, text);
  return { ok: false, status: res?.status, error: text };
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

export async function toggleOwned(seriesId, volumeNumber) {
  const res = await authFetch(`${API_BASE}/series/${seriesId}/volumes/${volumeNumber}/toggle`, {
    method: 'POST',
  });

  if (res?.ok) {
    const result = await res.json();
    seriesStore.update((seriesList) =>
      seriesList.map((s) =>
        s.id === seriesId
          ? { ...s, owned_volume_numbers: result.owned_volume_numbers || [] }
          : s
      )
    );
    return result;
  }

  console.error('Failed to update volume ownership:', await res.text());
  return null;
}

export async function updateSeries(id, data) {
  console.log('Updating series:', id, data);
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
