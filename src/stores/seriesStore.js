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

export async function toggleComplete(id, completed) {
  const res = await fetch(`${API_BASE}/series/${id}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: !completed })
  });
  if (res.ok) fetchSeries();
}

export async function toggleOwned(volumeId) {
  const res = await fetch(`${API_BASE}/volumes/${volumeId}/toggle`, {
    method: 'POST'
  });
  if (res.ok) fetchSeries();
}
