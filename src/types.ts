export type Draw = 'atp' | 'wta';

export interface Player {
  name: string;
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
