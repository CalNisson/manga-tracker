import { writable } from 'svelte/store';

export const seriesStore = writable([]);
const API_BASE = "https://manga-collection-backend-0fqi.onrender.com";

export async function fetchSeries() {
  try {
    const res = await fetch(`${API_BASE}/series`);
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
  const res = await fetch(`${API_BASE}/series`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (res.ok) fetchSeries();
}

export async function toggleComplete(id) {
  const response = await fetch(`${API_BASE}/series/${id}/toggle_complete`, {
    method: 'PATCH'
  });

  if (!response.ok) {
    console.error('Failed to toggle complete:', await response.text());
    throw new Error('Failed to toggle complete');
  }

  const updatedSeries = await response.json();

  seriesStore.update(seriesList =>
    seriesList.map(s =>
      s.id === id ? updatedSeries : s
    )
  );
}


export async function toggleOwned(volumeId) {
  const res = await fetch(`${API_BASE}/volumes/${volumeId}/toggle`, {
    method: 'POST'
  });
  if (res.ok) fetchSeries();
}

export async function updateSeries(id, data) {
  const response = await fetch(`${API_BASE}/series/${id}/update_total`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: data.title,
      total_volumes: data.total_volumes
    }),
  });

  if (!response.ok) {
    console.error('Failed to update series:', await response.text());
    throw new Error('Failed to update series');
  }

  const updatedSeries = await response.json();

  seriesStore.update(seriesList =>
    seriesList.map(s =>
      s.id === id ? updatedSeries : s
    )
  );
}

export async function deleteSeriesById(id) {
  const response = await fetch(`${API_BASE}/api/series/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    console.error('Failed to delete series:', await response.text());
    throw new Error('Failed to delete series');
  }

  // Optionally update the store if you're using seriesStore
  seriesStore.update(seriesList => seriesList.filter(s => s.id !== id));
}
