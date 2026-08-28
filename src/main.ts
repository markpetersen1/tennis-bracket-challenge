import { TOURNAMENTS, FETCH_CONCURRENCY } from './constants';
import { fetchPlayerPoints } from './scraper';
import { renderLeaderboard, renderTabs, applyTheme, showToast, setStatus } from './renderer';
import type { Player, Scores, Cache, Tournament } from './types';

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

// Every entrant gets a slot, so a roster that grew since the cache was written
// (or a player who has never been fetched) still renders as a blank row.
function initScores(players: Player[], cached: Scores | undefined): Scores {
  return Object.fromEntries(
    players.map(p => [p.name, cached?.[p.name] ?? { atp: null, wta: null }])
  );
}

migrateLegacyCache();

const scoresByTournament: Record<string, Scores> = Object.fromEntries(
  TOURNAMENTS.map(t => [t.id, initScores(t.players, loadCache(t.id)?.scores)])
);

let activeTournamentId =
  localStorage.getItem(ACTIVE_TOURNAMENT_KEY) ?? TOURNAMENTS[TOURNAMENTS.length - 1].id;
if (!TOURNAMENTS.some(t => t.id === activeTournamentId)) {
  activeTournamentId = TOURNAMENTS[TOURNAMENTS.length - 1].id;
}

function activeTournament(): Tournament {
  return TOURNAMENTS.find(t => t.id === activeTournamentId)!;
}

function renderActiveTournament(): void {
  const tournament = activeTournament();
  applyTheme(tournament);
  renderTabs(TOURNAMENTS, activeTournamentId, switchTournament);
  renderLeaderboard(tournament.players, scoresByTournament[tournament.id], tournament.id);

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

// Runs tasks with at most `limit` in flight, so we don't burst the proxy.
async function runPool(tasks: (() => Promise<void>)[], limit: number): Promise<void> {
  let next = 0;
  const worker = async () => { while (next < tasks.length) await tasks[next++](); };
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
}

async function refreshStandings(): Promise<void> {
  const { id: tournamentId, players } = activeTournament();
  setStatus('Fetching standings…');

  const scores = scoresByTournament[tournamentId];
  let failed = 0;

  const tasks = players.filter(p => !p.pending).flatMap(p =>
    (['atp', 'wta'] as const).map(draw => async () => {
      const pts = await fetchPlayerPoints(tournamentId, p.name, draw);
      if (pts === null) failed++;
      scores[p.name] = { ...scores[p.name], [draw]: pts };
      renderLeaderboard(players, scores, tournamentId);
    })
  );

  await runPool(tasks, FETCH_CONCURRENCY);

  saveCache(tournamentId, scores);
  const time = new Date().toLocaleTimeString();

  if (failed > 0) {
    setStatus(`Updated at ${time} (${failed} of ${tasks.length} scores unavailable)`);
    showToast('Some scores could not be fetched');
  } else {
    setStatus(`Last updated: ${time}`);
    showToast('Standings refreshed!');
  }
}

// Expose for the HTML onclick attribute.
(window as Window & { refreshStandings: () => Promise<void> }).refreshStandings = refreshStandings;

renderActiveTournament();
