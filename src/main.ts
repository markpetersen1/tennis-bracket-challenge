import { PLAYERS } from './constants';
import { fetchPlayerPoints } from './scraper';
import { renderLeaderboard, showToast, setStatus } from './renderer';
import type { Scores, Cache } from './types';

const LS_KEY = 'rg2026_scores_cache';

function loadCache(): Cache | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Cache) : null;
  } catch { return null; }
}

function saveCache(scores: Scores): void {
  const cache: Cache = { scores, lastUpdated: new Date().toISOString() };
  localStorage.setItem(LS_KEY, JSON.stringify(cache));
}

let scores: Scores = Object.fromEntries(
  PLAYERS.map(p => [p.name, { atp: null, wta: null }])
);

async function refreshStandings(): Promise<void> {
  setStatus('Fetching standings…');

  const fetches = PLAYERS.flatMap(p =>
    (['atp', 'wta'] as const).map(async draw => {
      const pts = await fetchPlayerPoints(p.name, draw);
      scores[p.name] = { ...scores[p.name], [draw]: pts };
      renderLeaderboard(PLAYERS, scores);
    })
  );

  const results = await Promise.allSettled(fetches);
  const failed = results.filter(r => r.status === 'rejected').length;

  saveCache(scores);
  const time = new Date().toLocaleTimeString();

  if (failed > 0) {
    setStatus(`Updated at ${time} (${failed} fetch${failed > 1 ? 'es' : ''} failed)`);
    showToast('Some scores could not be fetched');
  } else {
    setStatus(`Last updated: ${time}`);
    showToast('Standings refreshed!');
  }
}

// Expose for the HTML onclick attribute.
(window as Window & { refreshStandings: () => Promise<void> }).refreshStandings = refreshStandings;

(function init() {
  const cache = loadCache();
  if (cache) {
    scores = cache.scores;
    const time = new Date(cache.lastUpdated).toLocaleTimeString();
    setStatus(`Last updated: ${time} — press Refresh to reload`);
  }
  renderLeaderboard(PLAYERS, scores);
})();
