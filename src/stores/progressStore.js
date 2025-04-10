import { writable } from 'svelte/store';

export const progressMap = writable({}); // { [seriesId]: percent }
