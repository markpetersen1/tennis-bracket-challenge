export type Draw = 'atp' | 'wta';

export interface Player {
  name: string;        // served.bracket.tennis username, used for data fetching
  displayName: string; // shown in the UI
  color: string;
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
