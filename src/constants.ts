import type { Player, Tournament } from './types';

export const COLORS = [
  '#C4622D', '#2D6B3C', '#4A7FB5', '#9B59B6', '#E67E22',
  '#1ABC9C', '#E74C3C', '#3498DB', '#F39C12', '#16A085',
];

export const PLAYERS: Player[] = [
  { name: 'sunchine', displayName: 'Mark',   color: COLORS[0] },
  { name: 'meelz',    displayName: 'Amelia', color: COLORS[1] },
  { name: 'ace4tom',  displayName: 'Tom',    color: COLORS[2] },
];

// Three newcomers are joining for the US Open but haven't given us their
// served.bracket.tennis usernames yet. Swap `name`/`displayName` in as they
// arrive and drop `pending` — everything else picks them up automatically.
export const US_OPEN_NEWCOMERS: Player[] = [
  { name: 'tbd-1', displayName: 'TBD', color: COLORS[3], pending: true },
  { name: 'tbd-2', displayName: 'TBD', color: COLORS[4], pending: true },
  { name: 'tbd-3', displayName: 'TBD', color: COLORS[5], pending: true },
];

export const SERVED_ROOT = 'https://served.bracket.tennis/tournaments';

// Add one entry per Grand Slam per year. Order matters: the last entry is the
// default active tab (i.e. keep the current/upcoming tournament last).
export const TOURNAMENTS: Tournament[] = [
  {
    id: 'roland-garros-2026', name: 'Roland Garros 2026', short: 'Roland Garros',
    dates: 'May 24 – June 7', location: 'Paris, France',
    colors: { accent: '#C4622D', accentDark: '#8B3A18', sand: '#F5E6D3', sandDark: '#E8D4BC' },
    players: PLAYERS,
  },
  {
    id: 'wimbledon-2026', name: 'Wimbledon 2026', short: 'Wimbledon',
    dates: 'Jun 29 – Jul 12', location: 'London, England',
    colors: { accent: '#2D6B3C', accentDark: '#1B4526', sand: '#EDEFE4', sandDark: '#DCE0CC' },
    players: PLAYERS,
  },
  {
    id: 'us-open-2026', name: 'US Open 2026', short: 'US Open',
    dates: 'Aug 30 – Sep 13', location: 'New York, USA',
    colors: { accent: '#2B5CA8', accentDark: '#0E2E63', sand: '#E7EDF7', sandDark: '#D0DBEE' },
    players: [...PLAYERS, ...US_OPEN_NEWCOMERS],
  },
];

// Free CORS proxy — required because browsers block direct cross-origin fetches.
// corsproxy.io started rejecting keyless requests with a 403 in Aug 2026, so we're
// on allorigins now. It returns 5xx a fair bit — the bracket pages are ~270KB and
// that seems to sit near its timeout — so fetches retry rather than give up.
export const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
export const FETCH_ATTEMPTS = 3;
// Back off between attempts and keep only a few requests in flight: an instant
// retry tends to land in whatever window made the first one fail. Note the origin
// site itself is fast and reliable (~0.3s) — the proxy is the fragile link, so if
// this keeps misbehaving the real fix is fetching server-side in CI instead.
export const RETRY_BACKOFF_MS = 500;
export const FETCH_CONCURRENCY = 3;
