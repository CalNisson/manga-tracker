import Home from './pages/Home.svelte';
import Recommendations from './pages/Recommendations.svelte';
import CollectionSummary from './pages/CollectionSummary.svelte';

export default {
  '/': Home,
  '/recommendations': Recommendations,
  '/summary': CollectionSummary,
};
