import { writable } from 'svelte/store';

function createScreenStore() {
  const { subscribe, set } = writable(checkIsMobile());

  function checkIsMobile() {
    return window.innerWidth <= 768;
  }

  const update = () => set(checkIsMobile());

  if (typeof window !== 'undefined') {
    window.addEventListener('resize', update);
  }

  return { subscribe };
}

export const isMobile = createScreenStore();
