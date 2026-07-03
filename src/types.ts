export type Draw = 'atp' | 'wta';

export interface Player {
  name: string;        // served.bracket.tennis username, used for data fetching
  displayName: string; // shown in the UI
  color: string;
}

export interface TournamentColors {
  accent: string;
  accentDark: string;
  sand: string;
  sandDark: string;
}

export interface Tournament {
  id: string;        // served.bracket.tennis slug, e.g. 'wimbledon-2026'
  name: string;       // full display name, e.g. 'Wimbledon 2026'
  short: string;      // tab label, e.g. 'Wimbledon'
  dates: string;      // header meta, e.g. 'Jun 29 – Jul 12'
  location: string;   // header meta, e.g. 'London, England'
  colors: TournamentColors;
}

export interface PlayerScore {
  atp: number | null;
  wta: number | null;
}

export type Scores = Record<string, PlayerScore>;

export interface Cache {
  scores: Scores;
  lastUpdated: string;
}
