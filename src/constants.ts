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

export const SERVED_ROOT = 'https://served.bracket.tennis/tournaments';

// Add one entry per Grand Slam per year. Order matters: the last entry is the
// default active tab (i.e. keep the current/upcoming tournament last).
export const TOURNAMENTS: Tournament[] = [
  {
    id: 'roland-garros-2026', name: 'Roland Garros 2026', short: 'Roland Garros',
    dates: 'May 24 – June 7', location: 'Paris, France',
    colors: { accent: '#C4622D', accentDark: '#8B3A18', sand: '#F5E6D3', sandDark: '#E8D4BC' },
  },
  {
    id: 'wimbledon-2026', name: 'Wimbledon 2026', short: 'Wimbledon',
    dates: 'Jun 29 – Jul 12', location: 'London, England',
    colors: { accent: '#2D6B3C', accentDark: '#1B4526', sand: '#EDEFE4', sandDark: '#DCE0CC' },
  },
];

// Free CORS proxy — required because browsers block direct cross-origin fetches.
export const CORS_PROXY = 'https://corsproxy.io/?';
