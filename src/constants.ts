import type { Player } from './types';

export const COLORS = [
  '#C4622D', '#2D6B3C', '#4A7FB5', '#9B59B6', '#E67E22',
  '#1ABC9C', '#E74C3C', '#3498DB', '#F39C12', '#16A085',
];

export const PLAYERS: Player[] = [
  { name: 'sunchine', displayName: 'Mark',   color: COLORS[0] },
  { name: 'meelz',    displayName: 'Amelia', color: COLORS[1] },
  { name: 'ace4tom',  displayName: 'Tom',    color: COLORS[2] },
];

export const SERVED_BASE = 'https://served.bracket.tennis/tournaments/roland-garros-2026';

// Free CORS proxy — required because browsers block direct cross-origin fetches.
export const CORS_PROXY = 'https://corsproxy.io/?';
