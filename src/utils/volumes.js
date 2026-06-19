export function ownedVolumeNumbers(series) {
  return Array.isArray(series?.owned_volume_numbers) ? series.owned_volume_numbers : [];
}

export function ownedVolumeSet(series) {
  return new Set(ownedVolumeNumbers(series));
}

export function ownedVolumeCount(series) {
  return ownedVolumeNumbers(series).length;
}

export function totalVolumeCount(series) {
  return Number(series?.total_volumes) || 0;
}

export function percentOwned(series) {
  const total = totalVolumeCount(series);
  if (!total) return 0;
  return Math.round((ownedVolumeCount(series) / total) * 100);
}

export function volumeList(series) {
  const total = totalVolumeCount(series);
  const owned = ownedVolumeSet(series);
  return Array.from({ length: total }, (_, index) => {
    const volume_number = index + 1;
    return {
      volume_number,
      owned: owned.has(volume_number),
    };
  });
}

export function toggledOwnedVolumeNumbers(series, volumeNumber) {
  const next = new Set(ownedVolumeNumbers(series));
  if (next.has(volumeNumber)) {
    next.delete(volumeNumber);
  } else {
    next.add(volumeNumber);
  }
  return Array.from(next).sort((a, b) => a - b);
}
