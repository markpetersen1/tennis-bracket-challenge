import { PLAYERS, TOURNAMENTS } from './constants';
import { fetchPlayerPoints } from './scraper';
import { renderLeaderboard, renderTabs, applyTheme, showToast, setStatus } from './renderer';
import type { Scores, Cache } from './types';

const ACTIVE_TOURNAMENT_KEY = 'active_tournament';
const LEGACY_RG_KEY = 'rg2026_scores_cache';

function cacheKey(tournamentId: string): string {
  return `${tournamentId}_scores_cache`;
}

function loadCache(tournamentId: string): Cache | null {
  try {
    const raw = localStorage.getItem(cacheKey(tournamentId));
    return raw ? (JSON.parse(raw) as Cache) : null;
  } catch { return null; }
}

function saveCache(tournamentId: string, scores: Scores): void {
  const cache: Cache = { scores, lastUpdated: new Date().toISOString() };
  localStorage.setItem(cacheKey(tournamentId), JSON.stringify(cache));
}

// One-time migration: the Roland Garros cache used to live under a fixed key
// before per-tournament keying existed.
function migrateLegacyCache(): void {
  const legacy = localStorage.getItem(LEGACY_RG_KEY);
  if (legacy && !localStorage.getItem(cacheKey('roland-garros-2026'))) {
    localStorage.setItem(cacheKey('roland-garros-2026'), legacy);
  }
}

function emptyScores(): Scores {
  return Object.fromEntries(PLAYERS.map(p => [p.name, { atp: null, wta: null }]));
}

migrateLegacyCache();

const scoresByTournament: Record<string, Scores> = Object.fromEntries(
  TOURNAMENTS.map(t => [t.id, loadCache(t.id)?.scores ?? emptyScores()])
);

let activeTournamentId =
  localStorage.getItem(ACTIVE_TOURNAMENT_KEY) ?? TOURNAMENTS[TOURNAMENTS.length - 1].id;
if (!TOURNAMENTS.some(t => t.id === activeTournamentId)) {
  activeTournamentId = TOURNAMENTS[TOURNAMENTS.length - 1].id;
}

function renderActiveTournament(): void {
  const tournament = TOURNAMENTS.find(t => t.id === activeTournamentId)!;
  applyTheme(tournament);
  renderTabs(TOURNAMENTS, activeTournamentId, switchTournament);
  renderLeaderboard(PLAYERS, scoresByTournament[activeTournamentId], activeTournamentId);

  const cache = loadCache(activeTournamentId);
  if (cache) {
    const time = new Date(cache.lastUpdated).toLocaleTimeString();
    setStatus(`Last updated: ${time} — press Refresh to reload`);
  } else {
    setStatus('Press Refresh to load standings.');
  }
}

function switchTournament(id: string): void {
  if (id === activeTournamentId) return;
  activeTournamentId = id;
  localStorage.setItem(ACTIVE_TOURNAMENT_KEY, id);
  renderActiveTournament();
}

async function refreshStandings(): Promise<void> {
  const tournamentId = activeTournamentId;
  setStatus('Fetching standings…');

  const scores = scoresByTournament[tournamentId];
  const fetches = PLAYERS.flatMap(p =>
    (['atp', 'wta'] as const).map(async draw => {
      const pts = await fetchPlayerPoints(tournamentId, p.name, draw);
      scores[p.name] = { ...scores[p.name], [draw]: pts };
      renderLeaderboard(PLAYERS, scores, tournamentId);
    })
  );

  const results = await Promise.allSettled(fetches);
  const failed = results.filter(r => r.status === 'rejected').length;

  saveCache(tournamentId, scores);
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

renderActiveTournament();
